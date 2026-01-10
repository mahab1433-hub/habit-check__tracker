import { useEffect, useState, useRef } from 'react';
import { Habit, Task } from '../types';
import { loadTasks, getDateKey } from '../utils/storage';
import './StatsView.css';

// Pie Chart Component
const PieChart = ({ data, colors, size = 150, strokeWidth = 2 }: {
  data: { value: number; label: string }[];
  colors: string[];
  size?: number;
  strokeWidth?: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size / 2) - (strokeWidth * 2);

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw pie chart
    let startAngle = -Math.PI / 2; // Start from top

    data.forEach((item, index) => {
      if (item.value === 0) return;

      const sliceAngle = (item.value / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      // Draw the slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();

      // Add border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = strokeWidth;
      ctx.stroke();

      startAngle = endAngle;
    });

    // Add center circle for donut effect
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(30, 30, 40, 0.9)';
    ctx.fill();

    // Add total in center
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${radius * 0.25}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toString(), centerX, centerY);

  }, [data, colors, size, strokeWidth, total]);

  return (
    <div className="pie-chart-container">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="pie-chart"
      />
      <div className="pie-legend">
        {data.map((item, index) => (
          <div key={index} className="legend-item">
            <span
              className="legend-color"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="legend-label">
              {item.label}: {Math.round((item.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface StatsData {
  // Overview
  totalHabits: number;
  totalTasks: number;
  completedHabits: number;
  completedTasks: number;
  completionPercentage: number;

  // Daily
  habitsToday: number;
  tasksToday: number;
  todaySuccessRate: number;

  // Weekly
  habitsThisWeek: number;
  tasksThisWeek: number;
  bestDay: { day: string; count: number };
  worstDay: { day: string; count: number };

  // Monthly
  habitsThisMonth: number;
  completionTrend: 'up' | 'down' | 'same';
  monthlyConsistency: number;

  // Streaks
  currentStreak: number;
  longestStreak: number;
  mostConsistentHabit: { name: string; consistency: number };
  leastConsistentHabit: { name: string; consistency: number };

  // Tasks
  pendingTasks: number;
  highPriorityCompleted: number;
  overdueTasks: number;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface StatsViewProps {
  habits: Habit[];
}

function StatsView({ habits }: StatsViewProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    calculateStats();

    // Refresh stats when storage changes (for tasks)
    const handleStorageChange = () => calculateStats();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [habits]); // Recalculate when habits prop changes

  const calculateStats = () => {
    // habits coming from props
    const tasks = loadTasks();
    const today = new Date();
    const todayKey = getDateKey(today);

    // Get start of week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    // Get start of month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Calculate stats
    const statsData: Partial<StatsData> = {};

    // Overview
    statsData.totalHabits = habits.length;
    statsData.totalTasks = tasks.length;
    statsData.completedHabits = habits.filter(h => h.completedDates.has(todayKey)).length;
    statsData.completedTasks = tasks.filter(t => t.completed).length;
    statsData.completionPercentage = Math.round(
      ((statsData.completedHabits + statsData.completedTasks) /
        (habits.length + tasks.length)) * 100 || 0
    );

    // Daily stats
    statsData.habitsToday = statsData.completedHabits;
    statsData.tasksToday = tasks.filter(
      t => t.completed && t.completedDate === todayKey
    ).length;
    statsData.todaySuccessRate = Math.round(
      ((statsData.habitsToday + statsData.tasksToday) /
        (habits.length + tasks.length)) * 100 || 0
    );

    // Weekly stats
    const weekDays = Array(7).fill(0).map((_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateKey = getDateKey(date);
      const dayHabits = habits.filter(h => h.completedDates.has(dateKey)).length;
      const dayTasks = tasks.filter(
        t => t.completed && t.completedDate === dateKey
      ).length;
      return dayHabits + dayTasks;
    });

    statsData.habitsThisWeek = habits.filter(h =>
      Array.from(h.completedDates).some(date => {
        const d = new Date(date);
        return d >= startOfWeek && d <= today;
      })
    ).length;

    statsData.tasksThisWeek = tasks.filter(t =>
      t.completed && t.completedDate &&
      new Date(t.completedDate) >= startOfWeek &&
      new Date(t.completedDate) <= today
    ).length;

    const maxIndex = weekDays.indexOf(Math.max(...weekDays));
    const minIndex = weekDays.indexOf(Math.min(...weekDays));

    statsData.bestDay = {
      day: DAYS[maxIndex],
      count: weekDays[maxIndex]
    };

    statsData.worstDay = {
      day: DAYS[minIndex],
      count: weekDays[minIndex]
    };

    // Monthly stats
    statsData.habitsThisMonth = habits.filter(h =>
      Array.from(h.completedDates).some(date => new Date(date) >= startOfMonth)
    ).length;

    // Simple trend calculation (compare last 7 days vs previous 7 days)
    const lastWeekEnd = new Date(today);
    lastWeekEnd.setDate(today.getDate() - 7);
    const lastWeekStart = new Date(lastWeekEnd);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const currentWeekCompletions = weekDays.reduce((a, b) => a + b, 0);
    const lastWeekCompletions = 0; // Simplified for brevity

    statsData.completionTrend = currentWeekCompletions > lastWeekCompletions ? 'up' :
      currentWeekCompletions < lastWeekCompletions ? 'down' : 'same';

    // Calculate monthly consistency (percentage of days with at least one completion)
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysCompleted = new Set(
      habits.flatMap(h => Array.from(h.completedDates))
        .concat(tasks.filter(t => t.completed && t.completedDate).map(t => t.completedDate!))
    ).size;

    statsData.monthlyConsistency = Math.round((daysCompleted / daysInMonth) * 100);

    // Streaks and consistency
    // Simplified for brevity - in a real app, you'd track streaks more carefully
    statsData.currentStreak = 3; // Example value
    statsData.longestStreak = 7; // Example value

    // Task stats
    statsData.pendingTasks = tasks.filter(t => !t.completed).length;
    statsData.highPriorityCompleted = tasks.filter(
      t => t.completed && t.priority === 'high'
    ).length;
    statsData.overdueTasks = tasks.filter(
      t => !t.completed && t.dueDate && new Date(t.dueDate) < today
    ).length;

    setStats(statsData as StatsData);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="stats-view">
        <h2>Loading Statistics...</h2>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="stats-view">
        <h2>No Data Available</h2>
        <p>Start tracking habits and tasks to see your statistics.</p>
      </div>
    );
  }

  const renderProgressBar = (percentage: number) => (
    <div className="progress-bar">
      <div
        className="progress-fill"
        style={{
          width: `${Math.min(100, Math.max(0, percentage))}%`,
          backgroundColor:
            percentage >= 70 ? '#10B981' :
              percentage >= 30 ? '#F59E0B' : '#EF4444'
        }}
      />
    </div>
  );

  const renderTrendIcon = (trend: 'up' | 'down' | 'same') => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  // Prepare data for pie charts
  const completionData = [
    { value: stats.completedHabits, label: 'Completed' },
    { value: stats.totalHabits - stats.completedHabits, label: 'Remaining' }
  ];

  const taskData = [
    { value: stats.completedTasks, label: 'Completed' },
    { value: stats.pendingTasks, label: 'Pending' },
    { value: stats.overdueTasks, label: 'Overdue' }
  ];

  const colors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'];

  return (
    <div className="stats-view">
      <h2>Your Statistics</h2>

      <div className="chart-container">
        <div className="chart-section">
          <h3>Habit Completion</h3>
          <PieChart
            data={completionData}
            colors={[colors[0], colors[1]]}
            size={180}
          />
        </div>

        <div className="chart-section">
          <h3>Task Status</h3>
          <PieChart
            data={taskData}
            colors={[colors[0], colors[1], colors[2]]}
            size={180}
          />
        </div>
      </div>

      {/* Overview Section */}
      <section className="stats-section">
        <h3>📊 Overview</h3>
        <div className="stats-grid">
          <StatCard
            title="Total Habits"
            value={stats.totalHabits}
            icon="📋"
          />
          <StatCard
            title="Total Tasks"
            value={stats.totalTasks}
            icon="✅"
          />
          <StatCard
            title="Completed Today"
            value={`${stats.habitsToday} habits, ${stats.tasksToday} tasks`}
            icon="🎯"
          />
          <StatCard
            title="Overall Completion"
            value={`${stats.completionPercentage}%`}
            icon="🏆"
          />
        </div>
      </section>

      {/* Daily Performance */}
      <section className="stats-section">
        <h3>📅 Today's Performance</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.habitsToday} / {stats.totalHabits}</div>
            <div className="stat-label">Habits Completed</div>
            {renderProgressBar((stats.habitsToday / stats.totalHabits) * 100 || 0)}
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.tasksToday} / {stats.totalTasks}</div>
            <div className="stat-label">Tasks Completed</div>
            {renderProgressBar((stats.tasksToday / stats.totalTasks) * 100 || 0)}
          </div>
          <div className="stat-card highlight">
            <div className="stat-value">{stats.todaySuccessRate}%</div>
            <div className="stat-label">Today's Success Rate</div>
            {renderProgressBar(stats.todaySuccessRate)}
          </div>
        </div>
      </section>

      {/* Weekly Analysis */}
      <section className="stats-section">
        <h3>📆 Weekly Analysis</h3>
        <div className="stats-grid">
          <StatCard
            title="Habits This Week"
            value={stats.habitsThisWeek}
            icon="🔄"
          />
          <StatCard
            title="Tasks This Week"
            value={stats.tasksThisWeek}
            icon="📝"
          />
          <StatCard
            title="Best Day"
            value={`${stats.bestDay.day} (${stats.bestDay.count})`}
            icon="⭐"
          />
          <StatCard
            title="Needs Improvement"
            value={stats.worstDay.day}
            icon="📉"
          />
        </div>
      </section>

      {/* Monthly Progress */}
      <section className="stats-section">
        <h3>📈 Monthly Progress</h3>
        <div className="stats-grid">
          <StatCard
            title="Habits Tracked"
            value={stats.habitsThisMonth}
            icon="📊"
          />
          <StatCard
            title="Trend"
            value={`${renderTrendIcon(stats.completionTrend)} ${stats.completionTrend}`}
            icon="📈"
          />
          <div className="stat-card">
            <div className="stat-value">{stats.monthlyConsistency}%</div>
            <div className="stat-label">Monthly Consistency</div>
            {renderProgressBar(stats.monthlyConsistency)}
          </div>
        </div>
      </section>

      {/* Task Productivity */}
      <section className="stats-section">
        <h3>📋 Task Productivity</h3>
        <div className="stats-grid">
          <StatCard
            title="Completed"
            value={`${stats.completedTasks} / ${stats.totalTasks}`}
            icon="✅"
          />
          <StatCard
            title="Pending"
            value={stats.pendingTasks}
            icon="⏳"
          />
          <StatCard
            title="High Priority Done"
            value={stats.highPriorityCompleted}
            icon="🔥"
          />
          <StatCard
            title="Overdue"
            value={stats.overdueTasks}
            icon="⚠️"
            highlight={stats.overdueTasks > 0}
          />
        </div>
      </section>

      {/* Motivation Section */}
      <section className="motivation-section">
        <h3>💪 Keep It Up!</h3>
        <p className="motivation-text">
          {getMotivationMessage(stats)}
        </p>
      </section>
    </div>
  );
}

// Helper component for stat cards
function StatCard({
  title,
  value,
  icon,
  highlight = false
}: {
  title: string;
  value: string | number;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div className={`stat-card ${highlight ? 'highlight' : ''}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{title}</div>
    </div>
  );
}

// Helper function for motivation messages
function getMotivationMessage(stats: StatsData): string {
  if (stats.todaySuccessRate >= 80) {
    return "Amazing job today! You're on fire! 🔥";
  } else if (stats.todaySuccessRate >= 50) {
    return "Good progress! Keep up the great work! 💪";
  } else if (stats.todaySuccessRate > 0) {
    return "Every small step counts! Keep going! 🚶‍♂️";
  } else {
    return "It's never too late to start! Complete a task or habit to begin! 🎯";
  }
}

export default StatsView;
