import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Recipe } from '@/types';
import StarRating from './StarRating';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/config/apiClient';

interface RecipeListProps {
  onDelete?: () => void;
}

const RecipeList: React.FC<RecipeListProps> = ({ onDelete }) => {
  const { isAuthenticated, token, isAdmin } = useAuth();
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<Recipe[]>(API_ENDPOINTS.RECIPES);
      console.log('API response:', response);
      if (response.error) {
        setError(response.error);
      } else {
        const recipesData = Array.isArray(response.data) ? response.data : [];
        console.log('Setting recipes:', recipesData);
        setRecipes(recipesData);
      }
    } catch (err) {
      setError('Не вдалося завантажити рецепти.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей рецепт?')) {
      return;
    }

    try {
      await apiClient.delete(API_ENDPOINTS.RECIPE_DELETE(id));
      
      setRecipes(recipes.filter(recipe => recipe.id !== id));
      
      if (onDelete) {
        onDelete();
      }
    } catch (err) {
      console.error('Error deleting recipe:', err);
      alert('Не вдалося видалити рецепт.');
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Завантаження...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-5">
        <h3>Поки що рецептів немає</h3>
        <p>Будьте першим, хто поділиться смачним рецептом!</p>
        {isAuthenticated && (
          <Link href="/add-recipe" className="btn btn-primary">
            Додати рецепт
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="row">
      {recipes.map((recipe) => (
        <div key={recipe.id} className="col-lg-4 col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">{recipe.title}</h5>
              {recipe.description && (
                <p className="card-text text-muted small">
                  {recipe.description.length > 100 
                    ? `${recipe.description.substring(0, 100)}...`
                    : recipe.description
                  }
                </p>
              )}
              
              <div className="mb-2">
                <small className="text-muted">
                  <i className="bi bi-people-fill me-1"></i>
                  Порцій: {recipe.servings}
                </small>
              </div>

              {recipe.category && (
                <div className="mb-2">
                  <span className="badge bg-primary">
                    {recipe.category.name}
                  </span>
                </div>
              )}

              {recipe.tags && recipe.tags.length > 0 && (
                <div className="mb-2">
                  {recipe.tags.map(tag => (
                    <span key={tag.id} className="badge bg-secondary me-1">
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              <StarRating recipeId={recipe.id} />
            </div>
            
            <div className="card-footer bg-transparent">
              <div className="d-flex justify-content-between align-items-center">
                <Link 
                  href={`/recipes/${recipe.id}`} 
                  className="btn btn-outline-primary btn-sm"
                >
                  Переглянути
                </Link>
                
                {(isAuthenticated || isAdmin) && (
                  <div className="btn-group" role="group">
                    <Link 
                      href={`/edit-recipe/${recipe.id}`}
                      className="btn btn-outline-secondary btn-sm"
                    >
                      Редагувати
                    </Link>
                    <button 
                      className="btn btn-outline-danger btn-sm" 
                      onClick={() => handleDelete(recipe.id)}
                    >
                      Видалити
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecipeList;