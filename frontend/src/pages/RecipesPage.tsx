import React from 'react';
import { Link } from 'react-router-dom';
import RecipeList from '../components/RecipeList';

const RecipesPage: React.FC = () => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Каталог рецептів</h2>
        <Link to="/add-recipe" className="btn btn-success btn-lg">
          <i className="bi bi-plus-circle me-2"></i>Додати рецепт
        </Link>
      </div>
      <p>Оберіть рецепт, який вам до вподоби, щоб переглянути деталі.</p>
      <hr />
      <RecipeList />
    </div>
  );
};

export default RecipesPage;
