"use server";

import { db } from "@/db/drizzle";
import { GoalsAttempts, Goals, Habits, Categories, Users, GoalPriority, WeekDays } from "@/db/schema";
import { eq, and, desc, sql, inArray, gte, lte } from "drizzle-orm";
import { InferInsertModel } from 'drizzle-orm';
import { parseISO, subDays, startOfDay, endOfDay } from 'date-fns';


type NewHabit = Omit<InferInsertModel<typeof Habits>, 'id'>;
type NewGoal = Omit<InferInsertModel<typeof Goals>, 'id'>;
type NewCategory = Omit<InferInsertModel<typeof Categories>, 'id'>;
type NewGoalAttempt = Omit<InferInsertModel<typeof GoalsAttempts>, 'id'>;

type AdherenceStats = {
  goodHabits: number;
  goodHabitsTotal: number;
  badHabits: number;
  badHabitsTotal: number;
};

type AdherenceByDate = {
  [date: string]: AdherenceStats;
};

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
export async function getAllHabitsForUser(userId: string) {
  const habits = await db.select({
    id: Habits.id,
    name: Habits.name,
    isGoodHabit: Habits.isGoodHabit,
    categoryId: Categories.id,
    habitCategory: Categories.name,
    habitCategoryIcon: Categories.icon,
  }).from(Habits)
    .innerJoin(Categories, eq(Habits.categoryId, Categories.id))
    .where(eq(Habits.userId, userId));
  return habits;
}

// get 4 recent habits
export async function getRecentHabitsForUser(userId: string) {
  const habits = await db.select({
    habitId: Habits.id,
    habitName: Habits.name,
    habitCategory: Categories.name,
    habitCategoryId: Categories.id, 
    habitCategoryIcon: Categories.icon,
    habitType: Habits.isGoodHabit,
  }).from(Habits)
    .innerJoin(Categories, eq(Habits.categoryId, Categories.id))
    .where(eq(Habits.userId, userId))
    .orderBy(desc(Habits.createdAt))
    .limit(4);
  
  return habits;
}

//get user habits
export async function getUserHabits(userId: string) {
  const habits = await db.select().from(Habits).where(eq(Habits.userId, userId));
  return habits;
}

//delete a habit
export async function deleteHabit(habitId: string) {
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
  await createGoalAttemptsForGoal(newGoal.id);
  return newGoal;
}


//get all user goals
export async function getAllUserGoals(userId: string) {
  const goals = await db.select({
    id: Goals.id,
    name: Goals.name,
    habitId: Goals.habitId,
    habitName: Habits.name,
    priority: Goals.priority,
    startDate: Goals.startDate,
    finishDate: Goals.finishDate,
    goalSuccess: Goals.goalSuccess,
    weekDays: Goals.weekDays,
    completedAttempts: sql<number>`(
      SELECT CAST(COUNT(*) AS INTEGER)
      FROM ${GoalsAttempts}
      WHERE ${GoalsAttempts.goalId} = ${Goals.id}
      AND ${GoalsAttempts.isCompleted} = true
    )`.as('completedAttempts'),
  }).from(Goals)
    .innerJoin(Habits, eq(Goals.habitId, Habits.id))
    .where(eq(Goals.userId, userId))
    .orderBy(desc(Goals.createdAt));
  
  return goals;
}

//update a goal
export async function updateGoal(goalData: {
  id: string;
  name: string;
  habitId: string;
  priority: GoalPriority;
  startDate: string;
  finishDate: string;
  goalSuccess: number;
  weekDays: WeekDays[];
}) {
  const [updatedGoal] = await db
    .update(Goals)
    .set(goalData)
    .where(eq(Goals.id, goalData.id))
    .returning();
  await updateGoalAttemptsForGoal(updatedGoal.id);
  return updatedGoal;
}

//delete a goal
export async function deleteGoal(goalId: string) {
  await db.delete(GoalsAttempts).where(eq(GoalsAttempts.goalId, goalId));
  await db.delete(Goals).where(eq(Goals.id, goalId));
}

//goals for habit
export async function getGoalsForHabit(habitId: string) {
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
    )
    .execute();

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
  const categories = await db
    .select({
      id: Categories.id,
      name: Categories.name,
      icon: Categories.icon,
    })
    .from(Categories)
    .where(eq(Categories.userId, userId));
  return categories;
}

//update a category
export async function updateCategory(categoryId: string, categoryData: Partial<NewCategory>) {
  console.log(categoryData.icon);
  const [updatedCategory] = await db.update(Categories).set(categoryData).where(eq(Categories.id, categoryId)).returning();
  return updatedCategory;
}

//delete a category
export async function deleteCategory(categoryId: string) {
  await db.delete(Categories).where(eq(Categories.id, categoryId));
}

//GOALS ATTEMPTS

//create a Goal Attempt

export async function createGoalAttemptsForGoal(goalId: string) {
  const [goal] = await db.select().from(Goals).where(eq(Goals.id, goalId));
  const { startDate, finishDate, weekDays } = goal;

  const startDateObj = new Date(startDate);
  const endDateObj = new Date(finishDate);

  const goalAttemptsToInsert: NewGoalAttempt[] = [];

  for (let date = startDateObj; date <= endDateObj; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.getDay();
    // Adjust the mapping to align with our WeekDays enum
    const weekDay = Object.values(WeekDays)[(dayOfWeek + 6) % 7];
    
    if (weekDays!.includes(weekDay)) {
      goalAttemptsToInsert.push({
        goalId: goal.id,
        date: date.toISOString().split('T')[0],
        isCompleted: false,
        note: "",
      });
    }
  }

  if (goalAttemptsToInsert.length > 0) {
    await db.insert(GoalsAttempts).values(goalAttemptsToInsert);
  }
}

//update a goal attempt
export async function updateGoalAttempt(goalAttemptId: string, goalAttemptData: Partial<NewGoalAttempt>) {
  const [updatedGoalAttempt] = await db.update(GoalsAttempts).set(goalAttemptData).where(eq(GoalsAttempts.id, goalAttemptId)).returning();
  return updatedGoalAttempt;
}

export async function createHabitWithCategory(habitData: {
  name: string;
  category: string;
  userId: string;
  isGoodHabit: boolean;
}) {
  // First, find or create the category
  let [category] = await db
    .select()
    .from(Categories)
    .where(and(eq(Categories.name, habitData.category), eq(Categories.userId, habitData.userId)))
    .limit(1)
    .execute();
  
  if (!category) {
    [category] = await db.insert(Categories).values({
      name: habitData.category,
      userId: habitData.userId
    }).returning()
    .execute();
  }

  // Now create the habit
  const [newHabit] = await db
    .insert(Habits)
    .values({
      name: habitData.name,
      categoryId: category.id,
      userId: habitData.userId,
      isGoodHabit: habitData.isGoodHabit,
    })
    .returning()
    .execute();
  
  return newHabit;
}

export async function updateHabit(habitData: {
  id: string;
  name: string;
  categoryId: string;
  isGood: boolean;
}) {
  const [updatedHabit] = await db
    .update(Habits)
    .set({
      name: habitData.name,
      categoryId: habitData.categoryId,
      isGoodHabit: habitData.isGood,
    })
    .where(eq(Habits.id, habitData.id))
    .returning();
  return updatedHabit;
}

// get recent goals for user
export async function getRecentGoalsForUser(userId: string) {
  const goals = await db.select({
    id: Goals.id,
    name: Goals.name,
    habitId: Goals.habitId,
    habitName: Habits.name,
    priority: Goals.priority,
    startDate: Goals.startDate,
    finishDate: Goals.finishDate,
    goalSuccess: Goals.goalSuccess,
    weekDays: Goals.weekDays,
    completedAttempts: sql<number>`(
      SELECT CAST(COUNT(*) AS INTEGER)
      FROM ${GoalsAttempts}
      WHERE ${GoalsAttempts.goalId} = ${Goals.id}
      AND ${GoalsAttempts.isCompleted} = true
    )`.as('completedAttempts'),
  }).from(Goals)
    .innerJoin(Habits, eq(Goals.habitId, Habits.id))
    .where(eq(Goals.userId, userId))
    .orderBy(desc(Goals.createdAt))
    .limit(3);
  
  return goals;
}

// update goal attempts for a goal
export async function updateGoalAttemptsForGoal(goalId: string) {
 await db.select().from(Goals).where(eq(Goals.id, goalId));

  // Delete existing goal attempts
  await db.delete(GoalsAttempts).where(eq(GoalsAttempts.goalId, goalId));

  // Create new goal attempts
  await createGoalAttemptsForGoal(goalId);
}

// Get user goals for a specific day
export async function getUserGoalsForDay(date: string, userId: string) {
  const goalAttemptsForDay = await db
    .select({
      goalAttempt: GoalsAttempts,
      goal: Goals,
    })
    .from(GoalsAttempts)
    .innerJoin(Goals, eq(Goals.id, GoalsAttempts.goalId))
    .where(
      and(
        eq(GoalsAttempts.date, date),
        eq(Goals.userId, userId) 
      )
    );

  return goalAttemptsForDay;
}

// Get overall goal completion statistics
export async function getOverallGoalCompletion(userId: string) {
  const result = await db
    .select({
      totalAttempts: sql`COUNT(*)`,
      completedAttempts: sql`SUM(CASE WHEN ${GoalsAttempts.isCompleted} THEN 1 ELSE 0 END)`,
    })
    .from(GoalsAttempts)
    .innerJoin(Goals, eq(Goals.id, GoalsAttempts.goalId))
    .where(eq(Goals.userId, userId))
    .execute();

  const { totalAttempts, completedAttempts } = result[0];
  return {
    completed: Number(completedAttempts),
    remaining: Number(totalAttempts) - Number(completedAttempts),
  };
}

