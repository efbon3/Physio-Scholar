import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { GoogleSignInButton } from "../google-sign-in-button";
import { signUpAction } from "./actions";

type PageProps = { searchParams: Promise<{ error?: string }> };

export default async function SignupPage({ searchParams }: PageProps) {
  const { error } = await searchParams;

  return (
    <Card>
      <CardHeader>
        <h1 className="font-heading text-2xl font-medium">Request access</h1>
        <CardDescription>
          Physio-Scholar is open to enrolled MBBS students. Sign up here, complete your profile on
          the next page, and an admin will verify and approve you before you can start studying.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-3">
          <GoogleSignInButton />
          <p className="text-muted-foreground text-xs">
            Signing in with Google counts as accepting our Terms of Service and Privacy Policy — the
            same as ticking both boxes below.
          </p>
          <div className="text-muted-foreground flex items-center gap-3 text-xs">
            <span className="bg-border h-px flex-1" aria-hidden />
            <span>or sign up with email</span>
            <span className="bg-border h-px flex-1" aria-hidden />
          </div>
        </div>
        <form
          action={async (formData) => {
            "use server";
            const result = await signUpAction(formData);
            if (result?.error) {
              const { redirect } = await import("next/navigation");
              redirect(`/signup?error=${encodeURIComponent(result.error)}`);
            }
          }}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={12}
            />
            <p className="text-muted-foreground text-xs">At least 12 characters.</p>
          </div>

          <fieldset className="flex flex-col gap-3 pt-2">
            <legend className="text-sm font-medium">Consent</legend>

            <label className="flex gap-3 text-sm">
              <Checkbox id="consent_terms" name="consent_terms" required />
              <span>
                I accept the{" "}
                <Link href="/terms" className="underline" target="_blank">
                  Terms of Service
                </Link>
                .
              </span>
            </label>

            <label className="flex gap-3 text-sm">
              <Checkbox id="consent_privacy" name="consent_privacy" required />
              <span>
                I accept the{" "}
                <Link href="/privacy" className="underline" target="_blank">
                  Privacy Policy
                </Link>
                , including the DPDPA notices.
              </span>
            </label>

            <label className="flex gap-3 text-sm">
              <Checkbox id="consent_analytics" name="consent_analytics" />
              <span>
                (Optional) Allow anonymous product analytics to help improve the app. You can change
                this anytime in Settings.
              </span>
            </label>
          </fieldset>

          {error ? (
            <p role="alert" className="text-destructive text-sm" data-test="signup-error">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full">
            Create account
          </Button>
        </form>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
