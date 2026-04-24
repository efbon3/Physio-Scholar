import { watermarkId } from "@/lib/watermark";

/**
 * Visible user-id watermark. Renders a small discreet tag with a
 * hashed excerpt of the signed-in user's id in the bottom-right
 * corner of content pages.
 *
 * Per build spec §2.11, this is an anti-abuse measure — learners
 * seeing a traceable marker on every content view are less likely
 * to screenshot-and-share, and any leak that happens is traceable
 * via the hash prefix.
 *
 * Returns null when we don't have a user id (CI / preview envs) so
 * the marker doesn't print as "preview" on anonymous pages.
 */
export async function Watermark({ userId }: { userId: string | null }) {
  if (!userId || userId === "preview") return null;
  const hash = await watermarkId(userId);
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed right-3 bottom-3 z-40 font-mono text-[10px] opacity-50 select-none print:static print:text-black print:opacity-100"
    >
      {hash}
    </div>
  );
}
