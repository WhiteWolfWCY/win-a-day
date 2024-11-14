"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserNotificationSettings, updateUserNotificationSettings } from "@/actions/notifications";
import { useAuth } from "@clerk/nextjs";
import { NotificationFrequency } from "@/db/schema";
import { TimePickerInput } from "./ui/time-picker";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useTranslations } from 'next-intl';

type NotificationSettings = {
  id: string;
  userId: string;
  notificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  achievementNotifications: boolean;
  goalCompletionNotifications: boolean;
  goalUpdatesNotifications: boolean;
  habitUpdatesNotifications: boolean;
  reminderFrequency: NotificationFrequency;
  reminderTime: Date;
  updatedAt: Date;
  createdAt: Date;
};

export default function NotificationSettings() {
  const t = useTranslations();
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const [reminderTime, setReminderTime] = useState<Date | undefined>(undefined);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["notification-settings", userId],
    queryFn: () => getUserNotificationSettings(userId!),
    enabled: !!userId,
  });

  const mutation = useMutation({
    mutationFn: (newSettings: Partial<NotificationSettings>) =>
      updateUserNotificationSettings(userId!, newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-settings"] });
      toast({
        title: t('settings.notifications.updateSuccess'),
        description: t('settings.notifications.updateSuccessDesc'),
      });
    },
  });

  const handleToggle = (field: keyof NotificationSettings) => (checked: boolean) => {
    mutation.mutate({ [field]: checked });
  };

  const handleFrequencyChange = (value: NotificationFrequency) => {
    mutation.mutate({ reminderFrequency: value });
  };

  const handleTimeChange = (time: Date | undefined) => {
    setReminderTime(time);
    if (time) {
      mutation.mutate({ reminderTime: time });
    }
  };

  if (isLoading) return null;

  return (
    <Card className="bg-card backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">{t('settings.notifications.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('settings.notifications.enable')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.notifications.enableDesc')}
              </p>
            </div>
            <Switch
              checked={settings?.notificationsEnabled || false}
              onCheckedChange={handleToggle("notificationsEnabled")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('settings.notifications.email')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.notifications.emailDesc')}
              </p>
            </div>
            <Switch
              checked={settings?.emailNotificationsEnabled || false}
              onCheckedChange={handleToggle("emailNotificationsEnabled")}
              disabled={!settings?.notificationsEnabled}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">{t('settings.notifications.types')}</h3>
          
          <div className="flex items-center justify-between">
            <Label>{t('settings.notifications.achievements')}</Label>
            <Switch
              checked={settings?.achievementNotifications || false}
              onCheckedChange={handleToggle("achievementNotifications")}
              disabled={!settings?.notificationsEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>{t('settings.notifications.goalCompletions')}</Label>
            <Switch
              checked={settings?.goalCompletionNotifications || false}
              onCheckedChange={handleToggle("goalCompletionNotifications")}
              disabled={!settings?.notificationsEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>{t('settings.notifications.goalUpdates')}</Label>
            <Switch
              checked={settings?.goalUpdatesNotifications || false}
              onCheckedChange={handleToggle("goalUpdatesNotifications")}
              disabled={!settings?.notificationsEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>{t('settings.notifications.habitUpdates')}</Label>
            <Switch
              checked={settings?.habitUpdatesNotifications || false}
              onCheckedChange={handleToggle("habitUpdatesNotifications")}
              disabled={!settings?.notificationsEnabled}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">{t('settings.notifications.reminderSettings')}</h3>
          
          <div className="space-y-2">
            <Label>{t('settings.notifications.frequency')}</Label>
            <Select
              value={settings?.reminderFrequency || NotificationFrequency.DAILY}
              onValueChange={handleFrequencyChange}
              disabled={!settings?.notificationsEnabled}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('settings.notifications.selectFrequency')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(NotificationFrequency).map((frequency) => (
                  <SelectItem key={frequency} value={frequency}>
                    {t(`settings.notifications.frequencies.${frequency.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 