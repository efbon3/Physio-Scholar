import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { loginAction } from "./actions";

type PageProps = { searchParams: Promise<{ error?: string; next?: string }> };

export default async function LoginPage({ searchParams }: PageProps) {
  const { error, next } = await searchParams;

  return (
    <Card>
      <CardHeader>
        <h1 className="font-heading text-2xl font-medium">Sign in</h1>
        <CardDescription>Welcome back to Physio-Scholar.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action={async (formData) => {
            "use server";
            const result = await loginAction(formData);
            if (result?.error) {
              const { redirect } = await import("next/navigation");
              redirect(`/login?error=${encodeURIComponent(result.error)}`);
            }
          }}
          className="flex flex-col gap-5"
        >
          <input type="hidden" name="next" value={next ?? "/"} />

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
              autoComplete="current-password"
            />
          </div>

          {error ? (
            <p role="alert" className="text-destructive text-sm" data-test="login-error">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>

        <div className="text-muted-foreground mt-6 space-y-2 text-center text-sm">
          <p>
            <Link href="/reset-password" className="underline">
              Forgot your password?
            </Link>
          </p>
          <p>
            No account?{" "}
            <Link href="/signup" className="underline">
              Create one
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
