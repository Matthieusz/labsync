import type { Locale } from "date-fns";
import { format, isBefore, startOfDay } from "date-fns";
import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { calendarClassNames } from "./calendar-class-names";

export type CreateExamDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  onSubmit: (title: string, description: string) => Promise<void>;
  dateLocale: Locale;
};

export function CreateExamDialog({
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
