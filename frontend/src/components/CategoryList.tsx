import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Category } from '../types';

interface CategoryListProps {
  onDelete?: () => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ onDelete }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:8000/categories/');
      setCategories(response.data);
    } catch (err) {
      setError('Не вдалося завантажити категорії.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Ви впевнені, що хочете видалити цю категорію? Всі рецепти з цією категорією залишаться без категорії.')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/categories/${id}`);
        setCategories(categories.filter(category => category.id !== id));
        if (onDelete) onDelete();
      } catch (err) {
        console.error('Помилка при видаленні категорії:', err);
        alert('Не вдалося видалити категорію');
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Завантаження...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center">
        <p className="lead">Наразі категорій немає.</p>
        <Link to="/add-category" className="btn btn-primary">
          Додати першу категорію
        </Link>
      </div>
    );
  }

  return (
    <div className="row">
      {categories.map((category) => (
        <div key={category.id} className="col-md-4 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-folder me-2"></i>
                {category.name}
              </h5>
              <p className="card-text text-muted">
                Категорія для організації рецептів
              </p>
              <div className="mt-3">
                <div className="btn-group w-100" role="group">
                  <Link 
                    to={`/edit-category/${category.id}`} 
                    className="btn btn-outline-secondary btn-sm"
                  >
                    Редагувати
                  </Link>
                  <button 
                    onClick={() => handleDelete(category.id)}
                    className="btn btn-outline-danger btn-sm"
                  >
                    Видалити
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryList;