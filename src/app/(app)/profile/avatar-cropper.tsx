"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DISPLAY_SIZE = 280;
const OUTPUT_SIZE = 256;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

export type CroppedAvatar = {
  blob: Blob;
  /** Suggested object name. Includes a stable extension so Storage MIME-detect works. */
  filename: string;
};

type Props = {
  /** Existing avatar to show in the preview circle. Optional. */
  initialAvatarUrl: string | null;
  pending: boolean;
  /** Called when the learner Applies a crop. The parent uploads + persists. */
  onApply: (cropped: CroppedAvatar) => Promise<void> | void;
  /** Optional remove handler — clears the avatar without uploading anything. */
  onRemove?: () => Promise<void> | void;
};

/**
 * Avatar picker + circular cropper. No third-party crop library — the
 * affordances we need (file picker, drag, zoom slider, Apply) all map
 * cleanly to a `<canvas>` and a few pointer events, and adding a
 * dependency for ~150 LoC of behaviour pulls more weight than it
 * carries.
 *
 * Flow:
 *   1. Learner picks a file. We load it into an HTMLImageElement and
 *      compute the smallest zoom that lets the image cover the circle.
 *   2. Drag inside the canvas to pan; slider on top changes zoom.
 *   3. On Apply we render the visible circle to an off-screen canvas
 *      at OUTPUT_SIZE × OUTPUT_SIZE, export it as a JPEG Blob, and
 *      hand it to the parent's `onApply` for upload.
 *
 * Touch support comes free from pointer events — the same handlers
 * fire for mouse and touch.
 */
export function AvatarCropper({ initialAvatarUrl, pending, onApply, onRemove }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [draftUrl, setDraftUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(
    null,
  );

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setError("Please pick a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Pick something under 10 MB; we'll downscale before uploading.");
      return;
    }
    setError(null);
    const url = URL.createObjectURL(file);
    setDraftUrl(url);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }

  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const baseScale = Number(img.dataset.baseScale ?? "1");
    const totalScale = baseScale * zoom;
    const drawWidth = img.width * totalScale;
    const drawHeight = img.height * totalScale;
    const dx = (DISPLAY_SIZE - drawWidth) / 2 + offset.x;
    const dy = (DISPLAY_SIZE - drawHeight) / 2 + offset.y;

    ctx.save();
    ctx.clearRect(0, 0, DISPLAY_SIZE, DISPLAY_SIZE);
    ctx.fillStyle = "#0b0b0b";
    ctx.fillRect(0, 0, DISPLAY_SIZE, DISPLAY_SIZE);
    ctx.beginPath();
    ctx.arc(DISPLAY_SIZE / 2, DISPLAY_SIZE / 2, DISPLAY_SIZE / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
    ctx.restore();

    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(DISPLAY_SIZE / 2, DISPLAY_SIZE / 2, DISPLAY_SIZE / 2 - 1, 0, Math.PI * 2);
    ctx.stroke();
  }, [zoom, offset]);

  // Whenever the draft image loads, set the initial zoom so the image
  // exactly covers the circle.
  useEffect(() => {
    if (!draftUrl) return;
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      // Cover-fit: the smaller dimension reaches DISPLAY_SIZE.
      const baseScale = DISPLAY_SIZE / Math.min(img.width, img.height);
      img.dataset.baseScale = String(baseScale);
      drawPreview();
    };
    img.src = draftUrl;
  }, [draftUrl, drawPreview]);

  // Redraw whenever zoom or offset changes (drawPreview's identity
  // changes because it depends on those values via useCallback).
  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!imageRef.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      baseX: offset.x,
      baseY: offset.y,
    };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragRef.current) return;
    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;
    setOffset({ x: dragRef.current.baseX + dx, y: dragRef.current.baseY + dy });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragRef.current) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
  }

  async function handleApply() {
    if (!imageRef.current) return;
    setError(null);
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = OUTPUT_SIZE;
    exportCanvas.height = OUTPUT_SIZE;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) {
      setError("Couldn't render the cropped image. Try a different browser.");
      return;
    }

    const img = imageRef.current;
    const baseScale = Number(img.dataset.baseScale ?? "1");
    const totalScale = baseScale * zoom;
    const drawWidth = img.width * totalScale;
    const drawHeight = img.height * totalScale;
    const dx = (DISPLAY_SIZE - drawWidth) / 2 + offset.x;
    const dy = (DISPLAY_SIZE - drawHeight) / 2 + offset.y;
    const exportRatio = OUTPUT_SIZE / DISPLAY_SIZE;

    ctx.beginPath();
    ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
      img,
      dx * exportRatio,
      dy * exportRatio,
      drawWidth * exportRatio,
      drawHeight * exportRatio,
    );

    const blob = await new Promise<Blob | null>((resolve) =>
      exportCanvas.toBlob(resolve, "image/jpeg", 0.9),
    );
    if (!blob) {
      setError("Couldn't encode the avatar. Try a different image.");
      return;
    }
    await onApply({ blob, filename: `avatar-${Date.now()}.jpg` });
    setDraftUrl(null);
  }

  function handleCancelDraft() {
    setDraftUrl(null);
    setError(null);
  }

  return (
    <section aria-label="Profile photo" className="flex flex-col items-start gap-4">
      <div className="flex items-center gap-4">
        <AvatarPreview url={draftUrl ? null : initialAvatarUrl} />
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={pending}
            className="hover:bg-muted rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            {initialAvatarUrl ? "Change photo" : "Upload photo"}
          </button>
          {initialAvatarUrl && onRemove ? (
            <button
              type="button"
              onClick={() => void onRemove()}
              disabled={pending}
              className="text-muted-foreground hover:bg-muted rounded-md border px-3 py-1.5 text-xs disabled:opacity-50"
            >
              Remove photo
            </button>
          ) : null}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="sr-only"
            data-testid="avatar-file-input"
          />
        </div>
      </div>

      {draftUrl ? (
        <div className="border-input flex flex-col items-center gap-3 rounded-md border p-4">
          <p className="text-muted-foreground text-xs">
            Drag to position. Use the slider to zoom. Apply when you&apos;re happy.
          </p>
          <canvas
            ref={canvasRef}
            width={DISPLAY_SIZE}
            height={DISPLAY_SIZE}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="touch-none rounded-full bg-black"
            style={{ width: DISPLAY_SIZE, height: DISPLAY_SIZE }}
            data-testid="avatar-crop-canvas"
          />
          <label className="flex items-center gap-2 text-xs">
            <span>Zoom</span>
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              data-testid="avatar-zoom"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancelDraft}
              disabled={pending}
              className="text-muted-foreground hover:bg-muted rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleApply()}
              disabled={pending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-sm disabled:opacity-50"
              data-testid="avatar-apply"
            >
              {pending ? "Uploading…" : "Apply"}
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      ) : null}
    </section>
  );
}

function AvatarPreview({ url }: { url: string | null }) {
  return (
    <div
      aria-label="Current profile photo"
      className="border-input bg-muted relative h-20 w-20 overflow-hidden rounded-full border"
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="Profile" className="h-full w-full object-cover" />
      ) : (
        <div className="text-muted-foreground flex h-full w-full items-center justify-center text-xs">
          No photo
        </div>
      )}
    </div>
  );
}
