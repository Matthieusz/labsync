import { type RenderOptions, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { ThemeProvider } from "@/components/theme-provider";

interface WrapperProps {
  children: React.ReactNode;
}

/**
 * Custom render function that wraps components with necessary providers
 */
function AllProviders({ children }: WrapperProps) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="test-theme">
      {children}
    </ThemeProvider>
  );
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from testing-library
export * from "@testing-library/react";
export { userEvent } from "@testing-library/user-event";
export { customRender as render };
