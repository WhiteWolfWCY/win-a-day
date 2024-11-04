'use client';

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { getUserAchievements } from "@/actions/achievements";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Card } from "./ui/card";
import Loader from "./Loader";

export default function AchievementBadges() {
  const { userId } = useAuth();
  const { data: achievements, isLoading } = useQuery({
    queryKey: ["achievements", userId],
    queryFn: () => getUserAchievements(userId!),
    enabled: !!userId,
  });

  if (isLoading) return <Loader />;

  const unlockedAchievements = achievements?.filter(achievement => achievement.unlockedAt);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your Achievements</h3>
      <div className="flex flex-wrap gap-2">
        {unlockedAchievements?.length === 0 ? (
          <p className="text-sm text-muted-foreground">No achievements unlocked yet</p>
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
                      Unlocked on {achievement.unlockedAt?.toLocaleDateString()}
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