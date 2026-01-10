// Re-export everything from index.ts to maintain backward compatibility
export * from './index';

// This file is kept for backward compatibility
// The main type definitions now live in index.ts

// Type definitions
export type HabitType = 'daily' | 'weekly' | 'monthly';

export type HabitCategory = 
  | 'health' 
  | 'study' 
  | 'work' 
  | 'fitness' 
  | 'personal' 
  | 'other';

export interface HabitHistory {
  [date: string]: {
    completed: boolean;
    notes?: string;
    rating?: number;
  };
}

export interface HabitReminder {
  enabled: boolean;
  time: string;
  days: number[]; // 0-6 for Sunday-Saturday
}

export interface HabitGoal {
  target: number;
  unit: string;
  frequency: 'day' | 'week' | 'month';
}

/**
 * Represents a habit in the application
 */
export interface Habit {
  // Core properties
  id: string;
  name: string;
  type: HabitType;
  category: HabitCategory;
  color: string;
  icon: string;
  startDate: Date;
  streak: number;
  bestStreak: number;
  createdAt: Date;
  lastCompleted?: Date;
  history: HabitHistory;
  archived: boolean;
  completedDates: Set<string>;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  reminderTime?: string;
  
  // Optional properties
  reminder?: HabitReminder;
  goal?: HabitGoal;
  notes?: string;

  // For backward compatibility with old habit format
  [key: string]: any;
}

/**
 * Type for creating/updating habits (excludes auto-generated fields)
 */
export type HabitInput = Omit<Habit, 'id' | 'createdAt' | 'streak' | 'bestStreak' | 'history' | 'archived' | 'completedDates'> & {
  id?: string; // Optional for updates
  completedDates?: Set<string>;
};

// Utility types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Internal type for old habit format
interface OldHabit {
  id: string;
  name: string;
  color: string;
  category?: string;
  completedDates: Set<string>;
  frequency?: 'Daily' | 'Weekly';
  reminderTime?: string;
}

/**
 * Type guard to check if a habit is in the old format
 */
export function isOldHabit(habit: unknown): habit is OldHabit {
  return !!(habit && 
    typeof habit === 'object' && 
    'completedDates' in habit && 
    !('type' in habit));
}

/**
 * Convert old habit format to new format
 */
export function convertToNewHabit(habit: unknown): Habit {
  if (!isOldHabit(habit)) {
    return habit as Habit;
  }
  
  return {
    id: habit.id,
    name: habit.name,
    type: (habit.frequency?.toLowerCase() as HabitType) || 'daily',
    category: (habit.category as HabitCategory) || 'other',
    color: habit.color || '#4F46E5',
    icon: '📝',
    startDate: new Date(),
    streak: 0,
    bestStreak: 0,
    createdAt: new Date(),
    history: {},
    archived: false,
    completedDates: habit.completedDates,
    frequency: habit.frequency || 'Daily',
    reminderTime: habit.reminderTime,
    reminder: habit.reminderTime ? {
      enabled: true,
      time: habit.reminderTime,
      days: [1, 2, 3, 4, 5] // Default to weekdays
    } : undefined
  };
}

export interface HabitFormData extends Omit<Habit, 'id' | 'createdAt' | 'streak' | 'bestStreak' | 'history' | 'archived'> {
  id?: string;
}
