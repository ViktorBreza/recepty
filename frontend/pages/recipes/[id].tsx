import React from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import RecipeDetail from '@/components/RecipeDetail';

interface RecipePageProps {
  id: string;
}

const RecipePage: React.FC<RecipePageProps> = ({ id }) => {
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
      title={`Рецепт - Кіт Кухар`}
      description="Переглядайте детальну інформацію про рецепт"
    >
      <RecipeDetail recipeId={parseInt(id)} />
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

export default RecipePage;