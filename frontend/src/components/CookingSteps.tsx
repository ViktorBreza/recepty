import React from 'react';
import { CookingStep } from '../types';
import StepMedia from './StepMedia';

interface CookingStepsProps {
  steps: string | CookingStep[];
}

const CookingSteps: React.FC<CookingStepsProps> = ({ steps }) => {
  // If steps is a string (old format), convert to new format
  const normalizeSteps = (): CookingStep[] => {
    if (typeof steps === 'string') {
      // Split text into steps by numbers or new lines
      const stepTexts = steps
        .split(/\n(?=\d+\.)/g) // Split by lines starting with digit and dot
        .filter(step => step.trim().length > 0);

      return stepTexts.map((stepText, index) => ({
        id: `step-${index + 1}`,
        stepNumber: index + 1,
        description: stepText.replace(/^\d+\.\s*/, '').trim(), // Remove step number from beginning
        media: []
      }));
    }
    return steps;
  };

  const cookingSteps = normalizeSteps();

  if (!cookingSteps || cookingSteps.length === 0) {
    return (
      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        Кроки приготування не вказані.
      </div>
    );
  }

  return (
    <div className="cooking-steps">
      {cookingSteps.map((step, index) => (
        <div key={step.id || index} className="step-card mb-4">
          <div className="card">
            <div className="card-body">
              {/* Step header */}
              <div className="d-flex align-items-center mb-3">
                <div className="step-number-badge me-3">
                  <span className="badge bg-primary rounded-circle d-flex align-items-center justify-content-center" 
                        style={{ width: '40px', height: '40px', fontSize: '16px' }}>
                    {step.stepNumber}
                  </span>
                </div>
                <h5 className="card-title mb-0">
                  Крок {step.stepNumber}
                </h5>
              </div>

              {/* Step description */}
              <div className="step-description mb-3">
                <p className="card-text" style={{ lineHeight: '1.6' }}>
                  {step.description}
                </p>
              </div>

              {/* Media files */}
              {step.media && step.media.length > 0 && (
                <StepMedia 
                  media={step.media} 
                  stepNumber={step.stepNumber}
                />
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Summary */}
      <div className="cooking-summary mt-4 p-3 bg-light rounded">
        <div className="d-flex align-items-center">
          <i className="bi bi-check-circle-fill text-success me-2"></i>
          <span className="fw-bold">
            Готово! Ви виконали всі {cookingSteps.length} кроків приготування.
          </span>
        </div>
        <small className="text-muted">
          Смачного! 🍽️
        </small>
      </div>
    </div>
  );
};

export default CookingSteps;