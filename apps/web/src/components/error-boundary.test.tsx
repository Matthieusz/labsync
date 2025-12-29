import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "./error-boundary";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback || key,
  }),
}));

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Test error message");
  }
  return <div>No error</div>;
}

describe("ErrorBoundary", () => {
  // Suppress console.error for these tests since we're intentionally throwing
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it("should render children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("should render error fallback when child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("should render custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom fallback")).toBeInTheDocument();
  });

  it("should reset error state when Try Again is clicked", () => {
    let shouldThrow = true;

    function ControlledThrow() {
      if (shouldThrow) {
        throw new Error("Test error");
      }
      return <div>Recovered</div>;
    }

    const { rerender } = render(
      <ErrorBoundary>
        <ControlledThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Stop throwing and click reset
    shouldThrow = false;
    fireEvent.click(screen.getByText("Try Again"));

    // Re-render triggers the recovered state
    rerender(
      <ErrorBoundary>
        <ControlledThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText("Recovered")).toBeInTheDocument();
  });

  it("should display Try Again and Reload Page buttons", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Try Again")).toBeInTheDocument();
    expect(screen.getByText("Reload Page")).toBeInTheDocument();
  });
});
