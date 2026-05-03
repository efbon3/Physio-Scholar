/**
 * Compile-time smoke test for the generated Database type. Catches schema
 * regressions by asserting the shape we committed to: the public tables,
 * DPDPA consent columns on profiles, and every enum used by the app.
 *
 * Regenerate `database.types.ts` via `npm run db:types` after migrations.
 */
import { describe, expectTypeOf, it } from "vitest";
import type { Database } from "./database.types";

type PublicTables = Database["public"]["Tables"];
type PublicEnums = Database["public"]["Enums"];
type ProfileRow = PublicTables["profiles"]["Row"];
type SubscriptionRow = PublicTables["subscriptions"]["Row"];
type StudySessionRow = PublicTables["study_sessions"]["Row"];
type CardStateRow = PublicTables["card_states"]["Row"];
type ReviewRow = PublicTables["reviews"]["Row"];
type ExamEventRow = PublicTables["exam_events"]["Row"];
type AuditLogRow = PublicTables["admin_audit_log"]["Row"];

describe("Database type", () => {
  it("exposes the public tables (+ J5 admin_audit_log + faculty_assignments + Faculty Platform tables)", () => {
    expectTypeOf<keyof PublicTables>().toEqualTypeOf<
      | "admin_audit_log"
      | "announcements"
      | "assignment_marks"
      | "attendance_codes"
      | "attendance_records"
      | "batches"
      | "card_bookmarks"
      | "card_states"
      | "class_sessions"
      | "content_chapters"
      | "content_flags"
      | "departments"
      | "exam_events"
      | "faculty_assignments"
      | "institutions"
      | "profiles"
      | "rate_limits"
      | "reviews"
      | "role_permissions"
      | "study_sessions"
      | "subscriptions"
      | "weak_student_messages"
    >();
  });

  it("admin_audit_log row carries actor + action + target columns", () => {
    expectTypeOf<AuditLogRow>().toHaveProperty("actor_id");
    expectTypeOf<AuditLogRow>().toHaveProperty("action");
    expectTypeOf<AuditLogRow>().toHaveProperty("target_type");
    expectTypeOf<AuditLogRow>().toHaveProperty("target_id");
    expectTypeOf<AuditLogRow>().toHaveProperty("details");
    expectTypeOf<AuditLogRow>().toHaveProperty("created_at");
  });

  it("subscription_tier enum matches the migration", () => {
    expectTypeOf<PublicEnums["subscription_tier"]>().toEqualTypeOf<
      "free" | "pilot" | "student" | "institution"
    >();
  });

  it("subscription_status enum matches the migration", () => {
    expectTypeOf<PublicEnums["subscription_status"]>().toEqualTypeOf<
      "active" | "past_due" | "cancelled" | "expired"
    >();
  });

  it("study_session_status enum matches the migration", () => {
    expectTypeOf<PublicEnums["study_session_status"]>().toEqualTypeOf<
      "active" | "completed" | "abandoned"
    >();
  });

  it("profiles carry DPDPA consent columns (build spec §2.10)", () => {
    expectTypeOf<ProfileRow>().toHaveProperty("consent_terms_accepted_at");
    expectTypeOf<ProfileRow>().toHaveProperty("consent_privacy_accepted_at");
    expectTypeOf<ProfileRow>().toHaveProperty("consent_analytics");
    expectTypeOf<ProfileRow>().toHaveProperty("consent_analytics_updated_at");
    expectTypeOf<ProfileRow>().toHaveProperty("deletion_requested_at");
  });

  it("profiles carry minor-handling columns", () => {
    expectTypeOf<ProfileRow>().toHaveProperty("is_minor");
    expectTypeOf<ProfileRow>().toHaveProperty("guardian_email");
  });

  it("profiles carry the J4 personal-details columns", () => {
    expectTypeOf<ProfileRow>().toHaveProperty("date_of_birth");
    expectTypeOf<ProfileRow>().toHaveProperty("address");
    expectTypeOf<ProfileRow>().toHaveProperty("phone");
    expectTypeOf<ProfileRow>().toHaveProperty("roll_number");
    expectTypeOf<ProfileRow>().toHaveProperty("avatar_url");
  });

  it("profiles carry the per-student study_systems preference", () => {
    expectTypeOf<ProfileRow>().toHaveProperty("study_systems");
    expectTypeOf<ProfileRow["study_systems"]>().toEqualTypeOf<string[]>();
  });

  it("subscriptions.tier is the enum type", () => {
    expectTypeOf<SubscriptionRow["tier"]>().toEqualTypeOf<PublicEnums["subscription_tier"]>();
  });

  it("study_sessions.duration_seconds is generated and nullable", () => {
    // Generated columns appear as nullable number in the Row type.
    expectTypeOf<StudySessionRow["duration_seconds"]>().toEqualTypeOf<number | null>();
  });

  it("srs_card_status enum matches the Phase 3 migration", () => {
    expectTypeOf<PublicEnums["srs_card_status"]>().toEqualTypeOf<
      "learning" | "review" | "leech" | "suspended"
    >();
  });

  it("srs_rating enum matches the Phase 3 migration + the v1.3 dont_know addition", () => {
    expectTypeOf<PublicEnums["srs_rating"]>().toEqualTypeOf<
      "again" | "hard" | "good" | "easy" | "dont_know"
    >();
  });

  it("card_states row carries the SRS scheduling columns", () => {
    expectTypeOf<CardStateRow>().toHaveProperty("profile_id");
    expectTypeOf<CardStateRow>().toHaveProperty("card_id");
    expectTypeOf<CardStateRow>().toHaveProperty("ease");
    expectTypeOf<CardStateRow>().toHaveProperty("interval_days");
    expectTypeOf<CardStateRow>().toHaveProperty("status");
    expectTypeOf<CardStateRow>().toHaveProperty("consecutive_again_count");
    expectTypeOf<CardStateRow>().toHaveProperty("last_reviewed_at");
    expectTypeOf<CardStateRow>().toHaveProperty("due_at");
  });

  it("reviews row carries the rating + session columns", () => {
    expectTypeOf<ReviewRow>().toHaveProperty("profile_id");
    expectTypeOf<ReviewRow>().toHaveProperty("card_id");
    expectTypeOf<ReviewRow>().toHaveProperty("rating");
    expectTypeOf<ReviewRow>().toHaveProperty("hints_used");
    expectTypeOf<ReviewRow>().toHaveProperty("time_spent_seconds");
    expectTypeOf<ReviewRow>().toHaveProperty("session_id");
    expectTypeOf<ReviewRow>().toHaveProperty("created_at");
  });

  it("profiles carry is_faculty (J7 institutional faculty role)", () => {
    expectTypeOf<ProfileRow>().toHaveProperty("is_faculty");
    expectTypeOf<ProfileRow["is_faculty"]>().toEqualTypeOf<boolean>();
  });

  it("exam_events row carries the J7 calendar columns", () => {
    expectTypeOf<ExamEventRow>().toHaveProperty("audience");
    expectTypeOf<ExamEventRow>().toHaveProperty("institution_id");
    expectTypeOf<ExamEventRow>().toHaveProperty("owner_id");
    expectTypeOf<ExamEventRow>().toHaveProperty("title");
    expectTypeOf<ExamEventRow>().toHaveProperty("kind");
    expectTypeOf<ExamEventRow>().toHaveProperty("organ_systems");
    expectTypeOf<ExamEventRow>().toHaveProperty("starts_at");
    expectTypeOf<ExamEventRow>().toHaveProperty("ends_at");
    expectTypeOf<ExamEventRow>().toHaveProperty("notes");
  });

  it("exam_events.organ_systems is a string array", () => {
    expectTypeOf<ExamEventRow["organ_systems"]>().toEqualTypeOf<string[]>();
  });

  it("exam_events.ends_at is nullable (single-day events have null)", () => {
    expectTypeOf<ExamEventRow["ends_at"]>().toEqualTypeOf<string | null>();
  });
});
