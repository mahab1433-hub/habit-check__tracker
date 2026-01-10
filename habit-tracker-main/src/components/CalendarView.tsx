import { useState } from 'react';
import { Habit } from '../types';

import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import './CalendarView.css';

interface CalendarViewProps {
  habits: Habit[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onToggle: (habitId: string, date: Date) => void;
  onDelete: (habitId: string) => void;
  isCompleted: (habitId: string, date: Date) => boolean;
}

function CalendarView({
  habits,
  selectedDate,
  onDateChange,
  onToggle,
  onDelete,
  isCompleted,
}: CalendarViewProps) {
  const [currentViewDate, setCurrentViewDate] = useState(selectedDate);
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Date[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const dayDate = new Date(year, month, -startingDayOfWeek + i + 1);
      // Normalize to midnight
      dayDate.setHours(0, 0, 0, 0);
      days.push(dayDate);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      // Normalize to midnight
      dayDate.setHours(0, 0, 0, 0);
      days.push(dayDate);
    }

    return days;
  };

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = getDaysInMonth(currentViewDate);
  const currentMonth = currentViewDate.getMonth();
  const currentYear = currentViewDate.getFullYear();

  const monthName = monthNames[currentViewDate.getMonth()];
  const year = currentViewDate.getFullYear();

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  };

  const isTodayDate = (date: Date): boolean => {
    return date.toDateString() === new Date().toDateString();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentViewDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentViewDate(newDate);
  };

  const selectMonth = (monthIndex: number) => {
    const newDate = new Date(currentViewDate);
    newDate.setMonth(monthIndex);
    setCurrentViewDate(newDate);
    setShowMonthSelector(false);
  };

  if (habits.length === 0) {
    return (
      <div className="empty-state">
        <p>No habits yet. Add your first habit above!</p>
      </div>
    );
  }

  return (
    <div className="calendar-view">
      <div className="calendar-title-bar">
        <div className="calendar-nav">
          <button
            className="nav-button"
            onClick={() => navigateMonth('prev')}
            title="Previous month"
          >
            <FiChevronLeft />
          </button>
          <h2 className="calendar-name" onClick={() => setShowMonthSelector(!showMonthSelector)}>
            {monthName} {year}
          </h2>
          <button
            className="nav-button"
            onClick={() => navigateMonth('next')}
            title="Next month"
          >
            <FiChevronRight />
          </button>
        </div>
        <div className="title-bar-buttons">
          <button
            className="add-habit-button"
            onClick={() => setShowMonthSelector(!showMonthSelector)}
            title="Select month"
          >
            <span className="plus-icon">+</span>
          </button>
        </div>
      </div>

      {showMonthSelector && (
        <div className="month-selector">
          <div className="month-grid">
            {monthNames.map((month, index) => (
              <button
                key={month}
                className={`month-option ${index === currentMonth ? 'active' : ''}`}
                onClick={() => selectMonth(index)}
              >
                {month}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="calendar-header">
        {dayNames.map((day, index) => (
          <div key={index} className="calendar-day-header" title={day}>
            {day}
          </div>
        ))}
      </div>
      <div className="calendar-grid">
        {days.map((day, index) => {
          const isCurrentMonthDay = isCurrentMonth(day);
          const isToday = isTodayDate(day);


          return (
            <div
              key={index}
              className={`calendar-day ${!isCurrentMonthDay ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
              onClick={() => onDateChange(day)}
              aria-label={day.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            >
              <span className="day-number">{day.getDate()}</span>
              <div className="habits-indicator">
                {habits.slice(0, 3).map((habit) => {
                  const completed = isCompleted(habit.id, day);
                  return (
                    <div
                      key={habit.id}
                      className={`habit-dot ${completed ? 'completed' : ''}`}
                      style={{ backgroundColor: habit.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle(habit.id, day);
                      }}
                      title={`${habit.name} - ${completed ? 'Completed' : 'Not completed'}`}
                    />
                  );
                })}
                {habits.length > 3 && (
                  <div className="more-habits" title={`${habits.length - 3} more habits`}>
                    +{habits.length - 3}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="calendar-legend">
        {habits.map((habit) => (
          <div key={habit.id} className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: habit.color }}
            />
            <span className="legend-name">{habit.name}</span>
            <button
              className="legend-delete"
              onClick={() => onDelete(habit.id)}
              aria-label={`Delete ${habit.name}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CalendarView;
