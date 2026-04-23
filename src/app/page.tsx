export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-6 px-6 py-16">
      <header>
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Physio-Scholar</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Mechanism-based active recall for MBBS physiology.
        </h1>
      </header>
      <p className="text-muted-foreground text-base leading-7">
        This is the v1 pilot scaffold. Authentication, the learning loop, and the cardiovascular
        content pack land in upcoming build phases. See{" "}
        <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm">docs/build_spec.md</code>{" "}
        for the full plan.
      </p>
      <p className="text-muted-foreground text-sm">Phase 1 · project setup complete.</p>
    </main>
  );
}
