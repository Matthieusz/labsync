import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TeamList } from "./team-list";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "teams.yourTeams": "Your Teams",
        "teams.availableTeams": "Available Teams",
        "teams.noTeamsJoined": "No teams yet",
        "teams.noTeamsAvailable": "No available teams",
        "teams.open": "Open",
        "common.collapse": "Collapse",
        "common.expand": "Expand",
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

vi.mock("./create-team-dialog", () => ({
  CreateTeamDialog: () => (
    <button data-testid="create-team-dialog" type="button">
      Create Team
    </button>
  ),
}));

vi.mock("./join-team-dialog", () => ({
  JoinTeamDialog: () => (
    <button data-testid="join-team-dialog" type="button">
      Join Team
    </button>
  ),
}));

describe("TeamList", () => {
  const defaultProps = {
    orgSlug: "my-org",
    organizationId: "org-123",
    joined: [
      { id: "team-1", name: "Research Team" },
      { id: "team-2", name: "Development Team" },
    ],
    available: [
      { id: "team-3", name: "Marketing Team" },
      { id: "team-4", name: "Sales Team" },
    ],
  };

  it("should render your teams section", () => {
    render(<TeamList {...defaultProps} />);

    expect(screen.getByText("Your Teams")).toBeInTheDocument();
  });

  it("should render available teams section", () => {
    render(<TeamList {...defaultProps} />);

    expect(screen.getByText("Available Teams")).toBeInTheDocument();
  });

  it("should render joined team names", () => {
    render(<TeamList {...defaultProps} />);

    expect(screen.getByText("Research Team")).toBeInTheDocument();
    expect(screen.getByText("Development Team")).toBeInTheDocument();
  });

  it("should render available team names", () => {
    render(<TeamList {...defaultProps} />);

    expect(screen.getByText("Marketing Team")).toBeInTheDocument();
    expect(screen.getByText("Sales Team")).toBeInTheDocument();
  });

  it("should render team initials", () => {
    render(<TeamList {...defaultProps} />);

    expect(screen.getByText("RE")).toBeInTheDocument(); // Research
    expect(screen.getByText("DE")).toBeInTheDocument(); // Development
  });

  it("should render create team dialog", () => {
    render(<TeamList {...defaultProps} />);

    expect(screen.getByTestId("create-team-dialog")).toBeInTheDocument();
  });

  it("should toggle joined teams section on button click", async () => {
    render(<TeamList {...defaultProps} />);

    const collapseButtons = screen.getAllByRole("button", {
      name: /Collapse/i,
    });
    const joinedCollapseButton = collapseButtons[0];

    expect(screen.getByText("Research Team")).toBeInTheDocument();

    await userEvent.click(joinedCollapseButton);

    expect(screen.queryByText("Research Team")).not.toBeInTheDocument();
  });

  it("should toggle available teams section on button click", async () => {
    render(<TeamList {...defaultProps} />);

    const collapseButtons = screen.getAllByRole("button", {
      name: /Collapse/i,
    });
    const availableCollapseButton = collapseButtons[1];

    expect(screen.getByText("Marketing Team")).toBeInTheDocument();

    await userEvent.click(availableCollapseButton);

    expect(screen.queryByText("Marketing Team")).not.toBeInTheDocument();
  });

  it("should render empty state when no joined teams", () => {
    render(<TeamList {...defaultProps} joined={[]} />);

    expect(screen.getByText("No teams yet")).toBeInTheDocument();
  });

  it("should render empty state when no available teams", () => {
    render(<TeamList {...defaultProps} available={[]} />);

    expect(screen.getByText("No available teams")).toBeInTheDocument();
  });
});
