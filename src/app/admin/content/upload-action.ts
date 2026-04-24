"use server";

import { createClient } from "@/lib/supabase/server";

export type UploadResult =
  | { status: "ok"; url: string; path: string }
  | { status: "error"; message: string };

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
  "image/webp",
  "image/gif",
]);
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const PATH_PREFIX = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

/**
 * Upload a diagram to the public `diagrams` Supabase Storage bucket.
 *
 * Path convention: `<mechanism_id>/<timestamped-filename>`. Keeping the
 * file name partitioned by mechanism id means the bucket stays legible
 * at 100+ uploads, and a future "orphan cleanup" job can scan per-
 * mechanism-id prefixes without a full object scan.
 *
 * Returns the **public URL** the admin can paste into the mechanism
 * markdown as `![alt](url)`. The URL is stable across deploys and
 * cacheable by Serwist, so diagrams render offline after the first
 * load.
 */
export async function uploadDiagramAction(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file");
  const mechanismId = formData.get("mechanism_id");
  if (!(file instanceof File)) {
    return { status: "error", message: "Missing upload." };
  }
  if (typeof mechanismId !== "string" || !PATH_PREFIX.test(mechanismId)) {
    return { status: "error", message: "Invalid mechanism id — kebab-case only." };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return {
      status: "error",
      message: `Unsupported file type (${file.type || "unknown"}). Use PNG, JPEG, SVG, WEBP, or GIF.`,
    };
  }
  if (file.size > MAX_BYTES) {
    return { status: "error", message: "File too large. Max 2 MB." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Please sign in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) return { status: "error", message: "Admin only." };

  // Timestamp prefix so re-uploads of the same filename don't collide.
  // File names get sanitised to a-z0-9.-_ to avoid URL-encoding weirdness
  // in the rendered markdown.
  const safeName = file.name.replace(/[^A-Za-z0-9._-]/g, "-");
  const path = `${mechanismId}/${Date.now()}-${safeName}`;

  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await supabase.storage.from("diagrams").upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return { status: "error", message: `Upload failed: ${error.message}` };

  const { data: publicUrl } = supabase.storage.from("diagrams").getPublicUrl(path);
  return { status: "ok", url: publicUrl.publicUrl, path };
}
