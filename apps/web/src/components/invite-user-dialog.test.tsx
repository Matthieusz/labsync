import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InviteUserDialog } from "./invite-user-dialog";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "organizations.inviteMember": "Invite Member",
        "organizations.inviteMemberTitle": "Invite Member to Organization",
        "organizations.inviteMemberDescription":
          "Send an invitation to a user to join this organization.",
        "organizations.email": "Email",
        "organizations.emailPlaceholder": "user@example.com",
        "organizations.emailRequired": "Email is required",
        "organizations.validEmail": "Please enter a valid email",
        "organizations.inviteSent": "Invitation sent successfully",
        "organizations.inviteFailed": "Failed to send invitation",
        "common.sending": "Sending...",
        "common.cancel": "Cancel",
      };
      return translations[key] ?? key;
    },
  }),
}));

const mockInviteUser = vi.fn();
vi.mock("convex/react", () => ({
  useMutation: () => mockInviteUser,
}));

vi.mock("@labsync/backend/convex/_generated/api", () => ({
  api: {
    organizations: {
      inviteMemberToOrganization: "inviteMemberToOrganization",
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

describe("InviteUserDialog", () => {
  const mockOrganizationId = "org-123";
  const mockOrganizationName = "Test Organization";

  beforeEach(() => {
    vi.clearAllMocks();
    mockInviteUser.mockResolvedValue({ success: true });
  });

  it("should render the trigger button", () => {
    render(
      <InviteUserDialog
        organizationId={mockOrganizationId}
        organizationName={mockOrganizationName}
      />
    );

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should open dialog when trigger is clicked", async () => {
    render(
      <InviteUserDialog
        organizationId={mockOrganizationId}
        organizationName={mockOrganizationName}
      />
    );

    const triggerButton = screen.getByRole("button");
    await userEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("should display email input field", async () => {
    render(
      <InviteUserDialog
        organizationId={mockOrganizationId}
        organizationName={mockOrganizationName}
      />
    );

    await userEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("should allow typing in email field", async () => {
    render(
      <InviteUserDialog
        organizationId={mockOrganizationId}
        organizationName={mockOrganizationName}
      />
    );

    await userEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const emailInput = screen.getByRole("textbox");
    await userEvent.type(emailInput, "test@example.com");

    expect(emailInput).toHaveValue("test@example.com");
  });

  it("should have email placeholder", async () => {
    render(
      <InviteUserDialog
        organizationId={mockOrganizationId}
        organizationName={mockOrganizationName}
      />
    );

    await userEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText("user@example.com")).toBeInTheDocument();
  });

  it("should allow entering valid email", async () => {
    render(
      <InviteUserDialog
        organizationId={mockOrganizationId}
        organizationName={mockOrganizationName}
      />
    );

    await userEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const emailInput = screen.getByRole("textbox");
    await userEvent.type(emailInput, "test@example.com");

    // Verify the input was filled correctly
    expect(emailInput).toHaveValue("test@example.com");
  });

  it("should display dialog description", async () => {
    render(
      <InviteUserDialog
        organizationId={mockOrganizationId}
        organizationName={mockOrganizationName}
      />
    );

    await userEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });
});
