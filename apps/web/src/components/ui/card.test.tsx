import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

describe("Card Components", () => {
  describe("Card", () => {
    it("should render with default styles", () => {
      render(<Card>Card content</Card>);
      const card = screen.getByText("Card content");
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute("data-slot", "card");
      expect(card).toHaveClass("rounded-xl", "border", "bg-card");
    });

    it("should apply custom className", () => {
      render(<Card className="custom-class">Content</Card>);
      expect(screen.getByText("Content")).toHaveClass("custom-class");
    });
  });

  describe("CardHeader", () => {
    it("should render with data-slot attribute", () => {
      render(<CardHeader>Header</CardHeader>);
      const header = screen.getByText("Header");
      expect(header).toHaveAttribute("data-slot", "card-header");
    });

    it("should apply custom className", () => {
      render(<CardHeader className="custom-header">Header</CardHeader>);
      expect(screen.getByText("Header")).toHaveClass("custom-header");
    });
  });

  describe("CardTitle", () => {
    it("should render with data-slot attribute", () => {
      render(<CardTitle>Title</CardTitle>);
      const title = screen.getByText("Title");
      expect(title).toHaveAttribute("data-slot", "card-title");
      expect(title).toHaveClass("font-semibold");
    });
  });

  describe("CardDescription", () => {
    it("should render with muted text style", () => {
      render(<CardDescription>Description</CardDescription>);
      const desc = screen.getByText("Description");
      expect(desc).toHaveAttribute("data-slot", "card-description");
      expect(desc).toHaveClass("text-muted-foreground");
    });
  });

  describe("CardAction", () => {
    it("should render with data-slot attribute", () => {
      render(<CardAction>Action</CardAction>);
      const action = screen.getByText("Action");
      expect(action).toHaveAttribute("data-slot", "card-action");
    });
  });

  describe("CardContent", () => {
    it("should render with padding", () => {
      render(<CardContent>Content</CardContent>);
      const content = screen.getByText("Content");
      expect(content).toHaveAttribute("data-slot", "card-content");
      expect(content).toHaveClass("px-6");
    });
  });

  describe("CardFooter", () => {
    it("should render with flex layout", () => {
      render(<CardFooter>Footer</CardFooter>);
      const footer = screen.getByText("Footer");
      expect(footer).toHaveAttribute("data-slot", "card-footer");
      expect(footer).toHaveClass("flex", "items-center");
    });
  });

  describe("Card composition", () => {
    it("should render a complete card with all parts", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
            <CardAction>Action Button</CardAction>
          </CardHeader>
          <CardContent>Main Content</CardContent>
          <CardFooter>Footer Content</CardFooter>
        </Card>
      );

      expect(screen.getByText("Card Title")).toBeInTheDocument();
      expect(screen.getByText("Card Description")).toBeInTheDocument();
      expect(screen.getByText("Action Button")).toBeInTheDocument();
      expect(screen.getByText("Main Content")).toBeInTheDocument();
      expect(screen.getByText("Footer Content")).toBeInTheDocument();
    });
  });
});
