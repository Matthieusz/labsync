import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Input } from "./input";

describe("Input", () => {
  it("should render with default styles", () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText("Enter text");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("data-slot", "input");
  });

  it("should apply custom className", () => {
    render(<Input className="custom-input" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("custom-input");
  });

  it("should render with different types", () => {
    const { rerender } = render(<Input type="text" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "text");

    rerender(<Input type="email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");

    rerender(<Input data-testid="password-input" type="password" />);
    expect(screen.getByTestId("password-input")).toHaveAttribute(
      "type",
      "password"
    );

    rerender(<Input data-testid="number-input" type="number" />);
    expect(screen.getByTestId("number-input")).toHaveAttribute(
      "type",
      "number"
    );
  });

  it("should be disabled when disabled prop is passed", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("should handle value changes", () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "test value" } });

    expect(handleChange).toHaveBeenCalled();
  });

  it("should support controlled value", () => {
    const { rerender } = render(<Input readOnly value="initial" />);
    expect(screen.getByRole("textbox")).toHaveValue("initial");

    rerender(<Input readOnly value="updated" />);
    expect(screen.getByRole("textbox")).toHaveValue("updated");
  });

  it("should handle blur events", () => {
    const handleBlur = vi.fn();
    render(<Input onBlur={handleBlur} />);

    const input = screen.getByRole("textbox");
    fireEvent.blur(input);

    expect(handleBlur).toHaveBeenCalled();
  });

  it("should handle focus events", () => {
    const handleFocus = vi.fn();
    render(<Input onFocus={handleFocus} />);

    const input = screen.getByRole("textbox");
    fireEvent.focus(input);

    expect(handleFocus).toHaveBeenCalled();
  });

  it("should support placeholder text", () => {
    render(<Input placeholder="Enter your email" />);
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
  });

  it("should support required attribute", () => {
    render(<Input required />);
    expect(screen.getByRole("textbox")).toBeRequired();
  });

  it("should support name attribute", () => {
    render(<Input name="username" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("name", "username");
  });

  it("should support id attribute", () => {
    render(<Input id="my-input" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("id", "my-input");
  });
});
