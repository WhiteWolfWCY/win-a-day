"use server"

import { db } from "@/db/drizzle";
import { UserStats, Users, Habits, Goals, UserAchievements } from "@/db/schema";
import { clerkClient } from "@clerk/nextjs/server";
import { eq, desc, sql, and } from "drizzle-orm";
import type { User } from "@clerk/nextjs/server";

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
        totalScore,
        lastUpdated: new Date()
      })
      .where(eq(UserStats.userId, userId));
  } else {
    await db.insert(UserStats).values({
      userId,
      totalHabits: Number(habitStats.totalHabits),
      completedGoals: Number(completedGoals.count),
      achievementsUnlocked: Number(achievements.count),
      totalScore,
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
    })
    .from(Users)
    .leftJoin(UserStats, eq(Users.id, UserStats.userId))
    .orderBy(desc(sql`COALESCE(${UserStats.totalScore}, 0)`))
    .limit(10);

  return updatedLeaderboard;
} 