import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-6 px-6 py-16">
      <header>
        <p className="text-sm font-medium tracking-widest uppercase">Physio-Scholar</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Mechanism-based active recall for MBBS physiology.
        </h1>
      </header>
      <p className="text-base leading-7">
        This is the v1 pilot scaffold. Authentication, the learning loop, and the cardiovascular
        content pack land in upcoming build phases. See docs/build_spec.md for the full plan.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/signup" className={cn(buttonVariants({ size: "lg" }))}>
          Create account
        </Link>
        <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
          Sign in
        </Link>
      </div>
      <p className="text-sm">Phase 1 · project setup complete.</p>
    </main>
  );
}
