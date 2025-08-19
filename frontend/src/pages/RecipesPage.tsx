import React from 'react';
import RecipeList from '../components/RecipeList';

const RecipesPage: React.FC = () => {
  return (
    <div>
      <h2>Каталог рецептів</h2>
      <p>Оберіть рецепт, який вам до вподоби, щоб переглянути деталі.</p>
      <hr />
      <RecipeList />
    </div>
  );
};

export default RecipesPage;
