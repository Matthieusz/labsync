import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("should render with default styles", () => {
    render(<Skeleton data-testid="skeleton" />);
    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("data-slot", "skeleton");
  });

  it("should have animation and background classes", () => {
    render(<Skeleton data-testid="skeleton" />);
    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveClass("animate-pulse", "rounded-md", "bg-accent");
  });

  it("should apply custom className", () => {
    render(<Skeleton className="h-4 w-full" data-testid="skeleton" />);
    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveClass("h-4", "w-full");
  });

  it("should support custom dimensions via className", () => {
    render(<Skeleton className="h-12 w-12" data-testid="skeleton" />);
    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveClass("h-12", "w-12");
  });

  it("should render as a div element", () => {
    render(<Skeleton data-testid="skeleton" />);
    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton.tagName).toBe("DIV");
  });

  it("should pass through other props", () => {
    render(
      <Skeleton
        aria-label="Loading content"
        data-testid="skeleton"
        role="status"
      />
    );
    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveAttribute("role", "status");
    expect(skeleton).toHaveAttribute("aria-label", "Loading content");
  });
});
