"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type CompleteProfileResult = { status: "ok" } | { status: "error"; message: string };

const PHONE_PATTERN = /^[+\d][\d\s\-()]{4,30}$/;
const ROLL_NUMBER_PATTERN = /^[A-Za-z0-9./_\- ]{1,40}$/;
const NAME_PATTERN = /^[A-Za-z][A-Za-z .'\-]{0,119}$/;

function emptyToNull(value: string | undefined | null): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

/**
 * Persist the learner's first-time profile + stamp
 * `profile_completed_at = now()`. The (app) layout's gate keys off
 * that timestamp; while it's NULL the learner is bounced back to
 * /complete-profile, so this action is what unblocks them.
 *
 * Mandatory: full name, nickname, phone, college, roll number.
 * Optional: date of birth, address. Avatar upload happens in a
 * separate flow (see avatar-cropper) — leaving photo blank is fine.
 *
 * RLS: the existing profiles_update_own policy authorises this. We
 * just need a session.
 */
export async function completeProfileAction(formData: FormData): Promise<CompleteProfileResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Profile setup is unavailable in this environment." };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { status: "error", message: "Please sign in again." };

  const fullName = emptyToNull(formData.get("full_name")?.toString());
  const nickname = emptyToNull(formData.get("nickname")?.toString());
  const phone = emptyToNull(formData.get("phone")?.toString());
  const collegeName = emptyToNull(formData.get("college_name")?.toString());
  const rollNumber = emptyToNull(formData.get("roll_number")?.toString());
  const dateOfBirth = emptyToNull(formData.get("date_of_birth")?.toString());
  const address = emptyToNull(formData.get("address")?.toString());

  // Mandatory fields — fail closed.
  if (!fullName) return { status: "error", message: "Full name is required." };
  if (!nickname) return { status: "error", message: "Nickname is required." };
  if (!phone) return { status: "error", message: "Mobile number is required." };
  if (!collegeName) return { status: "error", message: "College name is required." };
  if (!rollNumber) return { status: "error", message: "Roll number is required." };

  if (!NAME_PATTERN.test(fullName)) {
    return {
      status: "error",
      message:
        "Full name should start with a letter and use letters, spaces, dots, hyphens, apostrophes.",
    };
  }
  if (nickname.length > 40) {
    return { status: "error", message: "Nickname is too long (40 characters max)." };
  }
  if (!PHONE_PATTERN.test(phone)) {
    return {
      status: "error",
      message: "Mobile number looks invalid. Use digits, spaces, dashes, parentheses, or +.",
    };
  }
  if (collegeName.length > 200) {
    return { status: "error", message: "College name is too long (200 characters max)." };
  }
  if (!ROLL_NUMBER_PATTERN.test(rollNumber)) {
    return {
      status: "error",
      message: "Roll number can use letters, digits, dots, slashes, dashes, underscores, spaces.",
    };
  }
  if (address !== null && address.length > 500) {
    return { status: "error", message: "Address is too long (500 characters max)." };
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
      nickname,
      phone,
      college_name: collegeName,
      roll_number: rollNumber,
      date_of_birth: dateOfBirth,
      address,
      profile_completed_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { status: "error", message: `Could not save profile: ${error.message}` };
  }

  revalidatePath("/complete-profile");
  revalidatePath("/pending-approval");
  return { status: "ok" };
}
