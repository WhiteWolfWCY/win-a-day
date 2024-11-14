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
import { Loader2, Quote, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Quote {
  text: string;
  author: string;
}

interface QuotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuotesDialog({ open, onOpenChange }: QuotesDialogProps) {
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isHabitDialogOpen, setIsHabitDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: quotes, isLoading: isLoadingQuotes } = useQuery({
    queryKey: ["quotes"],
    queryFn: async () => {
      const response = await axios.get("/api/quotes");
      return response.data as Quote[];
    },
  });

  const { data: habits, isLoading: isLoadingHabits } = useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const response = await axios.get("/api/habits");
      return response.data as Habit[];
    },
  });

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-[#FFB800]" />
            Daily Inspiration
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2 -mr-2 mt-4">
          <div className="grid gap-6">
            {quotes?.map((quote, index) => (
              <div
                key={index}
                className={cn(
                  "p-6 rounded-lg border bg-gradient-to-r",
                  "from-[#FFB800]/10 to-[#FFB800]/5",
                  "hover:shadow-lg transition-all duration-300"
                )}
              >
                <div className="flex justify-between items-center gap-4">
                  <div className="flex gap-3 flex-1">
                    <Quote className="h-5 w-5 text-[#FFB800] flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-lg italic mb-2">{quote.text}</p>
                      <p className="text-sm text-muted-foreground font-semibold">
                        - {quote.author}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full hover:bg-[#FFB800]/10 border-[#FFB800] h-8 w-8 flex-shrink-0"
                    onClick={() => {
                      setSelectedQuote(quote);
                      setIsHabitDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 text-[#FFB800]" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>

      <Dialog open={isHabitDialogOpen} onOpenChange={setIsHabitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attach to Habit</DialogTitle>
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
                  className="justify-start hover:bg-[#FFB800]/10 border-[#FFB800]/50"
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
    </Dialog>
  );
} 