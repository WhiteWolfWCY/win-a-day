import { sql } from "drizzle-orm";
import { boolean, date, integer, uuid, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
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

export enum NotificationFrequency {
  DAILY = "Daily",
  WEEKLY = "Weekly",
  MONTHLY = "Monthly",
  NEVER = "Never"
}

export const goalPriorityEnum = pgEnum("priority", [GoalPriority.LOW, GoalPriority.MEDIUM, GoalPriority.HIGH]);
export const weekDaysEnum = pgEnum("weekdays", [WeekDays.MONDAY, WeekDays.TUESDAY, WeekDays.WEDNESDAY, WeekDays.THURSDAY, WeekDays.FRIDAY, WeekDays.SATURDAY, WeekDays.SUNDAY]);
export const achievementCategoryEnum = pgEnum("achievement_category", [
  AchievementCategory.HABITS,
  AchievementCategory.GOALS,
  AchievementCategory.STREAKS,
  AchievementCategory.SOCIAL
]);
export const notificationFrequencyEnum = pgEnum("notification_frequency", [
  NotificationFrequency.DAILY,
  NotificationFrequency.WEEKLY,
  NotificationFrequency.MONTHLY,
  NotificationFrequency.NEVER
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
    note: text("note"),
    calendarEventId: text("calendar_event_id")
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

export const UserNotificationSettings = pgTable("user_notification_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").references(() => Users.id),
  
  // General notification settings
  notificationsEnabled: boolean("notifications_enabled").default(true),
  emailNotificationsEnabled: boolean("email_notifications_enabled").default(true),
  
  // Achievement notifications
  achievementNotifications: boolean("achievement_notifications").default(true),
  
  // Goal notifications
  goalCompletionNotifications: boolean("goal_completion_notifications").default(true),
  goalUpdatesNotifications: boolean("goal_updates_notifications").default(true),
  
  // Habit notifications
  habitUpdatesNotifications: boolean("habit_updates_notifications").default(true),
  
  // Reminder settings
  reminderFrequency: notificationFrequencyEnum("reminder_frequency").default(NotificationFrequency.DAILY),
  reminderTime: timestamp("reminder_time").default(sql`CURRENT_TIMESTAMP`), // Time of day to send reminders
  
  // Metadata
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create a table to store Google Calendar tokens
export const GoogleCalendarTokens = pgTable("google_calendar_tokens", {
  userId: text("user_id").primaryKey().references(() => Users.id),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiryDate: timestamp("expiry_date"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const GoalCalendarSync = pgTable("goal_calendar_sync", {
  id: uuid("id").defaultRandom().primaryKey(),
  goalId: uuid("goalId").references(() => Goals.id),
  userId: text("userId").references(() => Users.id),
  isEnabled: boolean("is_enabled").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  // Add unique constraint on goalId and userId combination
  unq: uniqueIndex('goal_calendar_sync_goal_user_unique').on(table.goalId, table.userId)
}));

export const HabitQuotes = pgTable("habit_quotes", {
  id: uuid("id").defaultRandom().primaryKey(),
  habitId: uuid("habitId").references(() => Habits.id),
  quote: text("quote").notNull(),
  author: text("author").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

