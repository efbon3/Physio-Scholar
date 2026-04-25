"use client";

import { useState, useTransition } from "react";

import { createInstitutionEventAction } from "@/lib/calendar/actions";

const ORGAN_SYSTEMS = [
  "cardiovascular",
  "respiratory",
  "renal",
  "gastrointestinal",
  "endocrine",
  "nervous",
  "musculoskeletal",
  "reproductive",
  "blood",
  "immune",
  "integumentary",
] as const;

const KIND_OPTIONS = [
  { value: "exam", label: "Exam" },
  { value: "holiday", label: "Holiday" },
  { value: "semester_boundary", label: "Semester boundary" },
  { value: "milestone", label: "Milestone" },
] as const;

type FormError = string | null;

/**
 * Faculty / admin form for institution-scoped events. Audience and
 * institution_id are forced server-side by the action — the form
 * cannot inject either field. RLS is the actual gate; this surface
 * is the affordance.
 */
export function InstitutionEventForm() {
  const [error, setError] = useState<FormError>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await createInstitutionEventAction(formData);
          if (result.status === "error") setError(result.message);
          // ok → action redirects to /admin/calendar
        });
      }}
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="ie-title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="ie-title"
          name="title"
          required
          maxLength={200}
          className="border-input bg-background h-10 rounded-md border px-3 text-sm outline-none focus:ring-2"
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Type</legend>
        <div className="flex flex-wrap gap-2">
          {KIND_OPTIONS.map((opt, i) => (
            <label
              key={opt.value}
              className="border-input hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <input type="radio" name="kind" value={opt.value} defaultChecked={i === 0} required />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ie-starts" className="text-sm font-medium">
            Start date
          </label>
          <input
            id="ie-starts"
            name="starts_at"
            type="date"
            required
            className="border-input bg-background h-10 rounded-md border px-3 text-sm outline-none focus:ring-2"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ie-ends" className="text-sm font-medium">
            End date (optional)
          </label>
          <input
            id="ie-ends"
            name="ends_at"
            type="date"
            className="border-input bg-background h-10 rounded-md border px-3 text-sm outline-none focus:ring-2"
          />
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Topics covered</legend>
        <p className="text-muted-foreground text-xs">
          For exams, select the organ systems being tested. Drives ±14d SRS weighting for every
          learner in your institution. Leave empty for non-exam events.
        </p>
        <div className="flex flex-wrap gap-2">
          {ORGAN_SYSTEMS.map((sys) => (
            <label
              key={sys}
              className="border-input hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <input type="checkbox" name="organ_systems" value={sys} />
              <span className="capitalize">{sys}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="ie-notes" className="text-sm font-medium">
          Notes (optional)
        </label>
        <textarea
          id="ie-notes"
          name="notes"
          maxLength={2000}
          className="border-input bg-background min-h-20 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
        />
      </div>

      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
          data-testid="institution-event-save"
        >
          {pending ? "Saving…" : "Add event"}
        </button>
      </div>
    </form>
  );
}
