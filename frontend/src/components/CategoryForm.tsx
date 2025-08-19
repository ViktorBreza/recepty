import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Category } from '../types';

interface CategoryFormData {
  name: string;
}

interface CategoryFormProps {
  isEditMode?: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ isEditMode = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isEditMode && id) {
      const fetchCategory = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`http://127.0.0.1:8000/categories/${id}`);
          const category: Category = response.data;
          setFormData({
            name: category.name,
          });
        } catch (err) {
          setError('Не вдалося завантажити дані категорії.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchCategory();
    }
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Назва категорії не може бути порожньою.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      let response;
      if (isEditMode) {
        response = await axios.put(`http://127.0.0.1:8000/categories/${id}`, formData);
      } else {
        response = await axios.post('http://127.0.0.1:8000/categories/', formData);
      }
      navigate('/categories');
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError('Категорія з такою назвою вже існує.');
      } else {
        setError('Сталася помилка при збереженні категорії.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Завантаження...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="name" className="form-label">
          Назва категорії <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          className="form-control"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Введіть назву категорії"
          required
          maxLength={50}
        />
        <div className="form-text">
          Максимум 50 символів. Назва має бути унікальною.
        </div>
      </div>

      <div className="mb-3">
        <h6>Попередній перегляд:</h6>
        <div className="p-3 bg-light rounded">
          <i className="bi bi-folder me-2"></i>
          <strong>{formData.name || 'Назва категорії'}</strong>
        </div>
      </div>

      <div className="d-flex gap-2">
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Збереження...
            </>
          ) : (
            isEditMode ? 'Зберегти зміни' : 'Створити категорію'
          )}
        </button>
        
        <button 
          type="button" 
          className="btn btn-outline-secondary"
          onClick={() => navigate('/categories')}
          disabled={loading}
        >
          Скасувати
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;