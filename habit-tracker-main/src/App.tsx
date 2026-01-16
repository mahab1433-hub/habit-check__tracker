import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Habit } from './types/habit';
import { api } from './services/api';
import { getDateKey } from './utils/storage';

import { playSuccessSound } from './utils/audio';
import { useHabitReminders } from './hooks/useHabitReminders';

import HabitList from './components/HabitList';
import CalendarView from './components/CalendarView';
import OnboardingScreen from './components/OnboardingScreen';
import SplashScreen from './components/SplashScreen';
import QuestionnaireScreen from './components/QuestionnaireScreen';
import AllSetScreen from './components/AllSetScreen';
import { AuthProvider, useAuth } from './context/AuthContext';

import TaskView from './components/TaskView';
import StatsView from './components/StatsView';


import BottomNavigation from './components/BottomNavigation';
import SettingsPage from './pages/SettingsPage';
import AddHabitPage from './pages/AddHabitPage';
import HabitPage from './pages/HabitPage';
import HabitDetailPage from './pages/HabitDetailPage';
import HelpSupportPage from './pages/HelpSupportPage';
import JournalPage from './pages/JournalPage';
import FocusPage from './pages/FocusPage';
import FocusStatsPage from './pages/FocusStatsPage';
import StepCalculatorPage from './pages/StepCalculatorPage';

import NotificationCenter from './components/NotificationCenter';
import DateSelector from './components/DateSelector';
import CategorySelector from './components/CategorySelector';
import TopNavigation from './components/TopNavigation';
import Sidebar from './components/Sidebar';
import './App.css';
import './themes.css';
import LoginPage from './components/LoginPage';
import DailyJournal from './components/DailyJournal';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const isAuthenticated = !!user;

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
  const [view, setView] = useState<'list' | 'calendar' | 'tasks' | 'stats' | 'notifications'>('list');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();

  // Enable Notifications
  useHabitReminders(habits);

  // Initial Onboarding Check (Run once)
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');

    if (hasSeenOnboarding === 'true') {
      setShowOnboarding(false);
    } else {
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
      playSuccessSound();
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

  const handleHelpClick = () => {
    navigate('/help');
  };

  const handleStepClick = () => {
    navigate('/step-counter');
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

  const handleJournalClick = () => {
    navigate('/journal');
  };

  const handleCalendarClick = () => {
    setView('calendar');
  };



  if (authLoading || showSplash) {
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

  if (!isAuthenticated) {
    return (
      <LoginPage onLogin={() => { }} />
    );
  }

  if (showQuestions) {
    return (
      <div className="app">
        <TopNavigation
          onMenuClick={handleMenuClick}
          onTodayClick={handleTodayClick}
          onSettingsClick={handleSettingsClick}
          onJournalClick={handleJournalClick}
          onCalendarClick={handleCalendarClick}
          onStepClick={handleStepClick}
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
        onHelpClick={handleHelpClick}
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

        <Route path="/help" element={
          <HelpSupportPage />
        } />
        <Route path="/journal" element={
          <JournalPage />
        } />
        <Route path="/focus/:taskId" element={
          <FocusPage />
        } />
        <Route path="/focus-stats" element={
          <FocusStatsPage />
        } />
        <Route path="/step-counter" element={
          <StepCalculatorPage />
        } />

        <Route path="/" element={
          <>
            <TopNavigation
              onMenuClick={handleMenuClick}
              onTodayClick={handleTodayClick}
              onSettingsClick={handleSettingsClick}
              onJournalClick={handleJournalClick}
              onCalendarClick={handleCalendarClick}
              onStepClick={handleStepClick}
            />
            <DateSelector
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
            <CategorySelector
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
            <main className="app-main">
              {view === 'list' && (
                <>
                  <DailyJournal selectedDate={selectedDate} onClick={handleJournalClick} />
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
                </>
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
                <StatsView habits={habits} selectedDate={selectedDate} />
              )}
              {view === 'notifications' && (
                <NotificationCenter />
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
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
