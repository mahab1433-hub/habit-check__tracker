// Import Habit type from the habit types file
import { Habit } from '../types/habit';
import HabitItem from './HabitItem';
import DatePicker from './DatePicker';
import './HabitList.css';

interface HabitListProps {
  habits: Habit[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onToggle: (habitId: string, date: Date) => void;
  onEdit: (habit: Habit | null) => void;
  onDelete: (habitId: string) => void;
  isCompleted: (habitId: string, date: Date) => boolean;
}

function HabitList({
  habits,
  selectedDate,
  onDateChange,
  onToggle,
  onEdit,
  onDelete,
  isCompleted,
}: HabitListProps) {
  if (habits.length === 0) {
    return (
      <div className="empty-state">
        <p>No habits yet. Add your first habit above!</p>
      </div>
    );
  }

  return (
    <div className="habit-list-container">
      <DatePicker selectedDate={selectedDate} onDateChange={onDateChange} />
      
      <div className="habit-list">
        {habits.map((habit) => (
          <HabitItem
            key={habit.id}
            habit={habit}
            selectedDate={selectedDate}
            isCompleted={isCompleted(habit.id, selectedDate)}
            onToggle={() => onToggle(habit.id, selectedDate)}
            onDelete={() => onDelete(habit.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default HabitList;
