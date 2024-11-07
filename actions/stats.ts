"use server"

import { db } from "@/db/drizzle";
import { UserStats, Users, Habits, Goals, UserAchievements } from "@/db/schema";
import { clerkClient } from "@clerk/nextjs/server";
import { eq, desc, sql, and } from "drizzle-orm";
import type { User } from "@clerk/nextjs/server";
import { getCurrentStreak } from "./achievements";

export async function updateUserStats(userId: string) {
  // Calculate stats
  const [habitStats] = await db
    .select({
      totalHabits: sql<number>`COUNT(*)`,
      goodHabits: sql<number>`SUM(CASE WHEN ${Habits.isGoodHabit} = true THEN 1 ELSE 0 END)`
    })
    .from(Habits)
    .where(eq(Habits.userId, userId));

  const [completedGoals] = await db
    .select({
      count: sql<number>`COUNT(*)`
    })
    .from(Goals)
    .where(and(
      eq(Goals.userId, userId),
      eq(Goals.isCompleted, true)
    ));

  const [achievements] = await db
    .select({
      count: sql<number>`COUNT(*)`
    })
    .from(UserAchievements)
    .where(and(
      eq(UserAchievements.userId, userId),
      sql`${UserAchievements.unlockedAt} IS NOT NULL`
    ));

  // Calculate total score
  const totalScore = (Number(habitStats.totalHabits) * 10) +
                    (Number(completedGoals.count) * 50) +
                    (Number(achievements.count) * 100);

  // Get current streak
  const currentStreak = await getCurrentStreak(userId);

  // Update or create user stats
  const [existingStats] = await db
    .select()
    .from(UserStats)
    .where(eq(UserStats.userId, userId));

  if (existingStats) {
    await db
      .update(UserStats)
      .set({
        totalHabits: Number(habitStats.totalHabits),
        completedGoals: Number(completedGoals.count),
        achievementsUnlocked: Number(achievements.count),
        goodHabitStreak: currentStreak,
        totalScore: totalScore + (currentStreak * 5),
        lastUpdated: new Date()
      })
      .where(eq(UserStats.userId, userId));
  } else {
    await db.insert(UserStats).values({
      userId,
      totalHabits: Number(habitStats.totalHabits),
      completedGoals: Number(completedGoals.count),
      achievementsUnlocked: Number(achievements.count),
      goodHabitStreak: currentStreak,
      totalScore: totalScore + (currentStreak * 5),
    });
  }
}

export async function getLeaderboard() {

  const leaderboard = await db
    .select({
      userId: Users.id,
      name: Users.name,
      imageUrl: Users.imgUrl,
      totalHabits: UserStats.totalHabits,
      completedGoals: UserStats.completedGoals,
      achievementsUnlocked: UserStats.achievementsUnlocked,
      totalScore: UserStats.totalScore,
      goodHabitStreak: UserStats.goodHabitStreak,
    })
    .from(Users)
    .leftJoin(UserStats, eq(Users.id, UserStats.userId))
    .orderBy(desc(sql`COALESCE(${UserStats.totalScore}, 0)`))
    .limit(10);

  // Initialize stats for users who don't have them yet
  for (const user of leaderboard) {
    if (user.totalScore === null) {
      await updateUserStats(user.userId);
    }
  }

  // Fetch the updated data
  const updatedLeaderboard = await db
    .select({
      userId: Users.id,
      name: Users.name,
      imageUrl: Users.imgUrl,
      totalHabits: UserStats.totalHabits,
      completedGoals: UserStats.completedGoals,
      achievementsUnlocked: UserStats.achievementsUnlocked,
      totalScore: UserStats.totalScore,
      goodHabitStreak: UserStats.goodHabitStreak,
    })
    .from(Users)
    .leftJoin(UserStats, eq(Users.id, UserStats.userId))
    .orderBy(desc(sql`COALESCE(${UserStats.totalScore}, 0)`))
    .limit(10);

  return updatedLeaderboard;
}

export async function getUserProfile(userId: string, initializeIfMissing = true) {
  try {
    const [user] = await db
      .select({
        id: Users.id,
        name: Users.name,
        imageUrl: Users.imgUrl,
        createdAt: Users.joinDate,
        totalHabits: UserStats.totalHabits,
        completedGoals: UserStats.completedGoals,
        achievementsUnlocked: UserStats.achievementsUnlocked,
        totalScore: UserStats.totalScore,
        goodHabitStreak: UserStats.goodHabitStreak,
      })
      .from(Users)
      .leftJoin(UserStats, eq(Users.id, UserStats.userId))
      .where(eq(Users.id, userId));

    if (!user) {
      throw new Error("User not found");
    }

    // Return the user data even if stats are missing
    return {
      ...user,
      totalHabits: user.totalHabits ?? 0,
      completedGoals: user.completedGoals ?? 0,
      achievementsUnlocked: user.achievementsUnlocked ?? 0,
      totalScore: user.totalScore ?? 0,
      goodHabitStreak: user.goodHabitStreak ?? 0,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
} 