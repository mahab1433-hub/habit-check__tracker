import { useState } from 'react';
import { FiBook } from 'react-icons/fi'; // Using Book icon for Journal
import './AllSetScreen.css';

interface AllSetScreenProps {
    onEnter: () => void;
}

function AllSetScreen({ onEnter }: AllSetScreenProps) {
    const [isExiting, setIsExiting] = useState(false);

    const handleContinue = () => {
        setIsExiting(true);
        setTimeout(() => {
            onEnter();
        }, 500);
    };

    return (
        <div className={`all-set-screen ${isExiting ? 'exit' : ''}`}>
            <div className="all-set-content">
                <div className="icon-container">
                    <div className="confetti-circle">
                        <span className="confetti-emoji">🎉</span>
                    </div>
                </div>

                <h1>You're all set!</h1>
                <p>Your journey to a better life starts now</p>

                <div className="highlight-card">
                    <div className="highlight-icon">
                        <FiBook />
                    </div>
                    <span className="highlight-text">Journal</span>
                </div>
            </div>

            <div className="all-set-footer">
                <button className="lets-go-button" onClick={handleContinue}>
                    Let's Go!
                </button>

                <div className="pagination-dots">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot active"></div>
                </div>
            </div>
            {/* Background orbs for atmosphere */}
            <div className="glow-orb orb-top"></div>
            <div className="glow-orb orb-bottom"></div>
        </div>
    );
}

export default AllSetScreen;
