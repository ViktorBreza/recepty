import React from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const CategoriesPage: React.FC = () => {
  return (
    <Layout 
      title="Категорії - Кіт Кухар"
      description="Управління категоріями рецептів"
    >
      <ProtectedRoute adminRequired>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Категорії</h2>
          <div className="btn-group">
            <button className="btn btn-success">
              + Додати категорію
            </button>
          </div>
        </div>
        
        <div className="alert alert-info" role="alert">
          <strong>В розробці:</strong> Управління категоріями буде доступне найближчим часом.
        </div>
      </ProtectedRoute>
    </Layout>
  );
};

export default CategoriesPage;