export async function getHabitAdherenceLastTwoWeeks(userId: string) {
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 13); 

  const result = await db
    .select({
      date: GoalsAttempts.date,
      isGoodHabit: Habits.isGoodHabit,
      isCompleted: GoalsAttempts.isCompleted,
    })
    .from(GoalsAttempts)
    .innerJoin(Goals, eq(Goals.id, GoalsAttempts.goalId))
    .innerJoin(Habits, eq(Habits.id, Goals.habitId))
    .where(
      and(
        eq(Goals.userId, userId),
        sql`${GoalsAttempts.date} >= ${twoWeeksAgo.toISOString().split('T')[0]}`
      )
    )
    .orderBy(GoalsAttempts.date);

  const adherenceByDate = result.reduce<AdherenceByDate>((acc, { date, isGoodHabit, isCompleted }) => {
    const dateStr = new Date(date).toISOString().split('T')[0];
    if (!acc[dateStr]) {
      acc[dateStr] = { goodHabits: 0, goodHabitsTotal: 0, badHabits: 0, badHabitsTotal: 0 };
    }
    if (isGoodHabit) {
      acc[dateStr].goodHabitsTotal++;
      if (isCompleted) acc[dateStr].goodHabits++;
    } else {
      acc[dateStr].badHabitsTotal++;
      if (isCompleted) acc[dateStr].badHabits++;
    }
    return acc;
  }, {});

  for (let d = new Date(twoWeeksAgo); d <= new Date(); d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    if (!adherenceByDate[dateStr]) {
      adherenceByDate[dateStr] = { goodHabits: 0, goodHabitsTotal: 0, badHabits: 0, badHabitsTotal: 0 };
    }
  }

  return Object.entries(adherenceByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, stats]) => ({
      date,
      goodHabits: stats.goodHabitsTotal > 0 ? (stats.goodHabits / stats.goodHabitsTotal) * 100 : 0,
      badHabits: stats.badHabitsTotal > 0 ? (stats.badHabits / stats.badHabitsTotal) * 100 : 0,
    }));
}

export async function getHabitStreaks(userId: string, startDate: Date, endDate: Date) {
  const habits = await getAllHabitsForUser(userId);
  const streaks = await Promise.all(habits.map(async (habit) => {
    const attempts = await db
      .select({
        date: GoalsAttempts.date,
        isCompleted: GoalsAttempts.isCompleted,
      })
      .from(GoalsAttempts)
      .innerJoin(Goals, eq(Goals.id, GoalsAttempts.goalId))
      .where(
        and(
          eq(Goals.habitId, habit.id),
          eq(GoalsAttempts.isCompleted, true),
          gte(GoalsAttempts.date, startDate.toISOString().split('T')[0]),
          lte(GoalsAttempts.date, endDate.toISOString().split('T')[0])
        )
      )
      .orderBy(desc(GoalsAttempts.date));

    let currentStreak = 0;
    let maxStreak = 0;
    let lastDate = new Date();

    for (const attempt of attempts) {
      const attemptDate = new Date(attempt.date);
      const dayDiff = Math.floor((lastDate.getTime() - attemptDate.getTime()) / (1000 * 3600 * 24));
      
      if (dayDiff <= 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        break;
      }
      lastDate = attemptDate;
    }

    return { habitName: habit.name, currentStreak, maxStreak };
  }));

  return streaks;
}

type CompletionRate = {
  totalAttempts: number;
  completedAttempts: number;
};

type DailyCompletionRate = {
  date: string;  
  totalAttempts: number;
  completedAttempts: number;
};

// Get category performance
export async function getCategoryPerformance(userId: string) {
  const categories = await getUserCategories(userId);
  const performance = await Promise.all(categories.map(async (category) => {
    const habits = await db
      .select({
        id: Habits.id,
      })
      .from(Habits)
      .where(and(
        eq(Habits.categoryId, category.id),
        eq(Habits.userId, userId)
      ));

    const habitIds = habits.map(h => h.id);

    if (habitIds.length === 0) {
      return { categoryName: category.name, completionRate: 0 };
    }

    const completionRate = await db
      .select({
        totalGoals: sql<number>`CAST(COUNT(DISTINCT ${Goals.id}) AS INTEGER)`,
        completedGoals: sql<number>`CAST(SUM(CASE WHEN ${Goals.isCompleted} THEN 1 ELSE 0 END) AS INTEGER)`,
      })
      .from(Goals)
      .where(and(
        eq(Goals.userId, userId),
        inArray(Goals.habitId, habitIds)
      ));

      if(!completionRate || completionRate.length === 0) {
        return { categoryName: category.name, completionRate: 0 };
      }

    const rate = completionRate[0]?.totalGoals > 0
      ? (completionRate[0]?.completedGoals / completionRate[0]?.totalGoals) * 100
      : 0;

    return { categoryName: category.name, completionRate: rate };
  }));

  return performance;
}

// Get goal completion rate over time
export async function getGoalCompletionRateOverTime(userId: string, startDate: Date, endDate: Date) {
  const completionRates = await db
    .select({
      date: GoalsAttempts.date,
      totalAttempts: sql<number>`CAST(COUNT(*) AS INTEGER)`,
      completedAttempts: sql<number>`CAST(SUM(CASE WHEN ${GoalsAttempts.isCompleted} THEN 1 ELSE 0 END) AS INTEGER)`,
    })
    .from(GoalsAttempts)
    .innerJoin(Goals, eq(Goals.id, GoalsAttempts.goalId))
    .where(
      and(
        eq(Goals.userId, userId),
        gte(GoalsAttempts.date, startDate.toISOString().split('T')[0]),
        lte(GoalsAttempts.date, endDate.toISOString().split('T')[0])
      )
    )
    .groupBy(GoalsAttempts.date)
    .orderBy(GoalsAttempts.date);

  return completionRates.map(rate => ({
    date: rate.date,
    completionRate: rate.totalAttempts > 0 
      ? (Number(rate.completedAttempts) / Number(rate.totalAttempts)) * 100 
      : 0,
  }));
}

// Get habit balance
export async function getHabitBalance(userId: string, startDate: Date, endDate: Date) {
  let habits = await getAllHabitsForUser(userId);
  
  // Upewnij się, że habits jest tablicą
  if (!Array.isArray(habits)) {
    habits = [];  // Przypisz pustą tablicę, jeśli wynik nie jest tablicą
  }

  const goodHabits = habits.filter(h => h.isGoodHabit).length;
  const badHabits = habits.length - goodHabits;

  const completionRates = await db
    .select({
      isGoodHabit: Habits.isGoodHabit,
      totalAttempts: sql<number>`CAST(COUNT(*) AS INTEGER)`,
      completedAttempts: sql<number>`CAST(SUM(CASE WHEN ${GoalsAttempts.isCompleted} THEN 1 ELSE 0 END) AS INTEGER)`,
    })
    .from(GoalsAttempts)
    .innerJoin(Goals, eq(Goals.id, GoalsAttempts.goalId))
    .innerJoin(Habits, eq(Habits.id, Goals.habitId))
    .where(
      and(
        eq(Goals.userId, userId),
        gte(GoalsAttempts.date, startDate.toISOString().split('T')[0]),
        lte(GoalsAttempts.date, endDate.toISOString().split('T')[0])
      )
    )
    .groupBy(Habits.isGoodHabit)
    .execute();

    if(!completionRates || completionRates.length === 0) {
      return {
        goodHabits: 0,
        badHabits: 0,
        goodHabitCompletionRate: 0,
        badHabitCompletionRate: 0,
      };
    }

  const goodHabitStats = completionRates?.find(r => r.isGoodHabit) || { totalAttempts: 0, completedAttempts: 0 };
  const badHabitStats = completionRates?.find(r => !r.isGoodHabit) || { totalAttempts: 0, completedAttempts: 0 };

  const goodHabitCompletionRate = goodHabitStats.totalAttempts > 0
    ? (goodHabitStats.completedAttempts / goodHabitStats.totalAttempts) * 100
    : 0;

  const badHabitCompletionRate = badHabitStats.totalAttempts > 0
    ? (badHabitStats.completedAttempts / badHabitStats.totalAttempts) * 100
    : 0;

  return {
    goodHabits,
    badHabits,
    goodHabitCompletionRate,
    badHabitCompletionRate,
  };
}


// Update the return type
export type CategoryDistribution = {
  categoryName: string;
  habitCount: number;
};

export async function getCategoryDistribution(userId: string): Promise<CategoryDistribution[]> {
  const categories = await getUserCategories(userId);
  
  const distribution = await Promise.all(categories.map(async (category) => {
    const habitCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(Habits)
      .where(and(
        eq(Habits.categoryId, category.id),
        eq(Habits.userId, userId)
      ));

    return {
      categoryName: category.name,
      habitCount: Number(habitCount[0]?.count) 
    };
  }));

  return distribution.filter(item => item.habitCount > 0);
}

/*

1. CRUD dla każdego z elementów czyli: Habits, Goals, Categories, Users 

2. Wyświetlania wszystkich Habits i wszystkich Goals 

3. Goals dla konkretnego Habit

4. 3 ostatnio dodanych Habitów i Goals

5. Goals dla DZISIEJSZEJ DATY

*/


























