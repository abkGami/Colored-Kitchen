
import React from 'react';
import { Button } from './ui/button';

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <div className="flex flex-wrap gap-2 my-6">
      <Button
        variant={activeCategory === null ? "default" : "outline"}
        onClick={() => onCategoryChange(null)}
        className={`category-btn ${activeCategory === null ? 'active' : ''}`}
      >
        All
      </Button>
      {categories.map((category) => (
        <Button
          key={category}
          variant={activeCategory === category ? "default" : "outline"}
          onClick={() => onCategoryChange(category)}
          className={`category-btn ${activeCategory === category ? 'active' : ''}`}
        >
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
