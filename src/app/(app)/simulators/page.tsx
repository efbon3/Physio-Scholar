import Link from "next/link";

export const metadata = {
  title: "Simulators",
};

const SIMULATORS = [
  {
    href: "/simulators/frank-starling",
    title: "Frank-Starling curve",
    body: "Drag preload and switch contractility states; watch stroke volume and ejection fraction move along the sigmoidal curve. Shows why a failing heart sits on a flatter curve and why increased preload eventually stops helping.",
  },
  {
    href: "/simulators/baroreceptor-reflex",
    title: "Baroreceptor reflex",
    body: "Trigger a blood-pressure drop and watch the reflex arc play out: baroreceptor firing falls, sympathetic surge rises, heart rate climbs, pressure recovers. Toggle vagal or sympathetic blockade to see the failure modes.",
  },
] as const;

/**
 * Simulators index — interactive living diagrams that complement the
 * static Chapter pages. Each simulator is tied to one Chapter and
 * cross-links from the Chapter detail page, so students discover
 * them in context too.
 */
export default function SimulatorsIndex() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Simulators</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Interactive models</h1>
        <p className="text-muted-foreground text-sm leading-7">
          Physiology that moves. Manipulate variables and watch the curves, traces, and numbers
          respond — for mechanisms where dynamics matter more than static snapshots.
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {SIMULATORS.map((s) => (
          <li
            key={s.href}
            className="border-border hover:bg-muted/30 rounded-md border p-4 transition-colors"
          >
            <Link href={s.href} className="flex flex-col gap-1">
              <p className="font-heading text-lg font-medium">{s.title}</p>
              <p className="text-muted-foreground text-sm leading-7">{s.body}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
