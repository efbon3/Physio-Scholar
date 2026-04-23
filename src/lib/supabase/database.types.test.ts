/**
 * Compile-time smoke test for the generated Database type. Catches schema
 * regressions by asserting the shape we committed to: four public tables,
 * DPDPA consent columns on profiles, and the subscription_tier enum.
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

describe("Database type", () => {
  it("exposes the four public tables", () => {
    expectTypeOf<keyof PublicTables>().toEqualTypeOf<
      "institutions" | "profiles" | "study_sessions" | "subscriptions"
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
});
