import React from 'react';
import { Link } from 'react-router-dom';
import CategoryList from '../components/CategoryList';

const CategoriesPage: React.FC = () => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Управління категоріями</h2>
        <Link to="/add-category" className="btn btn-primary">
          Додати нову категорію
        </Link>
      </div>
      
      <p className="text-muted mb-4">
        Категорії допомагають організувати рецепти за типами страв: супи, салати, десерти, основні страви тощо.
      </p>

      <CategoryList />
    </div>
  );
};

export default CategoriesPage;