"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Button } from "./ui/button";
import HabitMenu from "./HabitOptionsDropdown";
import AddHabitDialog from "./AddHabitDialog";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getRecentHabitsForUser } from "@/actions/actions";
import { useQuery } from "@tanstack/react-query";
import Loader from "./Loader";
import { CheckCircle2, XCircle } from "lucide-react";

export default function NewestHabits() {
  const t = useTranslations("dashboard.newestHabits");
  const locale = useLocale();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { userId } = useAuth();
  const { data: habits, isLoading } = useQuery({
    queryKey: ["newest-habits"],
    queryFn: async () => await getRecentHabitsForUser(userId!),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">{t("title")}</CardTitle>
        <Link
          href="/dashboard/habits"
          locale={locale}
          className="text-sm text-muted-foreground hover:text-primary"
        >
          {t("viewAll")}
        </Link>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {isLoading ? (
            <Loader />
          ) : habits && habits.length > 0 ? (
            <div className="flex flex-col h-full justify-between pb-16">
              {habits?.map((habit, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <h3 className="font-semibold">{habit.habitName}</h3>
                    <p className="text-sm text-gray-500">
                      {`${t('category')}: ${habit.habitCategoryIcon} ${habit.habitCategory}`}
                    </p>
                    <div className="text-sm text-gray-500 flex items-center">
                      {`${t('habitType')}: `}
                      {habit.habitType ? (
                        <>
                          <p>{t('goodHabit')}</p>
                          <CheckCircle2 className="h-4 w-4 text-green-500 ml-1" />
                        </>
                      ) : (
                        <>
                          <p>{t('badHabit')}</p>
                          <XCircle className="h-4 w-4 text-red-500 ml-1" />
                        </>
                      )}
                    </div>
                  </div>
                  <HabitMenu
                    habitId={habit.habitId}
                    habitName={habit.habitName}
                    categoryId={habit.habitCategoryId}
                    isGoodHabit={habit.habitType || false}
                  />
                </div>
              ))}
              <AddHabitDialog
                isDialogOpen={isDialogOpen}
                setIsDialogOpen={setIsDialogOpen}
                showAddButton={true}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col justify-between pb-16">
              <p className="text-sm text-gray-500">{t("noHabits")}</p>
              <AddHabitDialog
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
