"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useState } from "react";
import AddHabitDialog from "./AddHabitDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteHabit } from "@/actions/actions";
import { toast } from "@/hooks/use-toast";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { useTranslations } from 'next-intl';

interface HabitMenuProps {
  habitId: string;
  habitName: string;
  categoryId: string;
  isGoodHabit: boolean;
}

export default function HabitMenu({ habitId, habitName, categoryId, isGoodHabit }: HabitMenuProps) {
  const t = useTranslations();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteHabitMutation = useMutation({
    mutationFn: deleteHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newest-habits"] });
      queryClient.invalidateQueries({ queryKey: ["user-habits"] });
      toast({
        title: t('habits.deleteSuccess'),
        description: t('habits.deleteSuccessDesc'),
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: t('habits.deleteError'),
        variant: "destructive",
      });
      console.error("Failed to delete habit:", error);
    },
  });

  const handleDelete = () => {
    deleteHabitMutation.mutate(habitId);
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
      <AddHabitDialog
        isDialogOpen={isEditDialogOpen}
        setIsDialogOpen={setIsEditDialogOpen}
        habitId={habitId}
        initialValues={{
          name: habitName,
          categoryId: categoryId,
          isGood: isGoodHabit,
        }}
      />
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title={t('habits.deleteTitle')}
        description={t('habits.deleteConfirm', { name: habitName })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        isLoading={deleteHabitMutation.isPending}
      />
    </>
  );
}
