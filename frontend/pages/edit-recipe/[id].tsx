import React from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RecipeForm from '@/components/RecipeForm';

interface EditRecipePageProps {
  id: string;
}

const EditRecipePage: React.FC<EditRecipePageProps> = ({ id }) => {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <Layout>
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Завантаження...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title="Редагувати рецепт - Кіт Кухар"
      description="Редагувати свій рецепт"
    >
      <ProtectedRoute>
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h2 className="mb-4">Редагувати рецепт</h2>
            <RecipeForm recipeId={parseInt(id)} />
          </div>
        </div>
      </ProtectedRoute>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;

  return {
    props: {
      id: id as string,
    },
  };
};

export default EditRecipePage;