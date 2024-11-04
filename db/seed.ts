import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";
import { Achievements, AchievementCategory } from "./schema";

config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

const achievements = [
  // Habit Achievements
  {
    name: "Habit Beginner",
    description: "Create your first habit",
    category: AchievementCategory.HABITS,
    icon: "🌱",
    requirement: 1,
    xpReward: 50
  },
  {
    name: "Habit Enthusiast",
    description: "Create 5 habits",
    category: AchievementCategory.HABITS,
    icon: "🌿",
    requirement: 5,
    xpReward: 100
  },
  {
    name: "Habit Master",
    description: "Create 10 habits",
    category: AchievementCategory.HABITS,
    icon: "🌳",
    requirement: 10,
    xpReward: 200
  },
  // Goal Achievements
  {
    name: "Goal Starter",
    description: "Complete your first goal",
    category: AchievementCategory.GOALS,
    icon: "🎯",
    requirement: 1,
    xpReward: 50
  },
  {
    name: "Goal Achiever",
    description: "Complete 10 goals",
    category: AchievementCategory.GOALS,
    icon: "🏆",
    requirement: 10,
    xpReward: 150
  },
  {
    name: "Goal Master",
    description: "Complete 25 goals",
    category: AchievementCategory.GOALS,
    icon: "👑",
    requirement: 25,
    xpReward: 300
  },
  // Streak Achievements
  {
    name: "Streak Starter",
    description: "Maintain a 3-day streak",
    category: AchievementCategory.STREAKS,
    icon: "⭐",
    requirement: 3,
    xpReward: 50
  },
  {
    name: "Streak Runner",
    description: "Maintain a 7-day streak",
    category: AchievementCategory.STREAKS,
    icon: "🔥",
    requirement: 7,
    xpReward: 100
  },
  {
    name: "Streak Champion",
    description: "Maintain a 30-day streak",
    category: AchievementCategory.STREAKS,
    icon: "💫",
    requirement: 30,
    xpReward: 500
  },
  // Social Achievements (for future use)
  {
    name: "Community Member",
    description: "Join the community",
    category: AchievementCategory.SOCIAL,
    icon: "👋",
    requirement: 1,
    xpReward: 50
  }
];

async function seed() {
  try {
    await db.insert(Achievements).values(achievements);
    console.log('Successfully seeded achievements');
  } catch (error) {
    console.error('Error seeding achievements:', error);
  } finally {
    await client.end();
  }
}

seed(); 