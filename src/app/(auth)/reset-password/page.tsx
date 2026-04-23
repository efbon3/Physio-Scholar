import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { requestResetAction } from "./actions";

type PageProps = { searchParams: Promise<{ sent?: string; error?: string }> };

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { sent, error } = await searchParams;

  if (sent === "1") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            If an account exists for that email, we just sent a reset link. The link is good for 30
            minutes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Didn&apos;t arrive? Check spam, or{" "}
            <Link href="/reset-password" className="underline">
              request another
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Reset your password</CardTitle>
        <CardDescription>We&apos;ll email you a link to set a new one.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action={async (formData) => {
            "use server";
            const result = await requestResetAction(formData);
            const { redirect } = await import("next/navigation");
            if ("error" in result) {
              redirect(`/reset-password?error=${encodeURIComponent(result.error)}`);
            } else {
              redirect("/reset-password?sent=1");
            }
          }}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>

          {error ? (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full">
            Email me a reset link
          </Button>
        </form>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          <Link href="/login" className="underline">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
