import { Habit } from '../../types/habit';
import HabitCard from './HabitCard';
import './HabitList.css';

interface HabitListProps {
  habits: Habit[];
  onToggle: (id: string, date: Date) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

const HabitList = ({ habits, onToggle, onEdit, onDelete }: HabitListProps) => {
  if (habits.length === 0) {
    return (
      <div className="empty-state">
        <p>No habits found. Tap + to add your first habit!</p>
      </div>
    );
  }

  // Group habits by category
  const habitsByCategory = habits.reduce<Record<string, Habit[]>>((acc, habit) => {
    if (!acc[habit.category]) {
      acc[habit.category] = [];
    }
    acc[habit.category].push(habit);
    return acc;
  }, {});

  return (
    <div className="habit-list">
      {Object.entries(habitsByCategory).map(([category, categoryHabits]) => (
        <div key={category} className="habit-category">
          <h3 className="category-title">
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </h3>
          <div className="habit-cards">
            {categoryHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggle={() => onToggle(habit.id, new Date())}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HabitList;
