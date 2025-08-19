import React from 'react';
import RecipeForm from '../components/RecipeForm';

const EditRecipePage: React.FC = () => {
  return (
    <div>
      <h2>Редагувати рецепт</h2>
      <hr />
      <RecipeForm isEditMode={true} />
    </div>
  );
};

export default EditRecipePage;
