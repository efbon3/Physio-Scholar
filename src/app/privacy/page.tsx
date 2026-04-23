import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Physio-Scholar privacy policy (placeholder for v1 pilot).",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-6 py-16">
      <h1 className="font-heading text-3xl font-medium">Privacy Policy</h1>
      <p className="text-sm">
        This page is a placeholder for the v1 pilot. A DPDPA-compliant Privacy Policy will be
        published before public launch. During the pilot, the project author serves as the Data
        Fiduciary; personal data is limited to email address, learning activity, and consent records
        needed to operate the app.
      </p>
      <p className="text-sm">
        You can revoke analytics consent at any time in Settings. You can request deletion of your
        account and personal data; deletions are processed within 30 days of the request (build spec
        §2.10).
      </p>
      <p className="text-sm">Last updated: 2026-04-23.</p>
    </main>
  );
}
