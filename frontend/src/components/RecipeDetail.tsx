import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Recipe } from '../types';

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/recipes/${id}`);
        setRecipe(response.data);
      } catch (err) {
        setError('Не вдалося завантажити рецепт.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  if (loading) {
    return <div>Завантаження...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!recipe) {
    return <div>Рецепт не знайдено.</div>;
  }

  return (
    <div>
      <h2>{recipe.title}</h2>
      <p className="lead">{recipe.description}</p>
      <hr />

      <div className="row">
        <div className="col-md-6">
          <h4>Інгредієнти</h4>
          <ul className="list-group">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="list-group-item">
                {ingredient.name} - {ingredient.quantity} {ingredient.unit}
              </li>
            ))}
          </ul>
          <p className="mt-2"><strong>Порції:</strong> {recipe.servings}</p>
        </div>
        <div className="col-md-6">
          <h4>Кроки приготування</h4>
          <p style={{ whiteSpace: 'pre-wrap' }}>{recipe.steps}</p>
        </div>
      </div>

      <div className="mt-3">
        <p><strong>Категорія:</strong> {recipe.category ? recipe.category.name : 'Без категорії'}</p>
        <div>
          <strong>Теги:</strong>
          {recipe.tags.map(tag => (
            <span key={tag.id} className="badge bg-secondary ms-1">{tag.name}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
