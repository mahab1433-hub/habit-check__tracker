import { useEffect, useState } from 'react';
import { Habit } from '../types';
import { loadTasks, getDateKey } from '../utils/storage';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line
} from 'recharts';
import './StatsView.css';

interface StatsData {
  // Overview Data
  overviewData: { name: string; Total: number; Completed: number }[];

  // Daily Data
  dailyData: { name: string; Goal: number; Actual: number }[];
  todaySuccessRate: number;

  // Weekly Data
  weeklyData: { day: string; Habits: number; Tasks: number }[];

  // Monthly Data
  monthlyData: { week: string; Completion: number }[];
  monthlyConsistency: number;

  // Task Data
  taskStatusData: { name: string; value: number }[];

  // Streaks & Motivation
  currentStreak: number;
  longestStreak: number;

  // Mood Data
  moodDistribution: { name: string; value: number; color: string }[];
  moodTrend: { day: string; rating: number; color: string }[];

  // Habit Tracking Data
  habitTrackingData: { name: string; value: number; color: string }[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface StatsViewProps {
  habits: Habit[];
  selectedDate: Date;
}

function StatsView({ habits, selectedDate }: StatsViewProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    calculateStats();

    const handleStorageChange = () => calculateStats();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [habits, selectedDate]);

  const calculateStats = () => {
    const tasks = loadTasks();
    const today = new Date();
    const todayKey = getDateKey(today);

    // For Daily Performance, use selected Date
    const selectedKey = getDateKey(selectedDate);
    // Is selectedDate "Today"?
    const isTodaySelected = selectedKey === todayKey;

    // --- Overview Data (Keep global/today?) ---
    // User said "overview and weekly progress remains same". 
    // Usually Overview is "Total vs Completed (Today)". 
    // If we want Overview to be consistent with "Today's Performance", maybe it should stay "Today".
    // User said "if i select the date... that day analytics only show".
    // AND "overview and weekly progress remains same".
    // So Overview and Weekly should use ACTUAL Today.
    // Daily Performance should use SELECTED Date.

    const totalHabits = habits.length;
    const totalTasks = tasks.length;

    // Overview uses TODAY always? "Overview" typically implies general status.
    // Let's keep Overview as TODAY based on request "remains same".
    const completedHabitsOverview = habits.filter(h => h.completedDates.has(todayKey)).length;
    const completedTasksOverview = tasks.filter(t => t.status === 'Completed').length; // This is ALL TIME tasks completed? 
    // In previous code:
    // const completedTasks = tasks.filter(t => t.status === 'Completed').length;

    const overviewData = [
      { name: 'Habits', Total: totalHabits, Completed: completedHabitsOverview },
      { name: 'Tasks', Total: totalTasks, Completed: completedTasksOverview },
    ];

    // --- Daily Data (Selected Date) ---
    // Use selectedDate for this specific chart
    const habitsSelectedDate = habits.filter(h => h.completedDates.has(selectedKey)).length;
    const tasksSelectedDate = tasks.filter(t => t.status === 'Completed' && t.dueDate === selectedKey).length;

    // Tasks Goal for selected date
    const tasksGoalSelected = tasks.filter(t => t.status !== 'Completed' || t.dueDate === selectedKey).length;

    const dailyData = [
      { name: 'Habits', Goal: totalHabits, Actual: habitsSelectedDate },
      { name: 'Tasks', Goal: tasksGoalSelected, Actual: tasksSelectedDate },
    ];

    const dailySuccessRate = Math.round(
      ((habitsSelectedDate + tasksSelectedDate) / (totalHabits + tasks.length || 1)) * 100
    );

    // --- Weekly Data ---
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 6); // Last 7 days

    const weeklyData = Array(7).fill(0).map((_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateKey = getDateKey(date);
      const dayHabits = habits.filter(h => h.completedDates.has(dateKey)).length;
      const dayTasks = tasks.filter(t => t.status === 'Completed' && t.dueDate === dateKey).length;
      return {
        day: DAYS[date.getDay()],
        Habits: dayHabits,
        Tasks: dayTasks
      };
    });

    // --- Monthly Data (Weekly breakdown) ---
    // Let's show last 4 weeks
    const monthlyData = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7) - 6);
      const weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() - (i * 7));

      let weekCompletions = 0;
      // Loop days in this week chunk
      for (let d = 0; d < 7; d++) {
        const dDate = new Date(weekStart);
        dDate.setDate(weekStart.getDate() + d);
        const k = getDateKey(dDate);
        weekCompletions += habits.filter(h => h.completedDates.has(k)).length;
        weekCompletions += tasks.filter(t => t.status === 'Completed' && t.dueDate === k).length;
      }
      monthlyData.push({
        week: `W${4 - i}`,
        Completion: weekCompletions
      });
    }

    // Monthly consistency
    const daysInMonth = 30;
    const daysCompleted = new Set(
      habits.flatMap(h => Array.from(h.completedDates))
        .concat(tasks.filter(t => t.status === 'Completed' && t.dueDate).map(t => t.dueDate!))
        .filter(d => {
          const diff = (today.getTime() - new Date(d).getTime()) / (1000 * 3600 * 24);
          return diff <= 30 && diff >= 0;
        })
    ).size;
    const monthlyConsistency = Math.round((daysCompleted / daysInMonth) * 100);


    // --- Task Data ---
    const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;
    const overdueTasks = tasks.filter(t => t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) < today).length;

    // --- Mood Analytics ---
    const MOOD_COLORS = {
      1: '#ef4444', // Awful
      2: '#f97316', // Bad
      3: '#eab308', // Meh
      4: '#4ade80', // Good
      5: '#22c55e'  // Rad
    };

    const MOOD_LABELS = {
      1: 'Awful',
      2: 'Bad',
      3: 'Meh',
      4: 'Good',
      5: 'Rad'
    };

    // 1. Mood Log (Last 10 days for trend)
    const moodTrend = [];
    for (let i = 9; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const k = getDateKey(d);
      const feedbackStr = localStorage.getItem(`daily_journal_${k}`);
      if (feedbackStr) {
        const fb = JSON.parse(feedbackStr);
        moodTrend.push({
          day: DAYS[d.getDay()],
          rating: fb.rating,
          color: MOOD_COLORS[fb.rating as keyof typeof MOOD_COLORS]
        });
      } else {
        // Optional: Push null or 0 if no data? Or skip?
        // Charts usually handle gaps better if we skip or strictly handle 'null'. 
        // For line chart 'connectNulls', let's see. 
        // The user image shows connected lines. Let's assume we skip missing days or put them as null.
        // If we want a continuous x-axis, we should push object with null rating.
        moodTrend.push({
          day: DAYS[d.getDay()],
          rating: 0, // 0 for no data
          color: 'transparent'
        });
      }
    }
    // Filter out 0s for the line if we want to just connect existing points? 
    // Actually, Recharts Line `connectNulls` is useful. But here we have 0.
    // Let's filter out the 0s for now to just show dots for days we have data, 
    // BUT the X-axis needs to remain continuous.
    // So we keep them, but maybe handle in rendering.

    // 2. Mood Distribution (Last 30 days)
    const moodCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const k = getDateKey(d);
      const feedbackStr = localStorage.getItem(`daily_journal_${k}`);
      if (feedbackStr) {
        const fb = JSON.parse(feedbackStr);
        if (fb.rating >= 1 && fb.rating <= 5) {
          moodCounts[fb.rating as keyof typeof moodCounts]++;
        }
      }
    }

    const moodDistribution = Object.entries(moodCounts)
      .filter(([_, count]) => count > 0)
      .map(([rating, count]) => ({
        name: MOOD_LABELS[parseInt(rating) as keyof typeof MOOD_LABELS],
        value: count,
        color: MOOD_COLORS[parseInt(rating) as keyof typeof MOOD_COLORS]
      }));



    // --- Habit Tracking Data ---
    const HABIT_PALETTE = ['#10b981', '#facc15', '#f97316', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1'];
    const habitTrackingData = habits.map((h, index) => ({
      name: h.name,
      value: h.completedDates.size,
      color: h.color || HABIT_PALETTE[index % HABIT_PALETTE.length]
    })).filter(h => true); // Show all habits, even with 0 completions
    // User image shows segments. If 0, it won't show in Pie anyway. 
    // But for legend, maybe we want to show all? 
    // Recharts Pie ignores 0 values usually. Let's keep them if we want legend to show everything, 
    // or filter if we only want active ones. 
    // Let's filter > 0 for a cleaner chart, or keep all for complete visibility.
    // Given "exact etha mari" (exactly like this), the image shows specific items. 
    // I'll keep all for the legend, but Pie might look weird if all are 0.
    // Let's actually filter for the chart data, or ensure the chart handles 0 gracefully.
    // If I filter, the legend will only show active ones.
    // Let's filter > 0.

    // For Bar chart: Name: Status, Value: count
    const taskStatusData = [
      { name: 'Completed', value: completedTasksOverview },
      { name: 'Pending', value: pendingTasks },
      { name: 'Overdue', value: overdueTasks },
    ];

    setStats({
      overviewData,
      dailyData,
      todaySuccessRate: dailySuccessRate, // Renamed but keeping property name for now or refactor interface?
      // Interface has 'todaySuccessRate', let's just assign 'dailySuccessRate' to it.
      weeklyData,
      monthlyData,
      monthlyConsistency,
      taskStatusData,
      currentStreak: 0, // Placeholder
      longestStreak: 0, // Placeholder
      moodDistribution,
      moodTrend,
      habitTrackingData
    });
    setIsLoading(false);
  };

  if (isLoading) return <div className="stats-view loading"><h2>Loading Statistics...</h2></div>;
  if (!stats) return <div className="stats-view"><h2>No Data</h2></div>;

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string; }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="stats-view">
      <h2>Your Statistics</h2>

      <div className="stats-grid-container">
        {/* Overview Section */}
        <section className="stats-section-card">
          <h3>📊 Overview</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.overviewData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Legend />
                <Bar dataKey="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Today's Performance */}
        <section className="stats-section-card">
          <h3>📅 Today's Performance</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.dailyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Legend />
                <Bar dataKey="Goal" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Weekly Analysis */}
        <section className="stats-section-card full-width">
          <h3>📆 Weekly Analysis (Last 7 Days)</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.weeklyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Legend />
                <Bar dataKey="Habits" stackId="a" fill="#8b5cf6" radius={[0, 0, 4, 4]} />
                <Bar dataKey="Tasks" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>



        {/* Task Productivity */}
        <section className="stats-section-card">
          <h3>📋 Task Productivity</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.taskStatusData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Legend />
                <Bar dataKey="value" name="Tasks" fill="#ef4444" radius={[0, 4, 4, 0]}>
                  {stats.taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      entry.name === 'Completed' ? '#10b981' :
                        entry.name === 'Pending' ? '#f59e0b' :
                          '#ef4444'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Habit Tracking Breakdown */}
        <section className="stats-section-card">
          <h3>🎯 Habit Tracking</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.habitTrackingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.habitTrackingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Mood Distribution */}
        <section className="stats-section-card">
          <h3>🎭 Mood Distribution (Last 30 Days)</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.moodDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.moodDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Mood Trend */}
        <section className="stats-section-card full-width">
          <h3>📈 Mood Trend (Last 10 Days)</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.moodTrend.filter(d => d.rating > 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" />
                {/* Y Axis hidden or 0-6 */}
                <YAxis domain={[0, 6]} hide />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    return (
                      <circle cx={cx} cy={cy} r={6} fill={payload.color} stroke="none" />
                    );
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="motivation-section">
        <h3>💪 Keep It Up!</h3>
        <p className="motivation-text">
          {stats.todaySuccessRate > 50 ? "You're doing great! Keep building those habits!" : "Every small step counts. Go for it!"}
        </p>
      </section>
    </div>
  );
}

export default StatsView;
