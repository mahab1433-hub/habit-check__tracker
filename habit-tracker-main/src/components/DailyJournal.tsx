import React, { useState, useEffect } from 'react';
import { FiEdit2, FiPlus, FiChevronRight } from 'react-icons/fi';
import { getDateKey } from '../utils/storage';
import './DailyJournal.css';

interface DailyJournalProps {
    selectedDate: Date;
    onClick: () => void;
}

const DailyJournal: React.FC<DailyJournalProps> = ({ selectedDate, onClick }) => {
    const [journalData, setJournalData] = useState<{ title?: string; text?: string } | null>(null);

    useEffect(() => {
        const dateKey = getDateKey(selectedDate);
        const saved = localStorage.getItem(`daily_journal_${dateKey}`);
        if (saved) {
            try {
                setJournalData(JSON.parse(saved));
            } catch (e) {
                console.error('Error parsing journal data', e);
                setJournalData(null);
            }
        } else {
            setJournalData(null);
        }

        // Listen for storage changes in other windows/tabs (and current if needed)
        const handleStorage = () => {
            const currentSaved = localStorage.getItem(`daily_journal_${dateKey}`);
            if (currentSaved) {
                try {
                    setJournalData(JSON.parse(currentSaved));
                } catch (e) {
                    setJournalData(null);
                }
            } else {
                setJournalData(null);
            }
        };

        window.addEventListener('storage', handleStorage);
        // Custom event for same-window updates if we want to be reactive across internal saves
        window.addEventListener('journal-updated', handleStorage);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('journal-updated', handleStorage);
        };
    }, [selectedDate]);

    const isToday = getDateKey(selectedDate) === getDateKey(new Date());

    const stripHtml = (html: string) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    if (!journalData && !isToday) {
        return null; // Don't show empty journal cards for past/future dates
    }

    return (
        <div className="daily-journal-preview-container" onClick={onClick}>
            <div className="journal-preview-card">
                <div className="journal-preview-header">
                    <div className="journal-preview-icon">
                        <FiEdit2 />
                    </div>
                    <span className="journal-preview-label">Daily Journal</span>
                </div>

                <div className="journal-preview-content">
                    {journalData ? (
                        <>
                            <h4 className="journal-preview-title">
                                {journalData.title || "Untitled Entry"}
                            </h4>
                            <p className="journal-preview-text">
                                {journalData.text ?
                                    (() => {
                                        const cleanText = stripHtml(journalData.text);
                                        return cleanText.length > 80 ? cleanText.substring(0, 80) + '...' : cleanText;
                                    })()
                                    : "No content writing yet..."
                                }
                            </p>
                        </>
                    ) : (
                        <div className="journal-empty-prompt">
                            <FiPlus className="plus-icon" />
                            <span>Capture your thoughts for today...</span>
                        </div>
                    )}
                </div>

                <div className="journal-preview-footer">
                    <span className="view-link">View Journal</span>
                    <FiChevronRight className="arrow-icon" />
                </div>
            </div>
        </div>
    );
};

export default DailyJournal;
