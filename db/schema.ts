import { boolean, date, integer, uuid } from "drizzle-orm/pg-core";
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

export const goalPriorityEnum = pgEnum("priority", [GoalPriority.LOW, GoalPriority.MEDIUM, GoalPriority.HIGH]);
export const weekDaysEnum = pgEnum("weekdays", [WeekDays.MONDAY, WeekDays.TUESDAY, WeekDays.WEDNESDAY, WeekDays.THURSDAY, WeekDays.FRIDAY, WeekDays.SATURDAY, WeekDays.SUNDAY]);

export const Users = pgTable("users", {
    id: text("id").primaryKey(),
    name: text("name"),
    email: text("email").unique(),
    joinDate: date("joinDate").defaultNow()
});

export const Categories = pgTable("categories", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    userId: text("userId").references(() => Users.id)
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
    weekDays: weekDaysEnum("weekdays").array() 
});


export const GoalsAttempts = pgTable("goalsAttempts", { //dla kazdego dnia dla celu tworzy się rekord
    id: uuid("id").defaultRandom().primaryKey(),
    goalId: uuid("goalId").references(() => Goals.id),
    date: date("date").notNull(),
    isCompleted: boolean("isCompleted").default(false),
    note: text("note")
});

