"use server";

import { redirect } from "next/navigation";

import { isSafeRelativePath } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/server";

type LoginResult = { error: string } | undefined;

/**
 * Default post-login destination. Review-first instead of the marketing
 * home page — once a learner is signed in, the daily review loop is the
 * intended landing. Phase 5 replaces this with "/today" when that tab
 * is built.
 */
const DEFAULT_POST_LOGIN = "/review";

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
