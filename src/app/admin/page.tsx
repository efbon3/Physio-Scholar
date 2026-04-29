import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Admin",
};

/**
 * Admin overview — top-line counts + quick links into the deeper surfaces.
 * The numbers are read server-side with service-role-equivalent RLS
 * (admins can select across profiles + reviews + content_flags).
 */
export default async function AdminOverview() {
  const supabase = await createClient();
  const [profilesResult, reviewsResult, openFlagsResult] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("reviews").select("*", { count: "exact", head: true }),
    supabase.from("content_flags").select("*", { count: "exact", head: true }).eq("status", "open"),
  ]);

  const userCount = profilesResult.count ?? 0;
  const reviewCount = reviewsResult.count ?? 0;
  const openFlags = openFlagsResult.count ?? 0;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Admin</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Overview</h1>
      </header>

      <section aria-label="Headline counts">
        <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <Card label="Total users" value={`${userCount}`} href="/admin/users" />
          <Card label="Total reviews" value={`${reviewCount}`} />
          <Card
            label="Open content flags"
            value={`${openFlags}`}
            href="/admin/flags"
            accent={openFlags > 0}
          />
        </dl>
      </section>

      <section
        aria-label="Phase 4 placeholders"
        className="text-muted-foreground flex flex-col gap-2 border-t pt-4 text-xs"
      >
        <p>
          Dispute queue lands with the Phase 4 AI grader. Content edits are made in the repo (
          <code>content/chapters/</code>) and shipped via a normal deploy — admin does not write
          content in the app.
        </p>
      </section>
    </main>
  );
}

function Card({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: string;
  href?: string;
  accent?: boolean;
}) {
  const content = (
    <div
      className={`border-border flex h-full flex-col gap-1 rounded-md border p-4 ${accent ? "bg-primary/5" : "bg-background"}`}
    >
      <dt className="text-muted-foreground text-xs tracking-widest uppercase">{label}</dt>
      <dd className="text-3xl font-medium">{value}</dd>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}
