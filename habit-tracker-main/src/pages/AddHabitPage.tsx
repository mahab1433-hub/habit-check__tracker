import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTarget, FiClock, FiTag } from 'react-icons/fi';
import { Habit, HabitCategory } from '../types/habit';
import { api } from '../services/api';
import '../components/SettingsModal.css';

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // orange
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
];

const CATEGORIES = [
  'Health',
  'Fitness',
  'Learning',
  'Work',
  'Personal',
  'Social',
  'Creative',
  'Other'
];

function AddHabitPage() {
  const navigate = useNavigate();
  const [habitName, setHabitName] = useState('');
  const [frequency, setFrequency] = useState<'Daily' | 'Weekly'>('Daily');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  // const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!habitName.trim()) {
      alert('Please enter a habit name');
      return;
    }

    // setIsSubmitting(true);
    console.log('Submitting habit...', { habitName, frequency, selectedCategory }); // Debug log
    try {
      const newHabit: Partial<Habit> = {
        name: habitName.trim(),
        type: frequency.toLowerCase() as 'daily' | 'weekly' | 'monthly',
        category: selectedCategory.toLowerCase() as HabitCategory,
        color: selectedColor,
        icon: '📝',
        startDate: new Date(),
        streak: 0,
        bestStreak: 0,
        createdAt: new Date(),
        history: {},
        archived: false,
        completedDates: new Set(),
        frequency,
        reminderTime,
      };

      await api.createHabit(newHabit);
      // alert('Habit saved!'); // Optional confirmation
      navigate('/'); // Explicitly go to home
    } catch (error) {
      console.error('Failed to create habit', error);
      alert('Failed to save habit: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      // setIsSubmitting(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FiArrowLeft />
        </button>
        <h2>Add New Habit</h2>
        <div style={{ width: '24px' }}></div>
      </div>

      <div className="settings-content">
        {/* Habit Name */}
        <div className="settings-section">
          <h3>Habit Details</h3>
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">
                <FiTarget />
              </div>
              <div>
                <span className="setting-title">Habit Name</span>
                <div className="setting-description">Enter the name of your habit</div>
              </div>
            </div>
          </div>
          <div style={{ padding: '0 20px 20px' }}>
            <input
              type="text"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              placeholder="e.g., Drink water, Exercise, Read book"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#0f0f0f',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px',
              }}
            />
          </div>
        </div>

        {/* Category */}
        <div className="settings-section">
          <h3>Category</h3>
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">
                <FiTag />
              </div>
              <div>
                <span className="setting-title">Category</span>
                <div className="setting-description">Choose a category for your habit</div>
              </div>
            </div>
          </div>
          <div style={{ padding: '0 20px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    padding: '10px',
                    backgroundColor: selectedCategory === category ? selectedColor : '#0f0f0f',
                    border: `1px solid ${selectedCategory === category ? selectedColor : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Frequency */}
        <div className="settings-section">
          <h3>Frequency</h3>
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">
                <FiTarget />
              </div>
              <div>
                <span className="setting-title">How often?</span>
                <div className="setting-description">Set the frequency of this habit</div>
              </div>
            </div>
          </div>
          <div style={{ padding: '0 20px 20px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              {(['Daily', 'Weekly'] as const).map((freq) => (
                <button
                  key={freq}
                  onClick={() => setFrequency(freq)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: frequency === freq ? selectedColor : '#0f0f0f',
                    border: `1px solid ${frequency === freq ? selectedColor : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reminder Time */}
        <div className="settings-section">
          <h3>Reminder</h3>
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">
                <FiClock />
              </div>
              <div>
                <span className="setting-title">Reminder Time</span>
                <div className="setting-description">Set a daily reminder time</div>
              </div>
            </div>
          </div>
          <div style={{ padding: '0 20px 20px' }}>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#0f0f0f',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px',
              }}
            />
          </div>
        </div>

        {/* Color */}
        <div className="settings-section">
          <h3>Color</h3>
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">
                <FiTag />
              </div>
              <div>
                <span className="setting-title">Choose Color</span>
                <div className="setting-description">Select a color for your habit</div>
              </div>
            </div>
          </div>
          <div style={{ padding: '0 20px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: color,
                    border: selectedColor === color ? '3px solid white' : '2px solid transparent',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ padding: '20px' }}>
          <button
            onClick={handleSave}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: selectedColor,
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            Save Habit
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddHabitPage;
