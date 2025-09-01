import React from 'react';
import { Link } from 'react-router-dom';
import RecipeList from '../components/RecipeList';

const RecipesPage: React.FC = () => {
  return (
    <div className="position-relative">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <img 
            src="/logo.svg" 
            alt="Логотип" 
            width="50" 
            height="50" 
            className="me-3 opacity-75"
            style={{
              animation: 'gentle-float 4s ease-in-out infinite'
            }}
          />
          <h2 className="mb-0">Рецепти від Кота Кухаря</h2>
        </div>
        <Link to="/add-recipe" className="btn btn-success btn-lg">
          <i className="bi bi-plus-circle me-2"></i>Додати рецепт
        </Link>
      </div>
      <p>Оберіть рецепт від нашого котика-кухаря, щоб дізнатися всі секрети приготування!</p>
      <hr />
      <RecipeList />
    </div>
  );
};

export default RecipesPage;
