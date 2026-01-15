import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiChevronLeft,
    FiCheck,
    FiType,
    FiBold,
    FiItalic,
    FiUnderline,
    FiList,
    FiCode,
    FiMoreVertical,
    FiList as FiListNumbers // Using FiList for both for now, will find a numbered one
} from 'react-icons/fi';
import { MdFormatListNumbered, MdFormatListBulleted } from 'react-icons/md';
import { getDateKey } from '../utils/storage';
import './JournalPage.css';

const JournalPage: React.FC = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const editorRef = useRef<HTMLDivElement>(null);

    // Load data whenever selectedDate changes
    useEffect(() => {
        const dateKey = getDateKey(selectedDate);
        const saved = localStorage.getItem(`daily_journal_${dateKey}`);

        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setTitle(parsed.title || '');
                if (editorRef.current) {
                    editorRef.current.innerHTML = parsed.text || '';
                }
            } catch (e) {
                console.error('Error parsing journal data', e);
                setTitle('');
                if (editorRef.current) editorRef.current.innerHTML = '';
            }
        } else {
            setTitle('');
            if (editorRef.current) editorRef.current.innerHTML = '';
        }
    }, [selectedDate]);

    const handleSave = () => {
        const dateKey = getDateKey(selectedDate);
        const journalEntry = {
            title,
            text: editorRef.current?.innerHTML || '',
            rating: 3,
            timestamp: new Date().toISOString(),
        };
        localStorage.setItem(`daily_journal_${dateKey}`, JSON.stringify(journalEntry));
        window.dispatchEvent(new Event('journal-updated'));
        navigate(-1);
    };

    const handleFormat = (command: string, value?: string) => {
        document.execCommand(command, false, value);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = new Date(e.target.value);
        if (!isNaN(newDate.getTime())) {
            setSelectedDate(newDate);
        }
    };

    const formatDateHeader = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options);
    };

    const formatDayTime = (date: Date) => {
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });
        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        return `${day}, ${time}`;
    };

    return (
        <div className="journal-page">
            {/* Header */}
            <header className="journal-header">
                <button className="header-icon-btn" onClick={() => navigate(-1)} aria-label="Back">
                    <FiChevronLeft />
                </button>

                <div className="header-date-container">
                    <div className="header-date-wrapper">
                        <input
                            type="date"
                            className="hidden-date-input"
                            onChange={handleDateChange}
                            value={selectedDate.toISOString().split('T')[0]}
                        />
                        <div className="header-date">
                            {formatDateHeader(selectedDate)} <span className="calendar-arrow">▾</span>
                        </div>
                    </div>
                    <div className="header-timestamp">
                        {formatDayTime(selectedDate)}
                    </div>
                </div>

                <button className="header-icon-btn save-btn" onClick={handleSave} aria-label="Save">
                    <FiCheck />
                </button>
            </header>

            {/* Editor Area */}
            <main className="journal-editor">
                <input
                    type="text"
                    className="journal-title-input"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <div
                    ref={editorRef}
                    className="journal-content-editable"
                    contentEditable={true}
                    data-placeholder="Start writing your thoughts..."
                ></div>
            </main>

            {/* Toolbar */}
            <footer className="journal-toolbar">
                <div className="toolbar-main">
                    <button className="toolbar-btn" onMouseDown={(e) => { e.preventDefault(); handleFormat('bold'); }} title="Bold">
                        <FiBold />
                    </button>
                    <button className="toolbar-btn" onMouseDown={(e) => { e.preventDefault(); handleFormat('italic'); }} title="Italic">
                        <FiItalic />
                    </button>
                    <button className="toolbar-btn" onMouseDown={(e) => { e.preventDefault(); handleFormat('underline'); }} title="Underline">
                        <FiUnderline />
                    </button>
                    <button className="toolbar-btn" onMouseDown={(e) => { e.preventDefault(); handleFormat('insertUnorderedList'); }} title="Bullets">
                        <MdFormatListBulleted />
                    </button>
                    <button className="toolbar-btn" onMouseDown={(e) => { e.preventDefault(); handleFormat('insertOrderedList'); }} title="Numbered List">
                        <MdFormatListNumbered />
                    </button>
                    <button className="toolbar-btn" onMouseDown={(e) => { e.preventDefault(); handleFormat('formatBlock', 'pre'); }} title="Code">
                        <FiCode />
                    </button>
                    <button className="toolbar-btn" title="More">
                        <FiMoreVertical />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default JournalPage;
