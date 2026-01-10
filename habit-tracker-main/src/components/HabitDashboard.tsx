import { useState } from 'react';
import { Habit } from '../types/habit';
import HabitCard from './HabitCard';
import './HabitDashboard.css';

interface HabitDashboardProps {
    habits: Habit[];
    onToggle: (habitId: string, date: Date) => void;
    isCompleted: (habitId: string, date: Date) => boolean;
}

export type DashboardView = 'today' | 'weekly' | 'monthly' | 'overall';

function HabitDashboard({ habits, onToggle, isCompleted }: HabitDashboardProps) {
    const [currentView, setCurrentView] = useState<DashboardView>('today');

    const tabs: { id: DashboardView; label: string }[] = [
        { id: 'today', label: 'Today' },
        { id: 'weekly', label: 'Weekly' },
        { id: 'monthly', label: 'Monthly' },
        { id: 'overall', label: 'Overall' },
    ];

    return (
        <div className="habit-dashboard">
            <div className="dashboard-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab-item ${currentView === tab.id ? 'active' : ''}`}
                        onClick={() => setCurrentView(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="dashboard-content">
                {habits.length === 0 ? (
                    <div className="empty-dashboard">
                        <p>No habits yet. Add one to get started!</p>
                    </div>
                ) : (
                    habits.map((habit) => (
                        <HabitCard
                            key={habit.id}
                            habit={habit}
                            view={currentView}
                            onToggle={onToggle}
                            isCompleted={isCompleted}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

export default HabitDashboard;
