import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Tag } from '../types';
import { API_ENDPOINTS } from '../config/api';

interface TagFormData {
  name: string;
}

interface TagFormProps {
  isEditMode?: boolean;
}

const TagForm: React.FC<TagFormProps> = ({ isEditMode = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<TagFormData>({
    name: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isEditMode && id) {
      const fetchTag = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${API_ENDPOINTS.TAGS}/${id}`);
          const tag: Tag = response.data;
          setFormData({
            name: tag.name,
          });
        } catch (err) {
          setError('Не вдалося завантажити дані тегу.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchTag();
    }
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Назва тегу не може бути порожньою.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      let response;
      if (isEditMode) {
        response = await axios.put(`${API_ENDPOINTS.TAGS}/${id}`, formData);
      } else {
        response = await axios.post(`${API_ENDPOINTS.TAGS}/`, formData);
      }
      navigate('/tags');
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError('Тег з такою назвою вже існує.');
      } else {
        setError('Сталася помилка при збереженні тегу.');
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
          Назва тегу <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          className="form-control"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Введіть назву тегу"
          required
          maxLength={50}
        />
        <div className="form-text">
          Максимум 50 символів. Назва має бути унікальною.
        </div>
      </div>

      <div className="mb-3">
        <h6>Попередній перегляд:</h6>
        <span className="badge bg-primary">
          {formData.name || 'Назва тегу'}
        </span>
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
            isEditMode ? 'Зберегти зміни' : 'Створити тег'
          )}
        </button>
        
        <button 
          type="button" 
          className="btn btn-outline-secondary"
          onClick={() => navigate('/tags')}
          disabled={loading}
        >
          Скасувати
        </button>
      </div>
    </form>
  );
};

export default TagForm;