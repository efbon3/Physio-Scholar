import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Physio-Scholar</h1>
      <div className="flex flex-wrap gap-3">
        <Link href="/signup" className={cn(buttonVariants({ size: "lg" }))}>
          Create account
        </Link>
        <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
          Sign in
        </Link>
      </div>
    </main>
  );
}
