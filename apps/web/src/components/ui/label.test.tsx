import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Label } from "./label";

describe("Label", () => {
  it("should render with default styles", () => {
    render(<Label>Email</Label>);
    const label = screen.getByText("Email");
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("data-slot", "label");
  });

  it("should have font-medium class", () => {
    render(<Label>Name</Label>);
    expect(screen.getByText("Name")).toHaveClass("font-medium", "text-sm");
  });

  it("should apply custom className", () => {
    render(<Label className="custom-label">Custom</Label>);
    expect(screen.getByText("Custom")).toHaveClass("custom-label");
  });

  it("should support htmlFor attribute", () => {
    render(<Label htmlFor="email-input">Email</Label>);
    expect(screen.getByText("Email")).toHaveAttribute("for", "email-input");
  });

  it("should render children correctly", () => {
    render(
      <Label>
        <span>Required</span> Field
      </Label>
    );
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.getByText("Field", { exact: false })).toBeInTheDocument();
  });

  it("should be associated with form controls", () => {
    render(
      <div>
        <Label htmlFor="test-input">Test Label</Label>
        <input id="test-input" type="text" />
      </div>
    );
    const label = screen.getByText("Test Label");
    const input = screen.getByRole("textbox");
    expect(label).toHaveAttribute("for", "test-input");
    expect(input).toHaveAttribute("id", "test-input");
  });
});
