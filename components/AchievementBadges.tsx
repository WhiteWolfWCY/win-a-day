'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { getUserAchievements } from "@/actions/achievements";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Card } from "./ui/card";
import Loader from "./Loader";

export default function AchievementBadges() {
  const t = useTranslations('achievements');
  const { userId } = useAuth();
  const { data: achievements, isLoading } = useQuery({
    queryKey: ["user-achievements", userId],
    queryFn: () => getUserAchievements(userId!),
    enabled: !!userId,
  });

  if (isLoading) return <Loader />;

  const unlockedAchievements = achievements?.filter(achievement => achievement.unlockedAt);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t('yourAchievements')}</h3>
      <div className="flex flex-wrap gap-2">
        {unlockedAchievements?.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('noAchievements')}</p>
        ) : (
          <TooltipProvider>
            {unlockedAchievements?.map((achievement) => (
              <Tooltip key={achievement.id}>
                <TooltipTrigger asChild>
                  <Card className="w-12 h-12 flex items-center justify-center text-2xl cursor-help transition-transform hover:scale-110">
                    {achievement.icon}
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-semibold">{achievement.name}</p>
                    <p className="text-sm">{achievement.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('unlockedOn', { 
                        date: achievement.unlockedAt?.toLocaleDateString(undefined, { 
                          dateStyle: 'medium' 
                        })
                      })}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        )}
      </div>
    </div>
  );
} 