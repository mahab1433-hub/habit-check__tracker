import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiActivity } from 'react-icons/fi';
import HabitDashboard from '../components/HabitDashboard';
import HabitForm from '../components/habits/HabitForm';
// Import types from the habit types file
import { Habit, HabitInput } from '../types/habit';
import { api } from '../services/api';
import { getDateKey } from '../utils/storage';
import { playSuccessSound } from '../utils/audio';
import { addNotification } from '../utils/notifications';
import './HabitPage.css';

const HabitPage = () => {
  const navigate = useNavigate();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load habits from API
  const loadHabits = useCallback(async () => {
    try {
      const fetchedHabits = await api.fetchHabits();
      setHabits(fetchedHabits);
    } catch (error) {
      console.error('Failed to load habits', error);
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
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
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

    if (habitData.reminder && habitData.reminder.enabled) {
      addNotification(
        'Reminder Set',
        `You will be reminded to ${habitData.name} at ${habitData.reminder.time}`,
        'system'
      );
    }

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
            playSuccessSound();
          }

          let currentStreak = 0;
          const checkDate = new Date();
          checkDate.setHours(0, 0, 0, 0);

          while (true) {
            const key = getDateKey(checkDate);
            if (newCompletedDates.has(key)) {
              currentStreak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              if (currentStreak === 0) {
                checkDate.setDate(checkDate.getDate() - 1);
                const yesterKey = getDateKey(checkDate);
                if (newCompletedDates.has(yesterKey)) {
                  currentStreak++;
                  checkDate.setDate(checkDate.getDate() - 1);
                  continue;
                }
              }
              break;
            }
          }

          const newStreak = currentStreak;
          const updatedHabit: Habit = {
            ...habit,
            completedDates: newCompletedDates,
            streak: newStreak,
            bestStreak: Math.max(habit.bestStreak, newStreak),
            lastCompleted: isCompleted ? undefined : new Date()
          };

          api.updateHabit(updatedHabit).catch(err => {
            console.error('Failed to update habit streak/completion', err);
          });

          return updatedHabit;
        }
        return habit;
      })
    );
  }, []);

  const filteredHabits = selectedCategory === 'all'
    ? habits
    : habits.filter((habit) => habit.category?.toLowerCase() === selectedCategory.toLowerCase());

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
      <header className="habit-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FiChevronLeft size={24} />
        </button>
        <h1>My Habits</h1>
        <div className="header-actions">
          <button
            className="step-track-button"
            onClick={() => navigate('/step-counter')}
            title="Step Calculator"
          >
            <FiActivity size={20} />
          </button>
        </div>
      </header>

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
