import { useState, FormEvent } from 'react';
import './AddHabitForm.css';

interface AddHabitFormProps {
  onAdd: (name: string) => void;
}

function AddHabitForm({ onAdd }: AddHabitFormProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name);
      setName('');
    }
  };

  return (
    <form className="add-habit-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Add a new habit..."
        className="habit-input"
      />
      <button type="submit" className="add-button">
        Add Habit
      </button>
    </form>
  );
}

export default AddHabitForm;
