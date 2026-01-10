import { useState, useRef } from 'react';
import { FiChevronDown, FiHelpCircle, FiBook, FiAlertTriangle, FiMail, FiChevronLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './HelpSupportPage.css';

export default function HelpSupportPage() {
    const navigate = useNavigate();
    const [activeFaq, setActiveFaq] = useState<number | null>(null);
    const [issueType, setIssueType] = useState('Login');
    const [issueDescription, setIssueDescription] = useState('');
    const [formSubmitted, setFormSubmitted] = useState(false);

    // Refs for smooth scrolling
    const faqRef = useRef<HTMLDivElement>(null);
    const guideRef = useRef<HTMLDivElement>(null);
    const reportRef = useRef<HTMLDivElement>(null);
    const contactRef = useRef<HTMLDivElement>(null);

    const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const toggleFaq = (index: number) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    const handleReportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!issueDescription.trim()) return;

        // Save locally
        try {
            const existingIssues = JSON.parse(localStorage.getItem('support_issues') || '[]');
            const newIssue = {
                id: Date.now(),
                type: issueType,
                description: issueDescription,
                date: new Date().toISOString()
            };
            localStorage.setItem('support_issues', JSON.stringify([...existingIssues, newIssue]));

            setFormSubmitted(true);
            setIssueDescription('');
            setTimeout(() => setFormSubmitted(false), 3000); // Hide success after 3s
        } catch (error) {
            console.error('Failed to save issue', error);
        }
    };

    // FAQ Data
    const faqs = [
        { question: 'How do I create a habit?', answer: 'Use the Add Habit button and choose your daily goal.' },
        { question: 'Will my data be lost on refresh?', answer: 'No. All data is safely stored on your device.' },
        { question: 'Why is login not working?', answer: 'Check your credentials and internet connection.' },
        { question: 'How is my streak calculated?', answer: 'Streak counts consecutive days of habit completion.' }
    ];

    return (
        <div className="help-page">
            {/* Back Button (Optional but good UX for sub-page) */}
            <div style={{ marginBottom: '1rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}
                >
                    <FiChevronLeft /> Back
                </button>
            </div>

            {/* Section 1: Header */}
            <header className="help-header">
                <h1 className="help-title">Help & Support</h1>
                <p className="help-subtitle">We’re here to help you</p>
            </header>

            {/* Section 2: Quick Action Cards */}
            <section className="quick-actions-grid">
                <div className="action-card" onClick={() => scrollToSection(faqRef)}>
                    <FiHelpCircle className="action-icon" />
                    <span className="action-text">FAQs</span>
                </div>
                <div className="action-card" onClick={() => scrollToSection(guideRef)}>
                    <FiBook className="action-icon" />
                    <span className="action-text">How to Use App</span>
                </div>
                <div className="action-card" onClick={() => scrollToSection(reportRef)}>
                    <FiAlertTriangle className="action-icon" />
                    <span className="action-text">Report a Problem</span>
                </div>
                <div className="action-card" onClick={() => scrollToSection(contactRef)}>
                    <FiMail className="action-icon" />
                    <span className="action-text">Contact Support</span>
                </div>
            </section>

            {/* Section 3: FAQ Section */}
            <section className="help-section" ref={faqRef}>
                <h2 className="section-title">Frequently Asked Questions</h2>
                <div className="faq-list">
                    {faqs.map((faq, index) => (
                        <div key={index} className={`faq-item ${activeFaq === index ? 'open' : ''}`}>
                            <div className="faq-question" onClick={() => toggleFaq(index)}>
                                {faq.question}
                                <FiChevronDown className="faq-icon" />
                            </div>
                            <div className="faq-answer">
                                {faq.answer}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Section 4: How To Use App */}
            <section className="help-section" ref={guideRef}>
                <h2 className="section-title">How to Use App</h2>
                <div className="guide-steps">
                    <div className="guide-step">
                        <div className="step-number">1</div>
                        <div>Sign up or login to your account</div>
                    </div>
                    <div className="guide-step">
                        <div className="step-number">2</div>
                        <div>Create daily habits</div>
                    </div>
                    <div className="guide-step">
                        <div className="step-number">3</div>
                        <div>Mark habits as completed each day</div>
                    </div>
                    <div className="guide-step">
                        <div className="step-number">4</div>
                        <div>Track progress weekly and monthly</div>
                    </div>
                    <div className="guide-step">
                        <div className="step-number">5</div>
                        <div>Your data is automatically saved</div>
                    </div>
                </div>
            </section>

            {/* Section 5: Report a Problem */}
            <section className="help-section" ref={reportRef}>
                <h2 className="section-title">Report a Problem</h2>
                <form className="report-form" onSubmit={handleReportSubmit}>
                    <div className="form-group">
                        <label className="form-label">Issue Type</label>
                        <select
                            className="form-select"
                            value={issueType}
                            onChange={(e) => setIssueType(e.target.value)}
                        >
                            <option value="Login">Login Issue</option>
                            <option value="Habit">Habit Tracking</option>
                            <option value="UI">UI / Display</option>
                            <option value="Data">Data Sync</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Describe the problem..."
                            value={issueDescription}
                            onChange={(e) => setIssueDescription(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="submit-btn">Submit Report</button>

                    {formSubmitted && (
                        <div className="success-message">
                            Thanks! We’ll look into this.
                        </div>
                    )}
                </form>
            </section>

            {/* Section 6: Contact Support */}
            <section className="help-section" ref={contactRef}>
                <h2 className="section-title">Contact Support</h2>
                <div className="contact-card">
                    <p>Need more help? Email us directly.</p>
                    <a href="mailto:support@yourapp.com" className="contact-email">support@yourapp.com</a>
                    <p className="contact-note">We usually respond within 24–48 hours</p>
                </div>
            </section>

            {/* Section 7: App Info */}
            <footer className="app-info">
                <div>Habit Tracker v1.0.0</div>
                <div className="app-links">
                    <a href="#" className="app-link">Privacy Policy</a>
                    <a href="#" className="app-link">Terms & Conditions</a>
                </div>
            </footer>
        </div>
    );
}
