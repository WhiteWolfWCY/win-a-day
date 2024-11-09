"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useState } from "react";
import AddCategoryDialog from "./AddCategoryDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCategory } from "@/actions/actions";
import { toast } from "@/hooks/use-toast";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { useTranslations } from 'next-intl';

interface CategoryMenuProps {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
}

export default function CategoryMenu({ categoryId, categoryName, categoryIcon }: CategoryMenuProps) {
  const t = useTranslations();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-categories"] });
      toast({
        title: t('settings.categories.deleteSuccess'),
        description: t('settings.categories.deleteSuccessDesc'),
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: t('settings.categories.deleteError'),
        variant: "destructive",
      });
      console.error("Failed to delete category:", error);
    },
  });

  const handleDelete = () => {
    deleteCategoryMutation.mutate(categoryId);
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
      <AddCategoryDialog
        isDialogOpen={isEditDialogOpen}
        setIsDialogOpen={setIsEditDialogOpen}
        categoryId={categoryId}
        initialValues={{
          name: categoryName,
          icon: categoryIcon,
        }}
      />
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title={t('settings.categories.deleteTitle')}
        description={t('settings.categories.deleteConfirm', { name: categoryName })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        isLoading={deleteCategoryMutation.isPending}
      />
    </>
  );
}
