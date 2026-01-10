import { useState, useEffect, useRef } from 'react';
import './DateSelector.css';

interface DateSelectorProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

function DateSelector({ selectedDate, onDateSelect }: DateSelectorProps) {
  const [dates, setDates] = useState<Date[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate dates for 30 days before and after today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const generatedDates: Date[] = [];
    for (let i = -30; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      generatedDates.push(date);
    }
    setDates(generatedDates);
  }, []);

  useEffect(() => {
    // Scroll to selected date
    if (scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.querySelector('.date-card.active') as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [selectedDate, dates]);

  const getDayName = (date: Date): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return today.getTime() === compareDate.getTime();
  };

  const isSelected = (date: Date): boolean => {
    const compareSelected = new Date(selectedDate);
    compareSelected.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareSelected.getTime() === compareDate.getTime();
  };

  return (
    <div className="date-selector">
      <div className="date-scroll-container" ref={scrollContainerRef}>
        {dates.map((date, index) => (
          <div
            key={index}
            className={`date-card ${isSelected(date) ? 'active' : ''} ${isToday(date) && !isSelected(date) ? 'today' : ''}`}
            onClick={() => onDateSelect(date)}
          >
            <div className="day-name">{getDayName(date)}</div>
            <div className="date-number">{date.getDate()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DateSelector;
