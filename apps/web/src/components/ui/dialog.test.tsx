import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

describe("Dialog", () => {
  it("should render trigger button", () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    expect(
      screen.getByRole("button", { name: /Open Dialog/i })
    ).toBeInTheDocument();
  });

  it("should open dialog when trigger is clicked", async () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    await userEvent.click(screen.getByRole("button", { name: /Open Dialog/i }));

    await waitFor(() => {
      expect(screen.getByText("Test Dialog")).toBeInTheDocument();
      expect(screen.getByText("Dialog description")).toBeInTheDocument();
    });
  });

  it("should render close button by default", async () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    await userEvent.click(screen.getByRole("button", { name: /Open Dialog/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Close/i })
      ).toBeInTheDocument();
    });
  });

  it("should hide close button when showCloseButton is false", async () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent showCloseButton={false}>
          <DialogTitle>Test Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    await userEvent.click(screen.getByRole("button", { name: /Open Dialog/i }));

    await waitFor(() => {
      expect(screen.getByText("Test Dialog")).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("button", { name: /Close/i })
    ).not.toBeInTheDocument();
  });

  it("should render DialogHeader", async () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Header Title</DialogTitle>
            <DialogDescription>Header Description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    await userEvent.click(screen.getByRole("button", { name: /Open Dialog/i }));

    await waitFor(() => {
      expect(screen.getByText("Header Title")).toBeInTheDocument();
      expect(screen.getByText("Header Description")).toBeInTheDocument();
    });
  });

  it("should render DialogFooter", async () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test</DialogTitle>
          <DialogFooter>
            <button type="button">Cancel</button>
            <button type="button">Confirm</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    await userEvent.click(screen.getByRole("button", { name: /Open Dialog/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Cancel/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Confirm/i })
      ).toBeInTheDocument();
    });
  });

  it("should close dialog when DialogClose is clicked", async () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogClose>Close Me</DialogClose>
        </DialogContent>
      </Dialog>
    );

    await userEvent.click(screen.getByRole("button", { name: /Open Dialog/i }));

    await waitFor(() => {
      expect(screen.getByText("Test Dialog")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Close Me"));

    await waitFor(() => {
      expect(screen.queryByText("Test Dialog")).not.toBeInTheDocument();
    });
  });

  it("should apply custom className to DialogContent", async () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent className="custom-class">
          <DialogTitle>Test Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    await userEvent.click(screen.getByRole("button", { name: /Open Dialog/i }));

    await waitFor(() => {
      const content = screen.getByRole("dialog");
      expect(content).toHaveClass("custom-class");
    });
  });
});
