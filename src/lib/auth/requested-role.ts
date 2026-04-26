/**
 * Self-declared role at signup. INFORMATIONAL ONLY — does not grant
 * any privilege. The admin reads this to decide whether to set
 * is_admin / is_faculty during approval. The 20260506 column-lock
 * trigger keeps a learner from setting those flags directly even if
 * they've claimed `requested_role: 'admin'` here.
 */
export const REQUESTED_ROLES = ["student", "faculty", "admin"] as const;
export type RequestedRole = (typeof REQUESTED_ROLES)[number];

export const DEFAULT_REQUESTED_ROLE: RequestedRole = "student";

export function parseRequestedRole(raw: unknown): RequestedRole {
  if (typeof raw !== "string") return DEFAULT_REQUESTED_ROLE;
  if ((REQUESTED_ROLES as readonly string[]).includes(raw)) return raw as RequestedRole;
  return DEFAULT_REQUESTED_ROLE;
}

export function requestedRoleLabel(role: RequestedRole): string {
  switch (role) {
    case "student":
      return "Student";
    case "faculty":
      return "Faculty";
    case "admin":
      return "Admin";
  }
}
