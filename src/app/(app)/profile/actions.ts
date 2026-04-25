"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

/**
 * Server action result. Discriminated union so the form can switch on
 * `status` rather than juggling an `error?: string` field.
 */
export type ProfileActionResult =
  | { status: "ok"; message?: string }
  | { status: "error"; message: string };

const PHONE_PATTERN = /^[+\d][\d\s\-()]{4,30}$/;
const ROLL_NUMBER_PATTERN = /^[A-Za-z0-9./_\- ]{1,40}$/;

function emptyToNull(value: string | undefined): string | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

/**
 * Persist edited profile fields. The form binds to FormData; this
 * action validates each field individually and writes a single update
 * row via Supabase. Authorisation is handled by the existing
 * `profiles_update_own` RLS policy — the action only needs to confirm
 * a session exists.
 *
 * Date handling: `date_of_birth` is a Postgres `date`. The HTML date
 * input emits ISO `YYYY-MM-DD` which Postgres accepts directly. We
 * still gate it through a parse to reject impossible values like
 * "0000-00-00" or wildly future dates.
 */
export async function saveProfileAction(formData: FormData): Promise<ProfileActionResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Profile editing is unavailable in this environment." };
  }
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { status: "error", message: "You must be signed in." };

  const fullName = emptyToNull(formData.get("full_name")?.toString());
  const dateOfBirth = emptyToNull(formData.get("date_of_birth")?.toString());
  const address = emptyToNull(formData.get("address")?.toString());
  const phone = emptyToNull(formData.get("phone")?.toString());
  const rollNumber = emptyToNull(formData.get("roll_number")?.toString());

  if (fullName !== null && fullName.length > 120) {
    return { status: "error", message: "Name is too long." };
  }
  if (address !== null && address.length > 500) {
    return { status: "error", message: "Address is too long." };
  }
  if (phone !== null && !PHONE_PATTERN.test(phone)) {
    return {
      status: "error",
      message: "Phone number looks invalid. Use digits, spaces, dashes, parentheses, or +.",
    };
  }
  if (rollNumber !== null && !ROLL_NUMBER_PATTERN.test(rollNumber)) {
    return {
      status: "error",
      message: "Roll number can use letters, digits, dots, slashes, dashes, underscores, spaces.",
    };
  }
  if (dateOfBirth !== null) {
    const parsed = new Date(dateOfBirth);
    if (Number.isNaN(parsed.getTime())) {
      return { status: "error", message: "Date of birth is not a valid date." };
    }
    const year = parsed.getUTCFullYear();
    if (year < 1900 || year > new Date().getUTCFullYear()) {
      return { status: "error", message: "Date of birth must be between 1900 and today." };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      date_of_birth: dateOfBirth,
      address,
      phone,
      roll_number: rollNumber,
    })
    .eq("id", user.id);

  if (error) {
    return { status: "error", message: `Could not save profile: ${error.message}` };
  }

  revalidatePath("/profile");
  revalidatePath("/today");
  return { status: "ok", message: "Saved." };
}

/**
 * Persist a new avatar URL. The cropped Blob is uploaded directly to
 * Supabase Storage from the client (see `avatar-cropper.tsx`) — that
 * flow is owner-keyed by the storage RLS policy added in the J4
 * migration. The client then calls this action with the resulting
 * public URL so the profile row points at it.
 *
 * We re-derive the public URL server-side from the supplied storage
 * path rather than trusting the client's URL string outright. This
 * ensures the URL points at our bucket (not an attacker-controlled
 * domain).
 */
export async function setAvatarPathAction(
  storagePath: string | null,
): Promise<ProfileActionResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Avatar upload is unavailable in this environment." };
  }
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { status: "error", message: "You must be signed in." };

  let avatarUrl: string | null = null;
  if (storagePath !== null) {
    // Owner check — the storage policy already enforces this on writes
    // but a malicious client could pass any path here. Reject paths that
    // don't begin with the caller's user id.
    const expectedPrefix = `${user.id}/`;
    if (!storagePath.startsWith(expectedPrefix)) {
      return { status: "error", message: "Invalid avatar path." };
    }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(storagePath);
    avatarUrl = urlData.publicUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (error) {
    return { status: "error", message: `Could not save avatar: ${error.message}` };
  }

  revalidatePath("/profile");
  revalidatePath("/today");
  return { status: "ok" };
}
