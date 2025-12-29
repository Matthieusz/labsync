import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Loader from "./loader";

describe("Loader", () => {
  it("should render with default size", () => {
    render(<Loader />);
    const loader = document.querySelector(".animate-spin");
    expect(loader).toBeInTheDocument();
    expect(loader).toHaveClass("h-6", "w-6");
  });

  it("should render with different sizes", () => {
    const { rerender } = render(<Loader size="sm" />);
    let loader = document.querySelector(".animate-spin");
    expect(loader).toHaveClass("h-4", "w-4");

    rerender(<Loader size="default" />);
    loader = document.querySelector(".animate-spin");
    expect(loader).toHaveClass("h-6", "w-6");

    rerender(<Loader size="lg" />);
    loader = document.querySelector(".animate-spin");
    expect(loader).toHaveClass("h-8", "w-8");

    rerender(<Loader size="xl" />);
    loader = document.querySelector(".animate-spin");
    expect(loader).toHaveClass("h-12", "w-12");
  });

  it("should render with loading text", () => {
    render(<Loader text="Loading..." />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should not render text when not provided", () => {
    render(<Loader />);
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("should apply custom className", () => {
    render(<Loader className="custom-loader" />);
    const loader = document.querySelector(".animate-spin");
    expect(loader).toHaveClass("custom-loader");
  });

  it("should render with fullScreen mode", () => {
    const { container } = render(<Loader fullScreen />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("h-screen");
  });

  it("should render without fullScreen by default", () => {
    const { container } = render(<Loader />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("h-full");
    expect(wrapper).not.toHaveClass("h-screen");
  });

  it("should center content", () => {
    const { container } = render(<Loader />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("flex", "items-center", "justify-center");
  });

  it("should render text with muted styling", () => {
    render(<Loader text="Please wait" />);
    const text = screen.getByText("Please wait");
    expect(text).toHaveClass("text-muted-foreground", "text-sm");
  });
});
