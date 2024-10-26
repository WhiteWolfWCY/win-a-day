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

interface CategoryMenuProps {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
}

export default function CategoryMenu({ categoryId, categoryName, categoryIcon }: CategoryMenuProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-categories"] });
      toast({
        title: "Category deleted",
        description: "The category has been successfully deleted.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
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
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
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
        title="Delete Category"
        description={`Are you sure you want to delete the category "${categoryName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteCategoryMutation.isPending}
      />
    </>
  );
}
