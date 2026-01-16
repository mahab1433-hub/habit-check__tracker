import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FiX, FiActivity, FiUser, FiZap, FiInfo, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import './StepCalculator.css';

interface StepCalculatorProps {
    onClose: () => void;
    darkMode: boolean;
}

const GOAL_STEPS = 10000;

const StepCalculator: React.FC<StepCalculatorProps> = ({ onClose, darkMode }) => {
    // --- Step Tracking State ---
    const [steps, setSteps] = useState<number>(0);
    const [isSensorSupported, setIsSensorSupported] = useState<boolean>(true);
    const [isPermissionRequired, setIsPermissionRequired] = useState<boolean>(false);
    const [isPermissionGranted, setIsPermissionGranted] = useState<boolean>(false);

    // --- BMI / Health State ---
    const [weight, setWeight] = useState<string>(localStorage.getItem('health_weight') || '');
    const [height, setHeight] = useState<string>(localStorage.getItem('health_height') || '');
    const [bmi, setBmi] = useState<number | null>(null);
    const [bmiCategory, setBmiCategory] = useState<string>('');

    // Refs for logic
    const lastStepTime = useRef<number>(0);

    // --- Initialize Persistence & Logic ---
    useEffect(() => {
        // Load today's steps from storage
        const today = new Date().toDateString();
        const storedData = JSON.parse(localStorage.getItem('step_data') || '{}');
        if (storedData.date === today) {
            setSteps(storedData.steps || 0);
        } else {
            // New day, reset
            setSteps(0);
            localStorage.setItem('step_data', JSON.stringify({ date: today, steps: 0 }));
        }
    }, []);

    // --- Automatic Step Counting Logic ---
    const startStepTracking = useCallback(() => {
        let lastZ = 0;
        let isMoving = false;
        const threshold = 12;

        const handleMotion = (event: DeviceMotionEvent) => {
            const acc = event.accelerationIncludingGravity;
            if (!acc || acc.z === null) return;

            const deltaZ = Math.abs(acc.z - lastZ);
            const currentTime = Date.now();

            if (deltaZ > threshold && !isMoving && (currentTime - lastStepTime.current > 300)) {
                isMoving = true;
                setSteps(prev => {
                    const newSteps = prev + 1;
                    const today = new Date().toDateString();
                    localStorage.setItem('step_data', JSON.stringify({ date: today, steps: newSteps }));
                    return newSteps;
                });
                lastStepTime.current = currentTime;
            } else if (deltaZ < threshold - 2) {
                isMoving = false;
            }

            lastZ = acc.z;
        };

        window.addEventListener('devicemotion', handleMotion);
        setIsPermissionGranted(true);

        return () => window.removeEventListener('devicemotion', handleMotion);
    }, []);

    useEffect(() => {
        // Check if permission is needed (iOS 13+)
        if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
            setIsPermissionRequired(true);
        } else {
            // Regular browsers - try starting immediately
            const cleanup = startStepTracking();
            return cleanup;
        }
    }, [startStepTracking]);

    const requestPermission = async () => {
        if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
            try {
                const permissionState = await (DeviceMotionEvent as any).requestPermission();
                if (permissionState === 'granted') {
                    startStepTracking();
                    setIsPermissionRequired(false);
                } else {
                    setIsSensorSupported(false);
                    alert('Sensor permission was denied. Automatic counting will not work.');
                }
            } catch (error) {
                console.error('Error requesting permission:', error);
                setIsSensorSupported(false);
            }
        }
    };

    // --- BMI Calculation ---
    useEffect(() => {
        const w = parseFloat(weight);
        let h = parseFloat(height); // height in cm

        if (w > 0 && h > 0) {
            // Convert cm to meters for BMI calculation if it looks like cm
            // Migration: if h < 3, it's probably meters from old data
            if (h < 3) {
                h = h * 100;
                setHeight(h.toString());
            }
            const hInMeters = h / 100;
            const calculatedBmi = w / (hInMeters * hInMeters);
            setBmi(parseFloat(calculatedBmi.toFixed(1)));

            if (calculatedBmi < 18.5) setBmiCategory('Underweight');
            else if (calculatedBmi < 25) setBmiCategory('Normal');
            else if (calculatedBmi < 30) setBmiCategory('Overweight');
            else setBmiCategory('Obese');

            // Persist health data
            localStorage.setItem('health_weight', weight);
            localStorage.setItem('health_height', height);
        } else {
            setBmi(null);
            setBmiCategory('');
        }
    }, [weight, height]);

    // --- Progress Calculation ---
    const progressPercent = Math.min((steps / GOAL_STEPS) * 100, 100);
    const strokeDashoffset = 440 - (440 * progressPercent) / 100;

    return (
        <div className={`step-calculator-container ${darkMode ? 'dark' : 'light'} v2`}>
            <header className="step-calculator-header">
                <div className="header-title">
                    <FiActivity className="header-icon" />
                    <h2>Health Dashboard</h2>
                </div>
                <button className="close-button" onClick={onClose}>
                    <FiX size={24} />
                </button>
            </header>

            <div className="step-calculator-body">
                {/* Step Ring Section */}
                <section className="steps-progress-section">
                    <div className="progress-container">
                        <svg className="progress-ring" width="200" height="200">
                            <circle className="progress-ring-bg" cx="100" cy="100" r="70" />
                            <circle
                                className="progress-ring-fill"
                                cx="100"
                                cy="100"
                                r="70"
                                style={{ strokeDashoffset }}
                            />
                        </svg>
                        <div className="progress-content">
                            <span className="step-count">{steps.toLocaleString()}</span>
                            <span className="step-label">Steps Today</span>
                        </div>
                    </div>
                    <div className="automatic-tag">
                        <FiCheckCircle size={14} />
                        <span>Steps counted automatically</span>
                    </div>
                    <div className="goal-text">Goal: {GOAL_STEPS.toLocaleString()} steps</div>

                    {isPermissionRequired && !isPermissionGranted && (
                        <div className="permission-request-card">
                            <FiActivity size={24} className="pulse-icon" />
                            <h4>Enable Auto-Counting</h4>
                            <p>To count steps automatically, we need your device's motion sensor permission.</p>
                            <button className="permission-button" onClick={requestPermission}>
                                Grant Permission
                            </button>
                        </div>
                    )}
                </section>

                {!isSensorSupported && (
                    <div className="sensor-error">
                        <FiAlertCircle />
                        <span>Step counter not supported on this device</span>
                    </div>
                )}

                {/* BMI Section */}
                <section className="health-metrics-section">
                    <div className="section-header">
                        <FiUser size={18} />
                        <h3>Body Metrics</h3>
                    </div>

                    <div className="metrics-inputs">
                        <div className="input-group">
                            <label>Weight (kg)</label>
                            <input
                                type="number"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="00.0"
                            />
                        </div>
                        <div className="input-group">
                            <label>Height (cm)</label>
                            <input
                                type="number"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                placeholder="175"
                            />
                        </div>
                    </div>

                    {bmi && (
                        <div className="bmi-result-card animate-pop">
                            <div className="bmi-header">
                                <span className="bmi-label">Your BMI</span>
                                <span className={`bmi-category ${bmiCategory.toLowerCase()}`}>{bmiCategory}</span>
                            </div>
                            <div className="bmi-value">{bmi}</div>
                            <div className="bmi-scale">
                                <div className={`scale-point ${bmiCategory === 'Underweight' ? 'active' : ''}`} title="Underweight"></div>
                                <div className={`scale-point ${bmiCategory === 'Normal' ? 'active' : ''}`} title="Normal"></div>
                                <div className={`scale-point ${bmiCategory === 'Overweight' ? 'active' : ''}`} title="Overweight"></div>
                                <div className={`scale-point ${bmiCategory === 'Obese' ? 'active' : ''}`} title="Obese"></div>
                            </div>
                        </div>
                    )}
                </section>

                <section className="daily-stats-row">
                    <div className="stat-item">
                        <FiZap className="stat-icon" />
                        <div className="stat-info">
                            <span className="stat-val">{Math.round(steps * 0.04)} kcal</span>
                            <span className="stat-lbl">Burned</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <FiInfo className="stat-icon" />
                        <div className="stat-info">
                            <span className="stat-val">{((steps * 0.76) / 1000).toFixed(2)} km</span>
                            <span className="stat-lbl">Distance</span>
                        </div>
                    </div>
                </section>
            </div>

            <footer className="step-calculator-footer">
                <button className="done-button primary-action" onClick={onClose}>
                    Everything looks good!
                </button>
            </footer>
        </div>
    );
};

export default StepCalculator;
