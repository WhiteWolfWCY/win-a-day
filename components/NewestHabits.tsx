"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import HabitMenu from "./HabitOptionsDropdown";
import AddHabitDialog from "./AddHabitDialog";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getRecentHabitsForUser } from "@/actions/actions";
import { useQuery } from "@tanstack/react-query";
import Loader from "./Loader";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

export default function NewestHabits() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { userId } = useAuth();
  const { data: habits, isLoading } = useQuery({
    queryKey: ["newest-habits"],
    queryFn: async () => await getRecentHabitsForUser(userId!),
  });

  return (
    <Card className="bg-opacity-80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Newest Habits</CardTitle>
        <Link href="/dashboard/habits">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col h-full justify-between">
        {isLoading ? (
          <Loader />
        ) : habits && habits.length > 0 ? (
          <div className="flex flex-col h-full justify-between pb-16">
            {habits?.map((habit, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <h3 className="font-semibold">{habit.habitName}</h3>
                  <p className="text-sm text-gray-500">
                    Category: {habit.habitCategoryIcon} {habit.habitCategory}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center">
                    Good habit:{" "}
                    {habit.habitType ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 ml-1" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 ml-1" />
                    )}
                  </p>
                </div>
                <HabitMenu
                  habitId={habit.habitId}
                  habitName={habit.habitName}
                  categoryId={habit.habitCategoryId}
                  isGoodHabit={habit.habitType || false}
                />
              </div>
            ))}
            <AddHabitDialog
              isDialogOpen={isDialogOpen}
              setIsDialogOpen={setIsDialogOpen}
              showAddButton={true}
            />
          </div>
        ) : (
          <div className="h-full flex flex-col justify-between pb-16">
            <p className="text-sm text-gray-500">No habits found</p>
            <AddHabitDialog
              isDialogOpen={isDialogOpen}
              setIsDialogOpen={setIsDialogOpen}
              showAddButton={true}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
