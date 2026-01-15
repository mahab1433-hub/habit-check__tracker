import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft } from 'react-icons/fi';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { getDateKey } from '../utils/storage';
import './FocusStatsPage.css';

interface FocusSession {
    id: string;
    startTime: string;
    endTime: string;
    durationSeconds: number;
    dateKey: string;
    type?: 'Focus' | 'Short Break' | 'Long Break';
    status?: 'Completed' | 'Interrupted';
}

type TimeRange = 'Day' | 'Week' | 'Month' | 'Year' | 'All Time';

const FocusStatsPage: React.FC = () => {
    const navigate = useNavigate();
    const [timeRange, setTimeRange] = useState<TimeRange>('Week');
    const [allSessions, setAllSessions] = useState<FocusSession[]>([]);

    useEffect(() => {
        const sessions: FocusSession[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('task_sessions_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key) || '[]');
                    sessions.push(...data);
                } catch (e) {
                    console.error("Error parsing sessions for key:", key, e);
                }
            }
        }
        setAllSessions(sessions);
    }, []);

    const filteredData = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        return allSessions.filter(s => {
            const sessionDate = new Date(s.startTime);
            if (timeRange === 'Day') {
                return getDateKey(sessionDate) === getDateKey(now);
            } else if (timeRange === 'Week') {
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - 6);
                return sessionDate >= startOfWeek;
            } else if (timeRange === 'Month') {
                const startOfMonth = new Date(now);
                startOfMonth.setDate(now.getDate() - 29);
                return sessionDate >= startOfMonth;
            } else if (timeRange === 'Year') {
                const startOfYear = new Date(now);
                startOfYear.setFullYear(now.getFullYear() - 1);
                return sessionDate >= startOfYear;
            }
            return true;
        });
    }, [allSessions, timeRange]);

    const chartData = useMemo(() => {
        interface ModeData {
            focus: number;
            short: number;
            long: number;
        }
        const dataMap: { [key: string]: ModeData } = {};

        if (timeRange === 'Week') {
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dayLabel = date.getDate() + ' ' + date.toLocaleDateString('en-US', { month: 'short' });
                dataMap[dayLabel] = { focus: 0, short: 0, long: 0 };
            }
        }

        filteredData.forEach(s => {
            const date = new Date(s.startTime);
            let label = '';
            if (timeRange === 'Day') {
                label = date.getHours() + ':00';
            } else if (timeRange === 'Week' || timeRange === 'Month') {
                label = date.getDate() + ' ' + date.toLocaleDateString('en-US', { month: 'short' });
            } else if (timeRange === 'Year') {
                label = date.toLocaleDateString('en-US', { month: 'short' });
            } else {
                label = date.toLocaleDateString();
            }

            if (!dataMap[label]) {
                dataMap[label] = { focus: 0, short: 0, long: 0 };
            }

            const mins = Math.floor(s.durationSeconds / 60);
            if (s.type === 'Short Break') {
                dataMap[label].short += mins;
            } else if (s.type === 'Long Break') {
                dataMap[label].long += mins;
            } else {
                dataMap[label].focus += mins;
            }
        });

        return Object.entries(dataMap).map(([name, counts]) => ({
            name,
            ...counts
        }));
    }, [filteredData, timeRange]);

    const statsMetrics = useMemo(() => {
        const totalMins = filteredData.reduce((acc, s) => acc + Math.floor(s.durationSeconds / 60), 0);
        const sessionsCount = filteredData.length;
        const completedCount = filteredData.filter(s => s.status === 'Completed' || !s.status).length;
        const interruptedCount = filteredData.filter(s => s.status === 'Interrupted').length;
        const focusMins = filteredData.filter(s => s.type === 'Focus' || !s.type).reduce((acc, s) => acc + Math.floor(s.durationSeconds / 60), 0);
        const shortBreakMins = filteredData.filter(s => s.type === 'Short Break').reduce((acc, s) => acc + Math.floor(s.durationSeconds / 60), 0);
        const longBreakMins = filteredData.filter(s => s.type === 'Long Break').reduce((acc, s) => acc + Math.floor(s.durationSeconds / 60), 0);

        return {
            totalMins,
            sessionsCount,
            completedCount,
            interruptedCount,
            focusMins,
            shortBreakMins,
            longBreakMins
        };
    }, [filteredData]);

    const formatDuration = (mins: number) => {
        if (mins < 60) return `${mins}m`;
        const hrs = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        return `${hrs}h ${remainingMins}m`;
    };

    const distributionData = [
        { name: 'Focus', value: statsMetrics.focusMins || 1, color: '#007bff' },
        { name: 'Short Break', value: statsMetrics.shortBreakMins || 0, color: '#28a745' },
        { name: 'Long Break', value: statsMetrics.longBreakMins || 0, color: '#8b5cf6' },
        { name: 'Interrupted', value: statsMetrics.interruptedCount * 5 || 0, color: '#ffc107' } // Weight for visualization
    ].filter(item => item.value > 0);

    return (
        <div className="focus-stats-page">
            <header className="stats-header">
                <button className="stats-back-btn" onClick={() => navigate(-1)}>
                    <FiChevronLeft />
                </button>
                <h1>Statistics</h1>
                <div style={{ width: 44 }}></div>
            </header>

            <div className="time-range-tabs">
                {(['Day', 'Week', 'Month', 'Year', 'All Time'] as TimeRange[]).map(range => (
                    <button
                        key={range}
                        className={`range-tab ${timeRange === range ? 'active' : ''}`}
                        onClick={() => setTimeRange(range)}
                    >
                        {range}
                    </button>
                ))}
            </div>

            <main className="stats-content">
                <section className="stats-card trend-card">
                    <h3>Focus Mode</h3>
                    <p className="card-subtitle">Focus time over time</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                                dataKey="name"
                                stroke="rgba(255,255,255,0.3)"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="rgba(255,255,255,0.3)"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                unit="m"
                            />
                            <Tooltip
                                contentStyle={{ background: '#1c1c1e', border: 'none', borderRadius: '8px' }}
                                itemStyle={{ color: '#007bff' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="focus"
                                stroke="#007bff"
                                strokeWidth={3}
                                dot={{ r: 4, fill: '#007bff', strokeWidth: 2, stroke: '#000' }}
                                activeDot={{ r: 6 }}
                                name="Focus"
                            />
                            <Line
                                type="monotone"
                                dataKey="short"
                                stroke="#28a745"
                                strokeWidth={3}
                                dot={{ r: 4, fill: '#28a745', strokeWidth: 2, stroke: '#000' }}
                                activeDot={{ r: 6 }}
                                name="Short Break"
                            />
                            <Line
                                type="monotone"
                                dataKey="long"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#000' }}
                                activeDot={{ r: 6 }}
                                name="Long Break"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                    <div className="chart-legend">
                        <span className="legend-item"><span className="dot focus"></span> Focus</span>
                        <span className="legend-item"><span className="dot short"></span> Short Breaks</span>
                        <span className="legend-item"><span className="dot long"></span> Long Breaks</span>
                    </div>
                </section>

                <section className="stats-card distribution-card">
                    <h3>Weekly Progress</h3>
                    <p className="card-subtitle">Time and Session Analysis</p>

                    <div className="donut-chart-container">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={distributionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="donut-center-label">
                            <span className="total-value">{formatDuration(statsMetrics.totalMins)}</span>
                            <span className="total-label">Total Focus</span>
                        </div>
                    </div>

                    <div className="category-list">
                        <div className="category-item">
                            <span className="cat-dot" style={{ backgroundColor: '#007bff' }}></span>
                            <span className="cat-name">Sessions</span>
                            <span className="cat-value">{statsMetrics.sessionsCount}</span>
                        </div>
                        <div className="category-item">
                            <span className="cat-dot" style={{ backgroundColor: '#28a745' }}></span>
                            <span className="cat-name">Completed</span>
                            <span className="cat-value">{statsMetrics.completedCount}</span>
                        </div>
                        <div className="category-item">
                            <span className="cat-dot" style={{ backgroundColor: '#ffc107' }}></span>
                            <span className="cat-name">Interrupted</span>
                            <span className="cat-value">{statsMetrics.interruptedCount}</span>
                        </div>
                        <div className="category-item">
                            <span className="cat-dot" style={{ backgroundColor: '#007bff' }}></span>
                            <span className="cat-name">Focus</span>
                            <span className="cat-value">{formatDuration(statsMetrics.focusMins)}</span>
                        </div>
                        <div className="category-item">
                            <span className="cat-dot" style={{ backgroundColor: '#28a745' }}></span>
                            <span className="cat-name">Short Break</span>
                            <span className="cat-value">{formatDuration(statsMetrics.shortBreakMins)}</span>
                        </div>
                        <div className="category-item">
                            <span className="cat-dot" style={{ backgroundColor: '#8b5cf6' }}></span>
                            <span className="cat-name">Long Break</span>
                            <span className="cat-value">{formatDuration(statsMetrics.longBreakMins)}</span>
                        </div>
                    </div>
                    <p className="hint-text">Tap a category to highlight</p>
                </section>
            </main>
        </div>
    );
};

export default FocusStatsPage;
