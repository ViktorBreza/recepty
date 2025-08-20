import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Recipe } from '../types';
import PortionCalculator from './PortionCalculator';
import CookingSteps from './CookingSteps';
import StarRating from './StarRating';
import CommentSystem from './CommentSystem';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS } from '../config/api';

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await axios.get(`${API_ENDPOINTS.RECIPES}/${id}`);
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

  const handleDelete = async () => {
    if (window.confirm('Ви впевнені, що хочете видалити цей рецепт?')) {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        await axios.delete(`${API_ENDPOINTS.RECIPES}/${id}`, { headers });
        navigate('/recipes');
      } catch (err) {
        console.error('Помилка при видаленні рецепта:', err);
        alert('Не вдалося видалити рецепт');
      }
    }
  };

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
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div className="flex-grow-1">
          <h2>{recipe.title}</h2>
          <p className="lead">{recipe.description}</p>
          
          {/* Рейтинг рецепту */}
          <div className="mb-3">
            <StarRating recipeId={recipe.id} />
          </div>
        </div>
        {isAuthenticated && (
          <div className="btn-group">
            <Link to={`/edit-recipe/${recipe.id}`} className="btn btn-outline-primary">
              Редагувати
            </Link>
            <button onClick={handleDelete} className="btn btn-outline-danger">
              Видалити
            </button>
          </div>
        )}
      </div>
      <hr />

      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="sticky-top" style={{ top: '20px' }}>
            {/* Інгредієнти та калькулятор */}
            <div className="mb-4">
              <h4>Оригінальні інгредієнти</h4>
              <ul className="list-group">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="list-group-item">
                    <strong>{ingredient.name}</strong> - {ingredient.quantity} {ingredient.unit}
                  </li>
                ))}
              </ul>
              <p className="mt-2">
                <span className="badge bg-info">
                  Оригінально на {recipe.servings} порцій
                </span>
              </p>
            </div>

            <PortionCalculator 
              originalServings={recipe.servings}
              ingredients={recipe.ingredients}
            />
          </div>
        </div>
        
        <div className="col-lg-8">
          <h4 className="mb-4">Кроки приготування</h4>
          <CookingSteps steps={recipe.steps} />
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

      {/* Система коментарів */}
      <hr className="my-4" />
      <CommentSystem recipeId={recipe.id} />
    </div>
  );
};

export default RecipeDetail;
