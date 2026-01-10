import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiChevronLeft, FiSun, FiMoon } from 'react-icons/fi';
import HabitDashboard from '../components/HabitDashboard';
// import HabitList from '../components/HabitList';
import HabitForm from '../components/habits/HabitForm';
// Import types from the habit types file
import { Habit, HabitInput, HabitCategory } from '../types/habit';
import { api } from '../services/api';
// import { saveHabits as saveHabitsToStorage, loadHabits as loadHabitsFromStorage, getDateKey } from '../utils/storage';
import { getDateKey } from '../utils/storage';
import './HabitPage.css';

// Helper function to convert old habit format to new format
function convertToNewHabit(habit: any): Habit {
  if (!habit) {
    throw new Error('Habit is required');
  }

  // If it's already in the new format, return as is
  if (habit.history !== undefined && habit.archived !== undefined) {
    return habit as Habit;
  }

  // Convert from old format
  const newHabit: Habit = {
    id: habit.id || Date.now().toString(),
    name: habit.name || 'New Habit',
    type: (habit.type || (habit.frequency ? habit.frequency.toLowerCase() : 'daily')) as 'daily' | 'weekly' | 'monthly',
    category: (habit.category as HabitCategory) || 'other',
    color: habit.color || '#4F46E5',
    icon: habit.icon || '📝',
    startDate: habit.startDate ? new Date(habit.startDate) : new Date(),
    streak: habit.streak || 0,
    bestStreak: habit.bestStreak || 0,
    createdAt: habit.createdAt ? new Date(habit.createdAt) : new Date(),
    lastCompleted: habit.lastCompleted ? new Date(habit.lastCompleted) : undefined,
    history: habit.history || {},
    archived: habit.archived || false,
    completedDates: habit.completedDates instanceof Set
      ? habit.completedDates
      : Array.isArray(habit.completedDates)
        ? new Set(habit.completedDates)
        : new Set<string>(),
    frequency: habit.frequency || 'Daily',
    reminderTime: habit.reminderTime,
  };

  // Add reminder if it exists
  if (habit.reminder) {
    newHabit.reminder = {
      enabled: habit.reminder.enabled || false,
      time: habit.reminder.time || '09:00',
      days: habit.reminder.days || [1, 2, 3, 4, 5],
    };
  } else if (habit.reminderTime) {
    newHabit.reminder = {
      enabled: true,
      time: habit.reminderTime,
      days: [1, 2, 3, 4, 5], // Default to weekdays
    };
  }

  return newHabit;
}

