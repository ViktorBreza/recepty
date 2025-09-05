import React from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';

const HomePage: React.FC = () => {
  return (
    <Layout 
      title="Кіт Кухар - Найкращі рецепти"
      description="Ласкаво просимо до Кіт Кухар! Найкращі рецепти від нашого котика-кухаря! Знайдіть смачні страви або поділіться власними кулінарними шедеврами."
    >
      <div className="position-relative p-5 mb-4 rounded-4 overflow-hidden" style={{
        background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(226, 232, 240, 0.4)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
      }}>
        <div className="container-fluid py-5">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <h1 className="display-5 fw-bold mb-4" style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                Ласкаво просимо до Кіт Кухар!
              </h1>
              <p className="fs-4 mb-4" style={{ color: '#475569', lineHeight: '1.6' }}>
                Найкращі рецепти від нашого котика-кухаря! 
                Знайдіть смачні страви або поділіться власними кулінарними шедеврами.
              </p>
              <Link className="btn btn-lg px-4 py-3 hero-button" href="/recipes" style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontWeight: '600',
                boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
              }}>
                Переглянути рецепти
              </Link>
            </div>
            <div className="col-lg-5 text-center">
              <img 
                src="/maskot.svg" 
                alt="Маскот кіт-кухар" 
                className="img-fluid mascot-hover-effect"
                style={{
                  maxWidth: '280px',
                  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))',
                  animation: 'gentle-float 3s ease-in-out infinite'
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Декоративні елементи */}
        <div 
          className="position-absolute top-0 end-0 opacity-20" 
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
            width: '350px',
            height: '350px',
            transform: 'translate(100px, -100px)',
            filter: 'blur(1px)'
          }}
        />
        
        <div 
          className="position-absolute bottom-0 start-0 opacity-15" 
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
            width: '250px',
            height: '250px',
            transform: 'translate(-70px, 70px)',
            filter: 'blur(1px)'
          }}
        />

        {/* Додаткові акцентні елементи */}
        <div 
          className="position-absolute" 
          style={{
            top: '20%',
            right: '15%',
            width: '60px',
            height: '60px',
            background: 'linear-gradient(45deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))',
            borderRadius: '50%',
            filter: 'blur(2px)'
          }}
        />
        
        <div 
          className="position-absolute" 
          style={{
            bottom: '25%',
            left: '10%',
            width: '40px',
            height: '40px',
            background: 'linear-gradient(45deg, rgba(249, 115, 22, 0.1), rgba(245, 101, 101, 0.1))',
            borderRadius: '50%',
            filter: 'blur(1px)'
          }}
        />
      </div>
    </Layout>
  );
};

export default HomePage;