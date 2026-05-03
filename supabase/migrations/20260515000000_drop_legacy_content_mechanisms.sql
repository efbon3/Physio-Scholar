-- Drop the legacy content_mechanisms table + its enum.
--
-- Background: a redesign branch consolidated the original
-- 20260424181039_content_mechanisms migration into a new
-- 20260428000000_content_chapters create-from-scratch file. Production
-- ended up with both tables side by side (the original applied
-- pre-redesign, the new one applied via a partial sync). Both rows
-- were empty so dropping the legacy table was a no-op data-wise.
--
-- This migration formalises the cleanup so prod schema and local
-- migrations agree:
--   - content_mechanisms (table + indexes + policies) → removed
--   - content_mechanism_status (enum)                 → removed
--   - content_chapters (table) + content_chapter_status (enum) → kept
--
-- Application code reads `.from("content_chapters")` exclusively, so
-- removing the legacy half has zero behavioural impact.

drop table if exists public.content_mechanisms cascade;
drop type if exists public.content_mechanism_status;
