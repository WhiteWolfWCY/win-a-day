import { boolean, date, integer, uuid, timestamp } from "drizzle-orm/pg-core";
import { pgTable, text } from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";


export enum GoalPriority {
    LOW = "Low",
    MEDIUM = "Medium",
    HIGH = "High"
}

export enum WeekDays {
    MONDAY = "Monday",
    TUESDAY = "Tuesday",
    WEDNESDAY = "Wednesday",
    THURSDAY = "Thursday",
    FRIDAY = "Friday",
    SATURDAY = "Saturday",
    SUNDAY = "Sunday"
}

export enum AchievementCategory {
  HABITS = "Habits",
  GOALS = "Goals",
  STREAKS = "Streaks",
  SOCIAL = "Social"
}

export const goalPriorityEnum = pgEnum("priority", [GoalPriority.LOW, GoalPriority.MEDIUM, GoalPriority.HIGH]);
export const weekDaysEnum = pgEnum("weekdays", [WeekDays.MONDAY, WeekDays.TUESDAY, WeekDays.WEDNESDAY, WeekDays.THURSDAY, WeekDays.FRIDAY, WeekDays.SATURDAY, WeekDays.SUNDAY]);
export const achievementCategoryEnum = pgEnum("achievement_category", [
  AchievementCategory.HABITS,
  AchievementCategory.GOALS,
  AchievementCategory.STREAKS,
  AchievementCategory.SOCIAL
]);

export const Users = pgTable("users", {
    id: text("id").primaryKey(),
    name: text("name"),
    email: text("email").unique(),
    imgUrl: text("imageUrl"),
    joinDate: date("joinDate").defaultNow()
});

export const Categories = pgTable("categories", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    userId: text("userId").references(() => Users.id),
    icon: text("icon").notNull().default('📁'), // Default to a folder emoji
});

export const Habits = pgTable("habits", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    categoryId: uuid("categoryId").references(() => Categories.id),
    userId: text("userId").references(() => Users.id),
    isGoodHabit: boolean("isGoodHabit").default(true),
    createdAt: date("createdAt").defaultNow()
});

export const Goals = pgTable("goals", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    finishDate: date("finishDate").notNull(),
    startDate: date("startDate").defaultNow().notNull(),
    isCompleted: boolean("isCompleted").default(false),
    userId: text("userId").references(() => Users.id),
    priority: goalPriorityEnum("priority").notNull(),
    habitId: uuid("habitId").references(() => Habits.id),
    goalSuccess: integer("goalSuccess").notNull(),
    weekDays: weekDaysEnum("weekdays").array(),
    createdAt: date("createdAt").defaultNow()
});


export const GoalsAttempts = pgTable("goalsAttempts", { //dla kazdego dnia dla celu tworzy się rekord
    id: uuid("id").defaultRandom().primaryKey(),
    goalId: uuid("goalId").references(() => Goals.id),
    date: date("date").notNull(),
    isCompleted: boolean("isCompleted").default(false),
    note: text("note")
});

export const Achievements = pgTable("achievements", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: achievementCategoryEnum("category").notNull(),
  icon: text("icon").notNull(),
  requirement: integer("requirement").notNull(), // e.g., number of habits needed
  xpReward: integer("xpReward").notNull(),
  createdAt: date("createdAt").defaultNow()
});

export const UserAchievements = pgTable("user_achievements", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").references(() => Users.id),
  achievementId: uuid("achievementId").references(() => Achievements.id),
  unlockedAt: date("unlockedAt").defaultNow(),
  progress: integer("progress").default(0)
});

export const UserStats = pgTable("user_stats", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").references(() => Users.id),
  totalHabits: integer("totalHabits").default(0),
  completedGoals: integer("completedGoals").default(0),
  goodHabitStreak: integer("goodHabitStreak").default(0),
  achievementsUnlocked: integer("achievementsUnlocked").default(0),
  totalScore: integer("totalScore").default(0),
  lastUpdated: timestamp("lastUpdated").defaultNow()
});

