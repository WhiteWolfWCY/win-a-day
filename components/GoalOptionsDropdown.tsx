"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useState } from "react";
import GoalDialog from "./GoalDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteGoal } from "@/actions/actions";
import { toast } from "@/hooks/use-toast";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { GoalPriority, WeekDays } from "@/db/schema";
import { useTranslations } from 'next-intl';

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
  const t = useTranslations();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteGoalMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recent-goals"] });
      queryClient.invalidateQueries({ queryKey: ["user-goals"] });
      toast({
        title: t('goals.deleteSuccess'),
        description: t('goals.deleteSuccessDesc'),
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: t('goals.deleteError'),
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
            <span className="sr-only">{t('common.openMenu')}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            {t('common.edit')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            {t('common.delete')}
          </DropdownMenuItem>
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
        title={t('goals.deleteTitle')}
        description={t('goals.deleteConfirm', { name: goalName })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        isLoading={deleteGoalMutation.isPending}
      />
    </>
  );
}
