"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Button } from "./ui/button";
import GoalMenu from "./GoalOptionsDropdown";
import GoalDialog from "./GoalDialog";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getRecentGoalsForUser } from "@/actions/actions";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { format } from "date-fns";
import { GoalPriority, WeekDays } from "@/db/schema";
import Loader from "./Loader";
import { getPriorityColorClass } from "@/lib/utils";

export default function RecentGoals() {
  const t = useTranslations('dashboard.recentGoals');
  const locale = useLocale();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { userId } = useAuth();
  const { data: goals, isLoading } = useQuery({
    queryKey: ["recent-goals"],
    queryFn: async () => await getRecentGoalsForUser(userId!),
  });

  const getWeekDaysString = (weekDays: WeekDays[]) => {
    const fullDayNames = {
      [WeekDays.MONDAY]: "Monday",
      [WeekDays.TUESDAY]: "Tuesday",
      [WeekDays.WEDNESDAY]: "Wednesday",
      [WeekDays.THURSDAY]: "Thursday",
      [WeekDays.FRIDAY]: "Friday",
      [WeekDays.SATURDAY]: "Saturday",
      [WeekDays.SUNDAY]: "Sunday",
    };
    return weekDays.map(day => fullDayNames[day]).join(", ");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
        <Link
          href="/dashboard/goals"
          locale={locale}
          className="text-sm text-muted-foreground hover:text-primary"
        >
          {t('viewAll')}
        </Link>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {isLoading ? (
            <Loader />
          ) : (
            <div className="flex flex-col h-full justify-between pb-16">
              {goals?.length === 0 ? (
                <div className="text-muted-foreground">{t('noGoals')}</div>
              ) : (
                goals?.map((goal) => (
                  <div 
                    key={goal.id} 
                    className={`flex flex-col py-4 ${
                      goal.isCompleted ? "bg-green-50/50 dark:bg-green-950/20 rounded-lg px-3" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{goal.name}</h3>
                          {goal.isCompleted && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              {t('completed')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{t('habit')}: {goal.habitName}</p>
                      </div>
                      <GoalMenu
                        goalId={goal.id}
                        goalName={goal.name}
                        habitId={goal.habitId!}
                        priority={goal.priority}
                        startDate={goal.startDate}
                        finishDate={goal.finishDate}
                        goalSuccess={goal.goalSuccess}
                        weekDays={goal.weekDays!}
                      />
                    </div>
                    <div className="mt-2 text-sm">
                      <p>{t('priority')}: <span className={`font-semibold ${getPriorityColorClass(goal.priority)}`}>{goal.priority}</span></p>
                      <p>{t('finishDate')}: {format(new Date(goal.finishDate), 'yyyy-MM-dd')}</p>
                      <p>{t('days')}: {getWeekDaysString(goal.weekDays!)}</p>
                      <p>{t('progress')}: {goal.completedAttempts || 0}/{goal.goalSuccess} {t('successes')}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {`${t('dueDate')}: ${format(new Date(goal.finishDate), 'yyyy-MM-dd')}`}
                    </p>
                  </div>
                ))
              )}
              <GoalDialog
                isDialogOpen={isDialogOpen}
                setIsDialogOpen={setIsDialogOpen}
                showAddButton={true}
              />
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
