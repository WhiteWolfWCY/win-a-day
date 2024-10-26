"use server";

import { db } from "@/db/drizzle";
import { GoalsAttempts, Goals, Habits, Categories, Users } from "@/db/schema";
import { eq, inArray, desc, and } from "drizzle-orm";
import { InferInsertModel } from 'drizzle-orm';
import { sql } from "drizzle-orm";


type NewHabit = InferInsertModel<typeof Habits>;
type NewGoal = InferInsertModel<typeof Goals>;
type NewCategory = InferInsertModel<typeof Categories>;
type NewGoalAttempt = InferInsertModel<typeof GoalsAttempts>;

//USERS

// Create a User
export async function createUser(userData: {
  id: string;
  name: string;
  email: string;
}) {
  const [newUser] = await db.insert(Users).values(userData).returning();
  return newUser;
}

// Get All Users
export async function getUsers() {
  const users = await db.select().from(Users);
  return users;
}

// Update a User
export async function updateUser(userId: string, userData: Partial<{
  name: string;
  email: string;
}>) {
  const [updatedUser] = await db
    .update(Users)
    .set(userData)
    .where(eq(Users.id, userId))
    .returning();
  return updatedUser;
}

//Delete User
export async function deleteUser(userId: string) {
  await db.delete(Users).where(eq(Users.id, userId));
}

//HABITS

//create a Habit
export async function createHabit(habitData: NewHabit) {
  const [newHabit] = await db
    .insert(Habits)
    .values(habitData)
    .returning();
  return newHabit;
}

//get all habits
export async function getAllHabits() {
  const habits = await db.select().from(Habits);
  return habits;
}

//get user habits
export async function getUserHabits(userId: string) {
  const habits = await db.select().from(Habits).where(eq(Habits.userId, userId));
  return habits;
}

//update a habit
export async function updateHabit(habitId: number, habitData: Partial<NewHabit>) {
  const [updatedHabit] = await db.update(Habits).set(habitData).where(eq(Habits.id, habitId)).returning();
  return updatedHabit;
}

//delete a habit
export async function deleteHabit(habitId: number) {
  await db.delete(Habits).where(eq(Habits.id, habitId));
}

//last 3 habits for user
export async function getLastThreeHabits(userId: string) {
  const habits = await db.select().from(Habits).where(eq(Habits.userId, userId)).limit(3); 
  return habits;
}

//GOALS


//create a Goal
export async function createGoal(goalData: NewGoal) {
  const [newGoal] = await db.insert(Goals).values(goalData).returning();
  await createGoalAttemptsForGoal(newGoal.id); //utwórz obiekty GoalsAttempts dla nowego celu
  return newGoal;
}


//get all user goals
export async function getAllUserGoals(userId: string) {
  const goals = await db.select().from(Goals).where(eq(Goals.userId, userId));
  return goals;
}

//update a goal
export async function updateGoal(goalId: number, goalData: Partial<NewGoal>) {
  const [updatedGoal] = await db.update(Goals).set(goalData).where(eq(Goals.id, goalId)).returning();
  return updatedGoal;
}

//delete a goal
export async function deleteGoal(goalId: number) {
  await db.delete(Goals).where(eq(Goals.id, goalId));
}

//goals for habit
export async function getGoalsForHabit(habitId: number) {
  const goals = await db.select().from(Goals).where(eq(Goals.habitId, habitId));
  return goals;
}

//goals for today
export async function getUserGoalsForToday(userId: string) {
  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0]; 
  

  const goalAttemptsForToday = await db
    .select({
      goalAttempt: GoalsAttempts,
      goal: Goals,
    })
    .from(GoalsAttempts)
    .innerJoin(Goals, eq(Goals.id, GoalsAttempts.goalId))
    .where(
      and(
        eq(Goals.userId, userId),
        eq(GoalsAttempts.date, todayStr)
      )
    );

  return goalAttemptsForToday;
}


//CATEGORIES

//create a Category
export async function createCategory(categoryData: NewCategory) {
  const [newCategory] = await db.insert(Categories).values(categoryData).returning();
  return newCategory;
}

//get user categories
export async function getUserCategories(userId: string) {
  const categories = await db.select().from(Categories).where(eq(Categories.userId, userId));
  return categories;
}

//update a category
export async function updateCategory(categoryId: number, categoryData: Partial<NewCategory>) {
  const [updatedCategory] = await db.update(Categories).set(categoryData).where(eq(Categories.id, categoryId)).returning();
  return updatedCategory;
}

//delete a category
export async function deleteCategory(categoryId: number) {
  await db.delete(Categories).where(eq(Categories.id, categoryId));
}

//GOALS ATTEMPTS

//create a Goal Attempt

export async function createGoalAttemptsForGoal(goalId: number) {
  // Retrieve the goal
  const [goal] = await db.select().from(Goals).where(eq(Goals.id, goalId));
  const { startDate, finishDate, weekDays } = goal;  
  //Mapa dni tygodnia do liczb
  const weekDayNumbers = weekDays?.map((wd) => {
    switch (wd) {
      case "Sunday":
        return 0;
      case "Monday":
        return 1;
      case "Tuesday":
        return 2;
      case "Wednesday":
        return 3;
      case "Thursday":
        return 4;
      case "Friday":
        return 5;
      case "Saturday":
        return 6;
      default:
        return 0;
        throw new Error(`Invalid weekday: ${wd}`);
    }
  });

  const currentDate = new Date(startDate);
  const endDate = new Date(finishDate);

  //godzina 00:00:00 
  currentDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  const goalAttemptsToInsert: NewGoalAttempt[] = [];

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)
    if (weekDayNumbers?.includes(dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6)) {
      // Create a GoalAttempt for this date
      goalAttemptsToInsert.push({
        id: Date.now(), // Generate a unique ID
        goalId: goal.id,
        date: currentDate.toISOString(), // Convert Date to ISO string
        isCompleted: false,
        note: "",
      });
    }
    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Bulk insert GoalAttempts
  if (goalAttemptsToInsert.length > 0) {
    await db.insert(GoalsAttempts).values(goalAttemptsToInsert);
  }
}

//update a goal attempt
export async function updateGoalAttempt(goalAttemptId: number, goalAttemptData: Partial<NewGoalAttempt>) {
  const [updatedGoalAttempt] = await db.update(GoalsAttempts).set(goalAttemptData).where(eq(GoalsAttempts.id, goalAttemptId)).returning();
  return updatedGoalAttempt;
}



/*

1. CRUD dla każdego z elementów czyli: Habits, Goals, Categories, Users 

2. Wyświetlania wszystkich Habits i wszystkich Goals 

3. Goals dla konkretnego Habit

4. 3 ostatnio dodanych Habitów i Goals

5. Goals dla DZISIEJSZEJ DATY

*/


