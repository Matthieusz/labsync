import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SignUpForm from "./sign-up-form";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) => {
      const translations: Record<string, string> = {
        "auth.createAccount": "Create Account",
        "auth.signUp": "Sign Up",
        "auth.signingUp": "Signing Up...",
        "auth.alreadyHaveAccount": "Already have an account?",
        "auth.signIn": "Sign In",
        "common.name": "Name",
        "common.email": "Email",
        "common.creating": "Creating...",
        "teams.password": "Password",
        "auth.invalidEmail": "Invalid email",
        "auth.nameMinLength": `Name must be at least ${options?.count} characters`,
        "auth.passwordMinLength": `Password must be at least ${options?.count} characters`,
      };
      return translations[key] ?? key;
    },
  }),
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}));

const mockSignUp = vi.fn();
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signUp: {
      email: (
        data: unknown,
        callbacks: {
          onSuccess?: () => void;
          onError?: (error: { error: { message: string } }) => void;
        }
      ) => {
        mockSignUp(data, callbacks);
      },
    },
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("SignUpForm", () => {
  const mockOnSwitchToSignIn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the sign up form", () => {
    render(<SignUpForm onSwitchToSignIn={mockOnSwitchToSignIn} />);

    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
  });

  it("should have name, email, and password inputs", () => {
    render(<SignUpForm onSwitchToSignIn={mockOnSwitchToSignIn} />);

    const nameInput = screen.getByLabelText("Name");
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("type", "email");
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("should call onSwitchToSignIn when clicking sign in link", async () => {
    render(<SignUpForm onSwitchToSignIn={mockOnSwitchToSignIn} />);

    const signInButton = screen.getByRole("button", { name: /Sign In/i });
    await userEvent.click(signInButton);

    expect(mockOnSwitchToSignIn).toHaveBeenCalled();
  });

  it("should allow typing in all fields", async () => {
    render(<SignUpForm onSwitchToSignIn={mockOnSwitchToSignIn} />);

    const nameInput = screen.getByLabelText("Name");
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await userEvent.type(nameInput, "John Doe");
    await userEvent.type(emailInput, "john@example.com");
    await userEvent.type(passwordInput, "password123");

    expect(nameInput).toHaveValue("John Doe");
    expect(emailInput).toHaveValue("john@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("should submit form with valid data", async () => {
    render(<SignUpForm onSwitchToSignIn={mockOnSwitchToSignIn} />);

    const nameInput = screen.getByLabelText("Name");
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Sign Up" });

    await userEvent.type(nameInput, "John Doe");
    await userEvent.type(emailInput, "john@example.com");
    await userEvent.type(passwordInput, "password123");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
        }),
        expect.any(Object)
      );
    });
  });

  it("should display sign in prompt", () => {
    render(<SignUpForm onSwitchToSignIn={mockOnSwitchToSignIn} />);

    expect(screen.getByText(/Already have an account\?/i)).toBeInTheDocument();
  });
});
