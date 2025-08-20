import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { RecipeStats } from '../types';
import { API_ENDPOINTS } from '../config/api';

interface StarRatingProps {
  recipeId: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  recipeId, 
  showLabel = true, 
  size = 'md',
  readonly = false 
}) => {
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [stats, setStats] = useState<RecipeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const { token } = useAuth();

  // Розміри зірок
  const starSizes = {
    sm: 'fs-6',
    md: 'fs-4', 
    lg: 'fs-2'
  };

  const starClass = starSizes[size];

  // Завантажити поточний рейтинг користувача та статистику
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Завантажуємо статистику рецепту
        const statsResponse = await axios.get(`${API_ENDPOINTS.RATINGS}/${recipeId}/stats`);
        setStats(statsResponse.data);

        // Завантажуємо рейтинг користувача
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const userRatingResponse = await axios.get(
          `${API_ENDPOINTS.RATINGS}/${recipeId}/user-rating`,
          { headers }
        );
        setUserRating(userRatingResponse.data.rating);
      } catch (error) {
        console.error('Помилка завантаження рейтингу:', error);
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          console.error('Backend сервер не запущений! Запустіть: python -m uvicorn app.main:app --reload --port 8001');
        }
        // Встановлюємо порожні дані при помилці (наприклад, коли backend не запущений)
        setStats({ average_rating: null, total_ratings: 0, total_comments: 0 });
        setUserRating(null);
      } finally {
        setInitialLoading(false);
      }
    };

    // Додаємо невелику затримку для уникнення швидкого мигання
    const timeoutId = setTimeout(fetchData, 100);
    return () => clearTimeout(timeoutId);
  }, [recipeId, token]);

  const handleRating = async (rating: number) => {
    if (readonly) return;
    
    setLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.post(
        API_ENDPOINTS.RATINGS,
        {
          recipe_id: recipeId,
          rating: rating
        },
        { headers }
      );

      setUserRating(rating);
      
      // Оновлюємо статистику
      const statsResponse = await axios.get(`${API_ENDPOINTS.RATINGS}/${recipeId}/stats`);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Помилка збереження рейтингу:', error);
      alert('Не вдалося зберегти оцінку');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      const filled = (hoveredStar && i <= hoveredStar) || (!hoveredStar && userRating && i <= userRating);
      const average = stats?.average_rating !== null && stats?.average_rating !== undefined && i <= Math.round(stats.average_rating);
      
      stars.push(
        <span
          key={i}
          className={`${starClass} me-1 text-warning`}
          style={{ 
            cursor: readonly ? 'default' : 'pointer',
            opacity: readonly ? (average ? 1 : 0.3) : (filled ? 1 : 0.3),
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={() => !readonly && setHoveredStar(i)}
          onMouseLeave={() => !readonly && setHoveredStar(null)}
          onClick={() => !readonly && handleRating(i)}
        >
          ★
        </span>
      );
    }
    
    return stars;
  };

  if (initialLoading) {
    return <div className="text-muted">Завантаження рейтингу...</div>;
  }

  if (!stats) {
    return <div className="text-muted">Помилка завантаження рейтингу</div>;
  }

  return (
    <div className="d-flex align-items-center">
      <div className="me-2">
        {renderStars()}
      </div>
      
      {showLabel && (
        <div className="text-muted">
          {readonly ? (
            <span>
              {stats.average_rating !== null && stats.average_rating !== undefined ? 
                `${stats.average_rating.toFixed(1)} (${stats.total_ratings} оцінок)` : 
                'Немає оцінок'
              }
            </span>
          ) : (
            <span>
              {userRating ? `Ваша оцінка: ${userRating}` : 'Оцініть рецепт'}
              {loading && <span className="ms-2">Збереження...</span>}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StarRating;