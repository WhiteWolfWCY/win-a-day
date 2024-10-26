"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import GoalMenu from "./GoalOptionsDropdown";
import GoalDialog from "./GoalDialog";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getRecentGoalsForUser } from "@/actions/actions";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Loader2, Plus } from "lucide-react";

export default function RecentGoals() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { userId } = useAuth();
  const { data: goals, isLoading } = useQuery({
    queryKey: ["recent-goals"],
    queryFn: async () => await getRecentGoalsForUser(userId!),
  });

  return (
    <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Recent Goals</CardTitle>
        <Link href="/dashboard/goals">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : goals && goals.length > 0 ? (
          <>
            {goals?.map((goal, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div>
                  <h3 className="font-semibold">{goal.name}</h3>
                  <p className="text-sm text-gray-500">Habit: {goal.habitName}</p>
                  <p className="text-sm text-gray-500">
                    Priority: {goal.priority}
                  </p>
                </div>
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
              </div>
            ))}
            <Button
              className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-white"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Goal
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500">No goals found</p>
            <Button
              className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-white"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Goal
            </Button>
          </>
        )}

        <GoalDialog
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
        />
      </CardContent>
    </Card>
  );
}
