import { useState } from 'react';
import { FiBarChart2, FiClock, FiGrid, FiCloud, FiLayout, FiGlobe } from 'react-icons/fi';
import './OnboardingScreen.css';

interface OnboardingScreenProps {
    onEnter: () => void;
}

const FEATURES = [
    {
        icon: <FiBarChart2 />,
        title: 'Smart Analytics',
        description: 'Charts, heatmaps & insights for everything',
        color: '#3b82f6',
        bgColor: 'rgba(59, 130, 246, 0.15)'
    },
    {
        icon: <FiClock />,
        title: 'Smart Reminders',
        description: 'Never miss a habit or task',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.15)'
    },
    {
        icon: <FiGrid />,
        title: 'Home Screen Widgets',
        description: 'Quick access without opening the app',
        color: '#8b5cf6',
        bgColor: 'rgba(139, 92, 246, 0.15)'
    },
    {
        icon: <FiCloud />,
        title: 'Cloud Backup',
        description: 'Google Drive & iCloud sync',
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.15)'
    },
    {
        icon: <FiLayout />,
        title: 'Beautiful Themes',
        description: 'Light, dark & custom accent colors',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.15)'
    },
    {
        icon: <FiGlobe />,
        title: '30+ Languages',
        description: 'Use the app in your language',
        color: '#ec4899',
        bgColor: 'rgba(236, 72, 153, 0.15)'
    }
];

function OnboardingScreen({ onEnter }: OnboardingScreenProps) {
    const [isExiting, setIsExiting] = useState(false);

    const handleContinue = () => {
        setIsExiting(true);
        setTimeout(() => {
            onEnter();
        }, 300);
    };

    return (
        <div className={`onboarding-screen ${isExiting ? 'exit' : ''}`}>
            <div className="onboarding-header">
                <button className="skip-button" onClick={handleContinue}>
                    Skip
                </button>
            </div>

            <div className="onboarding-content-scroll">
                <div className="onboarding-title-section">
                    <h1>Everything Works</h1>
                    <h1 className="highlight">Together</h1>
                    <p>Powerful features across all trackers</p>
                </div>

                <div className="features-list">
                    {FEATURES.map((feature, index) => (
                        <div key={index} className="feature-card">
                            <div
                                className="feature-icon-box"
                                style={{ color: feature.color, backgroundColor: feature.bgColor }}
                            >
                                {feature.icon}
                            </div>
                            <div className="feature-info">
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="onboarding-footer">
                <button className="continue-button" onClick={handleContinue}>
                    Continue
                </button>
                <div className="pagination-dots">
                    <div className="dot active"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                </div>
            </div>
        </div>
    );
}

export default OnboardingScreen;
