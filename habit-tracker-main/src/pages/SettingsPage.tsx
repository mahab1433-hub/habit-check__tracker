import { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiCheck, FiDownload, FiUpload, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import '../components/SettingsModal.css';
import '../components/LoginPage.css'; // Reuse profile card styles defined here
import { addNotification } from '../utils/notifications';
import { useAuth } from '../context/AuthContext';

type ThemeColor = '#3b82f6' | '#10b981' | '#f59e0b' | '#ef4444' | '#8b5cf6' | '#ec4899' | '#06b6d4' | '#84cc16';
type DefaultScreen = 'today' | 'overview' | 'habits' | 'tasks' | 'statistics';
type FirstDayOfWeek = 'sunday' | 'monday';
type Language = 'en' | 'es' | 'fr' | 'de' | 'hi' | 'ta';
type Currency = '₹' | '$' | '€' | '£' | '¥';

interface SettingsPageProps {
  onBack?: () => void;
}

interface Settings {
  defaultScreen: DefaultScreen;
  darkMode: boolean;
  themeColor: ThemeColor;
  passcodeLock: boolean;
  language: Language;
  firstDayOfWeek: FirstDayOfWeek;
  use24HourTime: boolean;
  vibrationOnTap: boolean;
  completionSound: boolean;
  achievementSound: boolean;
  hideCompleted: boolean;
  defaultHabitsScreen: DefaultScreen;
  defaultMoodsScreen: DefaultScreen;
  currency: Currency;
  defaultExpensesScreen: DefaultScreen;
  autoStart: boolean;
  focusDuration: number | null;
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('appSettings');
    const defaultSettings: Settings = {
      defaultScreen: 'today',
      darkMode: false,
      themeColor: '#8b5cf6',
      passcodeLock: false,
      language: 'en',
      firstDayOfWeek: 'sunday',
      use24HourTime: false,
      vibrationOnTap: true,
      completionSound: true,
      achievementSound: true,
      hideCompleted: false,
      defaultHabitsScreen: 'today',
      defaultMoodsScreen: 'today',
      currency: '₹',
      defaultExpensesScreen: 'overview',
      autoStart: false,
      focusDuration: null,
      shortBreakDuration: 300,
      longBreakDuration: 1800,
      autoStartBreaks: true,
    };
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    document.documentElement.setAttribute('data-theme', settings.darkMode ? 'dark' : 'light');
    document.documentElement.style.setProperty('--primary-color', settings.themeColor);
  }, [settings]);

  const toggleSetting = (key: keyof Settings) => {
    setSettings((prev: Settings) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev: Settings) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const getSectionTitle = (section: string) => {
    const titles: Record<string, string> = {
      'top-general': 'Default Screen',
      'appearance': 'Theme & Display',
      'general': 'General Settings',
      'habits-tasks': 'Habits & Tasks',
      'moods': 'Moods',
      'expenses': 'Expenses',
      'data-backup': 'Data & Backup',
      'focus-mode': 'Focus Mode'
    };
    return titles[section] || section;
  };

  const renderSectionDetails = (section: string) => {
    switch (section) {
      case 'top-general':
        return (
          <div className="settings-section">
            <div className="setting-item">
              <span className="setting-title">Choose which screen opens first</span>
            </div>
            {(['today', 'overview', 'habits', 'tasks', 'statistics'] as DefaultScreen[]).map(screen => (
              <div key={screen} className="setting-item" onClick={() => updateSetting('defaultScreen', screen)}>
                <div className="setting-info">
                  <span className="setting-title">{screen.charAt(0).toUpperCase() + screen.slice(1)}</span>
                </div>
                {settings.defaultScreen === screen && <FiCheck />}
              </div>
            ))}
          </div>
        );

      case 'appearance':
        return (
          <div className="settings-section">
            <div className="setting-item">
              <span className="setting-title">Select primary accent color</span>
            </div>
            <div className="theme-colors">
              {(['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'] as ThemeColor[]).map(color => (
                <div
                  key={color}
                  className={`color-option ${settings.themeColor === color ? 'active' : ''}`}
                  onClick={() => updateSetting('themeColor', color)}
                  style={{ backgroundColor: color }}
                >
                  {settings.themeColor === color && <FiCheck className="check-icon" />}
                </div>
              ))}
            </div>
          </div>
        );

      case 'general':
        return (
          <div className="settings-section">
            <div className="setting-item">
              <span className="setting-title">Language</span>
            </div>
            {(['en', 'es', 'fr', 'de', 'hi', 'ta'] as Language[]).map(lang => (
              <div key={lang} className="setting-item" onClick={() => updateSetting('language', lang)}>
                <div className="setting-info">
                  <span className="setting-title">{lang === 'en' ? 'English' : lang === 'es' ? 'Spanish' : lang === 'fr' ? 'French' : lang === 'de' ? 'German' : lang === 'hi' ? 'Hindi' : 'Tamil'}</span>
                </div>
                {settings.language === lang && <FiCheck />}
              </div>
            ))}
            <div className="setting-item">
              <span className="setting-title">First Day of Week</span>
            </div>
            {(['sunday', 'monday'] as FirstDayOfWeek[]).map(day => (
              <div key={day} className="setting-item" onClick={() => updateSetting('firstDayOfWeek', day)}>
                <div className="setting-info">
                  <span className="setting-title">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                </div>
                {settings.firstDayOfWeek === day && <FiCheck />}
              </div>
            ))}
          </div>
        );

      case 'habits-tasks':
        return (
          <div className="settings-section">
            <div className="setting-item">
              <span className="setting-title">Default Screen for Habits & Tasks</span>
            </div>
            {(['today', 'overview', 'habits', 'tasks', 'statistics'] as DefaultScreen[]).map(screen => (
              <div key={screen} className="setting-item" onClick={() => updateSetting('defaultHabitsScreen', screen)}>
                <div className="setting-info">
                  <span className="setting-title">{screen.charAt(0).toUpperCase() + screen.slice(1)}</span>
                </div>
                {settings.defaultHabitsScreen === screen && <FiCheck />}
              </div>
            ))}
            <div className="setting-item">
              <span className="setting-title">Categories</span>
              <span className="setting-value">Manage categories (add / edit / delete)</span>
            </div>
            <div className="setting-item">
              <span className="setting-title">Reorder Habits</span>
              <span className="setting-value">Enable reorder mode</span>
            </div>
          </div>
        );

      case 'moods':
        return (
          <div className="settings-section">
            <div className="setting-item">
              <span className="setting-title">Default Screen for Moods</span>
            </div>
            {(['today', 'overview'] as DefaultScreen[]).map(screen => (
              <div key={screen} className="setting-item" onClick={() => updateSetting('defaultMoodsScreen', screen)}>
                <div className="setting-info">
                  <span className="setting-title">{screen.charAt(0).toUpperCase() + screen.slice(1)}</span>
                </div>
                {settings.defaultMoodsScreen === screen && <FiCheck />}
              </div>
            ))}
            <div className="setting-item">
              <span className="setting-title">Tags</span>
              <span className="setting-value">Manage mood tags (add / edit / delete)</span>
            </div>
          </div>
        );

      case 'expenses':
        return (
          <div className="settings-section">
            <div className="setting-item">
              <span className="setting-title">Default Screen for Expenses</span>
            </div>
            {(['overview', 'today'] as DefaultScreen[]).map(screen => (
              <div key={screen} className="setting-item" onClick={() => updateSetting('defaultExpensesScreen', screen)}>
                <div className="setting-info">
                  <span className="setting-title">{screen.charAt(0).toUpperCase() + screen.slice(1)}</span>
                </div>
                {settings.defaultExpensesScreen === screen && <FiCheck />}
              </div>
            ))}
            <div className="setting-item">
              <span className="setting-title">Currency Symbol</span>
            </div>
            {(['₹', '$', '€', '£', '¥'] as Currency[]).map(currency => (
              <div key={currency} className="setting-item" onClick={() => updateSetting('currency', currency)}>
                <div className="setting-info">
                  <span className="setting-title">{currency}</span>
                </div>
                {settings.currency === currency && <FiCheck />}
              </div>
            ))}
            <div className="setting-item" onClick={() => handleExportCSV()}>
              <div className="setting-info">
                <span className="setting-title">Export CSV</span>
                <span className="setting-value">Export expenses data as CSV</span>
              </div>
              <FiDownload />
            </div>
            <div className="setting-item">
              <span className="setting-title">Categories</span>
              <span className="setting-value">Manage expense categories</span>
            </div>
          </div>
        );

      case 'data-backup':
        return (
          <div className="settings-section">
            <div className="setting-item" onClick={() => handleCreateBackup()}>
              <div className="setting-info">
                <span className="setting-title">Create Local Backup</span>
              </div>
              <FiDownload />
            </div>
            <div className="setting-item" onClick={() => handleRestoreBackup()}>
              <div className="setting-info">
                <span className="setting-title">Restore from Backup</span>
              </div>
              <FiUpload />
            </div>
            <div className="setting-item">
              <span className="setting-title">Customize Quick Actions</span>
              <span className="setting-value">Choose actions shown in quick access menu</span>
            </div>
          </div>
        );

      case 'focus-mode':
        return (
          <div className="settings-section">
            <div className="setting-item">
              <span className="setting-title">Focus Session Duration</span>
            </div>
            {[
              { label: 'Infinity (Count up)', value: null },
              { label: '25 Minutes', value: 1500 },
              { label: '45 Minutes', value: 2700 },
              { label: '60 Minutes', value: 3600 }
            ].map(opt => (
              <div key={opt.label} className="setting-item" onClick={() => updateSetting('focusDuration', opt.value)}>
                <div className="setting-info">
                  <span className="setting-title">{opt.label}</span>
                </div>
                {settings.focusDuration === opt.value && <FiCheck />}
              </div>
            ))}

            <div className="setting-item">
              <span className="setting-title">Short Break Duration</span>
            </div>
            {[
              { label: '5 Minutes', value: 300 },
              { label: '10 Minutes', value: 600 },
              { label: '15 Minutes', value: 900 }
            ].map(opt => (
              <div key={opt.label} className="setting-item" onClick={() => updateSetting('shortBreakDuration', opt.value)}>
                <div className="setting-info">
                  <span className="setting-title">{opt.label}</span>
                </div>
                {settings.shortBreakDuration === opt.value && <FiCheck />}
              </div>
            ))}

            <div className="setting-item">
              <span className="setting-title">Long Break Duration</span>
            </div>
            {[
              { label: '15 Minutes', value: 900 },
              { label: '30 Minutes', value: 1800 },
              { label: '45 Minutes', value: 2700 }
            ].map(opt => (
              <div key={opt.label} className="setting-item" onClick={() => updateSetting('longBreakDuration', opt.value)}>
                <div className="setting-info">
                  <span className="setting-title">{opt.label}</span>
                </div>
                {settings.longBreakDuration === opt.value && <FiCheck />}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const handleRateApp = () => {
    // Placeholder for Play Store rating
    alert('Rate on Play Store - This would open the Play Store rating page');
  };

  const handleFeedback = () => {
    // Placeholder for feedback
    alert('Suggestions / Feedback - This would open a feedback form or email');
  };

  const handleShareApp = () => {
    // Placeholder for sharing
    if (navigator.share) {
      navigator.share({
        title: 'Habit Tracker',
        text: 'Check out this amazing Habit Tracker app!',
        url: window.location.href
      });
    } else {
      alert('Share this App - This would open sharing options');
    }
  };

  const handleExportCSV = () => {
    // Placeholder for CSV export
    alert('Export CSV - This would export expenses data as CSV file');
  };

  const handleCreateBackup = () => {
    // Placeholder for backup creation
    const dataStr = JSON.stringify(localStorage);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `habit-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleRestoreBackup = () => {
    // Placeholder for backup restoration
    alert('Restore from Backup - This would open a file picker to restore from backup');
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  const handleRequestPermission = () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }

    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        alert('Notifications enabled!');
        new Notification('Habit Tracker', { body: 'Notifications are working! 🔔' });
      } else {
        alert(`Permission ${permission}. Please enable notifications in your browser settings.`);
      }
    });
  };

  const handleTestNotification = () => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      try {
        const title = 'Test Notification';
        const message = 'If you see this, reminders will work! 🚀';

        // Save to History (so user can see it in Notification Center)
        addNotification(title, message, 'system');

        new Notification(title, {
          body: message,
          icon: '/vite.svg'
        });
      } catch (e) {
        alert('Error sending notification: ' + e);
      }
    } else {
      alert('Please enable notifications first');
      handleRequestPermission();
    }
  };

  const renderSection = () => {
    if (activeSection) {
      // Render detailed section view
      return (
        <div className="settings-page">
          <div className="settings-header">
            <button className="back-button" onClick={() => setActiveSection(null)}>
              <FiChevronLeft />
            </button>
            <h2>{getSectionTitle(activeSection)}</h2>
            <div style={{ width: '24px' }}></div>
          </div>

          <div className="settings-content">
            {renderSectionDetails(activeSection)}
          </div>
        </div>
      );
    }

    return (
      <div className="settings-page">
        <div className="settings-header">
          <button className="back-button" onClick={handleBack}>
            <FiChevronLeft />
          </button>
          <h2>Settings</h2>
          <div style={{ width: '24px' }}></div>
        </div>

        <div className="settings-content">
          {/* SECTION 1: APPEARANCE */}
          <div className="settings-section">
            <h3>APPEARANCE</h3>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon">🌙</div>
                <div>
                  <span className="setting-title">Dark mode</span>
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={() => toggleSetting('darkMode')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item" onClick={() => setActiveSection('appearance')}>
              <div className="setting-info">
                <div className="setting-icon">🎨</div>
                <div>
                  <span className="setting-title">Theme color</span>
                </div>
              </div>
              <FiChevronRight />
            </div>
          </div>

          {/* SECTION 2: GENERAL */}
          <div className="settings-section">
            <h3>GENERAL</h3>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon">🔒</div>
                <div>
                  <span className="setting-title">Passcode lock</span>
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.passcodeLock}
                  onChange={() => toggleSetting('passcodeLock')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item" onClick={() => setActiveSection('general')}>
              <div className="setting-info">
                <div className="setting-icon">🌐</div>
                <div>
                  <span className="setting-title">Language</span>
                  <span className="setting-value">{settings.language.toUpperCase()}</span>
                </div>
              </div>
              <FiChevronRight />
            </div>
            <div className="setting-item" onClick={() => setActiveSection('general')}>
              <div className="setting-info">
                <div className="setting-icon">📅</div>
                <div>
                  <span className="setting-title">First day of week</span>
                  <span className="setting-value">{settings.firstDayOfWeek}</span>
                </div>
              </div>
              <FiChevronRight />
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon">🕐</div>
                <div>
                  <span className="setting-title">24-hour time</span>
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.use24HourTime}
                  onChange={() => toggleSetting('use24HourTime')}
                />
                <span className="slider"></span>
              </label>
            </div>

            {/* Notifications Manually */}
            <div className="setting-item" onClick={handleRequestPermission}>
              <div className="setting-info">
                <div className="setting-icon">🔔</div>
                <div>
                  <span className="setting-title">Enable Mobile Notifications</span>
                  <span className="setting-value">{('Notification' in window) ? Notification.permission : 'unsupported'}</span>
                </div>
              </div>
              <FiChevronRight />
            </div>

            <div className="setting-item" onClick={handleTestNotification}>
              <div className="setting-info">
                <div className="setting-icon">🧪</div>
                <div>
                  <span className="setting-title">Send Test Notification</span>
                </div>
              </div>
              <FiChevronRight />
            </div>
          </div>

          {/* SECTION 3: SOUNDS & HAPTICS */}
          <div className="settings-section">
            <h3>SOUNDS & HAPTICS</h3>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon">📳</div>
                <div>
                  <span className="setting-title">Vibration on tap</span>
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.vibrationOnTap}
                  onChange={() => toggleSetting('vibrationOnTap')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon">🔔</div>
                <div>
                  <span className="setting-title">Completion sound</span>
                  <span className="setting-description">Play a sound when any activity is completed</span>
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.completionSound}
                  onChange={() => toggleSetting('completionSound')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon">🏆</div>
                <div>
                  <span className="setting-title">Goal & Achievement sound</span>
                  <span className="setting-description">Play a sound when a goal is achieved or achievement unlocked</span>
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.achievementSound}
                  onChange={() => toggleSetting('achievementSound')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* SECTION 4: HABITS & TASKS */}
          <div className="settings-section">
            <h3>HABITS & TASKS</h3>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon">👁️</div>
                <div>
                  <span className="setting-title">Hide completed activities</span>
                  <span className="setting-description">When enabled, show only incomplete items by default</span>
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.hideCompleted}
                  onChange={() => toggleSetting('hideCompleted')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item" onClick={() => setActiveSection('habits-tasks')}>
              <div className="setting-info">
                <div className="setting-icon">📁</div>
                <div>
                  <span className="setting-title">Categories</span>
                </div>
              </div>
              <FiChevronRight />
            </div>
            <div className="setting-item" onClick={() => setActiveSection('habits-tasks')}>
              <div className="setting-info">
                <div className="setting-icon">↕️</div>
                <div>
                  <span className="setting-title">Reorder habits</span>
                </div>
              </div>
              <FiChevronRight />
            </div>
            <div className="setting-item" onClick={() => setActiveSection('habits-tasks')}>
              <div className="setting-info">
                <div className="setting-icon">📱</div>
                <div>
                  <span className="setting-title">Default screen</span>
                  <span className="setting-value">{settings.defaultHabitsScreen}</span>
                </div>
              </div>
              <FiChevronRight />
            </div>
          </div>

          {/* SECTION 5: MOODS */}
          <div className="settings-section">
            <h3>MOODS</h3>
            <div className="setting-item" onClick={() => setActiveSection('moods')}>
              <div className="setting-info">
                <div className="setting-icon">🏷️</div>
                <div>
                  <span className="setting-title">Tags</span>
                </div>
              </div>
              <FiChevronRight />
            </div>
            <div className="setting-item" onClick={() => setActiveSection('moods')}>
              <div className="setting-info">
                <div className="setting-icon">📱</div>
                <div>
                  <span className="setting-title">Default screen</span>
                  <span className="setting-value">{settings.defaultMoodsScreen}</span>
                </div>
              </div>
              <FiChevronRight />
            </div>
          </div>

          {/* SECTION 6: EXPENSES */}
          <div className="settings-section">
            <h3>EXPENSES</h3>
            <div className="setting-item" onClick={() => setActiveSection('expenses')}>
              <div className="setting-info">
                <div className="setting-icon">📁</div>
                <div>
                  <span className="setting-title">Categories</span>
                </div>
              </div>
              <FiChevronRight />
            </div>
            <div className="setting-item" onClick={() => setActiveSection('expenses')}>
              <div className="setting-info">
                <div className="setting-icon">💱</div>
                <div>
                  <span className="setting-title">Currency symbol</span>
                  <span className="setting-value">{settings.currency}</span>
                </div>
              </div>
              <FiChevronRight />
            </div>
            <div className="setting-item" onClick={() => setActiveSection('expenses')}>
              <div className="setting-info">
                <div className="setting-icon">📊</div>
                <div>
                  <span className="setting-title">Export CSV</span>
                </div>
              </div>
              <FiChevronRight />
            </div>
            <div className="setting-item" onClick={() => setActiveSection('expenses')}>
              <div className="setting-info">
                <div className="setting-icon">📱</div>
                <div>
                  <span className="setting-title">Default screen</span>
                  <span className="setting-value">{settings.defaultExpensesScreen}</span>
                </div>
              </div>
              <FiChevronRight />
            </div>
          </div>

          {/* SECTION 7: DATA & BACKUP */}
          <div className="settings-section">
            <h3>DATA & BACKUP</h3>
            <div className="setting-item" onClick={() => setActiveSection('data-backup')}>
              <div className="setting-info">
                <div className="setting-icon">💾</div>
                <div>
                  <span className="setting-title">Backups</span>
                </div>
              </div>
              <FiChevronRight />
            </div>
            <div className="setting-item" onClick={() => setActiveSection('data-backup')}>
              <div className="setting-info">
                <div className="setting-icon">⚡</div>
                <div>
                  <span className="setting-title">Customize quick actions</span>
                </div>
              </div>
              <FiChevronRight />
            </div>
          </div>

          {/* SECTION 8: FOCUS MODE */}
          <div className="settings-section">
            <h3>FOCUS MODE</h3>
            <div className="setting-item" onClick={() => setActiveSection('focus-mode')}>
              <div className="setting-info">
                <div className="setting-icon">⏱️</div>
                <div>
                  <span className="setting-title">Durations</span>
                  <span className="setting-value">
                    Focus: {settings.focusDuration ? `${settings.focusDuration / 60}m` : '∞'},
                    Short: {settings.shortBreakDuration / 60}m,
                    Long: {settings.longBreakDuration / 60}m
                  </span>
                </div>
              </div>
              <FiChevronRight />
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon">🚀</div>
                <div>
                  <span className="setting-title">Auto-start Breaks</span>
                  <span className="setting-description">Automatically start timer when selecting a break mode</span>
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.autoStartBreaks}
                  onChange={() => toggleSetting('autoStartBreaks')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* SECTION 9: ABOUT */}
          <div className="settings-section">
            <h3>ABOUT</h3>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon">🚀</div>
                <div>
                  <span className="setting-title">Autostart / Auto-launch</span>
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.autoStart}
                  onChange={() => toggleSetting('autoStart')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item" onClick={() => handleRateApp()}>
              <div className="setting-info">
                <div className="setting-icon">⭐</div>
                <div>
                  <span className="setting-title">Rate on Play Store</span>
                </div>
              </div>
              <FiChevronRight />
            </div>
            <div className="setting-item" onClick={() => handleFeedback()}>
              <div className="setting-info">
                <div className="setting-icon">💬</div>
                <div>
                  <span className="setting-title">Suggestions / Feedback</span>
                </div>
              </div>
              <FiChevronRight />
            </div>
            <div className="setting-item" onClick={() => handleShareApp()}>
              <div className="setting-info">
                <div className="setting-icon">🔗</div>
                <div>
                  <span className="setting-title">Share this app</span>
                </div>
              </div>
              <FiChevronRight />
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon">ℹ️</div>
                <div>
                  <span className="setting-title">Habit Tracker</span>
                  <span className="setting-value">v1.0.0</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 10: ACCOUNT */}
          <div className="settings-section">
            <h3>ACCOUNT</h3>

            {/* Profile Card */}
            <div className="settings-profile-card">
              <div className="profile-avatar">
                <FiUser />
              </div>
              <div className="profile-info">
                <span className="profile-name">{user?.name || 'User'}</span>
                <span className="profile-email">{user?.email || 'No email'}</span>
              </div>
            </div>

            <div className="setting-item" onClick={handleLogout}>
              <div className="setting-info">
                <div className="setting-icon">🚪</div>
                <div>
                  <span className="setting-title" style={{ color: '#EF4444' }}>Log Out</span>
                </div>
              </div>
              <FiChevronRight />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return renderSection();
}
