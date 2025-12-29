import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

describe("Tabs", () => {
  it("should render tabs with triggers", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    expect(screen.getByRole("tab", { name: /Tab 1/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Tab 2/i })).toBeInTheDocument();
  });

  it("should show default tab content", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    expect(screen.getByText("Content 1")).toBeInTheDocument();
  });

  it("should switch tabs when trigger is clicked", async () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    await userEvent.click(screen.getByRole("tab", { name: /Tab 2/i }));

    expect(screen.getByText("Content 2")).toBeInTheDocument();
  });

  it("should have data-slot attribute", () => {
    render(
      <Tabs data-testid="tabs" defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    );

    expect(screen.getByTestId("tabs")).toHaveAttribute("data-slot", "tabs");
  });

  it("should apply custom className to Tabs", () => {
    render(
      <Tabs className="custom-tabs" data-testid="tabs" defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    );

    expect(screen.getByTestId("tabs")).toHaveClass("custom-tabs");
  });

  it("should apply custom className to TabsList", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList className="custom-list" data-testid="tabs-list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    );

    expect(screen.getByTestId("tabs-list")).toHaveClass("custom-list");
  });

  it("should apply custom className to TabsTrigger", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger className="custom-trigger" value="tab1">
            Tab 1
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    );

    expect(screen.getByRole("tab", { name: /Tab 1/i })).toHaveClass(
      "custom-trigger"
    );
  });

  it("should apply custom className to TabsContent", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent
          className="custom-content"
          data-testid="tab-content"
          value="tab1"
        >
          Content
        </TabsContent>
      </Tabs>
    );

    expect(screen.getByTestId("tab-content")).toHaveClass("custom-content");
  });

  it("should mark selected tab as active", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    expect(screen.getByRole("tab", { name: /Tab 1/i })).toHaveAttribute(
      "data-state",
      "active"
    );
    expect(screen.getByRole("tab", { name: /Tab 2/i })).toHaveAttribute(
      "data-state",
      "inactive"
    );
  });
});
