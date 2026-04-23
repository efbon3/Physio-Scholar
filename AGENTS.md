<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Project: Physio-Scholar

Mechanism-based active-recall PWA for MBBS physiology. V1 is a pilot for the
author's own first-year batch.

## Read these before writing code

The authoritative scope and design documents live in `docs/`:

1. `docs/vision_and_design.md` — product principles and pedagogy.
2. `docs/build_spec.md` — v1 scope, acceptance criteria, phase sequence.
3. `docs/content_production_sop.md` — content workflow.
4. `docs/roadmap.md` — post-v1 plans (do not build anything from here).

**If a feature is not in the V1 Build Specification, do not build it.** Flag
it as out-of-scope or confirm with the author first.

## Phase discipline

V1 is broken into phases (see `docs/build_spec.md` §4). Current phase and
what's in scope should always be confirmed before starting non-trivial work.
Phase 0 (gold-standard mechanism content) runs in parallel with Phase 1
engineering.

## Stack deviations to remember

- **Next.js 16 + Turbopack**, not 14. React 19. TypeScript strict.
- **Tailwind v4** via `@tailwindcss/postcss` — CSS-first config lives in
  `src/app/globals.css`; there is no `tailwind.config.ts`.
- **shadcn/ui** with the `base-nova` style on Tailwind v4. Use
  `npx shadcn@latest add <component>` to add primitives.
- **Serwist** will be used for the service worker (not `next-pwa`) when PWA
  work starts in Phase 2.
- **Rollup is overridden to `@rollup/wasm-node`** in `package.json` because
  Windows Smart App Control blocks Rollup's native `.node` binary. Do not
  remove this override unless you have verified Vitest still runs on Windows.

## Testing conventions

- Unit tests live next to source: `src/**/*.test.ts(x)`.
- E2E + axe tests live in `e2e/`.
- SRS scheduler (when built in Phase 3) must have 100% test coverage
  (build spec §2.7).

## Things not to do

- Do not add features outside v1 scope "while you're in there."
- Do not introduce new tools or frameworks without a specific reason tied to
  the build spec.
- Do not commit to `main` that breaks `npm run lint`, `format:check`,
  `type-check`, or `test:run`. CI enforces all four.
- Do not author medical content. Content is the author's job; engineering
  serves that content.
