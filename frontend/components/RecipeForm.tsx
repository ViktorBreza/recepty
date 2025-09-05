import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Recipe, Category, Tag, Ingredient } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config/api';

// Types for step-by-step functionality
interface StepMedia {
  id?: string;
  type: 'image' | 'video';
  filename: string;
  url: string;
  alt?: string;
}

interface CookingStep {
  id?: string;
  stepNumber: number;
  description: string;
  media?: StepMedia[];
}

interface RecipeFormProps {
  recipeId?: number;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ recipeId }) => {
  const [recipe, setRecipe] = useState<Partial<Recipe>>({
    title: '',
    description: '',
    ingredients: [{ name: '', quantity: 1, unit: 'шт' }],
    steps: [{ stepNumber: 1, description: '', media: [] }] as CookingStep[],
    servings: 1,
    category: null,
    tags: []
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { token } = useAuth();
  const router = useRouter();

  // Helper functions for steps management
  const addStep = () => {
    const steps = Array.isArray(recipe.steps) ? recipe.steps : [];
    const newStep: CookingStep = {
      stepNumber: steps.length + 1,
      description: '',
      media: []
    };
    setRecipe({ ...recipe, steps: [...steps, newStep] });
  };

  const updateStep = (index: number, field: keyof CookingStep, value: any) => {
    if (!Array.isArray(recipe.steps)) return;
    
    const updatedSteps = [...recipe.steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setRecipe({ ...recipe, steps: updatedSteps });
  };

  const removeStep = (index: number) => {
    if (!Array.isArray(recipe.steps) || recipe.steps.length <= 1) return;
    
    const updatedSteps = recipe.steps.filter((_, i) => i !== index);
    // Renumber steps
    updatedSteps.forEach((step, i) => {
      step.stepNumber = i + 1;
    });
    setRecipe({ ...recipe, steps: updatedSteps });
  };

  const uploadStepMedia = async (stepIndex: number, file: File): Promise<StepMedia | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API_ENDPOINTS.MEDIA}/upload-step-file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        return {
          type: response.data.file.type,
          filename: response.data.file.filename,
          url: response.data.file.url,
          alt: file.name
        };
      }
    } catch (error) {
      console.error('Media upload error:', error);
      setError('Помилка завантаження медіа файлу');
    }
    return null;
  };

  const handleFileUpload = async (stepIndex: number, files: FileList) => {
    if (!Array.isArray(recipe.steps)) return;
    
    const uploadPromises = Array.from(files).map(file => uploadStepMedia(stepIndex, file));
    const uploadedMedia = await Promise.all(uploadPromises);
    const validMedia = uploadedMedia.filter(media => media !== null) as StepMedia[];
    
    const updatedSteps = [...recipe.steps];
    const currentMedia = updatedSteps[stepIndex].media || [];
    updatedSteps[stepIndex].media = [...currentMedia, ...validMedia];
    setRecipe({ ...recipe, steps: updatedSteps });
  };

  const removeStepMedia = async (stepIndex: number, mediaIndex: number) => {
    if (!Array.isArray(recipe.steps)) return;
    
    const step = recipe.steps[stepIndex];
    if (!step.media || !Array.isArray(step.media)) return;
    const media = step.media[mediaIndex];
    
    try {
      // Delete from server
      await axios.delete(`${API_ENDPOINTS.MEDIA}/delete-step-file/${media.filename}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error deleting media:', error);
    }
    
    // Remove from state
    const updatedSteps = [...recipe.steps];
    updatedSteps[stepIndex].media = (step.media || []).filter((_, i) => i !== mediaIndex);
    setRecipe({ ...recipe, steps: updatedSteps });
  };

  useEffect(() => {
    // Load categories and tags
    const loadData = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          axios.get(`${API_ENDPOINTS.CATEGORIES}/`),
          axios.get(`${API_ENDPOINTS.TAGS}/`)
        ]);
        setCategories(categoriesRes.data);
        setTags(tagsRes.data);
      } catch (err) {
        console.error('Error loading form data:', err);
      }
    };

    loadData();

    // Load recipe if editing
    if (recipeId) {
      const loadRecipe = async () => {
        try {
          const response = await axios.get(`${API_ENDPOINTS.RECIPES}/${recipeId}`);
          const recipeData = response.data;
          
          // Ensure ingredients is array
          if (!Array.isArray(recipeData.ingredients)) {
            recipeData.ingredients = [{ name: '', quantity: 1, unit: 'шт' }];
          }
          
          // Convert old string steps to new format if needed
          if (typeof recipeData.steps === 'string' && recipeData.steps) {
            recipeData.steps = [{ 
              stepNumber: 1, 
              description: recipeData.steps, 
              media: [] 
            }];
          } else if (!Array.isArray(recipeData.steps)) {
            recipeData.steps = [{ stepNumber: 1, description: '', media: [] }];
          }
          
          setRecipe(recipeData);
        } catch (err) {
          setError('Не вдалося завантажити рецепт');
        }
      };
      
      loadRecipe();
    }
  }, [recipeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipe.title || !recipe.ingredients || recipe.ingredients.length === 0) {
      setError('Будь ласка, заповніть всі обов\'язкові поля');
      return;
    }

    // Validate steps
    if (!Array.isArray(recipe.steps) || recipe.steps.length === 0 || 
        recipe.steps.some(step => !step.description.trim())) {
      setError('Будь ласка, додайте хоча б один крок з описом');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const recipeData = {
        ...recipe,
        ingredients: recipe.ingredients?.filter(ing => ing.name.trim() !== ''),
        steps: recipe.steps.filter(step => step.description.trim() !== '')
      };

      if (recipeId) {
        await axios.put(`${API_ENDPOINTS.RECIPES}/${recipeId}`, recipeData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_ENDPOINTS.RECIPES}/`, recipeData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      router.push('/recipes');
    } catch (err) {
      setError('Помилка збереження рецепту');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = () => {
    setRecipe({
      ...recipe,
      ingredients: [...(recipe.ingredients || []), { name: '', quantity: 1, unit: 'шт' }]
    });
  };

  const removeIngredient = (index: number) => {
    const newIngredients = recipe.ingredients?.filter((_, i) => i !== index);
    setRecipe({
      ...recipe,
      ingredients: newIngredients
    });
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const newIngredients = [...(recipe.ingredients || [])];
    newIngredients[index] = {
      ...newIngredients[index],
      [field]: value
    };
    setRecipe({
      ...recipe,
      ingredients: newIngredients
    });
  };

  return (
    <div className="card">
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">
              Назва рецепту *
            </label>
            <input
              type="text"
              className="form-control"
              id="title"
              value={recipe.title || ''}
              onChange={(e) => setRecipe({ ...recipe, title: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Опис
            </label>
            <textarea
              className="form-control"
              id="description"
              rows={3}
              value={recipe.description || ''}
              onChange={(e) => setRecipe({ ...recipe, description: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="servings" className="form-label">
              Кількість порцій
            </label>
            <input
              type="number"
              className="form-control"
              id="servings"
              min="1"
              value={recipe.servings || 1}
              onChange={(e) => setRecipe({ ...recipe, servings: parseInt(e.target.value) })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Інгредієнти *</label>
            {recipe.ingredients?.map((ingredient, index) => (
              <div key={index} className="row mb-2">
                <div className="col-md-5">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Назва інгредієнта"
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Кількість"
                    min="0"
                    step="0.1"
                    value={ingredient.quantity}
                    onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value))}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Одиниця"
                    value={ingredient.unit}
                    onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                  />
                </div>
                <div className="col-md-1">
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => removeIngredient(index)}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={addIngredient}
            >
              + Додати інгредієнт
            </button>
          </div>

          <div className="mb-3">
            <label className="form-label">
              Кроки приготування *
            </label>
            
            {Array.isArray(recipe.steps) && recipe.steps.map((step, index) => (
              <div key={index} className="border rounded p-3 mb-3" style={{backgroundColor: '#f8f9fa'}}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">Крок {step.stepNumber}</h6>
                  {recipe.steps && recipe.steps.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => removeStep(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
                
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Опишіть цей крок приготування..."
                    value={step.description}
                    onChange={(e) => updateStep(index, 'description', e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Медіа файли для кроку:</label>
                  <input
                    type="file"
                    className="form-control"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => e.target.files && handleFileUpload(index, e.target.files)}
                  />
                  <small className="form-text text-muted">
                    Можна додати кілька зображень або відео. Максимум 5 файлів на крок.
                  </small>
                </div>
                
                {step.media && Array.isArray(step.media) && step.media.length > 0 && (
                  <div className="mb-2">
                    <label className="form-label">Додані файли:</label>
                    <div className="row">
                      {step.media.map((media, mediaIndex) => (
                        <div key={mediaIndex} className="col-md-3 mb-2">
                          <div className="position-relative">
                            {media.type === 'image' ? (
                              <img
                                src={media.url}
                                alt={media.alt || `Крок ${step.stepNumber} зображення ${mediaIndex + 1}`}
                                className="img-fluid rounded"
                                style={{maxHeight: '150px', objectFit: 'contain', width: '100%'}}
                              />
                            ) : (
                              <video
                                src={media.url}
                                className="img-fluid rounded"
                                style={{maxHeight: '150px', width: '100%'}}
                                controls
                              />
                            )}
                            <button
                              type="button"
                              className="btn btn-danger btn-sm position-absolute"
                              style={{top: '5px', right: '5px'}}
                              onClick={() => removeStepMedia(index, mediaIndex)}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={addStep}
            >
              + Додати крок
            </button>
          </div>

          <div className="d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => router.back()}
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Збереження...' : (recipeId ? 'Оновити рецепт' : 'Створити рецепт')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeForm;