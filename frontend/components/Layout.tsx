import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/utils/logger';
import Navigation from '@/components/Navigation';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = "Кіт Кухар - Найкращі рецепти", 
  description = "Найкращі рецепти від нашого котика-кухаря! Знайдіть смачні страви або поділіться власними кулінарними шедеврами." 
}) => {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    logger.logPageView(router.pathname, user?.id);
  }, [router.pathname, user]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="container py-3">
        <Navigation />

        <main>
          {children}
        </main>

        <footer className="pt-4 my-md-5 pt-md-5 border-top">
          <div className="row align-items-center">
            <div className="col-12 col-md-6">
              <small className="d-block mb-3 text-muted">© 2025</small>
            </div>
            <div className="col-12 col-md-6 text-end">
              <img src="/favicon.ico" alt="Логотип" width="30" height="30" className="opacity-50" />
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout;