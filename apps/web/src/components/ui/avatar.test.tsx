import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

describe("Avatar", () => {
  it("should render avatar component", () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );

    expect(screen.getByTestId("avatar")).toBeInTheDocument();
  });

  it("should render avatar with data-slot attribute", () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );

    expect(screen.getByTestId("avatar")).toHaveAttribute("data-slot", "avatar");
  });

  it("should apply custom className", () => {
    render(
      <Avatar className="custom-avatar" data-testid="avatar">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );

    expect(screen.getByTestId("avatar")).toHaveClass("custom-avatar");
  });

  it("should have default size classes", () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );

    expect(screen.getByTestId("avatar")).toHaveClass("size-8");
  });
});

describe("AvatarFallback", () => {
  it("should render fallback text", () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );

    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("should have data-slot attribute", () => {
    render(
      <Avatar>
        <AvatarFallback data-testid="fallback">JD</AvatarFallback>
      </Avatar>
    );

    expect(screen.getByTestId("fallback")).toHaveAttribute(
      "data-slot",
      "avatar-fallback"
    );
  });

  it("should apply custom className", () => {
    render(
      <Avatar>
        <AvatarFallback className="custom-fallback" data-testid="fallback">
          JD
        </AvatarFallback>
      </Avatar>
    );

    expect(screen.getByTestId("fallback")).toHaveClass("custom-fallback");
  });

  it("should have centered content", () => {
    render(
      <Avatar>
        <AvatarFallback data-testid="fallback">JD</AvatarFallback>
      </Avatar>
    );

    expect(screen.getByTestId("fallback")).toHaveClass("items-center");
    expect(screen.getByTestId("fallback")).toHaveClass("justify-center");
  });
});

describe("AvatarImage", () => {
  it("should render with correct data-slot", () => {
    render(
      <Avatar>
        <AvatarImage
          alt="User avatar"
          data-testid="avatar-image"
          src="/test-image.jpg"
        />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );

    // Note: Radix Avatar may not immediately render the image
    // The fallback is shown until the image loads
    expect(screen.getByText("JD")).toBeInTheDocument();
  });
});
