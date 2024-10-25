import { boolean, date, integer } from "drizzle-orm/pg-core";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
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

export const goalPriorityEnum = pgEnum("priority", [GoalPriority.LOW, GoalPriority.MEDIUM, GoalPriority.HIGH]);
export const weekDaysEnum = pgEnum("weekdays", [WeekDays.MONDAY, WeekDays.TUESDAY, WeekDays.WEDNESDAY, WeekDays.THURSDAY, WeekDays.FRIDAY, WeekDays.SATURDAY, WeekDays.SUNDAY]);

export const Users = pgTable("users", {
    id: text().primaryKey(),
    name: text(),
    email: text().unique(),
    joinDate: date().defaultNow()
});

export const Categories = pgTable("categories", {
    id: integer().primaryKey(),
    name: text().notNull(),
    userId: text().references(() => Users.id)
});

export const Habits = pgTable("habits", {
    id: integer().primaryKey(),
    name: text().notNull(),
    categoryId: integer().references(() => Categories.id),
    userId: text().references(() => Users.id),
    isGoodHabit: boolean().default(true)
});

export const Goals = pgTable("goals", {
    id: integer().primaryKey(),
    name: text().notNull(),
    finishDate: date().notNull(),
    startDate: date().defaultNow().notNull(),
    isCompleted: boolean().default(false),
    userId: text().references(() => Users.id),
    priority: goalPriorityEnum("priority").notNull(),
    habitId: integer().references(() => Habits.id),
    goalSuccess: integer().notNull(),
    weekDays: weekDaysEnum("weekdays").array()
});


export const GoalsAttempts = pgTable("goalsAttempts", { //dla kazdego dnia dla celu tworzy się rekord
    id: integer().primaryKey(),
    goalId: integer().references(() => Goals.id),
    date: date().notNull(),
    isCompleted: boolean().default(false),
    note: text()
});

