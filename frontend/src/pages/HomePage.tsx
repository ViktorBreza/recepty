import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="position-relative p-5 mb-4 rounded-3 overflow-hidden" style={{
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    }}>
      <div className="container-fluid py-5">
        <div className="row align-items-center">
          <div className="col-lg-7">
            <h1 className="display-5 fw-bold mb-4">Ласкаво просимо до Кіт Кухар!</h1>
            <p className="fs-4 mb-4">
              Найкращі рецепти від нашого котика-кухаря! 
              Знайдіть смачні страви або поділіться власними кулінарними шедеврами.
            </p>
            <Link className="btn btn-primary btn-lg" to="/recipes">
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
      
      <div 
        className="position-absolute top-0 end-0 opacity-25" 
        style={{
          background: 'radial-gradient(circle, rgba(255,107,157,0.1) 0%, transparent 70%)',
          width: '300px',
          height: '300px',
          transform: 'translate(100px, -100px)'
        }}
      />
      
      <div 
        className="position-absolute bottom-0 start-0 opacity-25" 
        style={{
          background: 'radial-gradient(circle, rgba(74,74,74,0.05) 0%, transparent 70%)',
          width: '200px',
          height: '200px',
          transform: 'translate(-50px, 50px)'
        }}
      />
    </div>
  );
};

export default HomePage;
