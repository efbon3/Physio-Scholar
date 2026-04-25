"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { createPersonalEventAction } from "@/lib/calendar/actions";

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

type FormError = string | null;

/**
 * Personal event form — a learner adds a self-set test, milestone, or
 * any private calendar marker. Submits to `createPersonalEventAction`
 * which forces audience='personal' and owner_id=auth.uid() server-side
 * so the form can't be used to inject institution-scoped events.
 */
export function PersonalEventForm() {
  const [error, setError] = useState<FormError>(null);
  const [pending, startTransition] = useTransition();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Calendar</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Add personal event</h1>
        <p className="text-muted-foreground text-sm leading-7">
          Visible only to you. The cluster-2 SRS weighting will surface cards from the topics you
          flag below in the ±14 days before the start date.
        </p>
      </header>

      <form
        action={(formData) => {
          setError(null);
          startTransition(async () => {
            const result = await createPersonalEventAction(formData);
            if (result.status === "error") setError(result.message);
            // status==="ok" → action redirected to /calendar
          });
        }}
        className="flex flex-col gap-5"
      >
        <Field label="Title" name="title" required maxLength={200} />

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">Type</legend>
          <div className="flex flex-wrap gap-2">
            {(["exam", "milestone"] as const).map((kind) => (
              <label
                key={kind}
                className="border-input hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <input
                  type="radio"
                  name="kind"
                  value={kind}
                  defaultChecked={kind === "exam"}
                  required
                />
                <span className="capitalize">{kind}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Start date" name="starts_at" type="date" required />
          <Field label="End date (optional)" name="ends_at" type="date" />
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">Topics covered</legend>
          <p className="text-muted-foreground text-xs">
            Select the organ systems your test or milestone touches. Drives the ±14d SRS weighting
            so cards from these systems surface earlier in the queue.
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

        <Field label="Notes (optional)" name="notes" textarea maxLength={2000} />

        {error ? (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
            data-testid="personal-event-save"
          >
            {pending ? "Saving…" : "Save event"}
          </button>
          <Link
            href="/calendar"
            className="text-muted-foreground text-xs underline-offset-2 hover:underline"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  maxLength,
  textarea = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
  textarea?: boolean;
}) {
  const id = `event-${name}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          name={name}
          maxLength={maxLength}
          className="border-input bg-background min-h-20 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          maxLength={maxLength}
          className="border-input bg-background h-10 rounded-md border px-3 text-sm outline-none focus:ring-2"
        />
      )}
    </div>
  );
}
