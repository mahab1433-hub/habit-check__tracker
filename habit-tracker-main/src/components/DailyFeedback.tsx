import React, { useState, useEffect } from 'react';
import './DailyFeedback.css';
import { getDateKey } from '../utils/storage';
import { FaSmile, FaMeh, FaFrown, FaTimes, FaRegGrinStars, FaRegTired } from 'react-icons/fa';

interface DailyFeedbackProps {
    selectedDate: Date;
    triggerOpen?: number;
}

const DailyFeedback: React.FC<DailyFeedbackProps> = ({ selectedDate, triggerOpen = 0 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [rating, setRating] = useState<number | null>(null);
    const [text, setText] = useState('');
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        checkVisibility();
    }, [selectedDate]);

    useEffect(() => {
        if (triggerOpen > 0) {
            // Manual trigger overrides hidden state
            setIsVisible(true);
            setIsExiting(false);
            // Optional: scroll into view
            const element = document.querySelector('.daily-feedback-container');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [triggerOpen]);

    const checkVisibility = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dateToCheck = new Date(selectedDate);
        dateToCheck.setHours(0, 0, 0, 0);

        // Only show for today
        if (dateToCheck.getTime() !== today.getTime()) {
            setIsVisible(false);
            return;
        }

        const dateKey = getDateKey(selectedDate);
        const hasFeedback = localStorage.getItem(`daily_feedback_${dateKey}`);
        const isDismissed = localStorage.getItem(`feedback_dismissed_${dateKey}`);

        if (!hasFeedback && !isDismissed) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => {
            const dateKey = getDateKey(selectedDate);
            localStorage.setItem(`feedback_dismissed_${dateKey}`, 'true');
            setIsVisible(false);
            setIsExiting(false);
        }, 300); // Match animation duration
    };

    const handleSubmit = () => {
        if (rating === null) return;

        setIsExiting(true);
        setTimeout(() => {
            const dateKey = getDateKey(selectedDate);
            const feedback = {
                rating,
                text,
                timestamp: new Date().toISOString(),
            };
            localStorage.setItem(`daily_feedback_${dateKey}`, JSON.stringify(feedback));
            setIsVisible(false);
            setIsExiting(false);
        }, 300);
    };

    if (!isVisible) return null;

    const ratings = [
        { value: 1, icon: <FaRegTired />, label: 'Bad' },
        { value: 2, icon: <FaFrown />, label: 'Okay' },
        { value: 3, icon: <FaMeh />, label: 'Good' },
        { value: 4, icon: <FaSmile />, label: 'Great' },
        { value: 5, icon: <FaRegGrinStars />, label: 'Amazing' },
    ];

    return (
        <div className={`daily-feedback-container ${isExiting ? 'exiting' : ''}`}>
            <div className="daily-feedback-card">
                <button className="close-button" onClick={handleDismiss} aria-label="Skip feedback">
                    <FaTimes />
                </button>

                <h3 className="feedback-title">How was your day?</h3>

                <div className="rating-selector">
                    {ratings.map((r) => (
                        <button
                            key={r.value}
                            className={`rating-btn ${rating === r.value ? 'selected' : ''}`}
                            onClick={() => setRating(r.value)}
                            aria-label={r.label}
                        >
                            <span className="rating-icon">{r.icon}</span>
                            <span className="rating-label">{r.label}</span>
                        </button>
                    ))}
                </div>

                {rating !== null && (
                    <div className="feedback-input-area show">
                        <input
                            type="text"
                            placeholder="Any highlights? (Optional)"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="feedback-text-input"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSubmit();
                            }}
                        />
                        <button className="submit-feedback-btn" onClick={handleSubmit}>
                            Save
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyFeedback;
