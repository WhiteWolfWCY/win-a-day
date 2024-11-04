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

  // Medal emojis for top 3
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
              className={`flex items-center justify-between p-4 rounded-lg bg-background/50 ${
                index < 3 ? "border border-yellow-500/20" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-xl font-bold min-w-[2rem]">
                  {index < 3 ? medals[index] : index + 1}
                </span>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.imageUrl ?? ''} />
                  <AvatarFallback>
                    {user.name?.charAt(0) ?? '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold flex items-center gap-2">
                    {user.name ?? 'Anonymous'}
                    {index === 0 && <Star className="h-4 w-4 text-yellow-500" />}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Target className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-foreground">{user.totalHabits ?? 0}</span>
                      habits
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Medal className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-foreground">{user.completedGoals ?? 0}</span>
                      goals
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Award className="h-4 w-4 text-purple-500" />
                      <span className="font-medium text-foreground">{user.achievementsUnlocked ?? 0}</span>
                      achievements
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold flex items-center justify-end gap-2">
                  {user.totalScore ?? 0}
                  <Flame className="h-5 w-5 text-orange-500" />
                </p>
                <p className="text-sm text-muted-foreground">points</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 