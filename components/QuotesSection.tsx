"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Habit } from "@/types/habits";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Quote {
  text: string;
  author: string;
}

export default function QuotesSection() {
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isHabitDialogOpen, setIsHabitDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  // Fetch quotes
  const { data: quotes, isLoading: isLoadingQuotes } = useQuery({
    queryKey: ["quotes"],
    queryFn: async () => {
      const response = await axios.get("/api/quotes");
      return response.data as Quote[];
    },
  });

  // Fetch user's habits
  const { data: habits, isLoading: isLoadingHabits } = useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const response = await axios.get("/api/habits");
      return response.data as Habit[];
    },
  });

  // Mutation to attach quote to habit
  const attachQuoteMutation = useMutation({
    mutationFn: async ({ habitId, quote }: { habitId: string; quote: Quote }) => {
      await axios.post("/api/habits/quote", { habitId, quote });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      toast({
        title: "Quote attached successfully",
        description: "The quote has been attached to your habit.",
      });
      setIsHabitDialogOpen(false);
    },
  });

  if (isLoadingQuotes) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Inspirational Quotes</h2>
      <div className="grid gap-6">
        {quotes?.map((quote, index) => (
          <div
            key={index}
            className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm"
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="text-lg italic mb-2">&ldquo;{quote.text}&rdquo;</p>
                <p className="text-sm text-muted-foreground">- {quote.author}</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setSelectedQuote(quote);
                  setIsHabitDialogOpen(true);
                }}
              >
                +
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isHabitDialogOpen} onOpenChange={setIsHabitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a habit</DialogTitle>
          </DialogHeader>
          {isLoadingHabits ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-4">
              {habits?.map((habit) => (
                <Button
                  key={habit.id}
                  variant="outline"
                  className="justify-start"
                  onClick={() => {
                    if (selectedQuote) {
                      attachQuoteMutation.mutate({
                        habitId: habit.id,
                        quote: selectedQuote,
                      });
                    }
                  }}
                >
                  {habit.name}
                </Button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 