"use server"

import { db } from "@/db/drizzle";
import { Achievements, UserAchievements, AchievementCategory, Goals, Habits, GoalsAttempts } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { updateUserStats } from "./stats";

export async function getAchievements() {
  const achievements = await db.select().from(Achievements);
  return achievements;
}

export async function getUserAchievements(userId: string) {
  const userAchievements = await db
    .select({
      achievement: Achievements,
      progress: UserAchievements.progress,
      unlockedAt: UserAchievements.unlockedAt
    })
    .from(Achievements)
    .leftJoin(
      UserAchievements,
      and(
        eq(UserAchievements.achievementId, Achievements.id),
        eq(UserAchievements.userId, userId)
      )
    );

  return userAchievements;
}

export async function updateAchievementProgress(
  userId: string,
  achievementId: string,
  progress: number
) {
  const [achievement] = await db
    .select()
    .from(Achievements)
    .where(eq(Achievements.id, achievementId));

  const [existingProgress] = await db
    .select()
    .from(UserAchievements)
    .where(
      and(
        eq(UserAchievements.userId, userId),
        eq(UserAchievements.achievementId, achievementId)
      )
    );

  const isUnlocked = progress >= achievement.requirement;
  const now = new Date().toISOString();

  if (!existingProgress) {
    await db.insert(UserAchievements).values({
      userId,
      achievementId,
      progress,
      unlockedAt: isUnlocked ? now : null
    });
  } else {
    await db
      .update(UserAchievements)
      .set({ 
        progress,
        unlockedAt: isUnlocked && !existingProgress.unlockedAt ? now : existingProgress.unlockedAt 
      })
      .where(eq(UserAchievements.id, existingProgress.id));
  }

  if (isUnlocked && !existingProgress?.unlockedAt) {
    await updateUserStats(userId);
  }
}

export async function getCurrentStreak(userId: string) {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const attempts = await db
    .select({
      date: UserAchievements.unlockedAt,
    })
    .from(UserAchievements)
    .where(
      and(
        eq(UserAchievements.userId, userId),
        sql`${UserAchievements.unlockedAt} >= ${thirtyDaysAgo.toISOString()}`,
        sql`${UserAchievements.unlockedAt} IS NOT NULL`
      )
    )
    .orderBy(sql`${UserAchievements.unlockedAt} DESC`);

  let currentStreak = 0;
  let lastDate = today;

  for (const attempt of attempts) {
    if (!attempt.date) continue;
    
    const attemptDate = new Date(attempt.date);
    const dayDiff = Math.floor((lastDate.getTime() - attemptDate.getTime()) / (1000 * 3600 * 24));
    
    if (dayDiff <= 1) {
      currentStreak++;
    } else {
      break;
    }
    lastDate = attemptDate;
  }

  return currentStreak;
}

export async function checkAndUpdateAchievements(userId: string) {
  // Check habit-related achievements
  const habitCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(Habits)
    .where(eq(Habits.userId, userId));

  const habitAchievements = await db
    .select()
    .from(Achievements)
    .where(eq(Achievements.category, AchievementCategory.HABITS));

  for (const achievement of habitAchievements) {
    await updateAchievementProgress(userId, achievement.id, Number(habitCount[0].count));
  }

  // Check goal-related achievements
  const completedGoalsCount = await db
    .select({
      count: sql<number>`COUNT(DISTINCT ${Goals.id})`
    })
    .from(Goals)
    .where(and(
      eq(Goals.userId, userId),
      sql`(
        SELECT COUNT(*)
        FROM ${GoalsAttempts}
        WHERE ${GoalsAttempts.goalId} = ${Goals.id}
        AND ${GoalsAttempts.isCompleted} = true
      ) >= ${Goals.goalSuccess}`
    ));

  const goalAchievements = await db
    .select()
    .from(Achievements)
    .where(eq(Achievements.category, AchievementCategory.GOALS));

  for (const achievement of goalAchievements) {
    await updateAchievementProgress(
      userId, 
      achievement.id, 
      Number(completedGoalsCount[0].count)
    );
  }

  // Check streak achievements
  const currentStreak = await getCurrentStreak(userId);
  
  const streakAchievements = await db
    .select()
    .from(Achievements)
    .where(eq(Achievements.category, AchievementCategory.STREAKS));

  for (const achievement of streakAchievements) {
    await updateAchievementProgress(userId, achievement.id, currentStreak);
  }
} 