"use client";

import { Loader2, Plus } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createHabit, updateHabit, getUserCategories } from "@/actions/actions";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or less"),
  categoryId: z.string().min(1, "Category is required"),
  isGood: z.boolean().default(true),
});

interface AddHabitDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (isDialogOpen: boolean) => void;
  habitId?: string;
  initialValues?: {
    name: string;
    categoryId: string;
    isGood: boolean;
  };
}

export default function AddHabitDialog({
  isDialogOpen,
  setIsDialogOpen,
  habitId,
  initialValues,
}: AddHabitDialogProps) {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["user-categories", userId],
    queryFn: async () => await getUserCategories(userId!),
    enabled: !!userId,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      isGood: true,
    },
  });

  useEffect(() => {
    if (initialValues && categories) {
      const category = categories.find(
        (c) => c.id === initialValues.categoryId
      );
      console.log("Category:", initialValues.categoryId);
      if (category) {
        form.reset({
          name: initialValues.name,
          categoryId: category.id,
          isGood: initialValues.isGood,
        });
        setSelectedCategory(category.id);
      } else {
        form.reset(initialValues);
        setSelectedCategory(initialValues.categoryId);
      }
    }
  }, [initialValues, categories, form]);

  const createHabitMutation = useMutation({
    mutationFn: createHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newest-habits"] });
      queryClient.invalidateQueries({ queryKey: ["user-habits"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Habit created",
        description: "Your new habit has been successfully added.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create habit. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to create habit:", error);
    },
  });

  const updateHabitMutation = useMutation({
    mutationFn: (habitData: {
      id: string;
      name: string;
      categoryId: string;
      isGood: boolean;
    }) => updateHabit(habitData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newest-habits"] });
      queryClient.invalidateQueries({ queryKey: ["user-habits"] });
      setIsDialogOpen(false);
      toast({
        title: "Habit updated",
        description: "Your habit has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update habit. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to update habit:", error);
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userId) return;
    if (habitId) {
      updateHabitMutation.mutate({
        id: habitId,
        name: values.name,
        categoryId: values.categoryId,
        isGood: values.isGood,
      });
    } else {
      createHabitMutation.mutate({
        name: values.name,
        categoryId: values.categoryId,
        userId: userId,
        isGoodHabit: values.isGood,
      });
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      {!habitId && (
        <DialogTrigger asChild>
          <Button className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-white">
            <Plus className="mr-2 h-4 w-4" /> Add Habit
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{habitId ? "Edit Habit" : "Add New Habit"}</DialogTitle>
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
                    <Input placeholder="Enter habit name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isCategoriesLoading ? (
                        <SelectItem value="">Loading categories...</SelectItem>
                      ) : categories && categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.icon} {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="">No categories found</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isGood"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Good Habit</FormLabel>
                    <FormDescription>
                      Is this a good habit you want to build?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
              disabled={
                createHabitMutation.isPending || updateHabitMutation.isPending
              }
            >
              {createHabitMutation.isPending || updateHabitMutation.isPending
                ? <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
                : habitId
                ? "Update Habit"
                : "Add Habit"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
