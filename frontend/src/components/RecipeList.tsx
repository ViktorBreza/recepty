import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Recipe } from '../types';
import StarRating from './StarRating';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS } from '../config/api';

interface RecipeListProps {
  onDelete?: () => void;
}

const RecipeList: React.FC<RecipeListProps> = ({ onDelete }) => {
  const { isAuthenticated, token, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_ENDPOINTS.RECIPES}/`);
      setRecipes(response.data);
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
    if (window.confirm('Ви впевнені, що хочете видалити цей рецепт?')) {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        await axios.delete(`${API_ENDPOINTS.RECIPES}/${id}`, { headers });
        setRecipes(recipes.filter(recipe => recipe.id !== id));
        if (onDelete) onDelete();
      } catch (err) {
        console.error('Помилка при видаленні рецепту:', err);
        alert('Не вдалося видалити рецепт');
      }
    }
  };

  const handleEditClick = (id: number) => {
    if (isAuthenticated) {
      navigate(`/edit-recipe/${id}`);
    } else {
      if (window.confirm('Редагувати рецепти можуть тільки зареєстровані користувачі. Хочете увійти або зареєструватися?')) {
        navigate('/login');
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center">
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
      <div className="text-center">
        <p className="lead">Наразі рецептів немає.</p>
        {isAuthenticated && (
          <Link to="/add-recipe" className="btn btn-primary">
            Додати перший рецепт
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="row">
      {recipes.map((recipe) => (
        <div key={recipe.id} className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">{recipe.title}</h5>
              <p className="card-text flex-grow-1">{recipe.description}</p>
              <p className="card-text">
                <small className="text-muted">
                  Категорія: {recipe.category ? recipe.category.name : 'Без категорії'}
                </small>
              </p>
              <p className="card-text">
                <small className="text-muted">
                  Порції: {recipe.servings}
                </small>
              </p>
              
              {/* Recipe rating */}
              <div className="mb-2">
                <StarRating 
                  recipeId={recipe.id} 
                  size="sm" 
                  readonly={true}
                  showLabel={true}
                />
              </div>
              <div className="mt-auto">
                <div className="btn-group w-100" role="group">
                  <Link 
                    to={`/recipes/${recipe.id}`} 
                    className="btn btn-outline-primary btn-sm"
                  >
                    Переглянути
                  </Link>
                  <button 
                    onClick={() => handleEditClick(recipe.id)}
                    className="btn btn-outline-secondary btn-sm"
                  >
                    Редагувати
                  </button>
                  {isAuthenticated && isAdmin && (
                    <button 
                      onClick={() => handleDelete(recipe.id)}
                      className="btn btn-outline-danger btn-sm"
                    >
                      Видалити
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecipeList;
