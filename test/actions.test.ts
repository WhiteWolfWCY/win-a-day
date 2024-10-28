import { mockDeep, DeepMockProxy, mockReset } from 'jest-mock-extended';
import { db } from '@/db/drizzle';


import {
  getAllHabitsForUser,
  getRecentHabitsForUser,
  getLastThreeHabits,
  getAllUserGoals,
  getGoalsForHabit,
  getUserGoalsForToday,
  getUserCategories,
  createGoalAttemptsForGoal,
  createHabitWithCategory,
  getRecentGoalsForUser,
  getUserGoalsForDay,
  getOverallGoalCompletion,
  getHabitAdherenceLastTwoWeeks,
  getHabitStreaks,
  getCategoryPerformance,
  getGoalCompletionRateOverTime,
  getHabitBalance,
  getCategoryDistribution,
} from '@/actions/actions';
import { Habits, Categories, Goals, GoalsAttempts, Users, GoalPriority, WeekDays } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { subDays } from 'date-fns';
import { sql } from 'drizzle-orm/sql';
import { PgSelectBuilder } from 'drizzle-orm/pg-core';



jest.mock('@/db/drizzle', () => ({
  __esModule: true,
  db: mockDeep<typeof db>(),
}));


/*jest.mock('../src/db/drizzle', () => ({
  __esModule: true,
  db: mockDeep<typeof db>(),
}));
*/

const mockDb = db as unknown as DeepMockProxy<typeof db>;

// Na początku pliku testowego

