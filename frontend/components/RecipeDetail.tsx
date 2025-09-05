import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { Recipe } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config/api';
import StarRating from './StarRating';

interface RecipeDetailProps {
  recipeId: number;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipeId }) => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await axios.get(`${API_ENDPOINTS.RECIPES}/${recipeId}`);
        setRecipe(response.data);
      } catch (err) {
        setError('Не вдалося завантажити рецепт');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (recipeId) {
      fetchRecipe();
    }
  }, [recipeId]);

  if (loading) {
    return (
      <div className="text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Завантаження...</span>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="alert alert-danger" role="alert">
        {error || 'Рецепт не знайдено'}
      </div>
    );
  }

  const steps = typeof recipe.steps === 'string' 
    ? recipe.steps.split('\n').filter(step => step.trim())
    : recipe.steps;

  return (
    <div className="recipe-detail">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1 className="mb-2">{recipe.title}</h1>
          <StarRating recipeId={recipe.id} />
        </div>
        
        {(isAuthenticated || isAdmin) && (
          <div className="btn-group">
            <Link 
              href={`/edit-recipe/${recipe.id}`}
              className="btn btn-outline-secondary"
            >
              Редагувати
            </Link>
          </div>
        )}
      </div>

      {recipe.description && (
        <div className="mb-4">
          <p className="lead">{recipe.description}</p>
        </div>
      )}

      <div className="row mb-4">
        <div className="col-md-6">
          <h3>Інгредієнти</h3>
          <p><strong>Порцій:</strong> {recipe.servings}</p>
          <ul className="list-unstyled">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="mb-2">
                <i className="bi bi-check-circle-fill text-success me-2"></i>
                {ingredient.quantity} {ingredient.unit} {ingredient.name}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="col-md-6">
          {recipe.category && (
            <div className="mb-3">
              <strong>Категорія:</strong>
              <span className="badge bg-primary ms-2">{recipe.category.name}</span>
            </div>
          )}
          
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="mb-3">
              <strong>Теги:</strong>
              <div className="mt-2">
                {recipe.tags.map(tag => (
                  <span key={tag.id} className="badge bg-secondary me-1">
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h3>Інструкції</h3>
        <ol className="list-group list-group-numbered">
          {Array.isArray(steps) ? (
            steps.map((step, index) => (
              <li key={index} className="list-group-item border-0 bg-transparent">
                {typeof step === 'string' ? step : step.description}
              </li>
            ))
          ) : (
            <li className="list-group-item border-0 bg-transparent">
              {steps}
            </li>
          )}
        </ol>
      </div>

      <div className="mt-4">
        <Link href="/recipes" className="btn btn-secondary">
          ← Назад до рецептів
        </Link>
      </div>
    </div>
  );
};

export default RecipeDetail;