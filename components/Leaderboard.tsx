"use client";

import { useQuery } from "@tanstack/react-query";
import { getLeaderboard } from "@/actions/stats";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Trophy, Target, Award, Medal, Star, Flame, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import Loader from "./Loader";
import Link from "next/link";
import { useTranslations } from 'next-intl';

export default function Leaderboard() {
  const t = useTranslations();
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => getLeaderboard(),
  });

  if (isLoading) return <Loader />;

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <TooltipProvider>
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            {t('leaderboard.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboard?.map((user, index) => (
              <Link href={`/dashboard/profile/${user.userId}`} key={user.userId} className="block">
                <div className={`flex items-center justify-between p-3 sm:p-4 rounded-lg bg-background/50 ${
                  index < 3 ? "border border-yellow-500/20" : ""
                } hover:bg-background/70 transition-colors mb-2`}>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <span className="text-lg sm:text-xl font-bold min-w-[1.5rem] sm:min-w-[2rem]">
                      {index < 3 ? medals[index] : index + 1}
                    </span>
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                      <AvatarImage src={user.imageUrl ?? ''} />
                      <AvatarFallback>
                        {user.name?.charAt(0) ?? '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold flex items-center gap-1 text-sm sm:text-base">
                        {user.name ?? t('common.anonymous')}
                        {index === 0 && <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />}
                      </p>
                      <div className="flex gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                              {user.totalHabits ?? 0}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('leaderboard.totalHabits')}</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger>
                            <span className="flex items-center gap-1">
                              <Medal className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                              {user.completedGoals ?? 0}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('leaderboard.goalsCompleted')}</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger>
                            <span className="flex items-center gap-1">
                              <Award className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                              {user.achievementsUnlocked ?? 0}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('leaderboard.achievementsUnlocked')}</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger>
                            <span className="flex items-center gap-1">
                              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                              {user.goodHabitStreak ?? 0}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('leaderboard.currentStreak')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>

                  <div className="text-right ml-2">
                    <Tooltip>
                      <TooltipTrigger>
                        <p className="text-base sm:text-lg font-bold flex items-center justify-end gap-1 sm:gap-2">
                          {user.totalScore ?? 0}
                          <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('leaderboard.totalScoreDesc')}</p>
                      </TooltipContent>
                    </Tooltip>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('leaderboard.points')}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
} 