describe('Actions', () => {
  beforeEach(() => {
    mockReset(mockDb);
  });

  describe('getAllHabitsForUser', () => {
    it('should return all habits for a given user', async () => {
      const userId = 'user-123';
      const habits = [
        {
          id: 'habit-1',
          name: 'Exercise',
          isGoodHabit: true,
          categoryId: 'category-1',
          habitCategory: 'Health',
          habitCategoryIcon: '🏋️',
        },
        {
          id: 'habit-2',
          name: 'Read',
          isGoodHabit: true,
          categoryId: 'category-2',
          habitCategory: 'Education',
          habitCategoryIcon: '📚',
        },
      ];

      // Mock the db calls
      const selectQueryBuilder = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValueOnce(habits),
      };

      mockDb.select.mockReturnValue(selectQueryBuilder as any);

      // Act
      const result = await getAllHabitsForUser(userId);

      // Assert
      expect(result).toEqual(habits);
      expect(mockDb.select).toHaveBeenCalledWith({
        id: Habits.id,
        name: Habits.name,
        isGoodHabit: Habits.isGoodHabit,
        categoryId: Categories.id,
        habitCategory: Categories.name,
        habitCategoryIcon: Categories.icon,
      });
      expect(selectQueryBuilder.from).toHaveBeenCalledWith(Habits);
      expect(selectQueryBuilder.innerJoin).toHaveBeenCalledWith(Categories, expect.anything());
      expect(selectQueryBuilder.where).toHaveBeenCalledWith(eq(Habits.userId, userId));
    });
  });

  describe('getRecentHabitsForUser', () => {
    it('should return recent habits for a given user', async () => {
      const userId = 'user-123';
      const recentHabits = [
        {
          habitId: 'habit-1',
          habitName: 'Exercise',
          habitCategory: 'Health',
          habitCategoryId: 'category-1',
          habitCategoryIcon: '🏋️',
          habitType: true,
        },
        {
          habitId: 'habit-2',
          habitName: 'Read',
          habitCategory: 'Education',
          habitCategoryId: 'category-2',
          habitCategoryIcon: '📚',
          habitType: true,
        },
      ];

      // Mock the db calls
      const selectQueryBuilder = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValueOnce(recentHabits),
      };

      mockDb.select.mockReturnValue(selectQueryBuilder as any);

      // Act
      const result = await getRecentHabitsForUser(userId);

      // Assert
      expect(result).toEqual(recentHabits);
      expect(mockDb.select).toHaveBeenCalledWith({
        habitId: Habits.id,
        habitName: Habits.name,
        habitCategory: Categories.name,
        habitCategoryId: Categories.id,
        habitCategoryIcon: Categories.icon,
        habitType: Habits.isGoodHabit,
      });
      expect(selectQueryBuilder.from).toHaveBeenCalledWith(Habits);
      expect(selectQueryBuilder.innerJoin).toHaveBeenCalledWith(Categories, expect.anything());
      expect(selectQueryBuilder.where).toHaveBeenCalledWith(eq(Habits.userId, userId));
      expect(selectQueryBuilder.orderBy).toHaveBeenCalledWith(expect.anything());
      expect(selectQueryBuilder.limit).toHaveBeenCalledWith(4);
    });
  });

  describe('getLastThreeHabits', () => {
    it('should return last three habits for a user', async () => {
      const userId = 'user-123';
      const habits = [
        { id: 'habit-1', name: 'Exercise' },
        { id: 'habit-2', name: 'Read' },
        { id: 'habit-3', name: 'Meditate' },
      ];

      // Mock the db calls
      const selectQueryBuilder = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValueOnce(habits),
      };

      mockDb.select.mockReturnValue(selectQueryBuilder as any);

      // Act
      const result = await getLastThreeHabits(userId);

      // Assert
      expect(result).toEqual(habits);
      expect(mockDb.select).toHaveBeenCalled();
      expect(selectQueryBuilder.from).toHaveBeenCalledWith(Habits);
      expect(selectQueryBuilder.where).toHaveBeenCalledWith(eq(Habits.userId, userId));
      expect(selectQueryBuilder.limit).toHaveBeenCalledWith(3);
    });
  });

  describe('getAllUserGoals', () => {
    it('should return all goals for a user', async () => {
      const userId = 'user-123';
      const goals = [
        {
          id: 'goal-1',
          name: 'Morning Run',
          habitId: 'habit-1',
          habitName: 'Exercise',
          priority: 'High',
          startDate: '2023-01-01',
          finishDate: '2023-02-01',
          goalSuccess: 80,
          weekDays: ['Monday', 'Wednesday', 'Friday'],
          completedAttempts: 10,
        },
      ];

      // Mock the db calls
      const selectQueryBuilder = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValueOnce(goals),
      };

      mockDb.select.mockReturnValue(selectQueryBuilder as any);

      // Act
      const result = await getAllUserGoals(userId);

      // Assert
      expect(result).toEqual(goals);
      expect(mockDb.select).toHaveBeenCalled();
      expect(selectQueryBuilder.from).toHaveBeenCalledWith(Goals);
      expect(selectQueryBuilder.innerJoin).toHaveBeenCalledWith(Habits, expect.anything());
      expect(selectQueryBuilder.where).toHaveBeenCalledWith(eq(Goals.userId, userId));
      expect(selectQueryBuilder.orderBy).toHaveBeenCalledWith(expect.anything());
    });
  });

  describe('getGoalsForHabit', () => {
    it('should return goals for a specific habit', async () => {
      const habitId = 'habit-1';
      const goals = [
        { id: 'goal-1', name: 'Morning Run' },
        { id: 'goal-2', name: 'Evening Yoga' },
      ];

      // Mock the db calls
      const selectQueryBuilder = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValueOnce(goals),
      };

      mockDb.select.mockReturnValue(selectQueryBuilder as any);

      // Act
      const result = await getGoalsForHabit(habitId);

      // Assert
      expect(result).toEqual(goals);
      expect(mockDb.select).toHaveBeenCalled();
      expect(selectQueryBuilder.from).toHaveBeenCalledWith(Goals);
      expect(selectQueryBuilder.where).toHaveBeenCalledWith(eq(Goals.habitId, habitId));
    });
  });

  describe('getUserGoalsForToday', () => {
    it('should return goals attempts for today', async () => {
      const userId = 'user-123';
      const mockGoals = [{
        id: '550e8400-e29b-41d4-a716-446655440000',
        goalId: '550e8400-e29b-41d4-a716-446655440001',
        date: new Date(),
        isCompleted: false,
        note: 'Test note',
        goal: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Test Goal',
          finishDate: new Date('2024-12-31'),
          startDate: new Date(),
          isCompleted: false,
          userId: 'user-123',
          priority: GoalPriority.MEDIUM,
          habitId: '550e8400-e29b-41d4-a716-446655440002',
          goalSuccess: 3,
          weekDays: [WeekDays.MONDAY, WeekDays.WEDNESDAY],
          createdAt: new Date()
        }
      }];

      // Tworzymy mock chain z metodą execute zwracającą mockGoals
      const mockChain = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(mockGoals)
      } as any;
      
      mockDb.select.mockReturnValue(mockChain);

      const result = await getUserGoalsForToday(userId);
      expect(result).toEqual(mockGoals);
    });
});


  

  describe('getUserCategories', () => {
    it('should return all categories for a user', async () => {
      const userId = 'user-123';
      const categories = [
        { id: 'category-1', name: 'Health', icon: '🏋️' },
        { id: 'category-2', name: 'Education', icon: '📚' },
      ];

      // Mock the db calls
      const selectQueryBuilder = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValueOnce(categories),
      };

      mockDb.select.mockReturnValue(selectQueryBuilder as any);

      // Act
      const result = await getUserCategories(userId);

      // Assert
      expect(result).toEqual(categories);
      expect(mockDb.select).toHaveBeenCalledWith({
        id: Categories.id,
        name: Categories.name,
        icon: Categories.icon,
      });
      expect(selectQueryBuilder.from).toHaveBeenCalledWith(Categories);
      expect(selectQueryBuilder.where).toHaveBeenCalledWith(eq(Categories.userId, userId));
    });
  });

  describe('createHabitWithCategory', () => {
    it('should create a habit and category if not exists', async () => {
      const habitData = {
        name: 'Exercise',
        category: 'Health',
        userId: 'user-123',
        isGoodHabit: true,
      };

      // Mock category select (no category found)
      const selectCategoryQueryBuilder = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValueOnce([]),
      };
      mockDb.select.mockReturnValueOnce(selectCategoryQueryBuilder as any);

      // Mock category insert
      const newCategory = { id: 'category-1', name: 'Health', userId: 'user-123' };
      const insertCategoryMock = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValueOnce([newCategory]),
      };
      mockDb.insert.mockReturnValueOnce(insertCategoryMock as any);

      // Mock habit insert
      const newHabit = { id: 'habit-1', ...habitData, categoryId: 'category-1' };
      const insertHabitMock = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValueOnce([newHabit]),
      };
      mockDb.insert.mockReturnValueOnce(insertHabitMock as any);

      // Act
      const result = await createHabitWithCategory(habitData);

      // Assert
      expect(result).toEqual(newHabit);
    });
  });

  describe('getRecentGoalsForUser', () => {
    it('should return recent goals for a user', async () => {
      const userId = 'user-123';
      const goals = [
        {
          id: 'goal-1',
          name: 'Morning Run',
          habitId: 'habit-1',
          habitName: 'Exercise',
          priority: 'High',
          startDate: '2023-01-01',
          finishDate: '2023-02-01',
          goalSuccess: 80,
          weekDays: ['Monday', 'Wednesday', 'Friday'],
          completedAttempts: 10,
        },
      ];

      // Mock the db calls
      const selectQueryBuilder = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValueOnce(goals),
      };

      mockDb.select.mockReturnValue(selectQueryBuilder as any);

      // Act
      const result = await getRecentGoalsForUser(userId);

      // Assert
      expect(result).toEqual(goals);
    });
  });

  describe('getUserGoalsForDay', () => {
    it('should return goal attempts for a specific day', async () => {
      const date = '2023-02-10';
      const userId = 'user-123';
      const goalAttempts = [
        {
          goalAttempt: { id: 'attempt-1', date },
          goal: { id: 'goal-1', name: 'Morning Run' },
        },
      ];

      // Mock the db calls
      const selectQueryBuilder = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValueOnce(goalAttempts),
      };

      mockDb.select.mockReturnValue(selectQueryBuilder as any);

      // Act
      const result = await getUserGoalsForDay(date, userId);

      // Assert
      expect(result).toEqual(goalAttempts);
    });
  });

  describe('getOverallGoalCompletion', () => {
    it('should return overall goal completion stats', async () => {
      const userId = 'user-123';
      const stats = [{ totalAttempts: 20, completedAttempts: 15 }];

      const selectMock = {
        from: jest.fn().mockReturnThis(), 
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValueOnce(stats), // Adjusted here
      };
      mockDb.select.mockReturnValue(selectMock as any);
      

      // Act
      const result = await getOverallGoalCompletion(userId);

      // Assert
      expect(result).toEqual({ completed: 15, remaining: 5 });
    });
  });

  describe('getHabitAdherenceLastTwoWeeks', () => {
    it('should return habit adherence stats for last two weeks', async () => {
      const userId = 'user-123';
      const dateFrom = subDays(new Date(), 13).toISOString().split('T')[0];
      const data = [
        {
          date: dateFrom,
          isGoodHabit: true,
          isCompleted: true,
        },
        // ... more data
      ];

      // Mock the db calls
      const selectQueryBuilder = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValueOnce(data),
      };

      mockDb.select.mockReturnValue(selectQueryBuilder as any);

      // Act
      const result = await getHabitAdherenceLastTwoWeeks(userId);

      // Assert
      expect(result).toBeDefined();
    });
  });

  describe('getHabitStreaks', () => {
    it('should return habit streaks', async () => {
      const userId = 'user-123';
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-02-01');

      // Mock getAllHabitsForUser
      const habits = [
        { id: 'habit-1', name: 'Exercise' },
        { id: 'habit-2', name: 'Read' },
      ];

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValueOnce(habits),
      } as any);

      // Mock db calls inside the function
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue([]),
      } as any);

      // Act
      const result = await getHabitStreaks(userId, startDate, endDate);

      // Assert
      expect(result).toBeDefined();
    });
  });

  describe('getCategoryPerformance', () => {
    it('should return category performance', async () => {
      const userId = 'user-123';
      const categories = [
        { id: 'category-1', name: 'Health', icon: '🏋️' },
      ];
    
      // Mock getUserCategories
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValueOnce(categories),
      } as any);
    
      // Mock habits query
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValueOnce([{ id: 'habit-1' }]),
      } as any);
    
      // Mock completion stats
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValueOnce([{ totalAttempts: 10, completedAttempts: 8 }]),
      } as any);
    
      const result = await getCategoryPerformance(userId);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBeTruthy();
    });
    
  });

  describe('getGoalCompletionRateOverTime', () => {
    it('should return goal completion rate over time', async () => {
      const userId = 'user-123';
      const completionRates = [
        { date: '2023-01-10', totalAttempts: 5, completedAttempts: 4 },
        { date: '2023-01-11', totalAttempts: 3, completedAttempts: 2 },
      ];

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValueOnce(completionRates),
      } as any);

      // Act
      const result = await getGoalCompletionRateOverTime(userId);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  /*describe('getHabitBalance', () => {
    it('should return correct habit balance', async () => {
      // Arrange
      const mockHabits = [
        { id: '1', isGoodHabit: true },
        { id: '2', isGoodHabit: false },
      ];
  
      const mockCompletionRates = [
        { isGoodHabit: true, totalAttempts: 10, completedAttempts: 5 },
        { isGoodHabit: false, totalAttempts: 10, completedAttempts: 5 },
      ];
  
      (getAllHabitsForUser as jest.Mock).mockResolvedValue(mockHabits);
      (db.execute as jest.Mock).mockResolvedValue(mockCompletionRates);
  
      // Act
      const result = await getHabitBalance(
        'testUserId',
        new Date('2023-01-01'),
        new Date('2023-12-31')
      );
  
      // Assert
      expect(result).toEqual({
        goodHabits: 1,
        badHabits: 1,
        goodHabitCompletionRate: 50,
        badHabitCompletionRate: 50,
      });
    });
  });*/


  describe('getCategoryDistribution', () => {
    it('should return category distribution', async () => {
      const userId = 'user-123';
      const categories = [
        { id: 'category-1', name: 'Health', icon: '🏋️' }
      ];
    
      // Mock getUserCategories
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValueOnce(categories),
      } as any);
    
      // Mock habit count query
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValueOnce([{ count: '5' }]),
      } as any);
    
      const result = await getCategoryDistribution(userId);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBeTruthy();
    });
  });
});
