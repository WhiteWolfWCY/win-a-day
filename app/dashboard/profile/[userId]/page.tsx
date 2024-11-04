"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getHabitBalance,
  getCategoryDistribution,
  getGoalCompletionRateOverTime,
} from "@/actions/actions";
import { getUserProfile } from "@/actions/stats";
import { 
  ArrowLeft, 
  Target, 
  Trophy, 
  Zap, 
  Flame,
  BarChart3,
  PieChart,
  LineChart,
  Award,
} from "lucide-react";
import Loader from "@/components/Loader";
import { HabitCategoryChart, GoalCompletionChart, HabitBalanceChart } from "@/components/charts";
import { subDays } from "date-fns";
import { Achievement } from "@/components/Achievement";
import { getUserAchievements } from "@/actions/achievements";

export default function UserProfilePage() {
  const { userId } = useParams();
  const router = useRouter();
  const dateRange = {
    from: subDays(new Date(), 30),
    to: new Date(),
  };

  // Fetch profile data
  const { data: profile, isLoading: isLoadingProfile, error: profileError } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => getUserProfile(userId as string),
    enabled: Boolean(userId),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity // Prevent automatic refetching
  });

  // Only fetch additional data if profile exists
  const { data: habitBalance, isLoading: isLoadingHabitBalance } = useQuery({
    queryKey: ["habit-balance", userId],
    queryFn: () => getHabitBalance(userId as string, dateRange.from, dateRange.to),
    enabled: Boolean(profile),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity
  });

  const { data: categoryDistribution, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["category-distribution", userId],
    queryFn: () => getCategoryDistribution(userId as string),
    enabled: Boolean(profile),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity
  });

  const { data: goalCompletionRate, isLoading: isLoadingGoalCompletion } = useQuery({
    queryKey: ["goal-completion-rate", userId],
    queryFn: () => getGoalCompletionRateOverTime(userId as string, dateRange.from, dateRange.to),
    enabled: Boolean(profile),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity
  });

  // Add achievement query
  const { data: achievements, isLoading: isLoadingAchievements } = useQuery({
    queryKey: ["user-achievements", userId],
    queryFn: () => getUserAchievements(userId as string),
    enabled: Boolean(profile),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity
  });

  // Show loading state only for initial profile load
  if (isLoadingProfile) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Loader />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center mt-8">
          <p className="text-red-500">
            {profileError ? "Error loading profile. Please try again later." : "User not found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="hover:bg-background/80"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Leaderboard
        </Button>
      </div>

      {/* Profile Header */}
      <div className="flex items-center gap-6 p-6 bg-background rounded-lg backdrop-blur-sm">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profile.imageUrl ?? ''} />
          <AvatarFallback className="text-2xl">
            {profile.name?.charAt(0) ?? '?'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold mb-2">{profile.name}&apos;s Profile</h1>
          <p className="text-muted-foreground">
            Member since {new Date(profile.createdAt ?? Date.now()).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Habits"
          value={profile.totalHabits}
          description="Created habits"
          icon={<Target className="h-4 w-4 text-blue-500" />}
        />
        <StatCard
          title="Completed Goals"
          value={profile.completedGoals}
          description="Total completed"
          icon={<Trophy className="h-4 w-4 text-green-500" />}
        />
        <StatCard
          title="Current Streak"
          value={profile.goodHabitStreak}
          description="Days"
          icon={<Zap className="h-4 w-4 text-yellow-500" />}
        />
        <StatCard
          title="Total Score"
          value={profile.totalScore}
          description="Points"
          icon={<Flame className="h-4 w-4 text-orange-500" />}
        />
      </div>

      {/* Achievements Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mt-8 flex items-center gap-2">
          <Award className="h-6 w-6 text-purple-500" />
          Achievements
          <span className="text-base font-normal text-muted-foreground">
            ({achievements?.filter(a => a.unlockedAt !== null).length ?? 0}/{achievements?.length ?? 0})
          </span>
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievements?.map((achievement) => (
            <Achievement
              key={achievement.id}
              name={achievement.name}
              description={achievement.description}
              progress={achievement.progress}
              requirement={achievement.requirement}
              category={achievement.category}
              icon={achievement.icon}
              xpReward={achievement.xpReward}
              isUnlocked={achievement.unlockedAt !== null}
              unlockedAt={achievement.unlockedAt ?? undefined}
            />
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="space-y-6">
        {/* Charts Header */}
        <h2 className="text-2xl font-semibold mt-8 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Statistics
        </h2>

        {/* Charts Grid */}
        {!isLoadingHabitBalance && habitBalance && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-2">
                <PieChart className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Habit Distribution</h3>
              </div>
              <HabitBalanceChart data={habitBalance} />
            </div>
            {!isLoadingCategories && categoryDistribution && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-2">
                  <PieChart className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Category Distribution</h3>
                </div>
                <HabitCategoryChart data={categoryDistribution} />
              </div>
            )}
          </div>
        )}

        {!isLoadingGoalCompletion && goalCompletionRate && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2">
              <LineChart className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Goal Completion Trend</h3>
            </div>
            <GoalCompletionChart data={goalCompletionRate} />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  description, 
  icon 
}: { 
  title: string; 
  value: number; 
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="hover:bg-background/60 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
} 