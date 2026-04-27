import { z } from "zod";

/**
 * Content schema for mechanism markdown files, mirroring
 * `docs/content_production_sop.md` Appendix A. This is the single source of
 * truth the app enforces at load time; author-side reviewers should treat
 * Zod parse errors as hard blockers on publication.
 *
 * Typographic conventions:
 *   - Frontmatter field names stay snake_case to match the SOP exactly;
 *     author-facing markdown shouldn't require camelCase gymnastics.
 *   - TypeScript consumers can alias to camelCase at the edge if needed.
 */

/**
 * Canonical physiology systems. v1 content is cardiovascular-only; the
 * enum lists the full set so later content authored under a different
 * system doesn't silently skip validation. Update here when the SOP
 * canonical list changes.
 */
export const organSystemSchema = z.enum([
  "general",
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
  "special-senses",
  "integrated",
]);
export type OrganSystem = z.infer<typeof organSystemSchema>;

/** Content lifecycle state (SOP §2.2, §6.1). */
export const mechanismStatusSchema = z.enum(["draft", "review", "published", "retired"]);
export type MechanismStatus = z.infer<typeof mechanismStatusSchema>;

/**
 * Bloom's taxonomy distribution for the four levels used in the app
 * (remember / understand / apply / analyze — evaluation and create are
 * out of scope for v1 per SOP §2). Values are percentages and must sum
 * to exactly 100; a mechanism without a coherent distribution is
 * considered a content bug.
 */
export const bloomsDistributionSchema = z
  .object({
    remember: z.number().int().min(0).max(100),
    understand: z.number().int().min(0).max(100),
    apply: z.number().int().min(0).max(100),
    analyze: z.number().int().min(0).max(100),
  })
  .refine((b) => b.remember + b.understand + b.apply + b.analyze === 100, {
    message: "blooms_distribution values must sum to 100",
    path: ["blooms_distribution"],
  });
export type BloomsDistribution = z.infer<typeof bloomsDistributionSchema>;

/**
 * Identifier used as slug, filename prefix, and inter-mechanism reference.
 * Lowercase letters, digits, hyphens; must start and end with an
 * alphanumeric to rule out `-foo` or `foo-` degenerate cases.
 */
const mechanismIdSchema = z.string().regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, {
  message: "mechanism id must be kebab-case (lowercase letters, digits, hyphens)",
});

/** NMC competency code like "PY-CV-1.5" (SOP references these explicitly). */
const nmcCompetencyCodeSchema = z.string().regex(/^[A-Z]{2,4}-[A-Z]{1,4}-\d+(?:\.\d+)?$/, {
  message: "nmc_competencies entries must look like PY-CV-1.5",
});

/**
 * Full mechanism frontmatter. Dates use `z.coerce.date()` so both raw ISO
 * strings and js-yaml-parsed Date instances (gray-matter's default) round
 * through successfully.
 */
export const mechanismFrontmatterSchema = z.object({
  id: mechanismIdSchema,
  title: z.string().min(1),
  organ_system: organSystemSchema,
  // Optional with empty default — Phase 0 author-generated drafts ship
  // without competency codes (the official NMC list isn't bundled with
  // the repo). Reviewers add codes during the gold-standard pass.
  nmc_competencies: z.array(nmcCompetencyCodeSchema).default([]),
  exam_patterns: z.array(z.string().min(1)).min(1),
  prerequisites: z.array(mechanismIdSchema),
  related_mechanisms: z.array(mechanismIdSchema),
  blooms_distribution: bloomsDistributionSchema,
  author: z.string().min(1),
  // SOP allows "pending" until a reviewer is assigned; keep that as a
  // legal value without coupling to a user-id format we haven't decided.
  reviewer: z.string().min(1),
  status: mechanismStatusSchema,
  version: z.string().min(1),
  published_date: z.coerce.date(),
  last_reviewed: z.coerce.date(),
});
export type MechanismFrontmatter = z.infer<typeof mechanismFrontmatterSchema>;
