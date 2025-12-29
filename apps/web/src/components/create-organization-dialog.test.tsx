import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateOrganizationDialog } from "./create-organization-dialog";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "organizations.create": "Create Organization",
        "organizations.createNew": "Create New Organization",
        "organizations.createDescription":
          "Create a new organization to collaborate with your team.",
        "organizations.name": "Name",
        "organizations.namePlaceholder": "Enter organization name",
        "organizations.slug": "Slug",
        "organizations.slugPlaceholder": "my-organization",
        "organizations.nameMinLength": "Name must be at least 2 characters",
        "organizations.slugMinLength": "Slug must be at least 2 characters",
        "organizations.slugRegex":
          "Slug can only contain lowercase letters, numbers, and hyphens",
        "organizations.created": "Organization created successfully",
        "organizations.failedToCreate": "Failed to create organization",
        "common.creating": "Creating...",
      };
      return translations[key] ?? key;
    },
  }),
}));

const mockCreateOrganization = vi.fn();
vi.mock("convex/react", () => ({
  useMutation: () => mockCreateOrganization,
}));

vi.mock("@labsync/backend/convex/_generated/api", () => ({
  api: {
    organizations: {
      createOrganization: "createOrganization",
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

describe("CreateOrganizationDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateOrganization.mockResolvedValue({ data: "org-id" });
  });

  it("should render the trigger button", () => {
    render(<CreateOrganizationDialog />);

    expect(
      screen.getByRole("button", { name: /Create Organization/i })
    ).toBeInTheDocument();
  });

  it("should open dialog when trigger is clicked", async () => {
    render(<CreateOrganizationDialog />);

    const triggerButton = screen.getByRole("button", {
      name: /Create Organization/i,
    });
    await userEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText("Create New Organization")).toBeInTheDocument();
    });
  });

  it("should display name and slug input fields", async () => {
    render(<CreateOrganizationDialog />);

    await userEvent.click(
      screen.getByRole("button", { name: /Create Organization/i })
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Slug")).toBeInTheDocument();
    });
  });

  it("should allow typing in input fields", async () => {
    render(<CreateOrganizationDialog />);

    await userEvent.click(
      screen.getByRole("button", { name: /Create Organization/i })
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Name")).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText("Name");
    const slugInput = screen.getByLabelText("Slug");

    await userEvent.type(nameInput, "My Organization");
    await userEvent.type(slugInput, "my-org");

    expect(nameInput).toHaveValue("My Organization");
    expect(slugInput).toHaveValue("my-org");
  });

  it("should have placeholders in input fields", async () => {
    render(<CreateOrganizationDialog />);

    await userEvent.click(
      screen.getByRole("button", { name: /Create Organization/i })
    );

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Enter organization name")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("my-organization")
      ).toBeInTheDocument();
    });
  });

  it("should call createOrganization on valid submit", async () => {
    render(<CreateOrganizationDialog />);

    await userEvent.click(
      screen.getByRole("button", { name: /Create Organization/i })
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Name")).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText("Name");
    const slugInput = screen.getByLabelText("Slug");

    await userEvent.type(nameInput, "My Organization");
    await userEvent.type(slugInput, "my-org");

    // Find the submit button inside the dialog
    const submitButtons = screen.getAllByRole("button", {
      name: /Create Organization/i,
    });
    const submitButton = submitButtons.at(-1);
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateOrganization).toHaveBeenCalledWith({
        name: "My Organization",
        slug: "my-org",
      });
    });
  });

  it("should display dialog description", async () => {
    render(<CreateOrganizationDialog />);

    await userEvent.click(
      screen.getByRole("button", { name: /Create Organization/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          "Create a new organization to collaborate with your team."
        )
      ).toBeInTheDocument();
    });
  });
});
