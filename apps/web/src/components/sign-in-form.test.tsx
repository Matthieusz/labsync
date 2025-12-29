import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SignInForm from "./sign-in-form";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) => {
      const translations: Record<string, string> = {
        "auth.welcomeBack": "Welcome Back",
        "auth.signIn": "Sign In",
        "auth.signingIn": "Signing In...",
        "auth.dontHaveAccount": "Don't have an account?",
        "auth.signUp": "Sign Up",
        "common.email": "Email",
        "teams.password": "Password",
        "auth.invalidEmail": "Invalid email",
        "auth.passwordMinLength": `Password must be at least ${options?.count} characters`,
      };
      return translations[key] ?? key;
    },
  }),
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}));

const mockSignIn = vi.fn();
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: (
        data: unknown,
        callbacks: {
          onSuccess?: () => void;
          onError?: (error: { error: { message: string } }) => void;
        }
      ) => {
        mockSignIn(data, callbacks);
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

describe("SignInForm", () => {
  const mockOnSwitchToSignUp = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the sign in form", () => {
    render(<SignInForm onSwitchToSignUp={mockOnSwitchToSignUp} />);

    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("should have email and password inputs", () => {
    render(<SignInForm onSwitchToSignUp={mockOnSwitchToSignUp} />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    expect(emailInput).toHaveAttribute("type", "email");
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("should call onSwitchToSignUp when clicking sign up link", async () => {
    render(<SignInForm onSwitchToSignUp={mockOnSwitchToSignUp} />);

    const signUpButton = screen.getByRole("button", { name: /Sign Up/i });
    await userEvent.click(signUpButton);

    expect(mockOnSwitchToSignUp).toHaveBeenCalled();
  });

  it("should allow typing in email field", async () => {
    render(<SignInForm onSwitchToSignUp={mockOnSwitchToSignUp} />);

    const emailInput = screen.getByLabelText("Email");
    await userEvent.type(emailInput, "test@example.com");

    expect(emailInput).toHaveValue("test@example.com");
  });

  it("should allow typing in password field", async () => {
    render(<SignInForm onSwitchToSignUp={mockOnSwitchToSignUp} />);

    const passwordInput = screen.getByLabelText("Password");
    await userEvent.type(passwordInput, "password123");

    expect(passwordInput).toHaveValue("password123");
  });

  it("should submit form with valid data", async () => {
    render(<SignInForm onSwitchToSignUp={mockOnSwitchToSignUp} />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Sign In" });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "test@example.com",
          password: "password123",
        }),
        expect.any(Object)
      );
    });
  });

  it("should display sign up prompt", () => {
    render(<SignInForm onSwitchToSignUp={mockOnSwitchToSignUp} />);

    expect(screen.getByText(/Don't have an account\?/i)).toBeInTheDocument();
  });
});
