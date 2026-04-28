import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { estimateExamMinutes, estimateReviewMinutes, PreflightModal } from "./preflight-modal";

type MutableElement = HTMLElement & {
  requestFullscreen?: unknown;
};

describe("PreflightModal", () => {
  const originalShowModal = HTMLDialogElement.prototype.showModal;
  const originalClose = HTMLDialogElement.prototype.close;
  const originalRequest = (document.documentElement as MutableElement).requestFullscreen;

  beforeEach(() => {
    // jsdom does not implement <dialog> showModal/close — stub them so
    // useEffect doesn't crash. Behaviour is verified by checking the
    // calls, not by relying on real modal layout.
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    });
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute("open");
    });
  });

  afterEach(() => {
    HTMLDialogElement.prototype.showModal = originalShowModal;
    HTMLDialogElement.prototype.close = originalClose;
    if (originalRequest) {
      (document.documentElement as MutableElement).requestFullscreen = originalRequest;
    } else {
      Reflect.deleteProperty(document.documentElement, "requestFullscreen");
    }
  });

  it("renders the question count and estimated minutes", () => {
    render(
      <PreflightModal
        open
        kind="Review session"
        questionCount={12}
        estimatedMinutes={18}
        onAccept={() => {}}
      />,
    );
    expect(screen.getByText(/Review session/)).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("~18")).toBeInTheDocument();
  });

  it("singular grammar at count 1", () => {
    render(
      <PreflightModal
        open
        kind="Review session"
        questionCount={1}
        estimatedMinutes={2}
        onAccept={() => {}}
      />,
    );
    // Stripped of leading whitespace, the text node is "question · "
    // — singular when count is 1.
    expect(screen.getByText(/^question/)).toBeInTheDocument();
  });

  it("calls onAccept and tries to enter fullscreen when Begin is clicked", () => {
    const onAccept = vi.fn();
    const requestSpy = vi.fn(() => Promise.resolve());
    (document.documentElement as MutableElement).requestFullscreen = requestSpy;

    render(
      <PreflightModal
        open
        kind="Review session"
        questionCount={5}
        estimatedMinutes={8}
        onAccept={onAccept}
      />,
    );

    fireEvent.click(screen.getByTestId("preflight-accept"));
    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(requestSpy).toHaveBeenCalledTimes(1);
  });

  it("does not call onAccept when fullscreen is unsupported (iOS tab)", () => {
    const onAccept = vi.fn();
    // No requestFullscreen attached — simulating iOS Safari tab.
    render(
      <PreflightModal
        open
        kind="Review session"
        questionCount={3}
        estimatedMinutes={5}
        onAccept={onAccept}
      />,
    );
    fireEvent.click(screen.getByTestId("preflight-accept"));
    // onAccept still fires — fullscreen is best-effort, not a gate.
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it("renders an optional context line", () => {
    render(
      <PreflightModal
        open
        kind="Review session"
        questionCount={3}
        estimatedMinutes={5}
        context="Frank-Starling mechanism"
        onAccept={() => {}}
      />,
    );
    expect(screen.getByText("Frank-Starling mechanism")).toBeInTheDocument();
  });

  it("cancel link defaults to /today and is overridable", () => {
    const { rerender } = render(
      <PreflightModal
        open
        kind="Review session"
        questionCount={3}
        estimatedMinutes={5}
        onAccept={() => {}}
      />,
    );
    expect(screen.getByTestId("preflight-cancel")).toHaveAttribute("href", "/today");

    rerender(
      <PreflightModal
        open
        kind="Review session"
        questionCount={3}
        estimatedMinutes={5}
        cancelHref="/systems"
        onAccept={() => {}}
      />,
    );
    expect(screen.getByTestId("preflight-cancel")).toHaveAttribute("href", "/systems");
  });

  it("opens via showModal when open transitions to true", () => {
    const showModalSpy = vi.spyOn(HTMLDialogElement.prototype, "showModal");
    const { rerender } = render(
      <PreflightModal
        open={false}
        kind="Review session"
        questionCount={3}
        estimatedMinutes={5}
        onAccept={() => {}}
      />,
    );
    expect(showModalSpy).not.toHaveBeenCalled();
    rerender(
      <PreflightModal
        open
        kind="Review session"
        questionCount={3}
        estimatedMinutes={5}
        onAccept={() => {}}
      />,
    );
    expect(showModalSpy).toHaveBeenCalledTimes(1);
  });
});

describe("estimateReviewMinutes", () => {
  it("rounds up to ceiling minutes", () => {
    expect(estimateReviewMinutes(0)).toBe(1);
    expect(estimateReviewMinutes(1)).toBe(2); // 90s → 2 min
    expect(estimateReviewMinutes(4)).toBe(6); // 360s → 6 min
    expect(estimateReviewMinutes(10)).toBe(15); // 900s → 15 min
  });
});

describe("estimateExamMinutes", () => {
  it("returns one minute per question", () => {
    expect(estimateExamMinutes(0)).toBe(1);
    expect(estimateExamMinutes(20)).toBe(20);
    expect(estimateExamMinutes(100)).toBe(100);
  });
});
