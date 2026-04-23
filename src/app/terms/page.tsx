import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Physio-Scholar terms of service. Placeholder until v1 launch.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-6 py-16">
      <h1 className="font-heading text-3xl font-medium">Terms of Service</h1>
      <p className="text-sm">
        This page is a placeholder for the v1 pilot. A full Terms of Service document will be
        published before public launch of Physio-Scholar. During the pilot, use of the app is
        governed by direct agreement with the project author.
      </p>
      <p className="text-sm">Last updated: 2026-04-23.</p>
    </main>
  );
}
