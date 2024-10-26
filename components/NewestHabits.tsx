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

export default function NewestHabits() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { userId } = useAuth();
  const { data: habits, isLoading } = useQuery({
    queryKey: ["newest-habits"],
    queryFn: async () => await getRecentHabitsForUser(userId!),
  });

  return (
    <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Newest Habits</CardTitle>
        <Link href="/dashboard/habits">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader />
        ) : habits && habits.length > 0 ? (
          <>
          {habits?.map((habit, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <h3 className="font-semibold">{habit.habitName}</h3>
                  <p className="text-sm text-gray-500">
                    Category: {habit.habitCategory}
                  </p>
                  <p className="text-sm text-gray-500">
                    Type: {habit.habitType ? "Good" : "Bad"}
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
              />
            </>
        ) : (
          <>
            <p className="text-sm text-gray-500">No habits found</p>
            <AddHabitDialog
                isDialogOpen={isDialogOpen}
                setIsDialogOpen={setIsDialogOpen}
              />
          </>
        )}
      </CardContent>
    </Card>
  );
}
