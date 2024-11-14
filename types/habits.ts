export interface Habit {
  id: string;
  name: string;
  categoryId: string | null;
  userId: string;
  isGoodHabit: boolean;
  createdAt: Date;
}

export interface HabitQuote {
  id: string;
  habitId: string;
  quote: string;
  author: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  userId: string;
  icon: string;
} 