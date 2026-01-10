import { useState } from 'react';
import { HabitType, HabitCategory, HabitInput } from '../../types/habit';

import './HabitForm.css';

interface HabitFormProps {
  initialHabit?: Partial<HabitInput>;
  onSave: (habit: HabitInput) => void;
  onCancel: () => void;
}

export default function HabitForm({ initialHabit, onSave, onCancel }: HabitFormProps) {
  const [name, setName] = useState(initialHabit?.name || '');
  const [type, setType] = useState<HabitType>(initialHabit?.type || 'daily');



  const [category, setCategory] = useState<HabitCategory>(initialHabit?.category || 'health');
  const [color, setColor] = useState(initialHabit?.color || '#4F46E5');
  const [icon, setIcon] = useState(initialHabit?.icon || '');
  const [reminderEnabled, setReminderEnabled] = useState(initialHabit?.reminder?.enabled || false);
  const [reminderTime, setReminderTime] = useState(initialHabit?.reminder?.time || '09:00');
  const [showReminderDays, setShowReminderDays] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>(
    initialHabit?.reminder?.days || [1, 2, 3, 4, 5] // Default to weekdays
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const habitData: HabitInput = {
      name,
      type,
      category,
      color,
      icon: icon || '📝',
      startDate: new Date(),
      reminder: reminderEnabled ? {
        enabled: true,
        time: reminderTime,
        days: selectedDays
      } : undefined,
      frequency: type === 'daily' ? 'Daily' : type === 'weekly' ? 'Weekly' : 'Monthly'
    };

    onSave(habitData);
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const days = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
  ];

  const categories: HabitCategory[] = ['health', 'study', 'work', 'fitness', 'personal', 'other'];
  const habitTypes: HabitType[] = ['daily', 'weekly', 'monthly'];
  const colorOptions = [
    '#4F46E5', // indigo
    '#10B981', // emerald
    '#3B82F6', // blue
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // violet
  ];

  const iconOptions = ['🏃', '💪', '📚', '🧘', '🚴', '🏋️', '🧠', '💧', '🍎', '🥗'];

  return (
    <form onSubmit={handleSubmit} className="habit-form">
      <div className="form-header">
        <h2>{initialHabit?.id ? 'Edit Habit' : 'Add New Habit'}</h2>
        <button
          type="button"
          className="close-button"
          onClick={onCancel}
          aria-label="Close"
        >
          &times;
        </button>
      </div>

      <div className="form-group">
        <label htmlFor="name">Habit Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Drink water, Read a book"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Type</label>
          <div className="button-group">
            {habitTypes.map((t) => (
              <button
                key={t}
                type="button"
                className={`type-button ${type === t ? 'active' : ''}`}
                onClick={() => {
                  setType(t);
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as HabitCategory)}
            className="category-select"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Appearance</label>
        <div className="appearance-selector">
          <div
            className="icon-preview"
            style={{ backgroundColor: color }}
            onClick={() => setShowReminderDays(!showReminderDays)}
          >
            {icon}
          </div>

          {showReminderDays && (
            <div className="appearance-options">
              <div className="color-options">
                {colorOptions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`color-option ${color === c ? 'selected' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
              <div className="icon-options">
                {iconOptions.map((i) => (
                  <button
                    key={i}
                    type="button"
                    className={`icon-option ${icon === i ? 'selected' : ''}`}
                    onClick={() => setIcon(i)}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <div className="reminder-toggle">
          <label>
            <span className="reminder-icon">🔔</span>
            Set Reminder
          </label>
          <label className="switch">
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        {reminderEnabled && (
          <div className="reminder-options">
            <div className="time-picker">
              <span>Time:</span>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
              />
            </div>

            <div className="day-picker">
              <button
                type="button"
                className="day-picker-button"
                onClick={() => setShowReminderDays(!showReminderDays)}
              >
                {selectedDays.length === 7
                  ? 'Every day'
                  : selectedDays.length === 5 &&
                    selectedDays.every(d => [1, 2, 3, 4, 5].includes(d))
                    ? 'Weekdays'
                    : selectedDays.length === 2 &&
                      selectedDays.includes(0) &&
                      selectedDays.includes(6)
                      ? 'Weekends'
                      : selectedDays.length === 0
                        ? 'No days selected'
                        : `${selectedDays.length} days selected`}
                <span>▼</span>
              </button>

              {showReminderDays && (
                <div className="day-options">
                  {days.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      className={`day-option ${selectedDays.includes(day.value) ? 'selected' : ''
                        }`}
                      onClick={() => toggleDay(day.value)}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="cancel-button"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button type="submit" className="save-button">
          {initialHabit?.id ? 'Update Habit' : 'Add Habit'}
        </button>
      </div>
    </form>
  );
};
