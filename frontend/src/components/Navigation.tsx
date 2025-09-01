import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation: React.FC = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header>
      <div className="d-flex flex-column flex-md-row align-items-center pb-3 mb-4 border-bottom">
        <Link to="/" className="d-flex align-items-center text-dark text-decoration-none">
          <img src="/logo.svg" alt="Логотип" width="40" height="40" className="me-2" />
          <span className="fs-4">Кіт Кухар</span>
        </Link>

        <nav className="d-inline-flex mt-2 mt-md-0 ms-md-auto align-items-center">
          <NavLink to="/" className="me-3 py-2 text-dark text-decoration-none" end>
            Головна
          </NavLink>
          <NavLink to="/recipes" className="me-3 py-2 text-dark text-decoration-none">
            Рецепти
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink to="/add-recipe" className="me-3 py-2 text-dark text-decoration-none">
                Додати рецепт
              </NavLink>
              
              {isAdmin && (
                <>
                  <NavLink to="/categories" className="me-3 py-2 text-dark text-decoration-none">
                    Категорії
                  </NavLink>
                  <NavLink to="/tags" className="me-3 py-2 text-dark text-decoration-none">
                    Теги
                  </NavLink>
                </>
              )}
            </>
          )}

          {isAuthenticated ? (
            <div className="dropdown">
              <button 
                className="btn btn-outline-secondary dropdown-toggle" 
                type="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                {user?.username}
                {isAdmin && <span className="badge bg-warning text-dark ms-1">Адмін</span>}
              </button>
              <ul className="dropdown-menu">
                <li>
                  <button className="dropdown-item" onClick={handleLogout}>
                    Вийти
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <>
              <NavLink to="/login" className="me-3 py-2 text-dark text-decoration-none">
                Вхід
              </NavLink>
              <NavLink to="/register" className="btn btn-outline-primary">
                Реєстрація
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navigation;