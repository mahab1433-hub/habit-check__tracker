import { useState, useEffect } from 'react';
import { FiX, FiChevronRight, FiCheck, FiDownload, FiUpload, FiShare2, FiMessageSquare, FiStar, FiChevronLeft } from 'react-icons/fi';
import './SettingsModal.css';

type ThemeColor = '#3b82f6' | '#10b981' | '#f59e0b' | '#ef4444' | '#8b5cf6' | '#ec4899' | '#06b6d4' | '#84cc16';
type DefaultScreen = 'today' | 'overview' | 'habits' | 'tasks' | 'statistics';
type FirstDayOfWeek = 'sunday' | 'monday';
type Language = 'en' | 'es' | 'fr' | 'de' | 'hi' | 'ta';

interface Settings {
  // General
  defaultScreen: DefaultScreen;

  // Appearance
  darkMode: boolean;
  themeColor: ThemeColor;

  // General Settings
  passcodeLock: boolean;
  language: Language;
  firstDayOfWeek: FirstDayOfWeek;
  use24HourTime: boolean;

  // Sounds & Haptics
  vibrationOnTap: boolean;
  completionSound: boolean;
  achievementSound: boolean;

  // Habits & Tasks
  hideCompleted: boolean;
  defaultHabitsScreen: DefaultScreen;

  // Moods
  defaultMoodsScreen: 'today' | 'calendar' | 'stats';

  // Expenses
  currency: string;
  defaultExpensesScreen: 'overview' | 'today';

  // About
  autoStart: boolean;
}

const DEFAULT_SETTINGS: Settings = {
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
};



interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('appSettings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));

    // Apply theme
    document.documentElement.setAttribute('data-theme', settings.darkMode ? 'dark' : 'light');
    document.documentElement.style.setProperty('--primary-color', settings.themeColor);
  }, [settings]);

  const toggleSetting = (key: keyof Settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isOpen) return null;

  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="settings-section">
            <h3>General</h3>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Default Screen</span>
                <span className="setting-value">
                  {settings.defaultScreen.charAt(0).toUpperCase() + settings.defaultScreen.slice(1)}
                </span>
              </div>
              <FiChevronRight />
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-title">First Day of Week</span>
                <span className="setting-value">
                  {settings.firstDayOfWeek === 'sunday' ? 'Sunday' : 'Monday'}
                </span>
              </div>
              <FiChevronRight />
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-title">24-Hour Time</span>
                <span className="setting-value">
                  {settings.use24HourTime ? 'On' : 'Off'}
                </span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.use24HourTime}
                  onChange={() => toggleSetting('use24HourTime')}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="settings-section">
            <h3>Appearance</h3>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Dark Mode</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={() => toggleSetting('darkMode')}
                />
                <span className="slider round"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Theme Color</span>
                <div className="theme-colors">
                  {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'].map(color => (
                    <div
                      key={color}
                      className={`color-option ${settings.themeColor === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => updateSetting('themeColor', color as ThemeColor)}
                    >
                      {settings.themeColor === color && <FiCheck className="check-icon" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      // Add more sections as needed...

      default:
        return (
          <>
            <div className="settings-section">
              <h3>General</h3>
              <div className="setting-item" onClick={() => setActiveSection('general')}>
                <div className="setting-info">
                  <div className="setting-icon">⚙️</div>
                  <span className="setting-title">General Settings</span>
                </div>
                <FiChevronRight />
              </div>
            </div>

            <div className="settings-section">
              <h3>Appearance</h3>
              <div className="setting-item" onClick={() => setActiveSection('appearance')}>
                <div className="setting-info">
                  <div className="setting-icon">🎨</div>
                  <span className="setting-title">Theme & Display</span>
                </div>
                <FiChevronRight />
              </div>
            </div>

            <div className="settings-section">
              <h3>Sounds & Haptics</h3>
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-icon">🔊</div>
                  <span className="setting-title">Vibration on Tap</span>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.vibrationOnTap}
                    onChange={() => toggleSetting('vibrationOnTap')}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-icon">🔔</div>
                  <span className="setting-title">Completion Sound</span>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.completionSound}
                    onChange={() => toggleSetting('completionSound')}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-icon">🏆</div>
                  <span className="setting-title">Achievement Sound</span>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.achievementSound}
                    onChange={() => toggleSetting('achievementSound')}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>

            <div className="settings-section">
              <h3>Habits & Tasks</h3>
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-icon">👁️</div>
                  <span className="setting-title">Hide Completed Activities</span>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.hideCompleted}
                    onChange={() => toggleSetting('hideCompleted')}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-icon">📁</div>
                  <span className="setting-title">Categories</span>
                </div>
                <FiChevronRight />
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-icon">↕️</div>
                  <span className="setting-title">Re-order Habits</span>
                </div>
                <FiChevronRight />
              </div>
            </div>

            <div className="settings-section">
              <h3>Data & Backup</h3>
              <div className="setting-item">
                <div className="setting-info">
                  <FiDownload className="setting-icon" />
                  <span className="setting-title">Create Backup</span>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <FiUpload className="setting-icon" />
                  <span className="setting-title">Restore from Backup</span>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h3>About</h3>
              <div className="setting-item">
                <div className="setting-info">
                  <FiStar className="setting-icon" />
                  <span className="setting-title">Rate on Play Store</span>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <FiMessageSquare className="setting-icon" />
                  <span className="setting-title">Send Feedback</span>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <FiShare2 className="setting-icon" />
                  <span className="setting-title">Share App</span>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-title">Version</span>
                  <span className="setting-value">1.0.0</span>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          {activeSection ? (
            <button className="back-button" onClick={() => setActiveSection(null)}>
              <FiChevronLeft />
            </button>
          ) : (
            <div></div>
          )}
          <h2>{activeSection ? activeSection.charAt(0).toUpperCase() + activeSection.slice(1) : 'Settings'}</h2>
          <button className="close-button" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="settings-content">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
