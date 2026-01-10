import { useState, useEffect } from 'react';
import './SplashScreen.css';

interface SplashScreenProps {
    onEnter: () => void;
}

function SplashScreen({ onEnter }: SplashScreenProps) {
    const [showContent, setShowContent] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);

    useEffect(() => {
        // Generate particles for animation
        const newParticles = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 2,
            delay: Math.random() * 2,
        }));
        setParticles(newParticles);

        // Show content after a brief delay
        const timer = setTimeout(() => {
            setShowContent(true);
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    const handleEnter = () => {
        setIsExiting(true);
        setShowContent(false);
        setTimeout(() => {
            onEnter();
        }, 500);
    };

    return (
        <div className={`splash-screen ${isExiting ? 'exit' : ''}`}>
            <div className="particles-container">
                {particles.map((particle) => (
                    <div
                        key={particle.id}
                        className="particle"
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            animationDelay: `${particle.delay}s`,
                        }}
                    />
                ))}
            </div>

            <div className={`splash-content ${showContent ? 'visible' : ''}`}>
                <div className="logo-container">
                    <div className="logo-circle">
                        <div className="logo-inner">
                            <svg viewBox="0 0 100 100" className="logo-icon">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="3" className="logo-ring" />
                                <path
                                    d="M 30 50 L 45 65 L 70 35"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="logo-check"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <h1 className="splash-title">
                    <span className="title-word">Habit</span>
                    <span className="title-word">Tracker</span>
                </h1>

                <p className="splash-subtitle">Build better habits, one day at a time</p>

                <button className="splash-button" onClick={handleEnter}>
                    <span>Get Started</span>
                    <svg className="button-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            <div className="gradient-orb orb-1" />
            <div className="gradient-orb orb-2" />
            <div className="gradient-orb orb-3" />
        </div>
    );
}

export default SplashScreen;
