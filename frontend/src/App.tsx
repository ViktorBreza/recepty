import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RecipesPage from './pages/RecipesPage';
import AddRecipePage from './pages/AddRecipePage';
import EditRecipePage from './pages/EditRecipePage';
import TagsPage from './pages/TagsPage';
import AddTagPage from './pages/AddTagPage';
import EditTagPage from './pages/EditTagPage';
import CategoriesPage from './pages/CategoriesPage';
import AddCategoryPage from './pages/AddCategoryPage';
import EditCategoryPage from './pages/EditCategoryPage';
import RecipeDetail from './components/RecipeDetail';

function App() {
  return (
    <Router>
      <div className="container py-3">
        <header>
          <div className="d-flex flex-column flex-md-row align-items-center pb-3 mb-4 border-bottom">
            <Link to="/" className="d-flex align-items-center text-dark text-decoration-none">
              <span className="fs-4">🍳 Книга Рецептів</span>
            </Link>

            <nav className="d-inline-flex mt-2 mt-md-0 ms-md-auto">
              <NavLink to="/" className="me-3 py-2 text-dark text-decoration-none" end>
                Головна
              </NavLink>
              <NavLink to="/recipes" className="me-3 py-2 text-dark text-decoration-none">
                Рецепти
              </NavLink>
              <NavLink to="/categories" className="me-3 py-2 text-dark text-decoration-none">
                Категорії
              </NavLink>
              <NavLink to="/tags" className="me-3 py-2 text-dark text-decoration-none">
                Теги
              </NavLink>
              <NavLink to="/add-recipe" className="me-3 py-2 text-dark text-decoration-none">
                Додати рецепт
              </NavLink>
            </nav>
          </div>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/add-recipe" element={<AddRecipePage />} />
            <Route path="/edit-recipe/:id" element={<EditRecipePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/add-category" element={<AddCategoryPage />} />
            <Route path="/edit-category/:id" element={<EditCategoryPage />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/add-tag" element={<AddTagPage />} />
            <Route path="/edit-tag/:id" element={<EditTagPage />} />
            <Route path="/recipes/:id" element={<RecipeDetail />} />
          </Routes>
        </main>

        <footer className="pt-4 my-md-5 pt-md-5 border-top">
          <div className="row">
            <div className="col-12 col-md">
              <small className="d-block mb-3 text-muted">© 2025</small>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
