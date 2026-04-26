import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SelfGradeRow } from "./self-grade-row";

describe("SelfGradeRow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders four self-grade buttons with /10 score labels once the delay elapses", () => {
    render(
      <SelfGradeRow
        revealedAt={Date.now() - 5000}
        delayMs={2000}
        hintsUsed={0}
        onRate={vi.fn()}
        autoRateAfterMs={0}
      />,
    );
    const correct = screen.getByTestId("self-grade-correct");
    const partWrong = screen.getByTestId("self-grade-partially-wrong");
    const partCorr = screen.getByTestId("self-grade-partially-correct");
    const wrong = screen.getByTestId("self-grade-wrong");

    expect(correct).toHaveTextContent("Correct");
    expect(correct).toHaveTextContent("10 / 10");
    expect(partWrong).toHaveTextContent("7.5 / 10");
    expect(partCorr).toHaveTextContent("5 / 10");
    expect(wrong).toHaveTextContent("2 / 10");
    expect(correct.closest("[role='group']")).toHaveAttribute("aria-hidden", "false");
  });

  it("subtracts hint penalty and reflects it in the displayed scores", () => {
    render(
      <SelfGradeRow
        revealedAt={Date.now() - 5000}
        delayMs={2000}
        hintsUsed={1}
        onRate={vi.fn()}
        autoRateAfterMs={0}
      />,
    );
    expect(screen.getByTestId("self-grade-correct")).toHaveTextContent("8 / 10");
    expect(screen.getByTestId("self-grade-partially-wrong")).toHaveTextContent("5.5 / 10");
  });

  it("invokes onRate with the mapped SM-2 rating, final score, and grade", () => {
    const onRate = vi.fn();
    render(
      <SelfGradeRow
        revealedAt={Date.now() - 5000}
        delayMs={2000}
        hintsUsed={0}
        onRate={onRate}
        autoRateAfterMs={0}
      />,
    );
    fireEvent.click(screen.getByTestId("self-grade-correct"));
    expect(onRate).toHaveBeenCalledWith("easy", 100, "correct");
  });

  it("maps correct + 1 hint to good (capped at good)", () => {
    const onRate = vi.fn();
    render(
      <SelfGradeRow
        revealedAt={Date.now() - 5000}
        delayMs={2000}
        hintsUsed={1}
        onRate={onRate}
        autoRateAfterMs={0}
      />,
    );
    fireEvent.click(screen.getByTestId("self-grade-correct"));
    expect(onRate).toHaveBeenCalledWith("good", 80, "correct");
  });

  it("is hidden and disabled before the reveal delay elapses", () => {
    render(
      <SelfGradeRow
        revealedAt={Date.now()}
        delayMs={5000}
        hintsUsed={0}
        onRate={vi.fn()}
        autoRateAfterMs={0}
      />,
    );
    const correct = screen.getByTestId("self-grade-correct");
    expect(correct).toBeDisabled();
    expect(correct.closest("[role='group']")).toHaveAttribute("aria-hidden", "true");
  });

  it("auto-grades 'wrong' after 24h watchdog elapses (default)", () => {
    const onRate = vi.fn();
    render(<SelfGradeRow revealedAt={Date.now()} delayMs={2000} hintsUsed={0} onRate={onRate} />);
    vi.advanceTimersByTime(24 * 60 * 60 * 1000 + 100);
    // wrong + 0 hints = 20 → maps to SM-2 again.
    expect(onRate).toHaveBeenCalledWith("again", 20, "wrong");
  });

  it("respects a custom autoRateAfterMs threshold", () => {
    const onRate = vi.fn();
    render(
      <SelfGradeRow
        revealedAt={Date.now()}
        delayMs={2000}
        hintsUsed={0}
        onRate={onRate}
        autoRateAfterMs={1_000}
      />,
    );
    vi.advanceTimersByTime(2_000);
    expect(onRate).toHaveBeenCalledWith("again", 20, "wrong");
  });

  it("does not auto-grade when autoRateAfterMs is 0", () => {
    const onRate = vi.fn();
    render(
      <SelfGradeRow
        revealedAt={Date.now()}
        delayMs={2000}
        hintsUsed={0}
        onRate={onRate}
        autoRateAfterMs={0}
      />,
    );
    vi.advanceTimersByTime(48 * 60 * 60 * 1000);
    expect(onRate).not.toHaveBeenCalled();
  });

  it("shows hint-penalty caption when hints were used", () => {
    render(
      <SelfGradeRow
        revealedAt={Date.now() - 5000}
        delayMs={2000}
        hintsUsed={2}
        onRate={vi.fn()}
        autoRateAfterMs={0}
      />,
    );
    expect(screen.getByText(/-3 points/)).toBeInTheDocument();
    expect(screen.getByText(/2 hints used/)).toBeInTheDocument();
  });
});
