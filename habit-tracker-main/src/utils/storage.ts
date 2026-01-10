import { Habit, HabitCategory, HabitType } from '../types/habit';
import { Task, TaskData } from '../types';

// New storage structure interface
interface HabitRecord {
  name: string;
  type: HabitType;
  category: HabitCategory;
  color: string;
  icon: string;
  startDate: string;
  createdAt: string;
  archived: boolean;
  history: Record<string, boolean>; // Simple boolean map for history
  frequency?: 'Daily' | 'Weekly' | 'Monthly';
  reminderTime?: string;
  reminder?: {
    enabled: boolean;
    time: string;
    days: number[];
  };
  goal?: {
    target: number;
    unit: string;
    frequency: 'day' | 'week' | 'month';
  };
}

interface StorageData {
  habits: Record<string, HabitRecord>;
}

const STORAGE_KEY = 'habit_tracker_data';

// Helper to calculate streak from history
function calculateStreak(history: Record<string, boolean>): number {
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check from today backwards
  for (let i = 0; i < 365; i++) { // Check up to a year back
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = getDateKey(date);

    if (history[dateKey]) {
      streak++;
    } else if (i === 0) {
      // If today is not done but yesterday was, streak continues (unless broken)
      // Actually strictly speaking, if today is not done, current streak is technically what was done up to yesterday?
      // Or if we miss today, is streak broken? usually we check yesterday if today is pending.
      // For simplicity: if today is missing, we check yesterday. if yesterday missing, streak 0.
      continue;
    } else {
      break;
    }
  }
  return streak;
}

export function saveHabits(habits: Habit[]): void {
  const storedHabits: Record<string, HabitRecord> = {};

  habits.forEach(habit => {
    // Convert Set<string> completedDates to history object
    const history: Record<string, boolean> = {};
    if (habit.completedDates instanceof Set) {
      habit.completedDates.forEach(date => {
        history[date] = true;
      });
    } else if (Array.isArray(habit.completedDates)) {
      (habit.completedDates as string[]).forEach(date => {
        history[date] = true;
      });
    }

    // Merge explicitly stored history if any (though usually we rely on completedDates as source of truth in App)
    // But requirement says "history" in JSON is where data lives.

    storedHabits[habit.id] = {
      name: habit.name,
      type: habit.type,
      category: habit.category,
      color: habit.color,
      icon: habit.icon,
      startDate: habit.startDate.toISOString(),
      createdAt: habit.createdAt.toISOString(),
      archived: habit.archived,
      history: history,
      frequency: habit.frequency,
      reminderTime: habit.reminderTime,
      reminder: habit.reminder,
      goal: habit.goal
    };
  });

  const data: StorageData = { habits: storedHabits };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadHabits(): Habit[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const parsed: StorageData = JSON.parse(data);

    // Handle case where parsed data might be empty or invalid
    if (!parsed || !parsed.habits) return [];

    const loadedHabits: Habit[] = Object.entries(parsed.habits).map(([id, record]) => {
      const history = record.history || {};
      const completedDates = new Set(Object.keys(history).filter(k => history[k] === true));

      const streak = calculateStreak(history);
      // Best streak could be stored or calculated. For now default to current streak if missing.
      const bestStreak = streak;

      return {
        id: id,
        name: record.name,
        type: record.type || 'daily',
        category: (record.category || 'other') as HabitCategory,
        color: record.color || '#4F46E5',
        icon: record.icon || '📝',
        startDate: record.startDate ? new Date(record.startDate) : new Date(),
        streak: streak,
        bestStreak: bestStreak,
        createdAt: record.createdAt ? new Date(record.createdAt) : new Date(),
        lastCompleted: undefined, // Could derive from history
        history: {}, // The internal app 'history' property type (HabitHistory) is complex { completed: bool, notes: string } - we can populate if needed but simple 'history' from storage is just boolean map.
        // IMPORTANT: App uses 'completedDates' Set for logic mostly. 
        archived: record.archived || false,
        completedDates: completedDates,
        frequency: record.frequency || 'Daily',
        reminderTime: record.reminderTime,
        reminder: record.reminder,
        goal: record.goal
      };
    });

    return loadedHabits;
  } catch (error) {
    console.error('Error loading habits:', error);
    // FAILSAFE: If data is corrupted, return empty array (which initializes empty state)
    // Optionally reset storage if completely broken? 
    // "Auto-reset to empty JSON structure without crashing"
    return [];
  }
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateKey(date: Date): string {
  return formatDate(date);
}

// Task storage functions (Keep as is or update if needed, but request focused on Habits)
const TASK_STORAGE_KEY = 'habit-tracker-tasks';

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify({ tasks }));
}

export function loadTasks(): Task[] {
  try {
    const data = localStorage.getItem(TASK_STORAGE_KEY);
    if (!data) return [];

    const parsed: TaskData = JSON.parse(data);
    return parsed.tasks || [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
}
