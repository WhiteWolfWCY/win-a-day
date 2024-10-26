"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle} from "./ui/dialog";
import { Form, FormControl,FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createGoal, updateGoal, getUserHabits } from "@/actions/actions";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { GoalPriority, WeekDays } from "@/db/schema";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  habitId: z.string().min(1, "Habit is required"),
  priority: z.nativeEnum(GoalPriority),
  startDate: z.string().min(1, "Start date is required"),
  finishDate: z.string().min(1, "Finish date is required"),
  goalSuccess: z.number().min(1, "Goal success is required"),
  weekDays: z.array(z.nativeEnum(WeekDays)).min(1, "At least one weekday is required"),
});

interface GoalDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (isDialogOpen: boolean) => void;
  goalId?: string;
  initialValues?: z.infer<typeof formSchema>;
}

export default function GoalDialog({ isDialogOpen, setIsDialogOpen, goalId, initialValues }: GoalDialogProps) {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedWeekDays, setSelectedWeekDays] = useState<WeekDays[]>([]);

  const { data: habits, isLoading: isHabitsLoading } = useQuery({
    queryKey: ["user-habits", userId],
    queryFn: () => getUserHabits(userId!),
    enabled: !!userId,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || {
      name: "",
      habitId: "",
      priority: GoalPriority.MEDIUM,
      startDate: new Date().toISOString().split('T')[0],
      finishDate: "",
      goalSuccess: 1,
      weekDays: [],
    },
  });

  useEffect(() => {
    if (initialValues) {
      form.reset(initialValues);
      setSelectedWeekDays(initialValues.weekDays);
    }
  }, [initialValues, form]);

  const createGoalMutation = useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recent-goals"] });
      queryClient.invalidateQueries({ queryKey: ["user-goals"] });
      queryClient.invalidateQueries({ queryKey: ['goal-completion', userId] });
      queryClient.invalidateQueries({ queryKey: ['habit-adherence', userId] });
      queryClient.invalidateQueries({ queryKey: ['goalAttempts', format(new Date(), 'yyyy-MM-dd')] });
      setIsDialogOpen(false);
      toast({
        title: "Goal created",
        description: "Your goal has been successfully created.",
      });
      // Reset the form
      form.reset({
        name: "",
        habitId: "",
        priority: GoalPriority.MEDIUM,
        startDate: new Date().toISOString().split('T')[0],
        finishDate: "",
        goalSuccess: 1,
        weekDays: [],
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to create goal:", error);
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: updateGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recent-goals"] });
      queryClient.invalidateQueries({ queryKey: ["user-goals"] });
      setIsDialogOpen(false);
      toast({
        title: "Goal updated",
        description: "Your goal has been successfully updated.",
      });
      // Reset the form
      form.reset({
        name: "",
        habitId: "",
        priority: GoalPriority.MEDIUM,
        startDate: new Date().toISOString().split('T')[0],
        finishDate: "",
        goalSuccess: 1,
        weekDays: [],
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update goal. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to update goal:", error);
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userId) return;
    if (goalId) {
      updateGoalMutation.mutate({ id: goalId, ...values });
    } else {
      createGoalMutation.mutate({ ...values, userId });
    }
  }

  return (
    <Dialog 
      open={isDialogOpen} 
      onOpenChange={(open) => {
        if (!open) {
          form.reset({
            name: "",
            habitId: "",
            priority: GoalPriority.MEDIUM,
            startDate: new Date().toISOString().split('T')[0],
            finishDate: "",
            goalSuccess: 1,
            weekDays: [],
          });
        }
        setIsDialogOpen(open);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{goalId ? "Edit Goal" : "Add New Goal"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter goal name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="habitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Habit</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a habit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isHabitsLoading ? (
                        <SelectItem value="loading">Loading habits...</SelectItem>
                      ) : habits && habits.length > 0 ? (
                        habits.map((habit) => (
                          <SelectItem key={habit.id} value={habit.id}>
                            {habit.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-habits">No habits found</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(GoalPriority).map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(parse(field.value, "yyyy-MM-dd", new Date()), "yyyy-MM-dd")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                        disabled={(date) =>
                          date < new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="finishDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Finish Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(parse(field.value, "yyyy-MM-dd", new Date()), "yyyy-MM-dd")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                        disabled={(date) =>
                          date < parse(form.getValues("startDate"), "yyyy-MM-dd", new Date()) || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="goalSuccess"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Success</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weekDays"
              render={() => (
                <FormItem>
                  <FormLabel>Week Days</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(WeekDays).map((day) => (
                      <FormField
                        key={day}
                        control={form.control}
                        name="weekDays"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={day}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(day)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, day])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== day
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {day}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={createGoalMutation.isPending || updateGoalMutation.isPending}
            >
              {createGoalMutation.isPending || updateGoalMutation.isPending
                ? "Saving..."
                : goalId
                ? "Update Goal"
                : "Add Goal"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
