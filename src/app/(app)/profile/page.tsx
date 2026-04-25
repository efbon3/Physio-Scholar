import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { ProfileForm } from "./profile-form";

export const metadata = {
  title: "Profile",
};

type ProfileSnapshot = {
  email: string | null;
  fullName: string;
  dateOfBirth: string;
  address: string;
  phone: string;
  rollNumber: string;
  avatarUrl: string | null;
};

const PREVIEW_PROFILE: ProfileSnapshot = {
  email: null,
  fullName: "",
  dateOfBirth: "",
  address: "",
  phone: "",
  rollNumber: "",
  avatarUrl: null,
};

/**
 * Profile page — the learner's personal details, separate from the
 * organ-system selector at /settings (J0). DOB is shown only here and
 * in admin tooling per the privacy posture documented on the J4
 * migration; no peer-visible profile views exist in v1.
 *
 * In environments without Supabase env vars (CI, unconfigured
 * preview), the page renders a placeholder explanation rather than
 * crashing — same graceful degradation as /today and /review.
 */
export default async function ProfilePage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <ProfileForm
        snapshot={PREVIEW_PROFILE}
        readOnly
        readOnlyMessage="Profile editing requires a live Supabase project. Set NEXT_PUBLIC_SUPABASE_URL to enable it."
      />
    );
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login?next=/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, date_of_birth, address, phone, roll_number, avatar_url")
    .eq("id", user.id)
    .single();

  const snapshot: ProfileSnapshot = {
    email: user.email ?? null,
    fullName: profile?.full_name ?? "",
    dateOfBirth: profile?.date_of_birth ?? "",
    address: profile?.address ?? "",
    phone: profile?.phone ?? "",
    rollNumber: profile?.roll_number ?? "",
    avatarUrl: profile?.avatar_url ?? null,
  };

  return <ProfileForm snapshot={snapshot} userId={user.id} />;
}
