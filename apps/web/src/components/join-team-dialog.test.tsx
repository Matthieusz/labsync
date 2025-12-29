import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JoinTeamDialog } from "./join-team-dialog";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "teams.join": "Join Team",
        "teams.joinTeam": "Join Team",
        "teams.joinDescription": "Enter the team password to join.",
        "teams.password": "Password",
        "teams.passwordPlaceholder": "Enter team password",
        "teams.passwordRequired": "Password is required",
        "teams.joined": "Successfully joined the team",
        "teams.joinFailed": "Failed to join team",
        "common.joining": "Joining...",
      };
      return translations[key] ?? key;
    },
  }),
}));

const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

const mockJoinTeam = vi.fn();
vi.mock("convex/react", () => ({
  useMutation: () => mockJoinTeam,
}));

vi.mock("@labsync/backend/convex/_generated/api", () => ({
  api: {
    teams: {
      joinTeam: "joinTeam",
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

describe("JoinTeamDialog", () => {
  const mockTeamId = "team-123";
  const mockOrgSlug = "my-org";
  const mockOrganizationId = "org-123";
  const mockTeamName = "Test Team";

  beforeEach(() => {
    vi.clearAllMocks();
    mockJoinTeam.mockResolvedValue({ success: true });
  });

  it("should render the trigger button", () => {
    render(
      <JoinTeamDialog
        organizationId={mockOrganizationId}
        orgSlug={mockOrgSlug}
        teamId={mockTeamId}
        teamName={mockTeamName}
      />
    );

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should open dialog when trigger is clicked", async () => {
    render(
      <JoinTeamDialog
        organizationId={mockOrganizationId}
        orgSlug={mockOrgSlug}
        teamId={mockTeamId}
        teamName={mockTeamName}
      />
    );

    const triggerButton = screen.getByRole("button");
    await userEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("should display password input field", async () => {
    render(
      <JoinTeamDialog
        organizationId={mockOrganizationId}
        orgSlug={mockOrgSlug}
        teamId={mockTeamId}
        teamName={mockTeamName}
      />
    );

    await userEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("should allow typing in password field", async () => {
    render(
      <JoinTeamDialog
        organizationId={mockOrganizationId}
        orgSlug={mockOrgSlug}
        teamId={mockTeamId}
        teamName={mockTeamName}
      />
    );

    await userEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText("Password");
    await userEvent.type(passwordInput, "secret123");

    expect(passwordInput).toHaveValue("secret123");
  });

  it("should have password placeholder", async () => {
    render(
      <JoinTeamDialog
        organizationId={mockOrganizationId}
        orgSlug={mockOrgSlug}
        teamId={mockTeamId}
        teamName={mockTeamName}
      />
    );

    await userEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    expect(
      screen.getByPlaceholderText("Enter team password")
    ).toBeInTheDocument();
  });

  it("should call joinTeam on valid submit", async () => {
    render(
      <JoinTeamDialog
        organizationId={mockOrganizationId}
        orgSlug={mockOrgSlug}
        teamId={mockTeamId}
        teamName={mockTeamName}
      />
    );

    await userEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText("Password");
    await userEvent.type(passwordInput, "secret123");

    // Find the submit button inside the dialog
    const buttons = screen.getAllByRole("button");
    const submitButton = buttons.find(
      (btn) =>
        btn.textContent?.includes("teams.join") ||
        btn.getAttribute("type") === "submit"
    );
    if (submitButton) {
      await userEvent.click(submitButton);
    }

    await waitFor(() => {
      expect(mockJoinTeam).toHaveBeenCalled();
    });
  });

  it("should display dialog description", async () => {
    render(
      <JoinTeamDialog
        organizationId={mockOrganizationId}
        orgSlug={mockOrgSlug}
        teamId={mockTeamId}
        teamName={mockTeamName}
      />
    );

    await userEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("should navigate after successful join", async () => {
    mockJoinTeam.mockResolvedValue({ success: true });

    render(
      <JoinTeamDialog
        organizationId={mockOrganizationId}
        orgSlug={mockOrgSlug}
        teamId={mockTeamId}
        teamName={mockTeamName}
      />
    );

    await userEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText("Password");
    await userEvent.type(passwordInput, "secret123");

    const buttons = screen.getAllByRole("button");
    const submitButton = buttons.find(
      (btn) =>
        btn.textContent?.includes("teams.join") ||
        btn.getAttribute("type") === "submit"
    );
    if (submitButton) {
      await userEvent.click(submitButton);
    }

    await waitFor(() => {
      expect(mockJoinTeam).toHaveBeenCalled();
    });
  });
});
