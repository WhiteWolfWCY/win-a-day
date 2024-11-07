"use server"
//to obsluguje osiagniecia uzytkownika
import { db } from "@/db/drizzle";
import { Achievements, UserAchievements, AchievementCategory, Goals, Habits, GoalsAttempts } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { updateUserStats } from "./stats";
import { sendNotification } from "./notifications/service";

export async function getAchievements() {
  const achievements = await db.select().from(Achievements);
  return achievements;
}

export async function getUserAchievements(userId: string) {
  const achievements = await db
    .select({
      id: Achievements.id,
      name: Achievements.name,
      description: Achievements.description,
      category: Achievements.category,
      requirement: Achievements.requirement,
      icon: Achievements.icon,
      progress: UserAchievements.progress,
      xpReward: Achievements.xpReward,
      unlockedAt: UserAchievements.unlockedAt,
    })
    .from(Achievements)
    .leftJoin(
      UserAchievements,
      and(
        eq(Achievements.id, UserAchievements.achievementId),
        eq(UserAchievements.userId, userId)
      )
    );

  return achievements.map(achievement => ({
    ...achievement,
    progress: achievement.progress ?? 0,
    unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : null,
  }));
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
    await sendNotification({
      userId,
      type: 'achievement',
      title: `🏆 Achievement Unlocked: ${achievement.name}!`,
      message: `Congratulations! You've earned the "${achievement.name}" achievement. ${achievement.description}`,
      link: `/dashboard/settings`
    });
  }
}

export async function getCurrentStreak(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get days with completed goal attempts
  const dailyAttempts = await db
    .select({
      date: GoalsAttempts.date,
    })
    .from(GoalsAttempts)
    .innerJoin(Goals, eq(Goals.id, GoalsAttempts.goalId))
    .where(
      and(
        eq(Goals.userId, userId),
        eq(GoalsAttempts.isCompleted, true),
        sql`${GoalsAttempts.date} >= ${thirtyDaysAgo.toISOString()}`
      )
    )
    .groupBy(GoalsAttempts.date)
    .orderBy(sql`${GoalsAttempts.date} DESC`);

 
  if (dailyAttempts.length === 0) return 0;

  let streak = 1;
  let previousDate = new Date(dailyAttempts[0].date);
  previousDate.setHours(0, 0, 0, 0);

 

  // Loop through dates from most recent to oldest
  for (let i = 1; i < dailyAttempts.length; i++) {
    const currentDate = new Date(dailyAttempts[i].date);
    currentDate.setHours(0, 0, 0, 0);
    
    
    // Calculate days between dates
    const diffInDays = Math.floor(
      (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    

    if (diffInDays === 1) {
      streak++;
      previousDate = currentDate;
    } else {
      break;
    }
  }

  // Check if streak is current
  const mostRecentDate = new Date(dailyAttempts[0].date);
  mostRecentDate.setHours(0, 0, 0, 0);
  const daysSinceLastAttempt = Math.floor(
    (today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSinceLastAttempt <= 1 ? streak : 0;
  return daysSinceLastAttempt <= 1 ? streak : 0;
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