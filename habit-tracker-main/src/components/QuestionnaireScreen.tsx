import { useState } from 'react';
import './QuestionnaireScreen.css';

interface QuestionnaireScreenProps {
    onComplete: () => void;
}

const GOALS = [
    { emoji: '💪', text: 'Build better habits' },
    { emoji: '🚫', text: 'Quit bad habits' },
    { emoji: '📊', text: 'Track my progress' },
    { emoji: '🧘', text: 'Improve mindfulness' }
];

function QuestionnaireScreen({ onComplete }: QuestionnaireScreenProps) {
    const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
    const [isExiting, setIsExiting] = useState(false);

    const handleContinue = () => {
        if (!selectedGoal) return;
        setIsExiting(true);
        setTimeout(() => {
            onComplete();
        }, 500);
    };

    return (
        <div className={`questionnaire-screen ${isExiting ? 'exit' : ''}`}>
            <div className="questionnaire-content">
                <h1>What is your main goal?</h1>
                <p>This helps us personalize your experience.</p>

                <div className="goals-grid">
                    {GOALS.map((goal) => (
                        <button
                            key={goal.text}
                            className={`goal-card ${selectedGoal === goal.text ? 'selected' : ''}`}
                            onClick={() => setSelectedGoal(goal.text)}
                        >
                            <span className="goal-emoji">{goal.emoji}</span>
                            <span className="goal-text">{goal.text}</span>
                            {selectedGoal === goal.text && <span className="check-mark">✓</span>}
                        </button>
                    ))}
                </div>

                <button
                    className="continue-btn"
                    disabled={!selectedGoal}
                    onClick={handleContinue}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}

export default QuestionnaireScreen;
