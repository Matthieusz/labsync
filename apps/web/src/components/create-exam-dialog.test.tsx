import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { enUS } from "date-fns/locale";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateExamDialog } from "./create-exam-dialog";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "calendar.createExam": "Create Exam",
        "calendar.createExamFor": "Create exam for selected date",
        "calendar.createExamDescription": "Schedule a new exam",
        "calendar.examTitle": "Exam Title",
        "calendar.examTitlePlaceholder": "Enter exam title",
        "calendar.selectedDate": "Selected Date",
        "calendar.selectDate": "Select a date",
        "calendar.descriptionLabel": "Description (optional)",
        "calendar.descriptionPlaceholder": "Enter description",
        "common.cancel": "Cancel",
      };
      return translations[key] ?? key;
    },
  }),
}));

describe("CreateExamDialog", () => {
  const mockOnOpenChange = vi.fn();
  const mockOnDateChange = vi.fn();
  const mockOnSubmit = vi.fn();
  const selectedDate = new Date("2025-12-30");

  const defaultProps = {
    isOpen: true,
    onOpenChange: mockOnOpenChange,
    selectedDate,
    onDateChange: mockOnDateChange,
    onSubmit: mockOnSubmit,
    dateLocale: enUS,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  it("should render dialog when open", () => {
    render(<CreateExamDialog {...defaultProps} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Exam Title")).toBeInTheDocument();
  });

  it("should not render dialog when closed", () => {
    render(<CreateExamDialog {...defaultProps} isOpen={false} />);

    expect(screen.queryByText("Create Exam")).not.toBeInTheDocument();
  });

  it("should allow typing in title input", async () => {
    const user = userEvent.setup();
    render(<CreateExamDialog {...defaultProps} />);

    const titleInput = screen.getByLabelText("Exam Title");
    await user.type(titleInput, "Math Exam");

    expect(titleInput).toHaveValue("Math Exam");
  });

  it("should allow typing in description input", async () => {
    const user = userEvent.setup();
    render(<CreateExamDialog {...defaultProps} />);

    const descriptionInput = screen.getByLabelText("Description (optional)");
    await user.type(descriptionInput, "Chapter 5 test");

    expect(descriptionInput).toHaveValue("Chapter 5 test");
  });

  it("should disable submit button when title is empty", () => {
    render(<CreateExamDialog {...defaultProps} />);

    const submitButton = screen.getByRole("button", { name: "Create Exam" });
    expect(submitButton).toBeDisabled();
  });

  it("should enable submit button when title has content", async () => {
    const user = userEvent.setup();
    render(<CreateExamDialog {...defaultProps} />);

    const titleInput = screen.getByLabelText("Exam Title");
    await user.type(titleInput, "Math Exam");

    const submitButton = screen.getByRole("button", { name: "Create Exam" });
    expect(submitButton).toBeEnabled();
  });

  it("should call onSubmit when form is submitted with valid data", async () => {
    const user = userEvent.setup();
    render(<CreateExamDialog {...defaultProps} />);

    const titleInput = screen.getByLabelText("Exam Title");
    const descriptionInput = screen.getByLabelText("Description (optional)");

    await user.type(titleInput, "Math Exam");
    await user.type(descriptionInput, "Chapter 5");

    const submitButton = screen.getByRole("button", { name: "Create Exam" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith("Math Exam", "Chapter 5");
    });
  });

  it("should call onOpenChange when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<CreateExamDialog {...defaultProps} />);

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("should not submit when title is only whitespace", async () => {
    const user = userEvent.setup();
    render(<CreateExamDialog {...defaultProps} />);

    const titleInput = screen.getByLabelText("Exam Title");
    await user.type(titleInput, "   ");

    const submitButton = screen.getByRole("button", { name: "Create Exam" });
    expect(submitButton).toBeDisabled();
  });

  it("should clear inputs after successful submit", async () => {
    const user = userEvent.setup();
    render(<CreateExamDialog {...defaultProps} />);

    const titleInput = screen.getByLabelText("Exam Title");
    const descriptionInput = screen.getByLabelText("Description (optional)");

    await user.type(titleInput, "Math Exam");
    await user.type(descriptionInput, "Chapter 5");

    const submitButton = screen.getByRole("button", { name: "Create Exam" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(titleInput).toHaveValue("");
      expect(descriptionInput).toHaveValue("");
    });
  });
});
