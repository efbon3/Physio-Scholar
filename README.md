# Physio-Scholar

Mechanism-based active-recall learning for MBBS physiology. V1 is a pilot PWA
for the author's own first-year batch, covering cardiovascular fundamentals.

## Status

Phase 1 · project setup. The learning loop, content, auth, offline sync, and
AI grading all land in later phases. See [`docs/build_spec.md`](docs/build_spec.md)
for the full plan.

## Documents

Read in this order:

1. [`docs/vision_and_design.md`](docs/vision_and_design.md) — what the product
   is and why. Authoritative on design principles and pedagogy.
2. [`docs/build_spec.md`](docs/build_spec.md) — what v1 is, acceptance
   criteria, build sequence. Authoritative on implementation scope.
3. [`docs/content_production_sop.md`](docs/content_production_sop.md) — how
   content gets authored, reviewed, and maintained.
4. [`docs/roadmap.md`](docs/roadmap.md) — what comes after v1. Subject to
   revision as pilot outcomes inform priorities.

If it is not explicitly in the V1 Build Specification, it is not in v1.

## Tech stack

| Layer         | Tool                                                     |
| ------------- | -------------------------------------------------------- |
| Framework     | Next.js 16 · App Router · React 19 · TypeScript strict   |
| Styling       | Tailwind CSS v4 · shadcn/ui (base-nova) · Lucide icons   |
| State         | Zustand (client) · TanStack Query (server) _(phase 3+)_  |
| Database      | Supabase · Postgres · Row-Level Security _(phase 1)_     |
| Auth          | Supabase Auth · email + password _(phase 1)_             |
| Offline       | IndexedDB via Dexie · Serwist service worker _(phase 2)_ |
| AI            | Anthropic Claude SDK (Sonnet) _(phase 4)_                |
| Email         | Resend _(phase 1)_                                       |
| Observability | Sentry · PostHog · Vercel Analytics _(phase 1)_          |
| Testing       | Vitest · Playwright · @axe-core/playwright               |
| Deployment    | Vercel                                                   |

Notes on deviations from `docs/build_spec.md` Appendix A:

- **Next.js 16** (spec says "14+"). Uses Turbopack by default, React 19, new
  caching semantics. Breaking changes vs Next 14 — check `node_modules/next/dist/docs/`
  before assuming behavior.
- **Serwist instead of `next-pwa`**. `next-pwa` is unmaintained and does not
  support Next 15+; Serwist is the actively maintained successor built on the
  same Workbox primitives. Same deliverable, supported runtime.

## Getting started

```bash
# Node 22 is the target (see .nvmrc); Node 20+ also works.
npm install

# Copy and fill in environment variables as each service comes online.
cp .env.example .env.local

npm run dev
```

Open <http://localhost:3000>.

## Scripts

| Command                 | What it does                             |
| ----------------------- | ---------------------------------------- |
| `npm run dev`           | Next.js dev server on :3000              |
| `npm run build`         | Production build                         |
| `npm run start`         | Serve the production build               |
| `npm run lint`          | ESLint (flat config, Next + TS rules)    |
| `npm run lint:fix`      | ESLint with auto-fix                     |
| `npm run format`        | Prettier write                           |
| `npm run format:check`  | Prettier check (CI uses this)            |
| `npm run type-check`    | `tsc --noEmit` against the whole project |
| `npm run test`          | Vitest in watch mode                     |
| `npm run test:run`      | Vitest single run                        |
| `npm run test:coverage` | Vitest with V8 coverage                  |
| `npm run test:e2e`      | Playwright tests (requires browsers)     |
| `npm run test:e2e:ui`   | Playwright UI mode                       |

First-time Playwright setup (downloads Chromium, ~170 MB):

```bash
npx playwright install --with-deps chromium
```

## Repository layout

```
.
├── .github/workflows/   CI — lint, unit, E2E + axe
├── .husky/              Pre-commit hook runs lint-staged
├── content/             Markdown mechanisms, diagrams, AI prompts (per SOP)
│   ├── mechanisms/
│   ├── diagrams/
│   └── prompts/
├── docs/                Design docs — the source of truth for scope
├── e2e/                 Playwright tests (smoke + axe a11y)
├── public/              Static assets served at /
├── src/
│   ├── app/             Next.js App Router routes
│   ├── components/      React components
│   │   └── ui/          shadcn/ui primitives
│   ├── hooks/           Custom React hooks
│   └── lib/             Shared utilities (e.g. cn)
├── components.json      shadcn/ui config
├── eslint.config.mjs    ESLint flat config
├── next.config.ts       Next.js config
├── playwright.config.ts Playwright config
├── postcss.config.mjs   Tailwind v4 via @tailwindcss/postcss
├── vitest.config.ts     Vitest config (jsdom, @/* alias)
└── vitest.setup.ts      @testing-library/jest-dom matchers
```

## Environment-specific note: Windows Smart App Control

On Windows 11 with Smart App Control enabled, unsigned native Node modules
(`.node` files) are blocked from loading. Rollup's native binary is one such
casualty, which crashes Vitest and anything that imports Rollup at runtime.

The fix in this repo: [`package.json`](package.json) overrides `rollup` with
`@rollup/wasm-node`, swapping the native bundler for the WASM build. No user
action is required on other platforms; macOS, Linux, and WSL use the native
binary transparently. CI uses Ubuntu where this does not apply.

## Contributing

No external contributions during the v1 pilot. This repo is authored solely by
the project author; issues and PRs from outside the core team will not be
actioned. That posture changes with v2 if external expansion happens —
see [`docs/roadmap.md`](docs/roadmap.md).
