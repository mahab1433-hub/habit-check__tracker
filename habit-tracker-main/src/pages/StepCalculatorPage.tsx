import { useNavigate } from 'react-router-dom';
import { FiChevronLeft } from 'react-icons/fi';
import StepCalculator from '../components/StepCalculator';
import './StepCalculatorPage.css';

const StepCalculatorPage = () => {
    const navigate = useNavigate();
    const darkMode = document.documentElement.getAttribute('data-theme') === 'dark';

    return (
        <div className="step-calculator-page">
            <header className="page-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <FiChevronLeft size={24} />
                </button>
                <h1>Step Calculator</h1>
            </header>

            <main className="page-content">
                <StepCalculator
                    onClose={() => navigate(-1)}
                    darkMode={darkMode}
                />
            </main>
        </div>
    );
};

export default StepCalculatorPage;
