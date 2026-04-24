import { describe, expect, it } from "vitest";

import { StubGrader, defaultGrader } from "./stub-grader";

describe("StubGrader", () => {
  it("returns grade=pending for every input", async () => {
    const g = new StubGrader();
    const result = await g.grade({
      review_id: "abc",
      card_id: "frank-starling:1",
      stem: "stem",
      correct_answer: "answer",
      elaborative_explanation: "explanation",
      self_explanation: "my explanation",
    });
    expect(result.grade).toBe("pending");
    expect(result.feedback).toMatch(/grading/i);
    expect(Date.parse(result.graded_at)).not.toBeNaN();
  });

  it("defaultGrader is a StubGrader instance for now (Phase 4 replaces)", async () => {
    const result = await defaultGrader.grade({
      review_id: "x",
      card_id: "y:1",
      stem: "s",
      correct_answer: "a",
      elaborative_explanation: "e",
      self_explanation: "",
    });
    expect(result.grade).toBe("pending");
  });
});
