import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Habit } from './types/habit';
import { api } from './services/api';
import { getDateKey } from './utils/storage';
import HabitDashboard from './components/HabitDashboard';
import HabitList from './components/HabitList';
import CalendarView from './components/CalendarView';
import OnboardingScreen from './components/OnboardingScreen';
import SplashScreen from './components/SplashScreen';
import QuestionnaireScreen from './components/QuestionnaireScreen';
import AllSetScreen from './components/AllSetScreen';

import TaskView from './components/TaskView';
import StatsView from './components/StatsView';
import BottomNavigation from './components/BottomNavigation';
import SettingsPage from './pages/SettingsPage';
import AddHabitPage from './pages/AddHabitPage';
import HabitPage from './pages/HabitPage';
import HabitDetailPage from './pages/HabitDetailPage';
import DateSelector from './components/DateSelector';
import CategorySelector from './components/CategorySelector';
import TopNavigation from './components/TopNavigation';
import Sidebar from './components/Sidebar';
import './App.css';
import './themes.css';
import LoginPage from './components/LoginPage';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('auth_user') === 'true';
  });
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showAllSet, setShowAllSet] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [view, setView] = useState<'list' | 'calendar' | 'tasks' | 'stats'>('list');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();

  // Initial Onboarding Check (Run once)
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');

    if (hasSeenOnboarding === 'true') {
      setShowSplash(true);
      setShowOnboarding(false);
    } else {
      setShowSplash(false);
      setShowOnboarding(true);
    }
  }, []);

  // Load habits on navigation
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadHabits = async () => {
      try {
        const fetchedHabits = await api.fetchHabits();
        setHabits(fetchedHabits);
      } catch (error) {
        console.error('Failed to load habits', error);
      }
    };
    loadHabits();
  }, [location.pathname, isAuthenticated]);


  const handleAddHabit = () => {
    navigate('/add-habit');
  };

  const deleteHabit = async (id: string) => {
    try {
      if (confirm('Are you sure?')) {
        await api.deleteHabit(id);
        setHabits(habits.filter(habit => habit.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete habit', error);
    }
  };

  const toggleHabitDate = async (habitId: string, date: Date) => {
    const dateKey = getDateKey(date);

    // Find habit to toggle
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    // Optimistic update
    const newCompletedDates = new Set(habit.completedDates);
    if (newCompletedDates.has(dateKey)) {
      newCompletedDates.delete(dateKey);
    } else {
      newCompletedDates.add(dateKey);
    }

    const updatedHabit = { ...habit, completedDates: newCompletedDates };

    setHabits(prevHabits =>
      prevHabits.map(h => (h.id === habitId ? updatedHabit : h))
    );

    try {
      await api.updateHabit(updatedHabit);
    } catch (error) {
      console.error('Failed to update habit', error);
      // Rollback if needed (omitted for brevity)
    }
  };

  const isHabitCompleted = (habitId: string, date: Date): boolean => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return false;
    const dateKey = getDateKey(date);
    return habit.completedDates.has(dateKey);
  };

  const getCompletedCount = (): number => {
    return habits.filter(habit => isHabitCompleted(habit.id, selectedDate)).length;
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const handleOnboardingFinish = () => {
    setShowOnboarding(false);
    setShowQuestions(true);
  };

  const handleQuestionsComplete = () => {
    setShowQuestions(false);
    setShowAllSet(true);
  };

  const handleAllSetComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowAllSet(false);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleMenuClick = () => {
    setIsSidebarOpen(true);
  };

  const handleTodayClick = () => {
    // Navigate to today's date and show date selector
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setSelectedDate(today);
    setView('list');
  };

  const handleFilterClick = () => {
    // TODO: Implement filter modal
    console.log('Filter clicked');
  };

  const handleCalendarClick = () => {
    setView('calendar');
  };



  if (!isAuthenticated) {
    return (
      <LoginPage onLogin={() => setIsAuthenticated(true)} />
    );
  }

  if (showSplash) {
    return (
      <div className="app">
        <SplashScreen onEnter={handleSplashFinish} />
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div className="app">
        <OnboardingScreen onEnter={handleOnboardingFinish} />
      </div>
    );
  }

  if (showQuestions) {
    return (
      <div className="app">
        <TopNavigation
          onMenuClick={handleMenuClick}
          onTodayClick={handleTodayClick}
          onSettingsClick={handleSettingsClick}
          onFilterClick={handleFilterClick}
          onCalendarClick={handleCalendarClick}
        />
        <QuestionnaireScreen onComplete={handleQuestionsComplete} />
      </div>
    );
  }

  if (showAllSet) {
    return (
      <div className="app">
        <AllSetScreen onEnter={handleAllSetComplete} />
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={setView}
        onSettingsClick={handleSettingsClick}
      />
      <Routes>
        <Route path="/settings" element={
          <SettingsPage onBack={() => navigate(-1)} />
        } />
        <Route path="/habits" element={
          <HabitPage />
        } />
        <Route path="/habits/:id" element={
          <HabitDetailPage />
        } />
        <Route path="/add-habit" element={
          <AddHabitPage />
        } />
        <Route path="/" element={
          <>
            <TopNavigation
              onMenuClick={handleMenuClick}
              onTodayClick={handleTodayClick}
              onSettingsClick={handleSettingsClick}
              onFilterClick={handleFilterClick}
              onCalendarClick={handleCalendarClick}
            />
            <DateSelector
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
            <CategorySelector
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
            <main>
              {view === 'list' && (
                <HabitList
                  habits={habits}
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  onToggle={toggleHabitDate}
                  onEdit={(habit) => {
                    // Handle edit - navigate to edit page or open modal
                    console.log('Edit habit:', habit);
                  }}
                  onDelete={deleteHabit}
                  isCompleted={isHabitCompleted}
                />
              )}
              {view === 'calendar' && (
                <CalendarView
                  habits={habits}
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  onToggle={toggleHabitDate}
                  onDelete={deleteHabit}
                  isCompleted={isHabitCompleted}
                />
              )}
              {view === 'tasks' && (
                <TaskView />
              )}
              {view === 'stats' && (
                <StatsView habits={habits} />
              )}
            </main>
            <BottomNavigation
              currentView={view}
              onViewChange={setView}
              onAddHabit={handleAddHabit}
            />
          </>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
