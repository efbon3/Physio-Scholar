import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RatingRow } from "./rating-row";

describe("RatingRow", () => {
  it("renders four buttons with shortcut hints once the delay has elapsed", () => {
    render(<RatingRow revealedAt={Date.now() - 5000} delayMs={2000} onRate={vi.fn()} />);
    const again = screen.getByTestId("rate-again");
    expect(again.closest("[role='group']")).toHaveAttribute("aria-hidden", "false");
    expect(again).toHaveAttribute("aria-keyshortcuts", "1");
    expect(again).toHaveTextContent("Again");
    expect(again).toHaveTextContent("1");
    expect(screen.getByTestId("rate-easy")).toHaveAttribute("aria-keyshortcuts", "4");
  });

  it("calls onRate when a button is clicked", () => {
    const onRate = vi.fn();
    render(<RatingRow revealedAt={Date.now() - 5000} delayMs={2000} onRate={onRate} />);
    fireEvent.click(screen.getByTestId("rate-good"));
    expect(onRate).toHaveBeenCalledWith("good");
  });

  it("maps number keys 1-4 to ratings while active", () => {
    const onRate = vi.fn();
    render(<RatingRow revealedAt={Date.now() - 5000} delayMs={2000} onRate={onRate} />);
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
        <RatingRow revealedAt={Date.now() - 5000} delayMs={2000} onRate={onRate} />
      </>,
    );
    const ta = screen.getByTestId("explain") as HTMLTextAreaElement;
    ta.focus();
    fireEvent.keyDown(ta, { key: "1" });
    expect(onRate).not.toHaveBeenCalled();
  });

  it("ignores number keys when modifier keys are held", () => {
    const onRate = vi.fn();
    render(<RatingRow revealedAt={Date.now() - 5000} delayMs={2000} onRate={onRate} />);
    fireEvent.keyDown(window, { key: "1", ctrlKey: true });
    fireEvent.keyDown(window, { key: "2", metaKey: true });
    expect(onRate).not.toHaveBeenCalled();
  });

  it("is hidden and inactive before the reveal delay elapses", () => {
    render(<RatingRow revealedAt={Date.now()} delayMs={5000} onRate={vi.fn()} />);
    // aria-hidden=true takes the group out of the accessibility tree, so
    // testing-library's getByRole won't reach it even with `hidden: true`
    // (the accessible name lookup fails). Walk up from a button instead.
    const again = screen.getByTestId("rate-again");
    expect(again).toBeDisabled();
    expect(again.closest("[role='group']")).toHaveAttribute("aria-hidden", "true");
  });

  it("does not respond to keystrokes while inactive", () => {
    const onRate = vi.fn();
    render(<RatingRow revealedAt={Date.now()} delayMs={5000} onRate={onRate} />);
    fireEvent.keyDown(window, { key: "1" });
    expect(onRate).not.toHaveBeenCalled();
  });
});
