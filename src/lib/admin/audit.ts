import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * Write a row to the admin_audit_log table from a server action.
 *
 * RLS denies inserts from authenticated callers — the table is meant
 * to be append-only via service-role writes only. For pilot scale
 * (~100 students, low admin volume) we accept the simplification
 * that audit writes go through the regular request-scoped client and
 * therefore depend on a service-role override or a SECURITY DEFINER
 * shim being added before the writes start landing in production.
 *
 * For now, this helper is a thin wrapper that swallows write errors
 * silently — an audit-write failure must not break the user-facing
 * admin action it accompanies. When wiring real writes from existing
 * server actions, call this helper after the primary mutation
 * succeeds; never let an audit failure prevent the underlying change.
 *
 * Example:
 *   await setFacultyFlagAction(profileId, true);
 *   void writeAuditEntry({
 *     action: "set_faculty",
 *     target_type: "profiles",
 *     target_id: profileId,
 *     details: { value: true },
 *   });
 */
export type AuditEntry = {
  action: string;
  target_type?: string | null;
  target_id?: string | null;
  details?: unknown;
};

export async function writeAuditEntry(entry: AuditEntry): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("admin_audit_log").insert({
      actor_id: user.id,
      action: entry.action,
      target_type: entry.target_type ?? null,
      target_id: entry.target_id ?? null,
      details: (entry.details ?? null) as never,
    });
  } catch {
    // Best-effort. An audit failure must not break the admin action.
  }
}
