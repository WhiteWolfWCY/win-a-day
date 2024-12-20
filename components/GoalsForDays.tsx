"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar } from "./ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { getUserGoalsForDay, updateGoalAttempt } from "@/actions/actions";
import { useAuth } from "@clerk/nextjs";
import { format } from "date-fns";
import Loader from "@/components/Loader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { NotebookIcon, Loader2, StickyNoteIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { isFuture } from 'date-fns';
import { cn } from "@/lib/utils";
import { useTranslations } from 'next-intl';

export default function GoalsForDays() {
  const {userId} = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const queryClient = useQueryClient();

  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState("");
  const [currentGoalAttemptId, setCurrentGoalAttemptId] = useState<string | null>(null);

  const [loadingAttempts, setLoadingAttempts] = useState<Set<string>>(new Set());

  const { data: goalAttempts = [], isLoading } = useQuery({
    queryKey: ['goalAttempts', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: () => getUserGoalsForDay(format(selectedDate, 'yyyy-MM-dd'), userId!),
  });

  const updateGoalAttemptMutation = useMutation({
    mutationFn: ({ goalAttemptId, isCompleted }: { goalAttemptId: string, isCompleted: boolean }) => {
      setLoadingAttempts(prev => new Set(prev).add(goalAttemptId));
      return updateGoalAttempt(goalAttemptId, { isCompleted });
    },
    onMutate: async ({ goalAttemptId, isCompleted }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: ['goalAttempts', format(selectedDate, 'yyyy-MM-dd')] 
      });

      // Snapshot the previous value
      const previousAttempts = queryClient.getQueryData(['goalAttempts', format(selectedDate, 'yyyy-MM-dd')]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        ['goalAttempts', format(selectedDate, 'yyyy-MM-dd')],
        (old: any) => old.map((attempt: any) => 
          attempt.goalAttempt.id === goalAttemptId 
            ? { ...attempt, goalAttempt: { ...attempt.goalAttempt, isCompleted } }
            : attempt
        )
      );

      return { previousAttempts };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousAttempts) {
        queryClient.setQueryData(
          ['goalAttempts', format(selectedDate, 'yyyy-MM-dd')],
          context.previousAttempts
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goalAttempts', format(selectedDate, 'yyyy-MM-dd')] });
      queryClient.invalidateQueries({ queryKey: ['recent-goals'] });
      queryClient.invalidateQueries({ queryKey: ['goal-completion', userId] });
      queryClient.invalidateQueries({ queryKey: ['habit-adherence', userId] });
      queryClient.invalidateQueries({ queryKey: ['goalAttempts'] });
      queryClient.invalidateQueries({ queryKey: ['goal-completion-rate'] });
      queryClient.invalidateQueries({ queryKey: ["user-achievements"] });
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
    },
    onSettled: (_, __, variables) => {
      setLoadingAttempts(prev => {
        const next = new Set(prev);
        next.delete(variables.goalAttemptId);
        return next;
      });
    },
  });

  const updateGoalAttemptNoteMutation = useMutation({
    mutationFn: ({ goalAttemptId, note }: { goalAttemptId: string, note: string }) => 
      updateGoalAttempt(goalAttemptId, { note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goalAttempts', format(selectedDate, 'yyyy-MM-dd')] });
      setNoteDialogOpen(false);
    },
  });

  const toggleGoalCompletion = (goalAttemptId: string, isCompleted: boolean) => {
    updateGoalAttemptMutation.mutate({ goalAttemptId, isCompleted });
  };

  const openNoteDialog = (goalAttemptId: string, currentNote: string) => {
    setCurrentGoalAttemptId(goalAttemptId);
    setCurrentNote(currentNote);
    setNoteDialogOpen(true);
  };

  const saveNote = () => {
    if (currentGoalAttemptId) {
      updateGoalAttemptNoteMutation.mutate({ goalAttemptId: currentGoalAttemptId, note: currentNote });
    }
  };

  const t = useTranslations('dashboard.goalsForDays');

  return (
    <Card className="bg-opacity-80 backdrop-blur-sm col-span-2 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border shadow"
            />
          </div>
          <Separator orientation="vertical" className="hidden md:block" />
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-4 text-center mt-0 md:-mt-16">
              {t('goalsFor')} {format(selectedDate, 'yyyy-MM-dd')}
            </h3>
            {isLoading ? (
              <Loader />
            ) : goalAttempts.length > 0 ? (
              <ScrollArea className="pr-4">
                {goalAttempts.map((attempt) => {
                  const isPastDue = new Date(attempt.goal.finishDate) < new Date(attempt.goalAttempt.date);
                  
                  return (
                    <div 
                      key={attempt.goalAttempt.id} 
                      className={cn(
                        "py-3 flex items-center justify-between border-b last:border-b-0",
                        loadingAttempts.has(attempt.goalAttempt.id) && "opacity-50 pointer-events-none",
                        isPastDue && "opacity-50 bg-red-50/10"
                      )}
                    >
                      <div className={cn(
                        "flex-1",
                        attempt.goalAttempt.isCompleted ? 'line-through text-gray-400' : '',
                      )}>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{attempt.goal.name}</h4>
                          {isPastDue && (
                            <span className="text-xs text-red-500 px-2 py-0.5 rounded-full bg-red-100/50">
                              {t('goals.status.pastDue')}
                            </span>
                          )}
                          {attempt.goalAttempt.note && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <StickyNoteIcon className="h-4 w-4 text-yellow-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="bg-yellow-100 p-2 rounded-md shadow-md max-w-xs">
                                    <p className="text-sm text-gray-700">{attempt.goalAttempt.note}</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{attempt.goal.priority}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openNoteDialog(attempt.goalAttempt.id, attempt.goalAttempt.note || '')}
                          disabled={loadingAttempts.has(attempt.goalAttempt.id) || isPastDue}
                        >
                          <NotebookIcon className="h-4 w-4" />
                        </Button>
                        {!isFuture(new Date(attempt.goalAttempt.date)) && !isPastDue && (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={attempt.goalAttempt.isCompleted || false}
                              onCheckedChange={(checked) => toggleGoalCompletion(attempt.goalAttempt.id, checked as boolean)}
                              disabled={loadingAttempts.has(attempt.goalAttempt.id) || isPastDue}
                            />
                            {loadingAttempts.has(attempt.goalAttempt.id) && (
                              <Loader2 className="h-4 w-4 animate-spin ml-2" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center text-gray-500">
                {t('noGoals')}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('addEditNote')}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={currentNote}
            onChange={(e) => setCurrentNote(e.target.value)}
            placeholder={t('enterNote')}
            className="min-h-[100px]"
          />
          <Button 
            onClick={saveNote} 
            disabled={updateGoalAttemptNoteMutation.isPending}
          >
            {updateGoalAttemptNoteMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('saving')}
              </>
            ) : (
              t('saveNote')
            )}
          </Button>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
