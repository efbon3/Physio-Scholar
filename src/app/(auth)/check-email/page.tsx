import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

export default function CheckEmailPage() {
  return (
    <Card>
      <CardHeader>
        <h1 className="font-heading text-2xl font-medium">Check your email</h1>
        <CardDescription>
          We sent a confirmation link to the address you signed up with. Click it to finish creating
          your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground space-y-2 text-sm">
        <p>
          Didn&apos;t arrive? Check spam, or go back and try signing up again with the same email —
          we&apos;ll resend the confirmation.
        </p>
        <p>
          <Link href="/login" className="underline">
            Already confirmed? Sign in.
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
