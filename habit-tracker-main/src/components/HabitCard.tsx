import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { Habit } from '../types/habit';
import { FiCheck } from 'react-icons/fi';
import { DashboardView } from './HabitDashboard';
import { getDateKey } from '../utils/storage';
import './HabitCard.css';

interface HabitCardProps {
    habit: Habit;
    view: DashboardView;
    onToggle: (habitId: string, date: Date) => void;
    isCompleted: (habitId: string, date: Date) => boolean;
}

function HabitCard({ habit, view, onToggle, isCompleted }: HabitCardProps) {
    const navigate = useNavigate();
    const today = new Date();



    const isTodayCompleted = isCompleted(habit.id, today);

    // --- View Specific Data Helpers ---

    // Weekly: Get last 7 days (or current week Mon-Sun)
    const getWeeklyDays = () => {
        const days = [];
        // Start from Monday of current week
        const currentDay = today.getDay(); // 0 is Sunday
        const distanceToMon = currentDay === 0 ? 6 : currentDay - 1;
        const monday = new Date(today);
        monday.setDate(today.getDate() - distanceToMon);

        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            days.push(d);
        }
        return days;
    };

    // Monthly: Get days for current month grid (5x6 approx)
    const getMonthlyDays = () => {
        const days = [];
        const year = today.getFullYear();
        const month = today.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    }

    // Overall: Get last 90 days for heatmap
    const getOverallDays = () => {
        const days = [];
        for (let i = 89; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            days.push(d);
        }
        return days;
    }

    // Today mini grid (just a visual pattern for now, or last 2 weeks?)
    // User image showed a mini grid. Let's show last 28 days for "Today" tab visualization
    const getTodayGridDays = () => {
        const days = [];
        for (let i = 27; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            days.push(d);
        }
        return days;
    }


    const renderTodayView = () => {
        return null;
    };

    const renderWeeklyView = () => {
        const days = getWeeklyDays();
        const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        return (
            <div className="weekly-row">
                <div className="week-headers">
                    {daysOfWeek.map(d => <span key={d}>{d}</span>)}
                </div>
                <div className="week-checks">
                    {days.map((date, idx) => {
                        const done = isCompleted(habit.id, date);
                        const isCurrentDay = getDateKey(date) === getDateKey(today);

                        return (
                            <div
                                key={idx}
                                className={`week-circle ${done ? 'checked' : ''} ${isCurrentDay ? 'current' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggle(habit.id, date);
                                }}
                            >
                                {date.getDate()}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    };

    const renderMonthlyView = () => {
        const days = getMonthlyDays();
        return (
            <div className="monthly-grid">
                {days.map((date, idx) => {
                    const done = isCompleted(habit.id, date);
                    return (
                        <div
                            key={idx}
                            className={`month-cell ${done ? 'filled' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggle(habit.id, date);
                            }}
                        >
                            {date.getDate()}
                        </div>
                    )
                })}
            </div>
        )
    };

    const renderOverallView = () => {
        const days = getOverallDays();
        return (
            <div className="overall-heatmap-container">
                <div className="overall-heatmap">
                    {days.map((date, idx) => {
                        const done = isCompleted(habit.id, date);
                        return (
                            <div
                                key={idx}
                                className={`heatmap-cell ${done ? 'filled' : ''}`}
                                title={date.toDateString()}
                            >
                                {date.getDate()}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    };

    const streakDays = habit.streak || 0;

    return (
        <div
            className="habit-card-modern"
            onClick={() => navigate(`/habits/${habit.id}`)}
            style={{ cursor: 'pointer' }}
        >
            <div className="card-header">
                <div className="habit-info-left">
                    <div className="habit-icon-box" style={{ backgroundColor: habit.color + '20' }}>
                        <span style={{ color: habit.color }}>
                            {habit.icon || '📝'}
                        </span>
                    </div>
                    <div className="habit-text-box">
                        <h3 className="habit-name">{habit.name}</h3>
                        <span className="habit-streak">
                            🔥 {streakDays} Days <span style={{ opacity: 0.6, margin: '0 4px' }}>|</span> {today.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                    </div>
                </div>


                <div className="habit-action-right">
                    <button
                        className={`main-check-btn ${isTodayCompleted ? 'completed' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggle(habit.id, today);
                        }}
                    >
                        <FiCheck />
                    </button>
                </div>
            </div>

            <div className="card-body-visual">
                {view === 'today' && renderTodayView()}
                {view === 'weekly' && renderWeeklyView()}
                {view === 'monthly' && renderMonthlyView()}
                {view === 'overall' && renderOverallView()}
            </div>

            {view === 'weekly' && <span className="view-label">Everyday</span>}
        </div >
    );
}

export default HabitCard;
