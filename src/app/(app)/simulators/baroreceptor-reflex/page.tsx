import Link from "next/link";

import { BaroreceptorSimulator } from "./simulator";

export const metadata = {
  title: "Baroreceptor reflex simulator",
};

export default function BaroreceptorPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">
          Simulator · Cardiovascular
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Baroreceptor reflex</h1>
        <p className="text-muted-foreground text-sm leading-7">
          Pick a pressure stimulus, pick a reflex state, and watch four simultaneous traces play out
          over twenty seconds: mean arterial pressure, baroreceptor firing rate, heart rate, and
          sympathetic activity. Toggle the reflex off and see what happens to a patient with
          baroreceptor denervation.
        </p>
      </header>

      <BaroreceptorSimulator />

      <nav aria-label="Related" className="text-muted-foreground flex gap-4 border-t pt-4 text-xs">
        <Link
          href="/systems/cardiovascular/baroreceptor-reflex"
          className="underline-offset-2 hover:underline"
        >
          Read the mechanism page →
        </Link>
        <Link href="/simulators" className="underline-offset-2 hover:underline">
          ← All simulators
        </Link>
      </nav>
    </main>
  );
}
