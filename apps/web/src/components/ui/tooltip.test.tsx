import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

describe("Tooltip", () => {
  it("should render trigger", () => {
    render(
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Tooltip content</TooltipContent>
      </Tooltip>
    );

    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("should have data-slot attribute on trigger", () => {
    render(
      <Tooltip>
        <TooltipTrigger data-testid="trigger">Hover me</TooltipTrigger>
        <TooltipContent>Tooltip content</TooltipContent>
      </Tooltip>
    );

    expect(screen.getByTestId("trigger")).toHaveAttribute(
      "data-slot",
      "tooltip-trigger"
    );
  });

  it("should work with TooltipProvider wrapper", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("should render trigger with correct element type", () => {
    render(
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button">Trigger Button</button>
        </TooltipTrigger>
        <TooltipContent>Content</TooltipContent>
      </Tooltip>
    );

    expect(
      screen.getByRole("button", { name: "Trigger Button" })
    ).toBeInTheDocument();
  });
});
