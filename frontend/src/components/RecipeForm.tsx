import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Recipe, Category, Tag, Ingredient, CookingStep } from '../types';
import StepForm from './StepForm';
import { API_ENDPOINTS } from '../config/api';

interface RecipeFormData {
  title: string;
  description: string;
  servings: number;
  category_id: number;
  steps: string | CookingStep[];
  ingredients: Ingredient[];
  tags: number[];
}

interface RecipeFormProps {
  isEditMode?: boolean;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ isEditMode = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RecipeFormData>({
    title: '',
    description: '',
    servings: 4,
    category_id: 0,
    steps: [{ id: 'step-1', stepNumber: 1, description: '', media: [] }],
    ingredients: [{ name: '', quantity: 1, unit: 'г' }],
    tags: [],
  });

  const [useOldStepsFormat, setUseOldStepsFormat] = useState(false);

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Завантажуємо категорії та теги для випадаючих списків та чекбоксів
    const fetchMetadata = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          axios.get(`${API_ENDPOINTS.CATEGORIES}/`),
          axios.get(`${API_ENDPOINTS.TAGS}/`),
        ]);
        setAllCategories(categoriesRes.data);
        setAllTags(tagsRes.data);
        if (categoriesRes.data.length > 0) {
          setFormData(prev => ({ ...prev, category_id: categoriesRes.data[0].id }));
        }
      } catch (err) {
        setError('Не вдалося завантажити категорії та теги.');
      }
    };

    fetchMetadata();

    // Якщо це режим редагування, завантажуємо дані рецепта
    if (isEditMode && id) {
      const fetchRecipe = async () => {
        try {
          const response = await axios.get(`${API_ENDPOINTS.RECIPES}/${id}`);
          const recipe: Recipe = response.data;
          // Перевіряємо формат кроків
          let steps: string | CookingStep[];
          let oldFormat = false;
          
          if (typeof recipe.steps === 'string') {
            steps = recipe.steps;
            oldFormat = true;
          } else if (Array.isArray(recipe.steps)) {
            steps = recipe.steps;
          } else {
            // Якщо невідомий формат, використовуємо старий
            steps = '';
            oldFormat = true;
          }

          setFormData({
            title: recipe.title,
            description: recipe.description || '',
            servings: recipe.servings,
            category_id: recipe.category?.id || 0,
            steps: steps,
            ingredients: recipe.ingredients,
            tags: recipe.tags.map(tag => tag.id),
          });
          
          setUseOldStepsFormat(oldFormat);
        } catch (err) {
          setError('Не вдалося завантажити дані рецепта.');
        }
      };
      fetchRecipe();
    }
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number) => {
    const newIngredients = [...formData.ingredients];
    (newIngredients[index] as any)[field] = value;
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: 1, unit: 'г' }],
    }));
  };

  const removeIngredient = (index: number) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const handleTagChange = (tagId: number) => {
    setFormData(prev => {
      const newTags = prev.tags.includes(tagId)
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId];
      return { ...prev, tags: newTags };
    });
  };

  const handleStepsFormatToggle = (useOldFormat: boolean) => {
    setUseOldStepsFormat(useOldFormat);
    if (useOldFormat) {
      // Конвертуємо нові кроки в старий формат
      if (Array.isArray(formData.steps)) {
        const stepsText = formData.steps
          .map((step, index) => `${index + 1}. ${step.description}`)
          .join('\n');
        setFormData(prev => ({ ...prev, steps: stepsText }));
      }
    } else {
      // Конвертуємо старий формат в нові кроки
      if (typeof formData.steps === 'string') {
        const stepTexts = formData.steps
          .split(/\n(?=\d+\.)/g)
          .filter(step => step.trim().length > 0);
        
        const cookingSteps: CookingStep[] = stepTexts.map((stepText, index) => ({
          id: `step-${index + 1}`,
          stepNumber: index + 1,
          description: stepText.replace(/^\d+\.\s*/, '').trim(),
          media: []
        }));

        if (cookingSteps.length === 0) {
          cookingSteps.push({ id: 'step-1', stepNumber: 1, description: '', media: [] });
        }
        
        setFormData(prev => ({ ...prev, steps: cookingSteps }));
      }
    }
  };

  const handleStepUpdate = (stepIndex: number, updatedStep: CookingStep) => {
    if (Array.isArray(formData.steps)) {
      const newSteps = [...formData.steps];
      newSteps[stepIndex] = updatedStep;
      setFormData(prev => ({ ...prev, steps: newSteps }));
    }
  };

  const handleAddStep = () => {
    if (Array.isArray(formData.steps)) {
      const newStepNumber = formData.steps.length + 1;
      const newStep: CookingStep = {
        id: `step-${newStepNumber}`,
        stepNumber: newStepNumber,
        description: '',
        media: []
      };
      setFormData(prev => ({ ...prev, steps: [...formData.steps as CookingStep[], newStep] }));
    }
  };

  const handleDeleteStep = (stepIndex: number) => {
    if (Array.isArray(formData.steps) && formData.steps.length > 1) {
      const newSteps = formData.steps.filter((_, index) => index !== stepIndex);
      // Перенумеровуємо кроки
      const renumberedSteps = newSteps.map((step, index) => ({
        ...step,
        stepNumber: index + 1,
        id: `step-${index + 1}`
      }));
      setFormData(prev => ({ ...prev, steps: renumberedSteps }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.category_id === 0) {
      setError("Будь ласка, оберіть категорію.");
      return;
    }
    setError(null);

    try {
      let response;
      if (isEditMode) {
        response = await axios.put(`${API_ENDPOINTS.RECIPES}/${id}`, formData);
      } else {
        response = await axios.post(`${API_ENDPOINTS.RECIPES}/`, formData);
      }
      navigate(`/recipes/${response.data.id}`);
    } catch (err) {
      setError('Сталася помилка при збереженні рецепта.');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <label htmlFor="title" className="form-label">Назва</label>
        <input type="text" className="form-control" id="title" name="title" value={formData.title} onChange={handleChange} required />
      </div>

      <div className="mb-3">
        <label htmlFor="description" className="form-label">Опис</label>
        <textarea className="form-control" id="description" name="description" value={formData.description} onChange={handleChange} />
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label htmlFor="servings" className="form-label">Порції</label>
          <input type="number" className="form-control" id="servings" name="servings" value={formData.servings} onChange={handleChange} required min="1" />
        </div>
        <div className="col-md-6">
          <label htmlFor="category_id" className="form-label">Категорія</label>
          <select className="form-select" id="category_id" name="category_id" value={formData.category_id} onChange={handleChange} required>
            <option value="0" disabled>Оберіть категорію</option>
            {allCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-3">
        <h5>Інгредієнти</h5>
        {formData.ingredients.map((ing, index) => (
          <div key={index} className="row g-2 mb-2 align-items-center">
            <div className="col-auto">
              <input type="text" className="form-control" placeholder="Назва" value={ing.name} onChange={e => handleIngredientChange(index, 'name', e.target.value)} required />
            </div>
            <div className="col-auto">
              <input type="number" className="form-control" placeholder="Кількість" value={ing.quantity} onChange={e => handleIngredientChange(index, 'quantity', parseFloat(e.target.value))} required />
            </div>
            <div className="col-auto">
              <input type="text" className="form-control" placeholder="Одиниці" value={ing.unit} onChange={e => handleIngredientChange(index, 'unit', e.target.value)} required />
            </div>
            <div className="col-auto">
              <button type="button" className="btn btn-danger" onClick={() => removeIngredient(index)}>–</button>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-secondary" onClick={addIngredient}>+ Додати інгредієнт</button>
      </div>

      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <label className="form-label mb-0">Кроки приготування</label>
          <div className="btn-group btn-group-sm" role="group">
            <button
              type="button"
              className={`btn ${useOldStepsFormat ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleStepsFormatToggle(true)}
            >
              Текст
            </button>
            <button
              type="button"
              className={`btn ${!useOldStepsFormat ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleStepsFormatToggle(false)}
            >
              По пунктах з медіа
            </button>
          </div>
        </div>

        {useOldStepsFormat ? (
          <textarea 
            className="form-control" 
            id="steps" 
            name="steps" 
            rows={5} 
            value={typeof formData.steps === 'string' ? formData.steps : ''} 
            onChange={handleChange} 
            required 
            placeholder="1. Перший крок приготування&#10;2. Другий крок приготування&#10;..."
          />
        ) : (
          <div>
            {Array.isArray(formData.steps) && formData.steps.map((step, index) => (
              <StepForm
                key={step.id || index}
                step={step}
                stepIndex={index}
                onUpdate={(updatedStep) => handleStepUpdate(index, updatedStep)}
                onDelete={() => handleDeleteStep(index)}
              />
            ))}
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={handleAddStep}
            >
              <i className="bi bi-plus-circle me-1"></i>
              Додати крок
            </button>
          </div>
        )}
      </div>

      <div className="mb-3">
        <h5>Теги</h5>
        <div>
          {allTags.map(tag => (
            <div key={tag.id} className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="checkbox"
                id={`tag-${tag.id}`}
                value={tag.id}
                checked={formData.tags.includes(tag.id)}
                onChange={() => handleTagChange(tag.id)}
              />
              <label className="form-check-label" htmlFor={`tag-${tag.id}`}>{tag.name}</label>
            </div>
          ))}
        </div>
      </div>

      <button type="submit" className="btn btn-primary">{isEditMode ? 'Зберегти зміни' : 'Створити рецепт'}</button>
    </form>
  );
};

export default RecipeForm;
