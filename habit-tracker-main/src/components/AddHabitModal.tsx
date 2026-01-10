import { useState, FormEvent, useEffect } from 'react';
import './AddHabitModal.css';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, frequency: 'Daily' | 'Weekly', reminderTime: string) => void;
}

function AddHabitModal({ isOpen, onClose, onSave }: AddHabitModalProps) {
  const [habitName, setHabitName] = useState('');
  const [frequency, setFrequency] = useState<'Daily' | 'Weekly'>('Daily');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setHabitName('');
      setFrequency('Daily');
      setReminderTime('09:00');
      setError('');
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!habitName.trim()) {
      setError('Habit name is required');
      return;
    }

    onSave(habitName.trim(), frequency, reminderTime);
    onClose();
  };

  const handleCancel = () => {
    setError('');
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Habit</h2>
          <button className="modal-close" onClick={handleCancel} aria-label="Close">
            ×
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="habit-name">Habit Name *</label>
            <input
              id="habit-name"
              type="text"
              value={habitName}
              onChange={(e) => {
                setHabitName(e.target.value);
                setError('');
              }}
              placeholder="e.g., Exercise, Read, Meditate"
              className={error ? 'input-error' : ''}
              autoFocus
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="frequency">Frequency</label>
            <select
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as 'Daily' | 'Weekly')}
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="reminder-time">Reminder Time</label>
            <input
              id="reminder-time"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddHabitModal;
