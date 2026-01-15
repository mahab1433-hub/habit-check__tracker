import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPlay, FiPause, FiClock, FiEdit3, FiMoreVertical, FiTag, FiChevronLeft, FiTrash2, FiSettings, FiX, FiCheck } from 'react-icons/fi';
import { getDateKey } from '../utils/storage';
import { Task } from '../types';
import { api } from '../services/api';
import DateSelector from '../components/DateSelector';
import './FocusPage.css';

type SessionType = 'Focus' | 'Short Break' | 'Long Break';

interface FocusSession {
    id: string;
    startTime: string;
    endTime: string;
    durationSeconds: number;
    dateKey: string;
    type?: SessionType;
    status?: 'Completed' | 'Interrupted';
}

// Fallback defaults
const DEFAULT_MODE_DURATIONS: Record<SessionType, number | null> = {
    'Focus': null, // Infinity
    'Short Break': 300, // 5 minutes
    'Long Break': 1800 // 30 minutes
};

const FocusPage: React.FC = () => {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const [task, setTask] = useState<Task | null>(null);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [sessions, setSessions] = useState<FocusSession[]>([]);
    const [sessionType, setSessionType] = useState<SessionType>('Focus');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [menuSessionId, setMenuSessionId] = useState<string | null>(null);

    // Load dynamic durations from settings
    const [modeDurations, setModeDurations] = useState(DEFAULT_MODE_DURATIONS);
    const [autoStartBreaks, setAutoStartBreaks] = useState(true);

    const loadSettings = () => {
        const savedSettings = localStorage.getItem('appSettings');
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            setModeDurations({
                'Focus': parsed.focusDuration !== undefined ? parsed.focusDuration : null,
                'Short Break': parsed.shortBreakDuration || 300,
                'Long Break': parsed.longBreakDuration || 1800
            });
            setAutoStartBreaks(parsed.autoStartBreaks !== undefined ? parsed.autoStartBreaks : true);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const updateGlobalSetting = (key: string, value: any) => {
        const savedSettings = localStorage.getItem('appSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {};
        settings[key] = value;
        localStorage.setItem('appSettings', JSON.stringify(settings));
        loadSettings(); // Refresh local state
    };

    useEffect(() => {
        const fetchTask = async () => {
            if (taskId) {
                const tasks = await api.fetchTasks();
                const found = tasks.find(t => t.id === taskId);
                setTask(found || null);
            }
        };
        fetchTask();
    }, [taskId]);

    // Load sessions from localStorage
    useEffect(() => {
        if (!taskId) return;
        const dateKey = getDateKey(selectedDate);
        const savedSessions = localStorage.getItem(`task_sessions_${taskId}_${dateKey}`);
        if (savedSessions) {
            setSessions(JSON.parse(savedSessions));
        } else {
            setSessions([]);
        }
    }, [taskId, selectedDate]);

    // Timer Sync with LocalStorage
    useEffect(() => {
        if (!taskId) return;

        const syncTimer = () => {
            const savedState = localStorage.getItem(`task_timer_${taskId}`);
            if (savedState) {
                const { startTime, elapsedWhenPaused, isRunning, type } = JSON.parse(savedState);
                if (type) setSessionType(type);
                if (isRunning) {
                    setIsActive(true);
                    const now = Date.now();
                    const additionalSeconds = Math.floor((now - startTime) / 1000);
                    setTimerSeconds(elapsedWhenPaused + additionalSeconds);
                } else {
                    setTimerSeconds(elapsedWhenPaused);
                    setIsActive(false);
                }
            } else {
                setTimerSeconds(0);
                setIsActive(false);
            }
        };

        syncTimer();
        const intervalId = setInterval(() => {
            if (isActive) syncTimer();
        }, 1000);

        window.addEventListener('storage', syncTimer);
        window.addEventListener('timer-updated', syncTimer);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('storage', syncTimer);
            window.removeEventListener('timer-updated', syncTimer);
        };
    }, [taskId, isActive]);

    const handleToggleTimer = () => {
        if (!taskId) return;
        const newState = !isActive;
        const now = new Date();
        const nowISO = now.toISOString();

        if (newState) {
            // START SESSION
            setIsActive(true);

            const savedState = localStorage.getItem(`task_timer_${taskId}`);
            let elapsed = timerSeconds;
            if (savedState) {
                const parsed = JSON.parse(savedState);
                elapsed = parsed.elapsedWhenPaused;
            }

            const stateToSave = {
                startTime: now.getTime(),
                elapsedWhenPaused: elapsed,
                isRunning: true,
                sessionStartISO: nowISO,
                type: sessionType
            };
            localStorage.setItem(`task_timer_${taskId}`, JSON.stringify(stateToSave));
        } else {
            // STOP SESSION -> Save to history
            setIsActive(false);
            const savedState = localStorage.getItem(`task_timer_${taskId}`);
            if (savedState) {
                const { startTime, elapsedWhenPaused, sessionStartISO } = JSON.parse(savedState);
                const currentSessionDuration = Math.floor((now.getTime() - startTime) / 1000);

                if (currentSessionDuration > 1) { // Only save sessions > 1 sec
                    const newSession: FocusSession = {
                        id: Date.now().toString(),
                        startTime: sessionStartISO || nowISO,
                        endTime: nowISO,
                        durationSeconds: currentSessionDuration,
                        dateKey: getDateKey(selectedDate),
                        type: sessionType,
                        status: 'Completed'
                    };

                    const dateKey = getDateKey(selectedDate);
                    const updatedSessions = [newSession, ...sessions];
                    setSessions(updatedSessions);
                    localStorage.setItem(`task_sessions_${taskId}_${dateKey}`, JSON.stringify(updatedSessions));
                }

                const stateToSave = {
                    startTime: null,
                    elapsedWhenPaused: elapsedWhenPaused + currentSessionDuration,
                    isRunning: false,
                    sessionStartISO: null,
                    type: sessionType
                };
                localStorage.setItem(`task_timer_${taskId}`, JSON.stringify(stateToSave));
            }
        }
        window.dispatchEvent(new Event('timer-updated'));
    };

    const formatTime = (totalSeconds: number) => {
        if (sessionType !== 'Focus' || modeDurations['Focus'] !== null) {
            const duration = modeDurations[sessionType] || 0;
            const remaining = Math.max(0, duration - totalSeconds);
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const formatHM = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        if (m === 0) return `${seconds}s`;
        return `${m}m`;
    };

    const handleModeSelect = (type: SessionType) => {
        setSessionType(type);
        setTimerSeconds(0);
        setIsMenuOpen(false);

        // Auto-start based on settings
        const shouldStart = type === 'Focus' || autoStartBreaks;
        setIsActive(shouldStart);

        const now = new Date();
        const stateToSave = {
            startTime: now.getTime(),
            elapsedWhenPaused: 0,
            isRunning: shouldStart,
            sessionStartISO: now.toISOString(),
            type: type
        };

        localStorage.setItem(`task_timer_${taskId}`, JSON.stringify(stateToSave));
        window.dispatchEvent(new Event('timer-updated'));
    };
    const handleDeleteSession = (sessionId: string) => {
        if (window.confirm('Delete this session?')) {
            const updatedSessions = sessions.filter(s => s.id !== sessionId);
            setSessions(updatedSessions);
            if (taskId) {
                const dateKey = getDateKey(selectedDate);
                localStorage.setItem(`task_sessions_${taskId}_${dateKey}`, JSON.stringify(updatedSessions));
            }
        }
        setMenuSessionId(null);
    };


    return (
        <div className="focus-page">
            <button className="focus-back-btn" onClick={() => navigate('/')}>
                <FiChevronLeft />
            </button>
            <h1 className="focus-page-title">Focus Mode</h1>
            {/* Date Selector */}
            <DateSelector
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
            />

            {/* Main Content Area */}
            <main className="focus-content-container">
                {sessions.length === 0 && !isActive ? (
                    <div className="focus-empty-state">
                        <div className="focus-timer-circle">
                            <div className="focus-timer-inner">
                                <FiClock className="focus-large-icon" />
                            </div>
                        </div>
                        <h2 className="focus-status-text">Focus Mode</h2>
                    </div>
                ) : (
                    <div className="focus-session-list">
                        {isActive && (
                            <div className={`active-session-indicator`}>
                                <div className={`pulse-circle pulse-${sessionType === 'Focus' ? 'focus' : sessionType === 'Short Break' ? 'short' : 'long'}`}></div>
                                <span className={`text-${sessionType === 'Focus' ? 'focus' : sessionType === 'Short Break' ? 'short' : 'long'}`}>
                                    Active {sessionType}
                                </span>
                            </div>
                        )}
                        {sessions.map((session: FocusSession) => (
                            <div key={session.id} className="session-history-card">
                                <div className="session-card-icon">
                                    <FiTag />
                                </div>
                                <div className="session-card-info">
                                    <div className="session-time-range">
                                        {formatHM(session.startTime)} - {formatHM(session.endTime)}
                                    </div>
                                    <div className="session-badges">
                                        <span className={`badge badge-type-${session.type === 'Focus' ? 'focus' : session.type === 'Short Break' ? 'short' : 'long'}`}>
                                            {session.type || 'Focus'}
                                        </span>
                                        <span className="badge badge-duration">{formatDuration(session.durationSeconds)}</span>
                                        <span className="badge badge-completed">Completed</span>
                                    </div>
                                </div>
                                <div className="session-more-menu-container">
                                    <button
                                        className="session-more-btn"
                                        onClick={() => setMenuSessionId(menuSessionId === session.id ? null : session.id)}
                                    >
                                        <FiMoreVertical />
                                    </button>
                                    {menuSessionId === session.id && (
                                        <div className="session-context-menu">
                                            <button
                                                className="menu-delete-btn"
                                                onClick={() => handleDeleteSession(session.id)}
                                            >
                                                <FiTrash2 /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <div className="focus-side-actions">
                <button className="side-action-btn" onClick={() => navigate('/journal')} title="Journal"><FiEdit3 /></button>
                <button
                    className={`side-action-btn ${isMenuOpen ? 'active menu-open' : ''}`}
                    onClick={() => {
                        setIsMenuOpen(!isMenuOpen);
                        setIsSettingsOpen(false);
                    }}
                    title="Change Mode"
                >
                    <FiClock />
                </button>
                <button
                    className={`side-action-btn ${isSettingsOpen ? 'active' : ''}`}
                    onClick={() => {
                        setIsSettingsOpen(!isSettingsOpen);
                        setIsMenuOpen(false);
                    }}
                    title="Focus Settings"
                >
                    <FiSettings />
                </button>
            </div>

            {/* Mode Selection Menu */}
            {isMenuOpen && (
                <>
                    <div className="mode-menu-overlay" onClick={() => setIsMenuOpen(false)}></div>
                    <div className="mode-menu">
                        <div className="menu-header">
                            <span>Select Mode</span>
                            <button className="close-menu" onClick={() => setIsMenuOpen(false)}><FiX /></button>
                        </div>
                        <button
                            className={`mode-menu-item ${sessionType === 'Focus' ? 'active' : ''}`}
                            onClick={() => handleModeSelect('Focus')}
                        >
                            <span className="mode-dot mode-focus"></span>
                            Focus ({modeDurations['Focus'] ? `${modeDurations['Focus'] / 60}:00` : '∞'})
                        </button>
                        <button
                            className={`mode-menu-item ${sessionType === 'Short Break' ? 'active' : ''}`}
                            onClick={() => handleModeSelect('Short Break')}
                        >
                            <span className="mode-dot mode-short"></span>
                            Short Break ({(modeDurations['Short Break'] || 300) / 60}:00)
                        </button>
                        <button
                            className={`mode-menu-item ${sessionType === 'Long Break' ? 'active' : ''}`}
                            onClick={() => handleModeSelect('Long Break')}
                        >
                            <span className="mode-dot mode-long"></span>
                            Long Break ({(modeDurations['Long Break'] || 1800) / 60}:00)
                        </button>
                    </div>
                </>
            )}

            {/* Focus Settings Overlay */}
            {isSettingsOpen && (
                <>
                    <div className="mode-menu-overlay" onClick={() => setIsSettingsOpen(false)}></div>
                    <div className="mode-menu focus-settings-menu">
                        <div className="menu-header">
                            <span>Focus Settings</span>
                            <button className="close-menu" onClick={() => setIsSettingsOpen(false)}><FiX /></button>
                        </div>

                        <div className="setting-group">
                            <label>Focus Duration</label>
                            <div className="setting-opts">
                                {[
                                    { label: '∞', value: null },
                                    { label: '25m', value: 1500 },
                                    { label: '45m', value: 2700 },
                                    { label: '60m', value: 3600 }
                                ].map(opt => (
                                    <button
                                        key={opt.label}
                                        className={`opt-btn ${modeDurations['Focus'] === opt.value ? 'active' : ''}`}
                                        onClick={() => updateGlobalSetting('focusDuration', opt.value)}
                                    >
                                        {modeDurations['Focus'] === opt.value && <FiCheck className="check-icon" />}
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="setting-group">
                            <label>Short Break</label>
                            <div className="setting-opts">
                                {[
                                    { label: '5m', value: 300 },
                                    { label: '10m', value: 600 },
                                    { label: '15m', value: 900 }
                                ].map(opt => (
                                    <button
                                        key={opt.label}
                                        className={`opt-btn ${modeDurations['Short Break'] === opt.value ? 'active' : ''}`}
                                        onClick={() => updateGlobalSetting('shortBreakDuration', opt.value)}
                                    >
                                        {modeDurations['Short Break'] === opt.value && <FiCheck className="check-icon" />}
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="setting-group">
                            <label>Long Break</label>
                            <div className="setting-opts">
                                {[
                                    { label: '15m', value: 900 },
                                    { label: '30m', value: 1800 },
                                    { label: '45m', value: 2700 }
                                ].map(opt => (
                                    <button
                                        key={opt.label}
                                        className={`opt-btn ${modeDurations['Long Break'] === opt.value ? 'active' : ''}`}
                                        onClick={() => updateGlobalSetting('longBreakDuration', opt.value)}
                                    >
                                        {modeDurations['Long Break'] === opt.value && <FiCheck className="check-icon" />}
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="setting-item-toggle">
                            <div className="toggle-info">
                                <span>Auto-start Breaks</span>
                                <p>Start timer automatically when selected</p>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={autoStartBreaks}
                                    onChange={(e) => updateGlobalSetting('autoStartBreaks', e.target.checked)}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </>
            )}

            {/* Mini Player */}
            <div className="focus-mini-player-container">
                <div className="focus-mini-player">
                    <div className="player-left">
                        <div className={`player-time-badge mode-bg-${sessionType === 'Focus' ? 'focus' : sessionType === 'Short Break' ? 'short' : 'long'}`}>
                            <FiClock />
                            <span>{formatTime(timerSeconds)}</span>
                        </div>
                        <div className="player-task-info">
                            <span className="player-task-name">{task?.title || 'Focus'}</span>
                            <span className="player-task-status">({isActive ? 'Active' : 'Paused'})</span>
                        </div>
                    </div>
                    <button className={`player-play-btn mode-bg-${sessionType === 'Focus' ? 'focus' : sessionType === 'Short Break' ? 'short' : 'long'}`} onClick={handleToggleTimer}>
                        {isActive ? <FiPause /> : <FiPlay />}
                    </button>
                </div>
            </div>

            {/* Bottom Nav Mockup */}
            <nav className="focus-bottom-nav">
                <button className="bottom-nav-item active" onClick={() => navigate('/')}>
                    <span className="nav-icon">📅</span>
                    <span className="nav-label">Today</span>
                </button>
                <button className="bottom-nav-item" onClick={() => navigate('/focus-stats')}>
                    <span className="nav-icon">📊</span>
                    <span className="nav-label">Statistics</span>
                </button>
                <button className="bottom-nav-item" onClick={() => navigate('/settings')}>
                    <span className="nav-icon">⚙️</span>
                    <span className="nav-label">Settings</span>
                </button>
            </nav>
        </div>
    );
};

export default FocusPage;
