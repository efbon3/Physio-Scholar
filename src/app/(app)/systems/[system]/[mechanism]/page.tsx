import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { MechanismRenderer } from "@/components/content/mechanism-renderer";
import { readAllMechanisms, readMechanismById } from "@/lib/content/fs";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ system: string; mechanism: string }> };

export async function generateStaticParams() {
  const mechanisms = await readAllMechanisms();
  return mechanisms.map((m) => ({
    system: m.frontmatter.organ_system,
    mechanism: m.frontmatter.id,
  }));
}

export async function generateMetadata({ params }: Params) {
  const { mechanism: id } = await params;
  const m = await readMechanismById(id);
  return { title: m?.frontmatter.title ?? "Mechanism not found" };
}

/** Same graceful posture as the middleware: skip Supabase in unconfigured envs. */
async function getProfileId(nextPath: string): Promise<string> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return "preview";
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
    return data.user.id;
  } catch {
    return "preview";
  }
}

export default async function MechanismPage({ params }: Params) {
  const { system, mechanism: id } = await params;
  const mechanism = await readMechanismById(id);

  // 404 cleanly if the mechanism id doesn't exist OR if the URL's
  // system slug doesn't match the mechanism's actual system — prevents
  // "renal/frank-starling" from rendering as if it were a renal topic.
  if (!mechanism || mechanism.frontmatter.organ_system !== system) {
    notFound();
  }

  const profileId = await getProfileId(`/systems/${system}/${id}`);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <nav className="text-muted-foreground text-xs">
        <Link href="/systems" className="underline-offset-2 hover:underline">
          Systems
        </Link>
        {" / "}
        <Link href={`/systems#${system}`} className="capitalize underline-offset-2 hover:underline">
          {system}
        </Link>
      </nav>
      <MechanismRenderer mechanism={mechanism} profileId={profileId} />
    </main>
  );
}
