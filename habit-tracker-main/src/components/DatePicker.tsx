import './DatePicker.css';

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  const formatDateDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    newDate.setHours(0, 0, 0, 0);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    newDate.setHours(0, 0, 0, 0);
    onDateChange(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    onDateChange(today);
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <div className="date-picker">
      <button className="date-nav-button" onClick={goToPreviousDay}>
        ‹
      </button>
      <div className="date-display">
        <div className="date-text">{formatDateDisplay(selectedDate)}</div>
        {!isToday && (
          <button className="today-button" onClick={goToToday}>
            Today
          </button>
        )}
      </div>
      <button className="date-nav-button" onClick={goToNextDay}>
        ›
      </button>
    </div>
  );
}

export default DatePicker;
