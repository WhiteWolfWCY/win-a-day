"use client";

import { useQuery } from "@tanstack/react-query";
import { getLeaderboard } from "@/actions/stats";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Trophy, Target, Award, Medal, Star, Flame } from "lucide-react";
import Loader from "./Loader";

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => getLeaderboard(),
  });

  if (isLoading) return <Loader />;

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaderboard?.map((user, index) => (
            <div
              key={user.userId}
              className={`flex items-center justify-between p-3 sm:p-4 rounded-lg bg-background/50 ${
                index < 3 ? "border border-yellow-500/20" : ""
              }`}
            >
              {/* Left side with rank, avatar, and name */}
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
                    {user.name ?? 'Anonymous'}
                    {index === 0 && <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />}
                  </p>
                  {/* Stats for mobile */}
                  <div className="flex gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                      {user.totalHabits ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Medal className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                      {user.completedGoals ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                      {user.achievementsUnlocked ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right side with score */}
              <div className="text-right ml-2">
                <p className="text-base sm:text-lg font-bold flex items-center justify-end gap-1 sm:gap-2">
                  {user.totalScore ?? 0}
                  <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">points</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 