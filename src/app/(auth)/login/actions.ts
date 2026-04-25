"use server";

import { redirect } from "next/navigation";

import { isSafeRelativePath } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/server";

type LoginResult = { error: string } | undefined;

/**
 * Default post-login destination. /today is the dashboard surface
 * (greeting, queue summary, active-systems chip, primary CTA). Landing
 * directly on /review used to drop the learner straight into card 1/N
 * with no orientation — confusing on a fresh sign-in. /today gives them
 * the lay of the land first, and a single click takes them into the
 * focused-study modal.
 */
const DEFAULT_POST_LOGIN = "/today";

export async function loginAction(formData: FormData): Promise<LoginResult> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? DEFAULT_POST_LOGIN);

  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Invalid email or password." };

  redirect(isSafeRelativePath(next) ? next : DEFAULT_POST_LOGIN);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
