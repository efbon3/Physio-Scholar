# Pre-pilot-launch checklist

Items to complete before the first real pilot student signs up. Deferred during Phase 2+ engineering work because none of them block code progress, and the repo is private with zero real data.

Revisit ~1–2 weeks before the pilot cohort's first login.

## Security / access

- [ ] **Revoke the Legacy HS256 JWT signing key** on the Supabase project.
      Dashboard → Project Settings → JWT Keys → JWT Signing Keys tab → ⋮ on "PREVIOUS KEY" (`0C46F249-...`) → Revoke.
      This invalidates the legacy `eyJ...` `anon` and `service_role` tokens that were shared in the initial setup chat transcript.
- [ ] **Rotate the database password** once more, out of any chat or email surface.
      Dashboard → Settings → Database → Reset password. Save to a password manager. Re-run `supabase link` locally; re-run `supabase db push` is not needed (no schema drift).
- [ ] **Rotate the `sb_secret_...` key** one more time post-launch-freeze.
      Dashboard → Project Settings → API Keys → Publishable and secret API keys → ⋮ on the secret key → Rotate. Update `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` and in Vercel env vars (Prod + Preview + Dev). Redeploy.

## Email delivery

- [ ] **Resend account + API key** created at <https://resend.com>.
- [ ] **Verified sender domain** on Resend (SPF + DKIM) — preferred over `onboarding@resend.dev` for anything user-facing.
- [ ] **Supabase → Auth → SMTP Settings** switched to Resend:
  - Host: `smtp.resend.com`
  - Port: `465`
  - Username: `resend`
  - Password: the Resend API key
  - Sender email: your verified-domain sender
- [ ] **`RESEND_API_KEY`** and **`RESEND_FROM_EMAIL`** added to `.env.local` and Vercel env vars (for any app-initiated direct sends in later phases — welcome emails, deletion confirmations, etc.).

## Supabase auth URLs

- [ ] **Site URL:** `https://physio-scholar.vercel.app` (Dashboard → Authentication → URL Configuration → Site URL).
- [ ] **Additional Redirect URLs:**
  - `http://localhost:3000/**` (local dev auth callbacks)
  - `https://*.vercel.app/**` (preview deploys for every PR)

Without these, the email-confirmation links in signup flows bounce with "Invalid redirect URL".

## End-to-end smoke

- [ ] From an incognito window, hit `https://physio-scholar.vercel.app/signup`.
- [ ] Sign up with a real email (plus-addressing works, e.g. `yourname+smoketest@gmail.com`), password ≥ 12 chars, tick both required consent boxes.
- [ ] Confirm redirect to `/check-email`.
- [ ] Open the confirmation email (via Resend once configured) → click link → confirm redirect to app landing page with session established.
- [ ] `/login` with the same credentials works.
- [ ] `/reset-password` request works; reset link returns you to `/update-password`; new password takes effect.

## Legal copy

- [ ] **Privacy Policy** at `/privacy` replaced with a real DPDPA-compliant document. Current page is a placeholder.
- [ ] **Terms of Service** at `/terms` replaced with the final pilot agreement. Current page is a placeholder.

## Observability sign-off

- [ ] **Sentry project** created; `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT` set in Vercel. First production error visible in Sentry inbox.
- [ ] **PostHog project** created; `NEXT_PUBLIC_POSTHOG_KEY` set in Vercel. Analytics consent flow verified: signing up with the analytics checkbox unticked should result in **zero** PostHog events captured; ticking it and navigating should produce events.

## GitHub branch protection (optional)

- [ ] If the repo goes public at launch, or if a second contributor gets write access, enable server-enforced branch protection on `main`.
      Settings → Branches → Add rule → Required status checks: Lint + format + types, Unit tests (Vitest), E2E + accessibility (Playwright + axe), DB migrations + RLS (pgTAP), Vercel.

## Phase 1 follow-ups

- [ ] Upgrade GitHub Actions versions (`actions/checkout`, `actions/setup-node`, `actions/upload-artifact`) to `v5` when released — current `v4` versions trigger Node 20 deprecation warnings in workflow logs.

---

Nothing on this list blocks Phase 2 or later engineering work. It's here so we don't forget.
