import { api } from "@labsync/backend/convex/_generated/api";
import type { Id } from "@labsync/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import type { Locale } from "date-fns";
import { format, isBefore, startOfDay } from "date-fns";
import { enUS, pl as plLocale } from "date-fns/locale";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock,
  Trash2,
} from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Constants
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MS_PER_SECOND = 1000;
const MS_PER_DAY =
  MS_PER_SECOND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY;
const WEEK_DAYS = 7;

type CalendarCardProps = {
  organizationId: string;
  userId: string;
};

type Exam = {
  _id: Id<"exams">;
  _creationTime: number;
  title: string;
  date: number;
  description?: string;
  createdBy: string;
  organizationId: string;
  teamId?: string;
};

// Sub-component for exam item in list - memoized for performance
type ExamItemProps = {
  exam: Exam;
  onDelete: (id: Id<"exams">) => void;
  dateDisplay: string;
  deleteLabel: string;
};

const ExamItem = memo(function ExamItemInner({
  exam,
  onDelete,
  dateDisplay,
  deleteLabel,
}: ExamItemProps) {
  return (
    <li className="group flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
      <div className="flex-1 space-y-0.5">
        <div className="font-medium text-sm">{exam.title}</div>
        <div className="text-muted-foreground text-xs">{dateDisplay}</div>
        {exam.description ? (
          <div className="text-muted-foreground text-xs italic">
            {exam.description}
          </div>
        ) : null}
      </div>
      <Button
        aria-label={deleteLabel}
        className="opacity-0 transition-opacity group-hover:opacity-100"
        onClick={() => onDelete(exam._id)}
        size="icon"
        type="button"
        variant="ghost"
      >
        <Trash2 className="h-4 w-4 text-muted-foreground" />
      </Button>
    </li>
  );
});

// Upcoming exams list component
type UpcomingExamsListProps = {
  exams: Exam[];
  deleteLabel: string;
  noExamsMessage: string;
  clickToAddMessage: string;
  formatDate: (timestamp: number) => string;
  onDelete: (examId: Id<"exams">) => void;
};

