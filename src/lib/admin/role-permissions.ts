/**
 * Shared types + metadata for the per-role capability matrix backed by
 * the `role_permissions` table (migration 20260513).
 *
 * The matrix lets the admin decide what each role can do platform-wide.
 * Faculty / HOD code paths read these flags at request time to gate UI
 * affordances + the corresponding server actions; admins always pass
 * every flag (so admin-row state is informational only).
 *
 * Adding a new capability:
 *   1. Add a column to public.role_permissions in a fresh migration.
 *   2. Add the column name to ROLE_CAPABILITIES below + give it a label.
 *   3. Re-generate database.types.ts so the typed read paths pick it up.
 *   4. Use `roleHas(role, capability)` from anywhere in the app.
 */

import type { Database } from "@/lib/supabase/database.types";

export type Role = "student" | "faculty" | "hod" | "admin";

export type RolePermissionsRow = Database["public"]["Tables"]["role_permissions"]["Row"];

/**
 * The 14 capability flag columns from migration 20260513. Each entry:
 *   - `key` — the column name on role_permissions (also the request-
 *     time gate identifier for the server action that updates it).
 *   - `label` — short human-readable name for the matrix header.
 *   - `description` — tooltip-grade explainer the admin sees on hover.
 *   - `group` — visual section in the matrix UI.
 */
export type Capability = {
  key: keyof Omit<RolePermissionsRow, "role" | "updated_at">;
  label: string;
  description: string;
  group: "Authoring" | "Approval" | "Records" | "Roster" | "Audit";
};

export const ROLE_CAPABILITIES: readonly Capability[] = [
  // Authoring — creating publishables. HOD must approve before students see them.
  {
    key: "can_create_assignments",
    label: "Create assignments",
    description: "Author homework / graded work that students will complete.",
    group: "Authoring",
  },
  {
    key: "can_create_student_tasks",
    label: "Create student tasks",
    description: "Post ungraded tasks (reading, prep, etc.) for students.",
    group: "Authoring",
  },
  {
    key: "can_send_announcements",
    label: "Send announcements",
    description: "Broadcast text announcements to selected batches.",
    group: "Authoring",
  },
  {
    key: "can_edit_schedule",
    label: "Edit schedule",
    description: "Add or change classes / lectures on the teaching calendar.",
    group: "Authoring",
  },
  // Approval — HOD-side moderation of faculty-authored publishables.
  {
    key: "can_approve_publishing",
    label: "Approve publishing",
    description: "Decide whether faculty-authored work goes live to students.",
    group: "Approval",
  },
  {
    key: "can_message_students",
    label: "Message students",
    description: "Send write-once direct messages to individual students.",
    group: "Approval",
  },
  // Records — attendance + marks. Edit implies view.
  {
    key: "can_view_attendance",
    label: "View attendance",
    description: "Read attendance records for the user's allowed batches.",
    group: "Records",
  },
  {
    key: "can_edit_attendance",
    label: "Edit attendance",
    description: "Mark students present / absent / leave in attendance grids.",
    group: "Records",
  },
  {
    key: "can_view_marks",
    label: "View marks",
    description: "Read assignment marks for the user's allowed batches.",
    group: "Records",
  },
  {
    key: "can_edit_marks",
    label: "Edit marks",
    description: "Enter or change marks on existing assignments.",
    group: "Records",
  },
  {
    key: "can_grade_assignments",
    label: "Grade assignments",
    description: "Apply rubric grades + feedback comments on submissions.",
    group: "Records",
  },
  // Roster — student-list visibility + edits.
  {
    key: "can_view_roster",
    label: "View roster",
    description: "Read the student roster for the user's allowed batches.",
    group: "Roster",
  },
  {
    key: "can_edit_roster",
    label: "Edit roster",
    description: "Add / remove students from a batch.",
    group: "Roster",
  },
  // Audit — sensitive read-only surface.
  {
    key: "can_view_audit_log",
    label: "View audit log",
    description: "Read the system-wide audit log of admin / faculty actions.",
    group: "Audit",
  },
] as const;

/** Order roles render in across the matrix columns. */
export const ROLE_ORDER: readonly Role[] = ["student", "faculty", "hod", "admin"] as const;

export const ROLE_LABEL: Record<Role, string> = {
  student: "Student",
  faculty: "Faculty",
  hod: "HOD",
  admin: "Admin",
};

/**
 * Pure helper: does a row from the matrix grant a capability? Admins
 * always return true — the row's flags are informational. For non-admin
 * roles it's a straight boolean read.
 */
export function rowHas(row: RolePermissionsRow, capability: Capability["key"]): boolean {
  if (row.role === "admin") return true;
  return Boolean(row[capability]);
}
