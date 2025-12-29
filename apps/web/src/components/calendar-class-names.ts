import { cn } from "@/lib/utils";

/**
 * Calendar classNames configuration for react-day-picker Calendar component.
 * Shared between CalendarCard and CreateExamDialog.
 */
export const calendarClassNames = {
  months: "flex flex-col space-y-4 sm:space-x-4 sm:space-y-0",
  month: "w-full space-y-4",
  caption: "flex items-center justify-center gap-1 pt-1",
  caption_label: "font-medium text-sm",
  nav: "flex items-center gap-1",
  nav_button: cn(
    "inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-transparent p-0 opacity-50 hover:bg-accent hover:text-accent-foreground hover:opacity-100"
  ),
  nav_button_previous: "",
  nav_button_next: "",
  table: "w-full space-y-1 border-collapse",
  head_row: "flex",
  head_cell:
    "flex-1 w-9 rounded-md text-center font-normal text-[0.8rem] text-muted-foreground",
  row: "mt-2 flex w-full",
  cell: cn(
    "relative flex-1 p-0 text-center text-sm focus-within:relative focus-within:z-20",
    "[&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md"
  ),
  day: cn(
    "mx-auto inline-flex h-9 w-9 items-center justify-center rounded-md p-0 font-normal hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground aria-selected:opacity-100"
  ),
  day_range_end: "day-range-end",
  day_selected:
    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
  day_today: "bg-accent font-semibold text-accent-foreground",
  day_outside:
    "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
  day_disabled: "cursor-not-allowed text-muted-foreground opacity-50",
  day_hidden: "invisible",
};

export const hasExamClassName = cn(
  "relative font-semibold text-primary",
  "after:-translate-x-1/2 after:absolute after:bottom-0.5 after:left-1/2 after:h-1.5 after:w-1.5 after:rounded-full after:bg-primary after:content-['']"
);
