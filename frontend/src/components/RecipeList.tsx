import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Recipe } from '../types';

const RecipeList: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/recipes/');
        setRecipes(response.data);
      } catch (err) {
        setError('Не вдалося завантажити рецепти.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  if (loading) {
    return <div>Завантаження...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (recipes.length === 0) {
    return <p>Наразі рецептів немає. Будьте першим, хто додасть новий!</p>;
  }

  return (
    <div className="row">
      {recipes.map((recipe) => (
        <div key={recipe.id} className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">
                <Link to={`/recipes/${recipe.id}`} className="text-decoration-none stretched-link">
                  {recipe.title}
                </Link>
              </h5>
              <p className="card-text flex-grow-1">{recipe.description}</p>
              <p className="card-text">
                <small className="text-muted">
  Категорія: {recipe.category ? recipe.category.name : 'Без категорії'}
</small>
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecipeList;
