import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("should render checkbox", () => {
    render(<Checkbox aria-label="test checkbox" />);

    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("should be unchecked by default", () => {
    render(<Checkbox aria-label="test checkbox" />);

    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("should be checked when defaultChecked is true", () => {
    render(<Checkbox aria-label="test checkbox" defaultChecked />);

    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("should toggle when clicked", async () => {
    render(<Checkbox aria-label="test checkbox" />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it("should have data-slot attribute", () => {
    render(<Checkbox aria-label="test checkbox" />);

    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "data-slot",
      "checkbox"
    );
  });

  it("should apply custom className", () => {
    render(<Checkbox aria-label="test checkbox" className="custom-checkbox" />);

    expect(screen.getByRole("checkbox")).toHaveClass("custom-checkbox");
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Checkbox aria-label="test checkbox" disabled />);

    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  it("should not toggle when disabled", async () => {
    render(<Checkbox aria-label="test checkbox" disabled />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();
  });

  it("should accept id prop", () => {
    render(<Checkbox aria-label="test checkbox" id="my-checkbox" />);

    expect(screen.getByRole("checkbox")).toHaveAttribute("id", "my-checkbox");
  });

  it("should have correct data-state when checked", async () => {
    render(<Checkbox aria-label="test checkbox" />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("data-state", "unchecked");

    await userEvent.click(checkbox);

    expect(checkbox).toHaveAttribute("data-state", "checked");
  });

  it("should support controlled checked state", () => {
    const { rerender } = render(
      <Checkbox aria-label="test checkbox" checked={false} />
    );

    expect(screen.getByRole("checkbox")).not.toBeChecked();

    rerender(<Checkbox aria-label="test checkbox" checked />);

    expect(screen.getByRole("checkbox")).toBeChecked();
  });
});
