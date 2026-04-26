import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders title, description, and decoration icon", () => {
    render(
      <EmptyState
        icon="📚"
        title="No mechanisms yet"
        description="Content lives under content/mechanisms/."
      />,
    );
    expect(screen.getByText("No mechanisms yet")).toBeInTheDocument();
    expect(screen.getByText(/content\/mechanisms/)).toBeInTheDocument();
    // Decoration is aria-hidden so screen readers skip it; assert via text.
    expect(screen.getByText("📚")).toBeInTheDocument();
  });

  it("renders action links when provided", () => {
    render(
      <EmptyState
        icon="✓"
        title="Caught up"
        description="Nothing due."
        actions={[
          { label: "Browse mechanisms", href: "/systems", variant: "primary" },
          { label: "See progress", href: "/progress", variant: "secondary" },
        ]}
      />,
    );
    const browse = screen.getByRole("link", { name: "Browse mechanisms" });
    const progress = screen.getByRole("link", { name: "See progress" });
    expect(browse).toHaveAttribute("href", "/systems");
    expect(progress).toHaveAttribute("href", "/progress");
  });

  it("omits the actions row when no actions are provided", () => {
    render(<EmptyState icon="i" title="t" description="d" />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });
});
