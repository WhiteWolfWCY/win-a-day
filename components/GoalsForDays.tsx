"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar } from "./ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { getUserGoalsForDay, updateGoalAttempt } from "@/actions/actions";
import { useAuth } from "@clerk/nextjs";
import { format } from "date-fns";
import Loader from "@/components/Loader";

export default function GoalsForDays() {
  const {userId} = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const queryClient = useQueryClient();

  const { data: goalAttempts = [], isLoading } = useQuery({
    queryKey: ['goalAttempts', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: () => getUserGoalsForDay(format(selectedDate, 'yyyy-MM-dd'), userId!),
  });

  const updateGoalAttemptMutation = useMutation({
    mutationFn: ({ goalAttemptId, isCompleted }: { goalAttemptId: string, isCompleted: boolean }) => 
      updateGoalAttempt(goalAttemptId, { isCompleted }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goalAttempts', format(selectedDate, 'yyyy-MM-dd')] });
      queryClient.invalidateQueries({ queryKey: ['recent-goals'] });
      queryClient.invalidateQueries({ queryKey: ['goal-completion', userId] });
      queryClient.invalidateQueries({ queryKey: ['habit-adherence', userId] });
    },
  });

  const toggleGoalCompletion = (goalAttemptId: string, isCompleted: boolean) => {
    updateGoalAttemptMutation.mutate({ goalAttemptId, isCompleted });
  };

  return (
    <Card className="bg-white bg-opacity-80 backdrop-blur-sm col-span-2 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Goals for Days</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border shadow"
            />
          </div>
          <Separator orientation="vertical" className="hidden md:block" />
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-4 text-center mt-0 md:-mt-16">Goals for {format(selectedDate, 'yyyy-MM-dd')}</h3>
            {isLoading ? (
              <Loader />
            ) : goalAttempts.length > 0 ? (
              <ScrollArea className="pr-4">
                {goalAttempts.map((attempt) => (
                  <div key={attempt.goalAttempt.id} className="py-3 flex items-center justify-between border-b last:border-b-0">
                    <div className={`flex-1 ${attempt.goalAttempt.isCompleted ? 'line-through text-gray-400' : ''}`}>
                      <h4 className="font-medium">{attempt.goal.name}</h4>
                      <p className="text-sm text-gray-500">{attempt.goal.priority}</p>
                    </div>
                    <Checkbox
                      checked={attempt.goalAttempt.isCompleted || false}
                      onCheckedChange={(checked) => toggleGoalCompletion(attempt.goalAttempt.id, checked as boolean)}
                    />
                  </div>
                ))}
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center text-gray-500">
                No goals for this day
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
