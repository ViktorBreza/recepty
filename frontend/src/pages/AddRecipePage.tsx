import React from 'react';
import RecipeForm from '../components/RecipeForm';

const AddRecipePage: React.FC = () => {
  return (
    <div>
      <h2>Додати новий рецепт</h2>
      <hr />
      <RecipeForm />
    </div>
  );
};

export default AddRecipePage;
