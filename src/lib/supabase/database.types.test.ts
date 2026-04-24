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

describe("Database type", () => {
  it("exposes the seven public tables (Phase 2 + Phase 3 C2 + Phase 5 F1)", () => {
    expectTypeOf<keyof PublicTables>().toEqualTypeOf<
      | "card_states"
      | "content_flags"
      | "institutions"
      | "profiles"
      | "reviews"
      | "study_sessions"
      | "subscriptions"
    >();
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

  it("srs_rating enum matches the Phase 3 migration", () => {
    expectTypeOf<PublicEnums["srs_rating"]>().toEqualTypeOf<"again" | "hard" | "good" | "easy">();
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
});
