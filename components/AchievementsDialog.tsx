'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Trophy } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { getUserAchievements } from "@/actions/achievements";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AchievementCategory } from "@/db/schema";
import { Progress } from "./ui/progress";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "./ui/card";
import Loader from "./Loader";

export default function AchievementsDialog() {
  const { userId } = useAuth();
  const { data: achievements, isLoading } = useQuery({
    queryKey: ["achievements", userId],
    queryFn: () => getUserAchievements(userId!),
    enabled: !!userId,
  });

  const achievementsByCategory = achievements?.reduce((acc, { achievement, progress, unlockedAt }) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push({ achievement, progress, unlockedAt });
    return acc;
  }, {} as Record<AchievementCategory, any[]>);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Trophy className="h-4 w-4" />
          Achievements
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Achievements</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader />
          </div>
        ) : (
          <Tabs defaultValue={AchievementCategory.HABITS} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {Object.values(AchievementCategory).map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            {Object.values(AchievementCategory).map((category) => (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievementsByCategory?.[category]?.map(({ achievement, progress = 0, unlockedAt }) => (
                    <Card
                      key={achievement.id}
                      className={cn(
                        "transition-colors",
                        unlockedAt 
                          ? "bg-primary/5 dark:bg-primary/10" 
                          : "bg-muted/50 dark:bg-muted/20"
                      )}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">{achievement.icon}</div>
                          <div className="space-y-1">
                            <h3 className="font-semibold tracking-tight">
                              {achievement.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <Progress
                            value={(progress / achievement.requirement) * 100}
                            className="h-2"
                          />
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Progress: {progress}/{achievement.requirement}</span>
                            {unlockedAt && (
                              <span className="text-primary">
                                Unlocked {new Date(unlockedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
} 