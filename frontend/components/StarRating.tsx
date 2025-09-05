import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RecipeStats } from '@/types';
import { apiClient } from '@/config/apiClient';

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
  const { token } = useAuth();

  // Star sizes
  const starSizes = {
    sm: 'fs-6',
    md: 'fs-4', 
    lg: 'fs-2'
  };

  const starClass = starSizes[size];

  // Load current user rating and statistics
  useEffect(() => {
    const fetchData = async () => {
      try {
        // For now, just set some default stats until API is fully integrated
        setStats({
          average_rating: null,
          total_ratings: 0,
          total_comments: 0
        });
        setUserRating(null);
      } catch (error) {
        console.error('Error fetching rating data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [recipeId, token]);

  const handleStarClick = async (rating: number) => {
    if (readonly) return;
    
    try {
      setUserRating(rating);
      // API call would go here
      console.log('Rating submitted:', rating);
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const renderStars = () => {
    const stars = [];
    const displayRating = hoveredStar || userRating || stats?.average_rating || 0;

    for (let i = 1; i <= 5; i++) {
      const isActive = i <= displayRating;
      const isInteractive = !readonly && !loading;
      
      stars.push(
        <button
          key={i}
          type="button"
          className={`btn p-0 border-0 bg-transparent ${starClass}`}
          style={{ 
            color: isActive ? '#ffc107' : '#e4e5e9',
            cursor: isInteractive ? 'pointer' : 'default'
          }}
          onClick={() => isInteractive && handleStarClick(i)}
          onMouseEnter={() => isInteractive && setHoveredStar(i)}
          onMouseLeave={() => isInteractive && setHoveredStar(null)}
          disabled={!isInteractive}
          aria-label={`Rate ${i} stars`}
        >
          ⭐
        </button>
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center">
        <div className="spinner-border spinner-border-sm me-2" role="status">
          <span className="visually-hidden">Завантаження рейтингу...</span>
        </div>
        {showLabel && <span className="text-muted">Завантаження...</span>}
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center">
      <div className="me-2">
        {renderStars()}
      </div>
      {showLabel && stats && (
        <small className="text-muted">
          {stats.average_rating 
            ? `${stats.average_rating.toFixed(1)} (${stats.total_ratings})`
            : 'Поки без оцінок'
          }
        </small>
      )}
    </div>
  );
};

export default StarRating;