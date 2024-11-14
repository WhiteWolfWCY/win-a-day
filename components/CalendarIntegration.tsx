"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Calendar, Check, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useTranslations } from 'next-intl';
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { getAllUserGoals, checkGoogleCalendarConnection, getSyncedGoals } from '@/actions/actions';
import { updateGoalCalendarSync } from '@/actions/calendar';

export default function CalendarIntegration() {
  const { userId } = useAuth();
  const t = useTranslations('settings.calendar');
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncingGoals, setSyncingGoals] = useState<{ [key: string]: boolean }>({});
  const queryClient = useQueryClient();

  const { data: isConnected, isLoading: isCheckingConnection } = useQuery({
    queryKey: ["google-calendar-connection", userId],
    queryFn: async () => await checkGoogleCalendarConnection(userId!),
    enabled: !!userId,
  });

  const { data: goals, isLoading: isLoadingGoals } = useQuery({
    queryKey: ["user-goals", userId],
    queryFn: async () => await getAllUserGoals(userId!),
    enabled: !!userId,
  });

  const { data: syncedGoals } = useQuery({
    queryKey: ["synced-goals", userId],
    queryFn: async () => await getSyncedGoals(userId!),
    enabled: !!userId,
  });

  const [selectedGoals, setSelectedGoals] = useState<{[key: string]: {
    enabled: boolean;
  }}>({});

  useEffect(() => {
    if (syncedGoals) {
      const syncedGoalsMap = syncedGoals.reduce((acc, goal) => ({
        ...acc,
        [goal.goalId!]: {
          enabled: goal.isEnabled,
        },
      }), {});
      
      setSelectedGoals(syncedGoalsMap);
    }
  }, [syncedGoals]);

  const connectToGoogleCalendar = async () => {
    setIsConnecting(true);
    try {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      const redirectUri = `${window.location.origin}/api/auth/google/callback`;
      
      const scope = 'https://www.googleapis.com/auth/calendar';
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent`;

      window.location.href = authUrl;
    } catch (error) {
      console.error('Calendar connection error:', error);
      toast({
        title: t('error'),
        description: t('connectionError'),
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const syncGoalMutation = useMutation({
    mutationFn: async ({ goalId, goalName, enabled }: { 
      goalId: string;
      goalName: string;
      enabled: boolean;
    }) => {
      setSyncingGoals(prev => ({ ...prev, [goalId]: true }));
      return await updateGoalCalendarSync(userId!, goalId, goalName, enabled);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["synced-goals"] });
      setSyncingGoals(prev => ({ ...prev, [variables.goalId]: false }));
      toast({
        title: t('success'),
        description: t('syncSuccess'),
      });
    },
    onError: (_, variables) => {
      setSyncingGoals(prev => ({ ...prev, [variables.goalId]: false }));
      toast({
        title: t('error'),
        description: t('syncError'),
        variant: "destructive",
      });
    }
  });

  const handleGoalToggle = (goalId: string, checked: boolean) => {
    const goal = goals?.find(g => g.id === goalId);
    if (!goal) return;

    setSelectedGoals(prev => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        enabled: checked,
      }
    }));

    syncGoalMutation.mutate({
      goalId,
      goalName: goal.name,
      enabled: checked,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
        {isCheckingConnection ? (
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('checking')}
          </Button>
        ) : isConnected ? (
          <div className="flex items-center space-x-2">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">{t('connected')}</span>
          </div>
        ) : (
          <Button
            onClick={connectToGoogleCalendar}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Calendar className="mr-2 h-4 w-4" />
            )}
            {t('connect')}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {isLoadingGoals ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : goals?.map((goal) => (
            <div key={goal.id} className="flex items-center justify-between py-4">
              <div className="flex-1">
                <Label className="text-sm font-medium">{goal.name}</Label>
              </div>
              <div className="flex items-center space-x-4">
                {syncingGoals[goal.id] && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                <Switch
                  checked={selectedGoals[goal.id]?.enabled || false}
                  onCheckedChange={(checked) => handleGoalToggle(goal.id, checked)}
                  disabled={!isConnected || syncingGoals[goal.id]}
                />
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}