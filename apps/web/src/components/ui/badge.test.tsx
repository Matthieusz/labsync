import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./badge";

describe("Badge", () => {
  it("should render with default variant", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute("data-slot", "badge");
    expect(badge).toHaveClass("bg-primary");
  });

  it("should render with different variants", () => {
    const { rerender } = render(<Badge variant="default">Default</Badge>);
    expect(screen.getByText("Default")).toHaveClass("bg-primary");

    rerender(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText("Secondary")).toHaveClass("bg-secondary");

    rerender(<Badge variant="destructive">Destructive</Badge>);
    expect(screen.getByText("Destructive")).toHaveClass("bg-destructive");

    rerender(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText("Outline")).toHaveClass("text-foreground");
  });

  it("should apply custom className", () => {
    render(<Badge className="custom-badge">Custom</Badge>);
    expect(screen.getByText("Custom")).toHaveClass("custom-badge");
  });

  it("should render as child component when asChild is true", () => {
    render(
      <Badge asChild>
        <a href="/link">Link Badge</a>
      </Badge>
    );
    const link = screen.getByRole("link", { name: "Link Badge" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/link");
  });

  it("should render as span by default", () => {
    render(<Badge>Text</Badge>);
    const badge = screen.getByText("Text");
    expect(badge.tagName).toBe("SPAN");
  });

  it("should have rounded-full class for pill shape", () => {
    render(<Badge>Pill</Badge>);
    expect(screen.getByText("Pill")).toHaveClass("rounded-full");
  });
});
