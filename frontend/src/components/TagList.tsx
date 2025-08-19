import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Tag } from '../types';

interface TagListProps {
  onDelete?: () => void;
}

const TagList: React.FC<TagListProps> = ({ onDelete }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:8000/tags/');
      setTags(response.data);
    } catch (err) {
      setError('Не вдалося завантажити теги.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей тег?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/tags/${id}`);
        setTags(tags.filter(tag => tag.id !== id));
        if (onDelete) onDelete();
      } catch (err) {
        console.error('Помилка при видаленні тегу:', err);
        alert('Не вдалося видалити тег');
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

  if (tags.length === 0) {
    return (
      <div className="text-center">
        <p className="lead">Наразі тегів немає.</p>
        <Link to="/add-tag" className="btn btn-primary">
          Додати перший тег
        </Link>
      </div>
    );
  }

  return (
    <div className="row">
      {tags.map((tag) => (
        <div key={tag.id} className="col-md-4 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <span className="badge bg-primary fs-6">{tag.name}</span>
              </h5>
              <div className="mt-3">
                <div className="btn-group w-100" role="group">
                  <Link 
                    to={`/edit-tag/${tag.id}`} 
                    className="btn btn-outline-secondary btn-sm"
                  >
                    Редагувати
                  </Link>
                  <button 
                    onClick={() => handleDelete(tag.id)}
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

export default TagList;