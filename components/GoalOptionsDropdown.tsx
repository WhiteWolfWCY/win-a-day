"use client";

import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useState } from "react";
import GoalDialog from "./GoalDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteGoal } from "@/actions/actions";
import { toast } from "@/hooks/use-toast";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { GoalPriority, WeekDays } from "@/db/schema";

interface GoalMenuProps {
  goalId: string;
  goalName: string;
  habitId: string;
  priority: GoalPriority;
  startDate: string;
  finishDate: string;
  goalSuccess: number;
  weekDays: WeekDays[];
}

export default function GoalMenu({ goalId, goalName, habitId, priority, startDate, finishDate, goalSuccess, weekDays }: GoalMenuProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteGoalMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recent-goals"] });
      queryClient.invalidateQueries({ queryKey: ["user-goals"] });
      toast({
        title: "Goal deleted",
        description: "The goal has been successfully deleted.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to delete goal:", error);
    },
  });

  const handleDelete = () => {
    deleteGoalMutation.mutate(goalId);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <GoalDialog
        isDialogOpen={isEditDialogOpen}
        setIsDialogOpen={setIsEditDialogOpen}
        goalId={goalId}
        initialValues={{
          name: goalName,
          habitId,
          priority,
          startDate,
          finishDate,
          goalSuccess,
          weekDays,
        }}
      />
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Goal"
        description={`Are you sure you want to delete the goal "${goalName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteGoalMutation.isPending}
      />
    </>
  );
}
