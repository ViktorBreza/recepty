import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Comment } from '../types';
import { API_ENDPOINTS } from '../config/api';

interface CommentSystemProps {
  recipeId: number;
}

const CommentSystem: React.FC<CommentSystemProps> = ({ recipeId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const { user, token } = useAuth();

  // Load comments
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_ENDPOINTS.COMMENTS}/${recipeId}`);
        setComments(response.data);
      } catch (error: any) {
        console.error('Помилка завантаження коментарів:', error);
        if (error?.code === 'ECONNREFUSED' || error?.code === 'ERR_NETWORK') {
          console.error('Backend server is not running! Start it with: python -m uvicorn app.main:app --reload --port 8001');
        }
        // Set empty array on error
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    // Add small delay
    const timeoutId = setTimeout(fetchComments, 100);
    return () => clearTimeout(timeoutId);
  }, [recipeId]);

  // Set author name for registered users
  useEffect(() => {
    if (user) {
      setAuthorName(user.username);
    }
  }, [user]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || (!user && !authorName.trim())) {
      alert('Заповніть всі поля');
      return;
    }

    setSubmitting(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.post(
        API_ENDPOINTS.COMMENTS,
        {
          recipe_id: recipeId,
          author_name: user ? user.username : authorName,
          content: newComment.trim()
        },
        { headers }
      );

      setComments([response.data, ...comments]);
      setNewComment('');
      
      // Clear name only for anonymous users
      if (!user) {
        setAuthorName('');
      }
    } catch (error) {
      console.error('Помилка створення коментаря:', error);
      alert('Не вдалося додати коментар');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editContent.trim()) {
      alert('Коментар не може бути порожнім');
      return;
    }

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.put(
        `${API_ENDPOINTS.COMMENTS}/${commentId}?content=${encodeURIComponent(editContent.trim())}`,
        {},
        { headers }
      );

      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, content: editContent.trim() }
          : comment
      ));
      
      setEditingId(null);
      setEditContent('');
    } catch (error) {
      console.error('Помилка редагування коментаря:', error);
      alert('Не вдалося редагувати коментар');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей коментар?')) {
      return;
    }

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.delete(`${API_ENDPOINTS.COMMENTS}/${commentId}`, { headers });
      
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Помилка видалення коментаря:', error);
      alert('Не вдалося видалити коментар');
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent('');
  };

  const canEditDelete = (comment: Comment) => {
    if (user && comment.user_id === user.id) {
      return true;
    }
    // For anonymous users we can add session_id logic if needed
    return false;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('uk-UA');
  };

  if (loading) {
    return <div>Завантаження коментарів...</div>;
  }

  return (
    <div className="mt-4">
      <h5>Коментарі ({comments.length})</h5>
      
      {/* Comment form */}
      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSubmitComment}>
            {!user && (
              <div className="mb-3">
                <label htmlFor="authorName" className="form-label">Ваше ім'я</label>
                <input
                  type="text"
                  className="form-control"
                  id="authorName"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Введіть ваше ім'я"
                  required
                />
              </div>
            )}
            
            <div className="mb-3">
              <label htmlFor="comment" className="form-label">Коментар</label>
              <textarea
                className="form-control"
                id="comment"
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Поділіться вашими думками про рецепт..."
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Додавання...' : 'Додати коментар'}
            </button>
          </form>
        </div>
      </div>

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="text-muted">Коментарів ще немає. Будьте першим!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="card mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="card-title mb-1">
                      {comment.author_name}
                      {comment.user && (
                        <small className="text-muted ms-2">(зареєстрований)</small>
                      )}
                    </h6>
                    <small className="text-muted">{formatDate(comment.created_at)}</small>
                  </div>
                  
                  {canEditDelete(comment) && (
                    <div className="dropdown">
                      <button 
                        className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                        type="button" 
                        data-bs-toggle="dropdown"
                      >
                        ⋯
                      </button>
                      <ul className="dropdown-menu">
                        <li>
                          <button 
                            className="dropdown-item" 
                            onClick={() => startEditing(comment)}
                          >
                            Редагувати
                          </button>
                        </li>
                        <li>
                          <button 
                            className="dropdown-item text-danger" 
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            Видалити
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
                
                {editingId === comment.id ? (
                  <div>
                    <textarea
                      className="form-control mb-2"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                    />
                    <button 
                      className="btn btn-sm btn-success me-2"
                      onClick={() => handleEditComment(comment.id)}
                    >
                      Зберегти
                    </button>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={cancelEditing}
                    >
                      Скасувати
                    </button>
                  </div>
                ) : (
                  <p className="card-text">{comment.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSystem;