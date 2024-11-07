"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { getAllUserGoals } from "@/actions/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Loader from "@/components/Loader";
import GoalMenu from "@/components/GoalOptionsDropdown";
import GoalDialog from "@/components/GoalDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { GoalPriority, WeekDays } from "@/db/schema";

export default function GoalsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { userId } = useAuth();
  const itemsPerPage = 10;

  const { data: goals, isLoading } = useQuery({
    queryKey: ["user-goals", userId],
    queryFn: async () => await getAllUserGoals(userId!),
    enabled: !!userId,
  });

  const filteredGoals = goals?.filter((goal) =>
    goal.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedGoals = filteredGoals?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil((filteredGoals?.length || 0) / itemsPerPage);

  const getWeekDaysString = (weekDays: WeekDays[]) => {
    const fullDayNames = {
      [WeekDays.MONDAY]: "Mon",
      [WeekDays.TUESDAY]: "Tue",
      [WeekDays.WEDNESDAY]: "Wed",
      [WeekDays.THURSDAY]: "Thu",
      [WeekDays.FRIDAY]: "Fri",
      [WeekDays.SATURDAY]: "Sat",
      [WeekDays.SUNDAY]: "Sun",
    };
    return weekDays.map(day => fullDayNames[day]).join(", ");
  };

  const getPriorityColor = (priority: GoalPriority) => {
    switch (priority) {
      case GoalPriority.LOW:
        return "text-blue-500";
      case GoalPriority.MEDIUM:
        return "text-yellow-500";
      case GoalPriority.HIGH:
        return "text-red-500";
      default:
        return "";
    }
  };

  return (
    <main className="container mx-auto flex-grow flex flex-col gap-6 p-6 z-10">
      <Card className="bg-card/80 backdrop-blur-sm border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">All Goals</CardTitle>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Goal
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search goals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isLoading ? (
            <Loader />
          ) : paginatedGoals && paginatedGoals.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Finish Date</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedGoals.map((goal) => (
                    <TableRow 
                      key={goal.id}
                      className={goal.isCompleted ? "bg-green-50/50 dark:bg-green-950/20" : ""}
                    >
                      <TableCell>{goal.name}</TableCell>
                      <TableCell>
                        <span className={`font-semibold ${getPriorityColor(goal.priority)}`}>
                          {goal.priority}
                        </span>
                      </TableCell>
                      <TableCell>{format(new Date(goal.finishDate), 'yyyy-MM-dd')}</TableCell>
                      <TableCell>{getWeekDaysString(goal.weekDays!)}</TableCell>
                      <TableCell>{goal.completedAttempts || 0}/{goal.goalSuccess} successes</TableCell>
                      <TableCell>
                        {goal.isCompleted ? (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                            In Progress
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <GoalMenu
                          goalId={goal.id}
                          goalName={goal.name}
                          habitId={goal.habitId!}
                          priority={goal.priority}
                          startDate={goal.startDate}
                          finishDate={goal.finishDate}
                          goalSuccess={goal.goalSuccess}
                          weekDays={goal.weekDays!}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4 gap-2">
                <Button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  {"<"}
                </Button>
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  {">"}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <p className="text-sm text-gray-500">No goals found</p>
            </div>
          )}
        </CardContent>
      </Card>
      <GoalDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />
    </main>
  );
}
