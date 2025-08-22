import React, { useState } from 'react';
import { Ingredient } from '../types';

interface PortionCalculatorProps {
  originalServings: number;
  ingredients: Ingredient[];
}

const PortionCalculator: React.FC<PortionCalculatorProps> = ({ 
  originalServings, 
  ingredients 
}) => {
  const [desiredServings, setDesiredServings] = useState<number>(originalServings);

  const calculateIngredientQuantity = (originalQuantity: number): number => {
    const multiplier = desiredServings / originalServings;
    const result = originalQuantity * multiplier;
    
    // Round to 2 decimal places for better display
    return Math.round(result * 100) / 100;
  };

  const formatQuantity = (quantity: number): string => {
    // If number is whole, show without decimals
    if (quantity % 1 === 0) {
      return quantity.toString();
    }
    // If has decimals, show maximum 2 digits
    return quantity.toFixed(2).replace(/\.?0+$/, '');
  };

  const handleServingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 1;
    setDesiredServings(Math.max(0.5, value)); // Minimum 0.5 servings
  };

  const presetServings = [1, 2, 4, 6, 8, 10];

  return (
    <div className="card">
      <div className="card-header bg-primary text-white">
        <h5 className="card-title mb-0">
          <i className="bi bi-calculator me-2"></i>
          Калькулятор порцій
        </h5>
      </div>
      <div className="card-body">
        {/* Control for selecting number of servings */}
        <div className="mb-3">
          <label htmlFor="servings-input" className="form-label">
            Кількість порцій:
          </label>
          <div className="row align-items-center">
            <div className="col-md-6">
              <input
                id="servings-input"
                type="number"
                className="form-control"
                value={desiredServings}
                onChange={handleServingsChange}
                min="0.5"
                max="50"
                step="0.5"
              />
            </div>
            <div className="col-md-6">
              <small className="text-muted">
                Оригінальний рецепт: {originalServings} порцій
              </small>
            </div>
          </div>
        </div>

        {/* Quick selection of popular values */}
        <div className="mb-3">
          <small className="text-muted d-block mb-2">Швидкий вибір:</small>
          <div className="btn-group btn-group-sm" role="group">
            {presetServings.map((servings) => (
              <button
                key={servings}
                type="button"
                className={`btn ${
                  desiredServings === servings ? 'btn-primary' : 'btn-outline-primary'
                }`}
                onClick={() => setDesiredServings(servings)}
              >
                {servings}
              </button>
            ))}
          </div>
        </div>

        {/* Display of recalculated ingredients */}
        <div>
          <h6 className="mb-3">
            Інгредієнти на {formatQuantity(desiredServings)} 
            {desiredServings === 1 ? ' порцію' : ' порцій'}:
          </h6>
          <div className="list-group">
            {ingredients.map((ingredient, index) => {
              const newQuantity = calculateIngredientQuantity(ingredient.quantity);
              const isChanged = newQuantity !== ingredient.quantity;
              
              return (
                <div
                  key={index}
                  className={`list-group-item d-flex justify-content-between align-items-center ${
                    isChanged ? 'list-group-item-success' : ''
                  }`}
                >
                  <span>
                    <strong>{ingredient.name}</strong>
                    {isChanged && (
                      <small className="text-muted ms-2">
                        (було: {formatQuantity(ingredient.quantity)} {ingredient.unit})
                      </small>
                    )}
                  </span>
                  <span className="badge bg-primary rounded-pill">
                    {formatQuantity(newQuantity)} {ingredient.unit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Change indicator */}
        {desiredServings !== originalServings && (
          <div className="mt-3 p-2 bg-light rounded">
            <small className="text-muted">
              <i className="bi bi-info-circle me-1"></i>
              Коефіцієнт: {formatQuantity(desiredServings / originalServings)}x від оригінального рецепту
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortionCalculator;