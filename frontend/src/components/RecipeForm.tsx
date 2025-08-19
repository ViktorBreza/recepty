import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Recipe, Category, Tag, Ingredient } from '../types';

interface RecipeFormData {
  title: string;
  description: string;
  servings: number;
  category_id: number;
  steps: string;
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
    steps: '',
    ingredients: [{ name: '', quantity: 1, unit: 'г' }],
    tags: [],
  });

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Завантажуємо категорії та теги для випадаючих списків та чекбоксів
    const fetchMetadata = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/categories/'),
          axios.get('http://127.0.0.1:8000/tags/'),
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
          const response = await axios.get(`http://127.0.0.1:8000/recipes/${id}`);
          const recipe: Recipe = response.data;
          setFormData({
            title: recipe.title,
            description: recipe.description || '',
            servings: recipe.servings,
            category_id: recipe.category?.id || 0,
            steps: recipe.steps,
            ingredients: recipe.ingredients,
            tags: recipe.tags.map(tag => tag.id),
          });
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
        response = await axios.put(`http://127.0.0.1:8000/recipes/${id}`, formData);
      } else {
        response = await axios.post('http://127.0.0.1:8000/recipes/', formData);
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
        <label htmlFor="steps" className="form-label">Кроки приготування</label>
        <textarea className="form-control" id="steps" name="steps" rows={5} value={formData.steps} onChange={handleChange} required />
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
