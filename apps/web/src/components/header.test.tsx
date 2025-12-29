import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Header from "./header";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "common.home": "Home",
        "common.dashboard": "Dashboard",
        "common.todos": "Todos",
      };
      return translations[key] ?? key;
    },
  }),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

vi.mock("./language-switcher", () => ({
  LanguageSwitcher: () => (
    <div data-testid="language-switcher">Language Switcher</div>
  ),
}));

describe("Header", () => {
  it("should render navigation links", () => {
    render(<Header />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Todos")).toBeInTheDocument();
  });

  it("should render links with correct hrefs", () => {
    render(<Header />);

    expect(screen.getByText("Home").closest("a")).toHaveAttribute("href", "/");
    expect(screen.getByText("Dashboard").closest("a")).toHaveAttribute(
      "href",
      "/dashboard"
    );
    expect(screen.getByText("Todos").closest("a")).toHaveAttribute(
      "href",
      "/todos"
    );
  });

  it("should render language switcher", () => {
    render(<Header />);

    expect(screen.getByTestId("language-switcher")).toBeInTheDocument();
  });

  it("should render horizontal rule", () => {
    render(<Header />);

    expect(document.querySelector("hr")).toBeInTheDocument();
  });

  it("should have navigation element", () => {
    render(<Header />);

    expect(document.querySelector("nav")).toBeInTheDocument();
  });

  it("should have flex layout on navigation", () => {
    const { container } = render(<Header />);

    const nav = container.querySelector("nav");
    expect(nav).toHaveClass("flex");
  });
});
