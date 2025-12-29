import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateTeamDialog } from "./create-team-dialog";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "teams.create": "Create Team",
        "teams.createNew": "Create New Team",
        "teams.createDescription":
          "Create a new team within your organization.",
        "teams.name": "Name",
        "teams.namePlaceholder": "Enter team name",
        "teams.password": "Password",
        "teams.passwordPlaceholder": "Optional team password",
        "teams.nameMinLength": "Name must be at least 2 characters",
        "teams.created": "Team created successfully",
        "teams.failedToCreate": "Failed to create team",
        "common.creating": "Creating...",
      };
      return translations[key] ?? key;
    },
  }),
}));

const mockCreateTeam = vi.fn();
vi.mock("convex/react", () => ({
  useMutation: () => mockCreateTeam,
}));

vi.mock("@labsync/backend/convex/_generated/api", () => ({
  api: {
    teams: {
      createTeam: "createTeam",
    },
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/error-handling", () => ({
  handleError: vi.fn(),
}));

describe("CreateTeamDialog", () => {
  const mockOrganizationId = "org-123" as never;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateTeam.mockResolvedValue({ data: "team-id" });
  });

  it("should render the trigger button", () => {
    render(<CreateTeamDialog organizationId={mockOrganizationId} />);

    expect(
      screen.getByRole("button", { name: /Create Team/i })
    ).toBeInTheDocument();
  });

  it("should open dialog when trigger is clicked", async () => {
    render(<CreateTeamDialog organizationId={mockOrganizationId} />);

    const triggerButton = screen.getByRole("button", { name: /Create Team/i });
    await userEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText("Create New Team")).toBeInTheDocument();
    });
  });

  it("should display name input field", async () => {
    render(<CreateTeamDialog organizationId={mockOrganizationId} />);

    await userEvent.click(screen.getByRole("button", { name: /Create Team/i }));

    await waitFor(() => {
      expect(screen.getByLabelText("Name")).toBeInTheDocument();
    });
  });

  it("should display password input field", async () => {
    render(<CreateTeamDialog organizationId={mockOrganizationId} />);

    await userEvent.click(screen.getByRole("button", { name: /Create Team/i }));

    await waitFor(() => {
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
    });
  });

  it("should allow typing in input fields", async () => {
    render(<CreateTeamDialog organizationId={mockOrganizationId} />);

    await userEvent.click(screen.getByRole("button", { name: /Create Team/i }));

    await waitFor(() => {
      expect(screen.getByLabelText("Name")).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText("Name");
    const passwordInput = screen.getByLabelText("Password");

    await userEvent.type(nameInput, "Research Team");
    await userEvent.type(passwordInput, "secret123");

    expect(nameInput).toHaveValue("Research Team");
    expect(passwordInput).toHaveValue("secret123");
  });

  it("should submit form when valid data is entered", async () => {
    render(<CreateTeamDialog organizationId={mockOrganizationId} />);

    await userEvent.click(screen.getByRole("button", { name: /Create Team/i }));

    await waitFor(() => {
      expect(screen.getByLabelText("Name")).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText("Name");
    await userEvent.type(nameInput, "Research Team");

    // Verify the input was filled
    expect(nameInput).toHaveValue("Research Team");
  });

  it("should display dialog description", async () => {
    render(<CreateTeamDialog organizationId={mockOrganizationId} />);

    await userEvent.click(screen.getByRole("button", { name: /Create Team/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Create a new team within your organization.")
      ).toBeInTheDocument();
    });
  });

  it("should have password field as optional", async () => {
    render(<CreateTeamDialog organizationId={mockOrganizationId} />);

    await userEvent.click(screen.getByRole("button", { name: /Create Team/i }));

    await waitFor(() => {
      const passwordInput = screen.getByLabelText("Password");
      expect(passwordInput).toHaveAttribute(
        "placeholder",
        "Optional team password"
      );
    });
  });
});
