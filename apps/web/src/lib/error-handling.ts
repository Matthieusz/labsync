import { toast } from "sonner";

/**
 * Standard error type returned from Convex queries/mutations
 */
type ConvexResult<T> = {
  data: T | null;
  error?: string;
};

/**
 * Handle errors consistently across the application.
 * Shows a toast notification with the error message.
 *
 * @param error - The error to handle (can be Error, string, or unknown)
 * @param fallbackMessage - Default message if error doesn't have a message
 * @returns The error message string
 *
 * @example
 * ```tsx
 * try {
 *   await someOperation();
 * } catch (error) {
 *   handleError(error, t("common.operationFailed"));
 * }
 * ```
 */
export function handleError(
  error: unknown,
  fallbackMessage = "An unexpected error occurred"
): string {
  let message: string;

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  } else {
    message = fallbackMessage;
  }

  toast.error(message);
  return message;
}

/**
 * Handle the result from a Convex query or mutation.
 * Shows error toast if the result contains an error.
 *
 * @param result - The result object from Convex
 * @param options - Configuration options
 * @returns true if successful (no error), false otherwise
 *
 * @example
 * ```tsx
 * const result = await createOrganization({ name, slug });
 * if (handleConvexResult(result, { successMessage: t("organizations.created") })) {
 *   // Success - close dialog, navigate, etc.
 * }
 * ```
 */
export function handleConvexResult<T>(
  result: ConvexResult<T>,
  options: {
    successMessage?: string;
    errorFallback?: string;
  } = {}
): result is { data: NonNullable<T>; error: undefined } {
  const { successMessage, errorFallback = "Operation failed" } = options;

  if (result.error) {
    toast.error(result.error);
    return false;
  }

  if (result.data === null) {
    toast.error(errorFallback);
    return false;
  }

  if (successMessage) {
    toast.success(successMessage);
  }

  return true;
}

/**
 * Wrap an async operation with consistent error handling.
 *
 * @param operation - The async operation to execute
 * @param options - Configuration options
 * @returns The result of the operation, or undefined if an error occurred
 *
 * @example
 * ```tsx
 * const result = await withErrorHandling(
 *   () => api.organizations.create({ name, slug }),
 *   {
 *     errorFallback: t("organizations.failedToCreate"),
 *     successMessage: t("organizations.created"),
 *   }
 * );
 * ```
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  options: {
    errorFallback?: string;
    successMessage?: string;
  } = {}
): Promise<T | undefined> {
  const { errorFallback = "Operation failed", successMessage } = options;

  try {
    const result = await operation();

    if (successMessage) {
      toast.success(successMessage);
    }

    return result;
  } catch (error) {
    handleError(error, errorFallback);
    return;
  }
}

/**
 * Type guard to check if a Convex result is successful
 */
export function isConvexSuccess<T>(
  result: ConvexResult<T>
): result is { data: NonNullable<T>; error: undefined } {
  return !result.error && result.data !== null;
}
