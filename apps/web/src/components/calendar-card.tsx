import { api } from "@labsync/backend/convex/_generated/api";
import type { Id } from "@labsync/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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

export function CalendarCard({ organizationId, userId }: CalendarCardProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [examTitle, setExamTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [examDescription, setExamDescription] = useState("");

  const createExam = useMutation(api.exams.createExam);
  const deleteExam = useMutation(api.exams.deleteExam);
  const examsResult = useQuery(api.exams.getExamsByOrganization, {
    organizationId,
  });

  const exams = (examsResult?.data || []) as Exam[];

  // Get dates that have exams for modifier
  const examDateArray = useMemo(
    () => exams.map((exam) => new Date(exam.date)),
    [exams]
  );

  const handleCreateExam = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!examTitle.trim()) {
        return;
      }
      if (!examDate) {
        return;
      }

      const dateObj = new Date(examDate);
      await createExam({
        title: examTitle,
        date: dateObj.getTime(),
        description: examDescription || undefined,
        createdBy: userId,
        organizationId,
      });

      setExamTitle("");
      setExamDate("");
      setExamDescription("");
      setIsDialogOpen(false);
    },
    [examTitle, examDate, examDescription, userId, organizationId, createExam]
  );

  const handleDeleteExam = useCallback(
    async (examId: Id<"exams">) => {
      await deleteExam({ examId });
    },
    [deleteExam]
  );

  const formatExamDate = useCallback(
    (timestamp: number) =>
      new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    []
  );

  // Sort exams by date
  const sortedExams = useMemo(
    () => [...exams].sort((a, b) => a.date - b.date),
    [exams]
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Calendar & Exams</CardTitle>
            <CardDescription className="text-xs">
              View and manage exam dates
              {sortedExams.length > 0
                ? ` • ${sortedExams.length} exam${sortedExams.length === 1 ? "" : "s"} scheduled`
                : ""}
            </CardDescription>
          </div>
          <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" type="button">
                Add Exam
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Exam</DialogTitle>
                <DialogDescription>
                  Add an exam to your organization calendar
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateExam}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Exam Title</Label>
                    <Input
                      id="title"
                      onChange={(e) => setExamTitle(e.target.value)}
                      placeholder="e.g., Final Exam - Mathematics"
                      required
                      value={examTitle}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      onChange={(e) => setExamDate(e.target.value)}
                      required
                      type="date"
                      value={examDate}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      onChange={(e) => setExamDescription(e.target.value)}
                      placeholder="Additional details about the exam"
                      value={examDescription}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Exam</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-[auto,300px]">
          <div className="flex justify-center">
            <Calendar
              mode="single"
              modifiers={{
                hasExam: examDateArray,
              }}
              modifiersClassNames={{
                hasExam:
                  "relative font-bold after:absolute after:bottom-1 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-primary after:content-['']",
              }}
              onSelect={setDate}
              selected={date}
            />
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-sm">Upcoming Exams</h3>
            {sortedExams.length > 0 ? (
              <ul className="space-y-3">
                {sortedExams.map((exam) => (
                  <li
                    className={cn(
                      "rounded-lg border bg-muted/30 p-3",
                      exam.date < Date.now() && "opacity-60"
                    )}
                    key={exam._id}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <div className="font-medium text-sm">{exam.title}</div>
                        <div className="text-muted-foreground text-xs">
                          {formatExamDate(exam.date)}
                        </div>
                        {exam.description ? (
                          <div className="text-muted-foreground text-xs">
                            {exam.description}
                          </div>
                        ) : null}
                      </div>
                      <Button
                        aria-label="Delete exam"
                        onClick={() => handleDeleteExam(exam._id)}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-muted-foreground text-sm">
                No exams scheduled yet. Click "Add Exam" to create one.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
