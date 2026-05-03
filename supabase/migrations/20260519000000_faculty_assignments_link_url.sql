-- Faculty assignments grow a link_url column so faculty can attach an
-- external resource (Google Form, Drive PDF, YouTube lecture, etc.) to
-- the row. Students see it as an "Open assignment" button on /today
-- alongside the title and due date.
--
-- Optional. Validates http(s) URLs only via a check constraint —
-- avoids javascript: / data: / file: schemes that would phish the
-- learner. Length capped at 2000 chars matching common URL limits.

alter table public.faculty_assignments
  add column link_url text
    check (
      link_url is null
      or (char_length(link_url) <= 2000 and link_url ~* '^https?://')
    );

comment on column public.faculty_assignments.link_url is
  'Optional external URL (Google Form, Drive doc, video, etc.). When non-null the student dashboard renders an "Open assignment" button that opens it in a new tab. Constrained to http(s) only.';
