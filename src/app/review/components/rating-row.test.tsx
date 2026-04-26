import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RatingRow } from "./rating-row";

describe("RatingRow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders four buttons with shortcut hints once the delay has elapsed", () => {
    render(
      <RatingRow
        revealedAt={Date.now() - 5000}
        delayMs={2000}
        onRate={vi.fn()}
        autoRateAfterMs={0}
      />,
    );
    const again = screen.getByTestId("rate-again");
    expect(again.closest("[role='group']")).toHaveAttribute("aria-hidden", "false");
    expect(again).toHaveAttribute("aria-keyshortcuts", "1");
    expect(again).toHaveTextContent("Again");
    expect(again).toHaveTextContent("1");
    expect(screen.getByTestId("rate-easy")).toHaveAttribute("aria-keyshortcuts", "4");
  });

  it("calls onRate when a button is clicked", () => {
    const onRate = vi.fn();
    render(
      <RatingRow
        revealedAt={Date.now() - 5000}
        delayMs={2000}
        onRate={onRate}
        autoRateAfterMs={0}
      />,
    );
    fireEvent.click(screen.getByTestId("rate-good"));
    expect(onRate).toHaveBeenCalledWith("good");
  });

  it("maps number keys 1-4 to ratings while active", () => {
    const onRate = vi.fn();
    render(
      <RatingRow
        revealedAt={Date.now() - 5000}
        delayMs={2000}
        onRate={onRate}
        autoRateAfterMs={0}
      />,
    );
    fireEvent.keyDown(window, { key: "1" });
    fireEvent.keyDown(window, { key: "2" });
    fireEvent.keyDown(window, { key: "3" });
    fireEvent.keyDown(window, { key: "4" });
    expect(onRate).toHaveBeenNthCalledWith(1, "again");
    expect(onRate).toHaveBeenNthCalledWith(2, "hard");
    expect(onRate).toHaveBeenNthCalledWith(3, "good");
    expect(onRate).toHaveBeenNthCalledWith(4, "easy");
  });

  it("ignores keystrokes when focus is in a textarea", () => {
    const onRate = vi.fn();
    render(
      <>
        <textarea data-testid="explain" />
        <RatingRow
          revealedAt={Date.now() - 5000}
          delayMs={2000}
          onRate={onRate}
          autoRateAfterMs={0}
        />
      </>,
    );
    const ta = screen.getByTestId("explain") as HTMLTextAreaElement;
    ta.focus();
    fireEvent.keyDown(ta, { key: "1" });
    expect(onRate).not.toHaveBeenCalled();
  });

  it("ignores number keys when modifier keys are held", () => {
    const onRate = vi.fn();
    render(
      <RatingRow
        revealedAt={Date.now() - 5000}
        delayMs={2000}
        onRate={onRate}
        autoRateAfterMs={0}
      />,
    );
    fireEvent.keyDown(window, { key: "1", ctrlKey: true });
    fireEvent.keyDown(window, { key: "2", metaKey: true });
    expect(onRate).not.toHaveBeenCalled();
  });

  it("is hidden and disabled before delayMs has elapsed", () => {
    render(
      <RatingRow revealedAt={Date.now()} delayMs={5000} onRate={vi.fn()} autoRateAfterMs={0} />,
    );
    const again = screen.getByTestId("rate-again");
    expect(again).toBeDisabled();
    expect(again.closest("[role='group']")).toHaveAttribute("aria-hidden", "true");
  });

  it("does not respond to keystrokes while inactive", () => {
    const onRate = vi.fn();
    render(
      <RatingRow revealedAt={Date.now()} delayMs={5000} onRate={onRate} autoRateAfterMs={0} />,
    );
    fireEvent.keyDown(window, { key: "1" });
    expect(onRate).not.toHaveBeenCalled();
  });

  it("auto-fires onRate('again') after the 24h watchdog elapses (default)", () => {
    const onRate = vi.fn();
    const start = Date.now();
    render(<RatingRow revealedAt={start} delayMs={2000} onRate={onRate} />);
    vi.advanceTimersByTime(60 * 60 * 1000);
    expect(onRate).not.toHaveBeenCalled();
    vi.advanceTimersByTime(22 * 60 * 60 * 1000);
    expect(onRate).not.toHaveBeenCalled();
    vi.advanceTimersByTime(60 * 60 * 1000 + 100);
    expect(onRate).toHaveBeenCalledTimes(1);
    expect(onRate).toHaveBeenCalledWith("again");
  });

  it("respects a custom autoRateAfterMs threshold", () => {
    const onRate = vi.fn();
    render(
      <RatingRow revealedAt={Date.now()} delayMs={2000} onRate={onRate} autoRateAfterMs={10_000} />,
    );
    vi.advanceTimersByTime(9_000);
    expect(onRate).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2_000);
    expect(onRate).toHaveBeenCalledWith("again");
  });

  it("auto-rates with the configured value (e.g. 'hard') instead of the default", () => {
    const onRate = vi.fn();
    render(
      <RatingRow
        revealedAt={Date.now()}
        delayMs={2000}
        onRate={onRate}
        autoRateAfterMs={1_000}
        autoRateValue="hard"
      />,
    );
    vi.advanceTimersByTime(2_000);
    expect(onRate).toHaveBeenCalledWith("hard");
  });

  it("auto-rates immediately when revealedAt is already past the threshold", () => {
    const onRate = vi.fn();
    const past = Date.now() - 25 * 60 * 60 * 1000;
    render(<RatingRow revealedAt={past} delayMs={2000} onRate={onRate} />);
    vi.advanceTimersByTime(0);
    expect(onRate).toHaveBeenCalledWith("again");
  });

  it("does not auto-rate when autoRateAfterMs is 0 (disabled)", () => {
    const onRate = vi.fn();
    render(
      <RatingRow revealedAt={Date.now()} delayMs={2000} onRate={onRate} autoRateAfterMs={0} />,
    );
    vi.advanceTimersByTime(48 * 60 * 60 * 1000);
    expect(onRate).not.toHaveBeenCalled();
  });

  it("clears the watchdog when the component unmounts (manual rate path)", () => {
    const onRate = vi.fn();
    const { unmount } = render(
      <RatingRow
        revealedAt={Date.now() - 3000}
        delayMs={2000}
        onRate={onRate}
        autoRateAfterMs={20_000}
      />,
    );
    fireEvent.click(screen.getByTestId("rate-good"));
    expect(onRate).toHaveBeenCalledWith("good");
    unmount();
    vi.advanceTimersByTime(30_000);
    expect(onRate).toHaveBeenCalledTimes(1);
  });
});
