"use client";

import { useState, useTransition } from "react";

import { toDriveDirectImageUrl } from "@/lib/content/drive";

import { uploadDiagramAction } from "./upload-action";

type Props = {
  /** Called with the ready-to-paste markdown image snippet `![alt](url)`. */
  onInsert: (snippet: string) => void;
  /** Mechanism id for the storage path. Falls back to "unfiled". */
  mechanismId: string;
};

/**
 * Two-path diagram helper inside the CMS editor.
 *
 * Path 1 — **Upload.** File picker → Supabase Storage → we get a
 * public URL back and insert `![alt](url)` at the cursor position (or
 * at the end if we can't pinpoint the caret).
 *
 * Path 2 — **Drive link.** Paste a share link → we convert it to the
 * direct-image URL with toDriveDirectImageUrl() and insert the same
 * markdown snippet. The admin has to have set the Drive file to
 * "Anyone with the link can view," but no OAuth is required.
 */
export function DiagramInserter({ onInsert, mechanismId }: Props) {
  const [altText, setAltText] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function emit(url: string) {
    const trimmedAlt = altText.trim() || "diagram";
    onInsert(`![${trimmedAlt}](${url})`);
    setAltText("");
    setDriveUrl("");
  }

  function handleDrivePaste() {
    setError(null);
    setOk(null);
    const direct = toDriveDirectImageUrl(driveUrl);
    if (!direct) {
      setError(
        "Not a Google Drive share link. Use a URL like https://drive.google.com/file/d/…/view.",
      );
      return;
    }
    emit(direct);
    setOk("Drive link inserted into the editor.");
  }

  function handleUpload(formData: FormData) {
    setError(null);
    setOk(null);
    formData.set("mechanism_id", mechanismId);
    // Client-side pre-flight so a 10 MB file doesn't round-trip only
    // to fail the server's 2 MB guard. Server re-checks anyway — this
    // just shortens the feedback loop for the admin.
    const file = formData.get("file");
    if (file instanceof File) {
      if (file.size > 2 * 1024 * 1024) {
        setError("File too large. Max 2 MB — compress or crop before uploading.");
        return;
      }
      const allowed = new Set([
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/svg+xml",
        "image/webp",
        "image/gif",
      ]);
      if (file.type && !allowed.has(file.type)) {
        setError(`Unsupported file type (${file.type}). Use PNG, JPEG, SVG, WEBP, or GIF.`);
        return;
      }
    }
    startTransition(async () => {
      const result = await uploadDiagramAction(formData);
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      emit(result.url);
      setOk("Image uploaded and inserted.");
    });
  }

  return (
    <section
      aria-label="Insert diagram"
      className="border-border bg-muted/20 flex flex-col gap-4 rounded-md border p-4"
    >
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">Insert a diagram</p>
        <p className="text-muted-foreground text-xs">
          The resulting markdown snippet <code>![alt](url)</code> is added wherever you leave your
          cursor in the textarea above (or appended at the end if we can&apos;t find a selection).
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="diagram-alt" className="text-xs font-medium">
          Caption / alt text
        </label>
        <input
          id="diagram-alt"
          type="text"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Frank-Starling curve overlay"
          className="border-input bg-background rounded-md border px-3 py-1.5 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <form action={handleUpload} className="flex flex-col gap-2" encType="multipart/form-data">
          <label htmlFor="diagram-file" className="text-xs font-medium">
            Upload image
          </label>
          <input
            id="diagram-file"
            name="file"
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
            className="text-xs"
            required
          />
          <button
            type="submit"
            disabled={pending}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-fit rounded-md px-3 py-1.5 text-xs disabled:opacity-50"
          >
            {pending ? "Uploading…" : "Upload & insert"}
          </button>
          <p className="text-muted-foreground text-xs">
            PNG / JPEG / SVG / WEBP / GIF, up to 2 MB. Lands in Supabase Storage, served from the{" "}
            <code>diagrams/</code> bucket.
          </p>
        </form>

        <div className="flex flex-col gap-2">
          <label htmlFor="diagram-drive" className="text-xs font-medium">
            Paste Google Drive link
          </label>
          <input
            id="diagram-drive"
            type="url"
            value={driveUrl}
            onChange={(e) => setDriveUrl(e.target.value)}
            placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
            className="border-input bg-background rounded-md border px-3 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={handleDrivePaste}
            className="hover:bg-muted w-fit rounded-md border px-3 py-1.5 text-xs"
          >
            Convert & insert
          </button>
          <p className="text-muted-foreground text-xs">
            Requires the Drive file to be set to <em>Anyone with the link can view</em>.
          </p>
        </div>
      </div>

      {error ? <p className="text-destructive text-xs">{error}</p> : null}
      {ok ? <p className="text-xs text-emerald-600">{ok}</p> : null}
    </section>
  );
}
