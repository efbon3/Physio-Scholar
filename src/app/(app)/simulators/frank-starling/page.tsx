import Link from "next/link";

import { FrankStarlingSimulator } from "./simulator";

export const metadata = {
  title: "Frank-Starling simulator",
};

export default function FrankStarlingPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">
          Simulator · Cardiovascular
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Frank-Starling curve</h1>
        <p className="text-muted-foreground text-sm leading-7">
          Drag end-diastolic volume and switch contractility. Watch stroke volume and ejection
          fraction track along the sigmoidal curve. A failing heart sits on a flatter curve —
          additional preload raises filling pressure without raising output.
        </p>
      </header>

      <FrankStarlingSimulator />

      <nav aria-label="Related" className="text-muted-foreground flex gap-4 border-t pt-4 text-xs">
        <Link
          href="/systems/cardiovascular/frank-starling"
          className="underline-offset-2 hover:underline"
        >
          Read the chapter page →
        </Link>
        <Link href="/simulators" className="underline-offset-2 hover:underline">
          ← All simulators
        </Link>
      </nav>
    </main>
  );
}
