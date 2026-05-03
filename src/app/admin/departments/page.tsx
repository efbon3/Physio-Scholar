import { createClient } from "@/lib/supabase/server";

import { CreateDepartmentForm } from "./create-department-form";
import { DepartmentRow, type EligibleHead } from "./department-row";

export const metadata = {
  title: "Departments · Admin",
};

type DepartmentRecord = {
  id: string;
  name: string;
  head_user_id: string | null;
  created_at: string;
};

/**
 * Admin → departments. CRUD over public.departments scoped to the
 * admin's own institution (RLS enforces — same-institution callers
 * read, admins write). Each row supports rename, set/clear HOD, and
 * delete.
 *
 * The HOD picker shows users in the same institution whose role is
 * `hod` or `faculty`. Setting a faculty user as HOD here doesn't
 * change their role — that's a separate admin action on
 * /admin/users/[id]. The picker exposes faculty too because in the
 * flow "promote to HOD then assign as head", the order may sometimes
 * be reversed (assign as head first, then admin remembers to flip
 * the role).
 */
export default async function AdminDepartmentsPage() {
  const supabase = await createClient();

  // Caller's institution_id — used to scope the eligible-head picker.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: callerProfile } = user
    ? await supabase.from("profiles").select("institution_id").eq("id", user.id).single()
    : { data: null };
  const institutionId = callerProfile?.institution_id ?? null;

  const { data: departments, error: deptError } = await supabase
    .from("departments")
    .select("id, name, head_user_id, created_at")
    .order("name", { ascending: true });

  // Eligible heads — same institution, role hod or faculty. We render
  // even when the call fails (treat as empty list) so the page still
  // works enough to add the first department.
  let eligibleHeads: EligibleHead[] = [];
  if (institutionId) {
    const { data: heads } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("institution_id", institutionId)
      .in("role", ["hod", "faculty"])
      .order("full_name", { ascending: true });
    eligibleHeads = (heads ?? []).map((h) => ({
      id: h.id,
      full_name: h.full_name,
      role: h.role,
    }));
  }

  const rows = (departments ?? []) as DepartmentRecord[];

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Departments</h1>
        <p className="text-muted-foreground text-sm">
          Sub-divisions inside your institution. Each HOD heads exactly one; faculty members belong
          to one. The Faculty Platform approval queue routes a faculty&apos;s submitted artefacts to
          the HOD of their department.
        </p>
      </header>

      <section aria-label="Add department" className="mb-6">
        <CreateDepartmentForm />
      </section>

      {deptError ? (
        <p className="text-destructive text-sm">Failed to load: {deptError.message}</p>
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No departments yet. Add one above to get started.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((d) => (
            <DepartmentRow
              key={d.id}
              id={d.id}
              name={d.name}
              headUserId={d.head_user_id}
              eligibleHeads={eligibleHeads}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
