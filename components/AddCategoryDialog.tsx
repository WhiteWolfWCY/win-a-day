"use client";

import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createCategory, updateCategory } from "@/actions/actions";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import data, { Emoji } from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or less"),
  icon: z.string().min(1, "Icon is required"),
});

interface AddCategoryDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (isDialogOpen: boolean) => void;
  categoryId?: string;
  initialValues?: {
    name: string;
    icon: string;
  };
}

export default function AddCategoryDialog({
  isDialogOpen,
  setIsDialogOpen,
  categoryId,
  initialValues,
}: AddCategoryDialogProps) {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      icon: "📁",
    },
  });

  useEffect(() => {
    if (initialValues) {
      form.reset(initialValues);
    }
  }, [initialValues, form]);

  const createCategoryMutation = useMutation({
    mutationFn: (categoryData: { name: string; userId: string; icon: string }) => createCategory(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-categories"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Category created",
        description: "Your new category has been successfully added.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to create category:", error);
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: (categoryData: { id: string; name: string; icon: string }) => updateCategory(categoryData.id, { name: categoryData.name, icon: categoryData.icon }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-categories"] });
      setIsDialogOpen(false);
      toast({
        title: "Category updated",
        description: "Your category has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to update category:", error);
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userId) return;
    if (categoryId) {
      updateCategoryMutation.mutate({
        id: categoryId,
        name: values.name,
        icon: values.icon,
      });
    } else {
      createCategoryMutation.mutate({
        name: values.name,
        userId: userId,
        icon: values.icon,
      });
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{categoryId ? "Edit Category" : "Add New Category"}</DialogTitle>
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
                    <Input placeholder="Enter category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline">{field.value} Select Icon</Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Picker
                          data={data}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          onEmojiSelect={(emoji: any) => field.onChange(emoji.native)}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
              disabled={
                createCategoryMutation.isPending || updateCategoryMutation.isPending
              }
            >
              {createCategoryMutation.isPending || updateCategoryMutation.isPending
                ? <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
                : categoryId
                ? "Update Category"
                : "Add Category"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}