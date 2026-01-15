import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiChevronLeft, FiEdit2, FiTrash2, FiShare2, FiChevronRight } from 'react-icons/fi';
import { Habit } from '../types/habit';
import { api } from '../services/api';
import { jsPDF } from "jspdf";
import './HabitDetailPage.css';
import { getDateKey } from '../utils/storage';

function HabitDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [habit, setHabit] = useState<Habit | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date()); // For calendar navigation

    useEffect(() => {
        const loadHabit = async () => {
            if (!id) return;
            try {
                // Fetch all habits and find the one we need (since we don't have getHabit endpoint yet)
                // Or I can just fetch all safely.
                const allHabits = await api.fetchHabits();
                const found = allHabits.find(h => h.id === id);

                if (found) {
                    setHabit(found);
                } else {
                    navigate('/');
                }
            } catch (error) {
                console.error("Failed to load habit", error);
            }
        };
        loadHabit();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!id) return;
        if (confirm('Are you sure you want to delete this habit?')) {
            try {
                await api.deleteHabit(id);
                navigate('/');
            } catch (error) {
                console.error("Failed to delete habit", error);
            }
        }
    };

    // --- Calendar Logic ---
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0 is Sun
        // Adjust for Monday start if needed, but user image shows standard grid
        // Image shows Mon start.
        const firstDayMon = firstDay === 0 ? 6 : firstDay - 1;

        const res = [];
        // Empty slots
        for (let i = 0; i < firstDayMon; i++) res.push(null);
        // Days
        for (let i = 1; i <= days; i++) res.push(new Date(year, month, i));
        return res;
    }

    const changeMonth = (delta: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentDate(newDate);
    }

    if (!habit) return null;

    const monthParam = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const calendarDays = getDaysInMonth(currentDate);
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const isCompleted = (date: Date) => {
        if (!date) return false;
        const key = getDateKey(date);
        return habit.completedDates.has(key);
    };

    const totalCompleted = habit.completedDates.size;
    // Basic streak calc matching the type definition
    const currentStreak = habit.streak;
    const longestStreak = habit.bestStreak;

    const handleShare = async () => {
        if (!habit) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // --- Title Section ---
        doc.setFillColor(30, 30, 46); // Dark bg
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.text("Habit Report", 20, 25);

        // --- Hero Info ---
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text(`Target: ${habit.name}`, 20, 60);

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Frequency: ${habit.frequency || 'Daily'}`, 20, 70);

        // --- Stats Grid ---
        const startY = 85;
        const boxWidth = (pageWidth - 40 - 20) / 3;
        const boxHeight = 40;

        // Draw boxes
        doc.setDrawColor(200);
        doc.rect(20, startY, boxWidth, boxHeight); // Current
        doc.rect(20 + boxWidth + 10, startY, boxWidth, boxHeight); // Longest
        doc.rect(20 + (boxWidth + 10) * 2, startY, boxWidth, boxHeight); // Total

        // Current Streak
        doc.setFontSize(20);
        doc.setTextColor(0);
        doc.text(`${currentStreak}`, 20 + boxWidth / 2, startY + 20, { align: 'center' });
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Current Streak', 20 + boxWidth / 2, startY + 30, { align: 'center' });

        // Longest Streak
        doc.setFontSize(20);
        doc.setTextColor(0);
        doc.text(`${longestStreak}`, 20 + boxWidth + 10 + boxWidth / 2, startY + 20, { align: 'center' });
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Best Streak', 20 + boxWidth + 10 + boxWidth / 2, startY + 30, { align: 'center' });

        // Total
        doc.setFontSize(20);
        doc.setTextColor(0);
        doc.text(`${totalCompleted}`, 20 + (boxWidth + 10) * 2 + boxWidth / 2, startY + 20, { align: 'center' });
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Total Done', 20 + (boxWidth + 10) * 2 + boxWidth / 2, startY + 30, { align: 'center' });

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 280);

        // --- Output ---
        const fileName = `${habit.name.replace(/\s+/g, '_')}_Report.pdf`;

        // Try to share file on mobile
        if (navigator.canShare && navigator.canShare({ files: [new File([], fileName)] })) {
            const blob = doc.output('blob');
            const file = new File([blob], fileName, { type: "application/pdf" });
            try {
                await navigator.share({
                    files: [file],
                    title: 'Habit Report',
                    text: `Check out my progress on ${habit.name}!`,
                });
            } catch (err) {
                console.log("Share failed or cancelled, downloading instead.", err);
                doc.save(fileName);
            }
        } else {
            // Fallback to download
            doc.save(fileName);
        }
    };

    return (
        <div className="habit-detail-page">
            <header className="detail-header">
                <button className="icon-btn" onClick={() => navigate(-1)}>
                    <FiChevronLeft size={24} />
                </button>
                <div className="header-actions">
                    <button className="icon-btn" onClick={handleDelete}><FiTrash2 /></button>
                    <button className="icon-btn"><FiEdit2 /></button>
                    <button className="icon-btn" onClick={handleShare}><FiShare2 /></button>
                </div>
            </header>

            <div className="detail-hero">
                <div className="hero-icon-box" style={{ color: habit.color }}>
                    {habit.icon || '📝'}
                </div>
                <h1 className="hero-title">{habit.name}</h1>
                <span className="hero-frequency-tag">
                    <span className="refresh-icon">↻</span> {habit.frequency || 'Everyday'}
                </span>
            </div>

            <div className="detail-calendar-card">
                <div className="calendar-header">
                    <button onClick={() => changeMonth(-1)}><FiChevronLeft /></button>
                    <span className="month-label">{monthParam}</span>
                    <button onClick={() => changeMonth(1)}><FiChevronRight /></button>
                </div>

                <div className="calendar-grid">
                    {weekDays.map(d => <span key={d} className="cal-day-header">{d}</span>)}

                    {calendarDays.map((date, idx) => (
                        <div key={idx} className="cal-day-cell">
                            {date && (
                                <>
                                    <span className={`day-number ${isCompleted(date) ? 'completed-text' : ''}`}>
                                        {date.getDate()}
                                    </span>
                                    {isCompleted(date) && <div className="dot-indicator" style={{ background: habit.color }}></div>}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="stats-grid">
                {/* Main Streak Card - Green in mockup */}
                <div className="stat-card accent-green">
                    <div className="stat-icon flame-icon">🔥</div>
                    <div className="stat-value">{currentStreak} Days</div>
                    <div className="stat-label">Current Streak</div>
                </div>

                <div className="stat-row">
                    <div className="stat-card small">
                        <div className="stat-icon">🚀</div>
                        <div className="stat-value">{longestStreak} Days</div>
                        <div className="stat-label">Longest Streak</div>
                    </div>

                    <div className="stat-card small">
                        <div className="stat-icon">✓</div>
                        <div className="stat-value">{totalCompleted}</div>
                        <div className="stat-label">Total Completed</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HabitDetailPage;
