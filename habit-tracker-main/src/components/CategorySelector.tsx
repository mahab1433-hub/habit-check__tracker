import { useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import './CategorySelector.css';

interface CategorySelectorProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  completedCount?: number;
}

function CategorySelector({ selectedCategory, onCategorySelect, completedCount = 0 }: CategorySelectorProps) {
  const [categories] = useState([
    'All',
    'Health',
    'Study',
    'Work',
    'Home',
    'Other',
    'Completed'
  ]);

  return (
    <div className="category-selector">
      <div className="category-scroll-container">
        {categories.map((category) => (
          <div
            key={category}
            className={`category-chip ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => onCategorySelect(category)}
          >
            {category === 'Completed' ? (
              <>
                <FiCheck className="completed-icon" />
                <span>{completedCount}</span>
              </>
            ) : (
              <span>{category}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategorySelector;
