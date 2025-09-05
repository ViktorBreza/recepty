import React from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const TagsPage: React.FC = () => {
  return (
    <Layout 
      title="Теги - Кіт Кухар"
      description="Управління тегами рецептів"
    >
      <ProtectedRoute adminRequired>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Теги</h2>
          <div className="btn-group">
            <button className="btn btn-success">
              + Додати тег
            </button>
          </div>
        </div>
        
        <div className="alert alert-info" role="alert">
          <strong>В розробці:</strong> Управління тегами буде доступне найближчим часом.
        </div>
      </ProtectedRoute>
    </Layout>
  );
};

export default TagsPage;