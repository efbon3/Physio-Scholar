-- Add the "dont_know" value to the srs_rating enum.
--
-- Build spec §2.7 (modification 3): the standard SM-2 four ratings
-- (again / hard / good / easy) are extended with a fifth — "dont_know"
-- — for use on MCQ and fill-blank formats. Pedagogical rationale:
-- a student who admitted ignorance has not consolidated a wrong
-- mental model, so future intervals don't need tightening (no ease
-- drop, no lapse-counter increment) even though the card should
-- return soon to introduce the content. The next-interval is the
-- same 1 day Again uses; the difference is in the ease + lapse
-- behaviour, which the application-side scheduler enforces.
--
-- ALTER TYPE ... ADD VALUE is non-transactional in PostgreSQL, but
-- Supabase migrations run statement-by-statement so the new value
-- is committed before any subsequent statement that might reference
-- it. We do not use the new value as a default or in a check
-- constraint here, so no further work is needed beyond the enum
-- extension itself.

alter type public.srs_rating add value if not exists 'dont_know';
