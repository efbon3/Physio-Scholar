import type { GradeInput, GradeResult, Grader } from "./types";

/**
 * Placeholder grader. Returns `pending` for every submission so the
 * learner sees a consistent "Grading when online" experience. Phase 4
 * replaces this with a real Claude-backed implementation; the seam
 * (`Grader`) is what lets that swap happen without touching any caller.
 *
 * Rationale for returning pending (rather than, say, auto-green): if
 * Phase 4 slips, at least the learner experience is honest — the
 * interface says "we're going to grade this, just not yet" rather than
 * giving fake reinforcement.
 */
export class StubGrader implements Grader {
  async grade(_input: GradeInput): Promise<GradeResult> {
    void _input; // signal we're aware of the input, just ignoring for the stub
    return {
      grade: "pending",
      feedback: "Your explanation was recorded. Grading will arrive when the grader comes online.",
      graded_at: new Date().toISOString(),
    };
  }
}

/**
 * Default export — the grader Next.js code imports. Swapping this one
 * binding to `new ClaudeGrader(...)` in Phase 4 is the entire wire-up.
 */
export const defaultGrader: Grader = new StubGrader();
