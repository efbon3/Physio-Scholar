import Link from "next/link";
import { redirect } from "next/navigation";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

import { updatePasswordAction } from "../reset-password/actions";

type PageProps = { searchParams: Promise<{ error?: string; ok?: string }> };

export default async function UpdatePasswordPage({ searchParams }: PageProps) {
  const { error, ok } = await searchParams;

  // This page is only reachable after the reset-link callback has created a
  // short-lived session; if the user lands here cold, bounce to /login.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=reset_link_expired");

  if (ok === "1") {
    return (
      <Card>
        <CardHeader>
          <h1 className="font-heading text-2xl font-medium">Password updated</h1>
          <CardDescription>You can now sign in with your new password.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
            Continue to sign in
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h1 className="font-heading text-2xl font-medium">Set a new password</h1>
        <CardDescription>Minimum 12 characters.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action={async (formData) => {
            "use server";
            const result = await updatePasswordAction(formData);
            const { redirect } = await import("next/navigation");
            if ("error" in result) {
              redirect(`/update-password?error=${encodeURIComponent(result.error)}`);
            } else {
              redirect("/update-password?ok=1");
            }
          }}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={12}
            />
          </div>

          {error ? (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full">
            Update password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
