import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  daysUntil,
  groupByMonth,
  readVisibleEvents,
  type ExamEventRow,
} from "@/lib/calendar/events";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

import { DeletePersonalEventButton } from "./delete-personal-event-button";

export const metadata = {
  title: "Calendar",
};

async function loadFacultyFlag(): Promise<{ isFaculty: boolean; isAdmin: boolean }> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { isFaculty: false, isAdmin: false };
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { isFaculty: false, isAdmin: false };
    const { data } = await supabase
      .from("profiles")
      .select("is_faculty, is_admin")
      .eq("id", user.id)
      .single();
    return { isFaculty: Boolean(data?.is_faculty), isAdmin: Boolean(data?.is_admin) };
  } catch {
    return { isFaculty: false, isAdmin: false };
  }
}

const KIND_LABELS: Record<string, string> = {
  exam: "Exam",
  holiday: "Holiday",
  semester_boundary: "Semester",
  milestone: "Milestone",
};

const KIND_TONE: Record<string, string> = {
  exam: "border-destructive/40 bg-destructive/5",
  holiday: "border-emerald-300 bg-emerald-50",
  semester_boundary: "border-input bg-muted/40",
  milestone: "border-blue-300 bg-blue-50/40",
};

/**
 * Calendar — read-only list view of every exam_events row visible to
 * the caller (institution events for their institution + their own
 * personal events). Grouped by month, ordered ascending.
 *
 * Authoring forms (faculty / personal) land in a follow-up PR; this
 * page is the surface they will both link to.
 */
export default async function CalendarPage() {
  const [events, role] = await Promise.all([readVisibleEvents(), loadFacultyFlag()]);
  const now = new Date();
  const upcoming = events.filter((e) => e.starts_at >= toDateKey(now));
  const past = events.filter((e) => e.starts_at < toDateKey(now));
  const upcomingByMonth = groupByMonth(upcoming);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Calendar</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Upcoming</h1>
        <p className="text-muted-foreground text-sm leading-7">
          Institutional exams + your own personal events. Personal events are visible only to you;
          institutional events are set by your faculty.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/calendar/new"
            className={cn(buttonVariants({ size: "sm" }))}
            data-testid="add-personal-event"
          >
            Add personal event
          </Link>
          {role.isFaculty || role.isAdmin ? (
            <Link
              href="/admin/calendar"
              className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
            >
              Manage institution events
            </Link>
          ) : null}
        </div>
      </header>

      {upcoming.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nothing scheduled. Faculty haven&apos;t added any institution events yet, and you
          haven&apos;t added any of your own.
        </p>
      ) : (
        <section aria-label="Upcoming events" className="flex flex-col gap-6">
          {Array.from(upcomingByMonth.entries()).map(([monthKey, group]) => (
            <MonthBlock key={monthKey} monthKey={monthKey} events={group} now={now} />
          ))}
        </section>
      )}

      {past.length > 0 ? (
        <section aria-label="Past events" className="flex flex-col gap-3 border-t pt-6">
          <h2 className="font-heading text-lg font-medium">Past</h2>
          <ul className="flex flex-col gap-2">
            {past
              .slice()
              .reverse()
              .slice(0, 10)
              .map((e) => (
                <li
                  key={e.id}
                  className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-sm"
                >
                  <span>
                    <span className="font-mono text-xs">{e.starts_at}</span> · {e.title}
                  </span>
                  {e.audience === "personal" ? (
                    <DeletePersonalEventButton id={e.id} title={e.title} />
                  ) : null}
                </li>
              ))}
          </ul>
          {past.length > 10 ? (
            <p className="text-muted-foreground text-xs">
              + {past.length - 10} earlier events not shown.
            </p>
          ) : null}
        </section>
      ) : null}

      <div>
        <Link
          href="/today"
          className="text-muted-foreground text-xs underline-offset-2 hover:underline"
        >
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}

function MonthBlock({
  monthKey,
  events,
  now,
}: {
  monthKey: string;
  events: ExamEventRow[];
  now: Date;
}) {
  const label = formatMonth(monthKey);
  return (
    <section aria-label={label} className="flex flex-col gap-2">
      <h2 className="font-heading text-base font-medium">{label}</h2>
      <ul className="flex flex-col gap-2">
        {events.map((e) => (
          <EventCard key={e.id} event={e} now={now} />
        ))}
      </ul>
    </section>
  );
}

function EventCard({ event, now }: { event: ExamEventRow; now: Date }) {
  const days = daysUntil(event.starts_at, now);
  const tone = KIND_TONE[event.kind] ?? "border-input";
  return (
    <li className={cn("flex flex-col gap-1 rounded-md border p-3 text-sm", tone)}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-medium tracking-widest uppercase">
              {KIND_LABELS[event.kind] ?? event.kind}
            </span>
            {event.audience === "personal" ? (
              <span className="bg-background text-muted-foreground rounded-full border px-2 py-0.5">
                Personal
              </span>
            ) : null}
            <span className="text-muted-foreground">
              {days === 0
                ? "today"
                : days === 1
                  ? "tomorrow"
                  : days > 0
                    ? `in ${days} days`
                    : `${Math.abs(days)} days ago`}
            </span>
          </div>
          <p className="font-medium">{event.title}</p>
          <p className="text-muted-foreground font-mono text-xs">
            {event.starts_at}
            {event.ends_at && event.ends_at !== event.starts_at ? ` → ${event.ends_at}` : ""}
          </p>
          {event.organ_systems.length > 0 ? (
            <p className="text-muted-foreground text-xs capitalize">
              Topics: {event.organ_systems.join(" · ")}
            </p>
          ) : null}
          {event.notes ? <p className="text-muted-foreground text-xs">{event.notes}</p> : null}
        </div>
        {event.audience === "personal" ? (
          <DeletePersonalEventButton id={event.id} title={event.title} />
        ) : null}
      </div>
    </li>
  );
}

function formatMonth(key: string): string {
  // key shape: YYYY-MM. Build a Date at the 1st of that month.
  const date = new Date(`${key}-01T00:00:00Z`);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", timeZone: "UTC" });
}

function toDateKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = `${d.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${d.getUTCDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}
