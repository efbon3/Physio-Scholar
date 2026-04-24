/**
 * Grading domain types for self-explanation responses (build spec §2.6).
 *
 * C5 ships the contract; Phase 4 wires the real Claude-based grader
 * against this same shape. Nothing downstream of `Grade` / `GradeResult`
 * / `Grader` needs to change when the implementation swaps.
 *
 * Rubric per Vision Document §2.7:
 *   green  — "Well explained" — learner captured the mechanism
 *   yellow — "Partially correct" — some content right, some missing/wrong
 *   red    — "Missing the mechanism" — misses or misapplies the core model
 *   pending — the grader has not yet run (offline, queued, or Phase 4 not
 *             yet live). UI shows "Grading when online" text.
 */
export type Grade = "green" | "yellow" | "red" | "pending";

export type GradeResult = {
  grade: Grade;
  /**
   * Short explanatory feedback surfaced to the learner. For `pending`
   * this is the "Grading when online" message. For yellow/red it's the
   * specific correction the spec requires (§2.6). For green it may be
   * a brief reinforcement or blank.
   */
  feedback: string;
  /** ISO timestamp when the grader produced the result. */
  graded_at: string;
};

/**
 * The grader interface. Deliberately async — a real implementation
 * performs a network call to Claude; the stub resolves immediately.
 * Either way the caller awaits the same shape.
 */
export interface Grader {
  grade(input: GradeInput): Promise<GradeResult>;
}

export type GradeInput = {
  /** The review row id whose self_explanation we're grading. */
  review_id: string;
  /** Card context — grader needs to know what was being asked. */
  card_id: string;
  stem: string;
  correct_answer: string;
  elaborative_explanation: string;
  /** The student's free-text explanation. */
  self_explanation: string;
};
