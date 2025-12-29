import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MemberList } from "./member-list";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "organizations.membersTitle": "Team Members",
        "organizations.members_other": "{{count}} member(s)",
        "members.filterByRole": "Filter by Role",
        "members.allRoles": "All Roles",
        "members.owner": "Owner",
        "members.admin": "Admin",
        "members.member": "Member",
        "members.sortBy": "Sort By",
        "members.sortByName": "Name",
        "members.sortByRole": "Role",
        "members.noResults": "No matching members",
        "members.tryDifferentFilter": "Try a different search term",
        "organizations.noMembers": "No members",
        "organizations.invite": "Invite members to your organization",
        "members.ascending": "Ascending",
        "members.descending": "Descending",
        "members.searchPlaceholder": "Search members...",
        "common.collapse": "Collapse",
        "common.expand": "Expand",
      };
      return translations[key] ?? key;
    },
  }),
}));

vi.mock("./invite-user-dialog", () => ({
  default: () => (
    <button data-testid="invite-user-dialog" type="button">
      Invite User
    </button>
  ),
  InviteUserDialog: () => (
    <button data-testid="invite-user-dialog" type="button">
      Invite User
    </button>
  ),
}));

describe("MemberList", () => {
  const defaultProps = {
    result: {
      data: {
        id: "team-123",
        name: "Research Team",
        members: [
          {
            userId: "1",
            email: "john@example.com",
            name: "John Doe",
            role: "owner",
          },
          {
            userId: "2",
            email: "jane@example.com",
            name: "Jane Smith",
            role: "admin",
          },
          {
            userId: "3",
            email: "bob@example.com",
            name: "Bob Wilson",
            role: "member",
          },
        ],
      },
    },
    orgSlug: "my-org",
    isLoading: false,
  };

  it("should render team members title", () => {
    render(<MemberList {...defaultProps} />);

    expect(screen.getByText("Team Members")).toBeInTheDocument();
  });

  it("should render member names", () => {
    render(<MemberList {...defaultProps} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Wilson")).toBeInTheDocument();
  });

  it("should render member emails", () => {
    render(<MemberList {...defaultProps} />);

    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("bob@example.com")).toBeInTheDocument();
  });

  it("should render member roles", () => {
    render(<MemberList {...defaultProps} />);

    expect(screen.getByText("owner")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();
    expect(screen.getByText("member")).toBeInTheDocument();
  });

  it("should render invite user dialog", () => {
    render(<MemberList {...defaultProps} />);

    expect(screen.getByTestId("invite-user-dialog")).toBeInTheDocument();
  });

  it("should render search input", () => {
    render(<MemberList {...defaultProps} />);

    expect(
      screen.getByPlaceholderText("Search members...")
    ).toBeInTheDocument();
  });

  it("should filter members by search term", async () => {
    render(<MemberList {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search members...");
    await userEvent.type(searchInput, "John");

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
    expect(screen.queryByText("Bob Wilson")).not.toBeInTheDocument();
  });

  it("should render member initials", () => {
    render(<MemberList {...defaultProps} />);

    expect(screen.getByText("JO")).toBeInTheDocument(); // John
    expect(screen.getByText("JA")).toBeInTheDocument(); // Jane
    expect(screen.getByText("BO")).toBeInTheDocument(); // Bob
  });

  it("should display empty state when no members", () => {
    const propsWithNoMembers = {
      ...defaultProps,
      result: {
        data: {
          id: "team-123",
          name: "Research Team",
          members: [],
        },
      },
    };

    render(<MemberList {...propsWithNoMembers} />);

    expect(screen.getByText("No members")).toBeInTheDocument();
  });

  it("should show no matching members when filter returns empty", async () => {
    render(<MemberList {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search members...");
    await userEvent.type(searchInput, "xyz-non-existent-name");

    expect(screen.getByText("No matching members")).toBeInTheDocument();
  });
});