const HabitPage = () => {
  const navigate = useNavigate();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null) as [Habit | null, (habit: Habit | null) => void];
  const [darkMode, setDarkMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load habits from API
  const loadHabits = useCallback(async () => {
    try {
      const fetchedHabits = await api.fetchHabits();
      setHabits(fetchedHabits);
    } catch (error) {
      console.error('Failed to load habits', error);
      // Fallback or empty state could be handled here
    }
  }, []);

  useEffect(() => {
    loadHabits();

    // Check for dark mode preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    updateTheme(isDarkMode);
  }, [loadHabits]);

  const updateTheme = (isDark: boolean) => {
    document.body.className = isDark ? 'dark-theme' : 'light-theme';
  };

  // Toggle dark/light mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    updateTheme(newDarkMode);
  };


  // Add a new habit
  const addHabit = useCallback((habitData: HabitInput) => {
    const newHabit: Habit = {
      ...habitData,
      id: Date.now().toString(),
      name: habitData.name || 'New Habit',
      type: habitData.type || 'daily',
      category: habitData.category || 'other',
      color: habitData.color || '#4F46E5',
      icon: habitData.icon || '📝',
      startDate: new Date(),
      streak: 0,
      bestStreak: 0,
      createdAt: new Date(),
      lastCompleted: undefined,
      history: {},
      archived: false,
      completedDates: new Set<string>(),
      frequency: habitData.frequency || 'Daily',
      reminder: habitData.reminder
    };
    setHabits(prevHabits => [...prevHabits, newHabit]);
    setShowAddHabit(false);
  }, []);

  // Update an existing habit
  const updateHabit = useCallback((id: string, updatedHabit: HabitInput) => {
    setHabits(prevHabits =>
      prevHabits.map(habit => {
        if (habit.id === id) {
          return {
            ...habit,
            ...updatedHabit,
            // Preserve important fields that shouldn't be overridden
            id: habit.id,
            createdAt: habit.createdAt,
            streak: habit.streak,
            bestStreak: habit.bestStreak,
            history: habit.history,
            completedDates: habit.completedDates
          };
        }
        return habit;
      })
    );
    setEditingHabit(null);
  }, []);

  // Delete a habit
  const deleteHabit = useCallback((id: string) => {
    setHabits(prevHabits => prevHabits.filter(habit => habit.id !== id));
  }, []);

  // Toggle habit completion
  const toggleHabitCompletion = useCallback((id: string, date: Date) => {
    setHabits(prevHabits =>
      prevHabits.map(habit => {
        if (habit.id === id) {
          const dateStr = getDateKey(date);
          const newCompletedDates = new Set(habit.completedDates);
          const isCompleted = newCompletedDates.has(dateStr);

          if (isCompleted) {
            newCompletedDates.delete(dateStr);
          } else {
            newCompletedDates.add(dateStr);
          }

          // Update streak
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);

          const wasCompletedYesterday = newCompletedDates.has(
            getDateKey(yesterday)
          );

          let newStreak = habit.streak;
          if (!isCompleted) {
            newStreak = wasCompletedYesterday ? habit.streak + 1 : 1;
          } else {
            newStreak = Math.max(0, habit.streak - 1);
          }

          const updatedHabit: Habit = {
            ...habit,
            completedDates: newCompletedDates,
            streak: newStreak,
            bestStreak: Math.max(habit.bestStreak, newStreak),
            lastCompleted: isCompleted ? undefined : new Date()
          };

          return updatedHabit;
        }
        return habit;
      })
    );
  }, []);

  // Filter habits by selected category
  const filteredHabits = selectedCategory === 'all'
    ? habits
    : habits.filter((habit) => habit.category?.toLowerCase() === selectedCategory.toLowerCase());

  // Calculate progress
  const calculateProgress = () => {
    if (filteredHabits.length === 0) return 0;
    const today = new Date();
    const todayKey = getDateKey(today);
    const completedToday = filteredHabits.filter(habit =>
      habit.completedDates.has(todayKey)
    ).length;
    return Math.round((completedToday / filteredHabits.length) * 100);
  };
  const progressPercentage = calculateProgress();



  return (
    <div className={`habit-page ${darkMode ? 'dark' : 'light'}`}>
      {/* Header */}
      <header className="habit-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FiChevronLeft size={24} />
        </button>
        <h1>My Habits</h1>
        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
          <button
            className="add-habit-button"
            onClick={() => {
              setEditingHabit(null);
              setShowAddHabit(true);
            }}
          >
            <FiPlus size={20} />
          </button>
        </div>
      </header>

      {/* Category Filter */}
      <div className="category-filter">
        {['all', 'health', 'study', 'work', 'fitness', 'personal', 'other'].map((category) => (
          <button
            key={category}
            className={`category-tag ${selectedCategory.toLowerCase() === category.toLowerCase() ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>




      {/* Premium Progress Section */}
      <div className="progress-card-premium">
        <div className="progress-header-row">
          <div>
            <h3>Today's Focus</h3>
            <p className="subtext">
              {progressPercentage === 100
                ? "All daily goals smashed! 🔥"
                : `${filteredHabits.filter(h => h.completedDates.has(getDateKey(new Date()))).length} of ${filteredHabits.length} completed`}
            </p>
          </div>
          <div className="progress-ring-container">
            {progressPercentage === 100 ? (
              <div className="animated-tick-circle">
                <svg className="checkmark" viewBox="0 0 52 52">
                  <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                  <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>
              </div>
            ) : (
              <span className="premium-percentage">{progressPercentage}%</span>
            )}
          </div>
        </div>
        <div className="premium-progress-bar-bg">
          <div
            className="premium-progress-bar-fill"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Habit List */}
      <main className="habit-main">
        <HabitDashboard
          habits={filteredHabits}
          onToggle={toggleHabitCompletion}
          isCompleted={(habitId, date) => {
            const habit = habits.find(h => h.id === habitId);
            if (!habit) return false;
            const dateKey = getDateKey(date);
            return habit.completedDates.has(dateKey);
          }}
        />
      </main>

      {/* Add/Edit Habit Modal */}
      {(showAddHabit || editingHabit) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <HabitForm
              initialHabit={editingHabit || undefined}
              onSave={(habitData: HabitInput) => {
                if (editingHabit) {
                  updateHabit(editingHabit.id, habitData);
                } else {
                  addHabit(habitData);
                }
              }}
              onCancel={() => {
                setShowAddHabit(false);
                setEditingHabit(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitPage;
