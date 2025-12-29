import { api } from "@labsync/backend/convex/_generated/api";
import type { Id } from "@labsync/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
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
import { calendarClassNames, hasExamClassName } from "./calendar-class-names";
import { CreateExamDialog } from "./create-exam-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