function UpcomingExamsList({
  exams,
  deleteLabel,
  noExamsMessage,
  clickToAddMessage,
  formatDate,
  onDelete,
}: UpcomingExamsListProps) {
  if (exams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
        <CalendarDays className="mb-2 h-8 w-8 text-muted-foreground/50" />
        <p className="text-muted-foreground text-sm">{noExamsMessage}</p>
        <p className="text-muted-foreground text-xs">{clickToAddMessage}</p>
      </div>
    );
  }

  return (
    <ul className="max-h-80 space-y-2 overflow-y-auto">
      {exams.map((exam) => (
        <ExamItem
          dateDisplay={formatDate(exam.date)}
          deleteLabel={deleteLabel}
          exam={exam}
          key={exam._id}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

// Calendar classNames configuration
const calendarClassNames = {
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

const hasExamClassName = cn(
  "relative font-semibold text-primary",
  "after:-translate-x-1/2 after:absolute after:bottom-0.5 after:left-1/2 after:h-1.5 after:w-1.5 after:rounded-full after:bg-primary after:content-['']"
);

// Create Exam Dialog component
type CreateExamDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  onSubmit: (title: string, description: string) => Promise<void>;
  dateLocale: Locale;
};

function CreateExamDialog({
  isOpen,
  onOpenChange,
  selectedDate,
  onDateChange,
  onSubmit,
  dateLocale,
}: CreateExamDialogProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const today = startOfDay(new Date());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }
    await onSubmit(trimmedTitle, description);
    setTitle("");
    setDescription("");
    setShowCalendar(false);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateChange(date);
      setShowCalendar(false);
    }
  };

  const isPastDate = (date: Date) => isBefore(startOfDay(date), today);

  return (
    <Dialog onOpenChange={onOpenChange} open={isOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("calendar.createExam")}</DialogTitle>
          <DialogDescription>
            {selectedDate
              ? t("calendar.createExamFor", {
                  date: format(selectedDate, "EEEE,d MMMM, yyyy", {
                    locale: dateLocale,
                  }),
                })
              : t("calendar.createExamDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="exam-title">{t("calendar.examTitle")}</Label>
              <Input
                id="exam-title"
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("calendar.examTitlePlaceholder")}
                required
                value={title}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("calendar.selectedDate")}</Label>
              <Button
                className="w-full justify-start text-left font-normal"
                onClick={() => setShowCalendar(!showCalendar)}
                type="button"
                variant="outline"
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                {selectedDate
                  ? format(selectedDate, "EEEE, d MMMM, yyyy", {
                      locale: dateLocale,
                    })
                  : t("calendar.selectDate")}
              </Button>
              {showCalendar && (
                <div className="rounded-md border p-3">
                  <Calendar
                    classNames={calendarClassNames}
                    disabled={isPastDate}
                    locale={dateLocale}
                    mode="single"
                    onSelect={handleDateSelect}
                    selected={selectedDate}
                  />
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="exam-description">
                {t("calendar.descriptionLabel")}
              </Label>
              <Input
                id="exam-description"
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("calendar.descriptionPlaceholder")}
                value={description}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              {t("common.cancel")}
            </Button>
            <Button disabled={!title.trim()} type="submit">
              {t("calendar.createExam")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CalendarCard({ organizationId, userId }: CalendarCardProps) {
  const { t, i18n } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get date-fns locale based on current language
  const dateLocale = i18n.language === "pl" ? plLocale : enUS;

  const createExam = useMutation(api.exams.createExam);
  const deleteExam = useMutation(api.exams.deleteExam);
  const examsResult = useQuery(api.exams.getExamsByOrganization, {
    organizationId,
  });

  const exams = (examsResult?.data || []) as Exam[];
  const today = startOfDay(new Date());

  // Get dates that have exams for modifier
  const examDateArray = useMemo(
    () => exams.map((exam) => new Date(exam.date)),
    [exams]
  );

  // Check if a date is in the past
  const isPastDate = useCallback(
    (date: Date) => isBefore(startOfDay(date), today),
    [today]
  );

  // Handle day click - open dialog for future/today dates
  const handleDayClick = useCallback(
    (day: Date) => {
      if (isPastDate(day)) {
        return;
      }
      setSelectedDate(day);
      setIsDialogOpen(true);
    },
    [isPastDate]
  );

  const handleCreateExam = useCallback(
    async (title: string, description: string) => {
      if (!selectedDate) {
        return;
      }

      await createExam({
        title,
        date: selectedDate.getTime(),
        description: description || undefined,
        createdBy: userId,
        organizationId,
      });

      setIsDialogOpen(false);
    },
    [selectedDate, userId, organizationId, createExam]
  );

  const handleDeleteExam = useCallback(
    async (examId: Id<"exams">) => {
      await deleteExam({ examId });
    },
    [deleteExam]
  );

  // Sort exams by date and get upcoming only
  const upcomingExams = useMemo(() => {
    const sorted = [...exams].sort((a, b) => a.date - b.date);
    const nowTime = Date.now();
    return sorted.filter((exam) => exam.date >= nowTime);
  }, [exams]);

  const formatExamDate = useCallback(
    (timestamp: number) =>
      format(new Date(timestamp), "PPP", { locale: dateLocale }),
    [dateLocale]
  );

  const formatRelativeDate = useCallback(
    (timestamp: number) => {
      const examDate = new Date(timestamp);
      const now = new Date();
      const diffDays = Math.ceil(
        (examDate.getTime() - now.getTime()) / MS_PER_DAY
      );

      if (diffDays === 0) {
        return t("calendar.today");
      }
      if (diffDays === 1) {
        return t("calendar.tomorrow");
      }
      if (diffDays > 1 && diffDays <= WEEK_DAYS) {
        return t("calendar.inDays", { count: diffDays });
      }
      return formatExamDate(timestamp);
    },
    [t, formatExamDate]
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{t("calendar.title")}</CardTitle>
            </div>
          </div>
          <Button
            aria-label={isExpanded ? t("common.collapse") : t("common.expand")}
            onClick={() => setIsExpanded(!isExpanded)}
            size="sm"
            type="button"
            variant="ghost"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded ? (
        <CardContent className="pt-0">
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Calendar Section - Left */}
            <div className="shrink-0">
              <Calendar
                className="rounded-lg border p-3"
                classNames={calendarClassNames}
                disabled={isPastDate}
                locale={dateLocale}
                mode="single"
                modifiers={{
                  hasExam: examDateArray,
                }}
                modifiersClassNames={{
                  hasExam: hasExamClassName,
                }}
                onDayClick={handleDayClick}
                onSelect={setSelectedDate}
                selected={selectedDate}
              />
            </div>

            {/* Upcoming exams list - Right next to calendar */}
            <div className="min-w-0 flex-1">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {t("calendar.upcomingExams")}
              </h3>
              <UpcomingExamsList
                clickToAddMessage={t("calendar.clickToAdd")}
                deleteLabel={t("calendar.deleteExam")}
                exams={upcomingExams}
                formatDate={formatRelativeDate}
                noExamsMessage={t("calendar.noExams")}
                onDelete={handleDeleteExam}
              />
            </div>
          </div>
        </CardContent>
      ) : null}

      <CreateExamDialog
        dateLocale={dateLocale}
        isOpen={isDialogOpen}
        onDateChange={setSelectedDate}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCreateExam}
        selectedDate={selectedDate}
      />
    </Card>
  );
}
