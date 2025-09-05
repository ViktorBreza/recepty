import React from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RecipeForm from '@/components/RecipeForm';

const AddRecipePage: React.FC = () => {
  return (
    <Layout 
      title="Додати рецепт - Кіт Кухар"
      description="Поділіться своїм улюбленим рецептом з іншими користувачами"
    >
      <ProtectedRoute>
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h2 className="mb-4">Додати новий рецепт</h2>
            <RecipeForm />
          </div>
        </div>
      </ProtectedRoute>
    </Layout>
  );
};

export default AddRecipePage;