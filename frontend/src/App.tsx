import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navigation from './components/Navigation';
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
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="container py-3">
          <Navigation />

          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/recipes" element={<RecipesPage />} />
              <Route path="/recipes/:id" element={<RecipeDetail />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              <Route 
                path="/add-recipe" 
                element={
                  <ProtectedRoute>
                    <AddRecipePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/edit-recipe/:id" 
                element={
                  <ProtectedRoute>
                    <EditRecipePage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/categories" 
                element={
                  <ProtectedRoute adminRequired>
                    <CategoriesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/add-category" 
                element={
                  <ProtectedRoute adminRequired>
                    <AddCategoryPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/edit-category/:id" 
                element={
                  <ProtectedRoute adminRequired>
                    <EditCategoryPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/tags" 
                element={
                  <ProtectedRoute adminRequired>
                    <TagsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/add-tag" 
                element={
                  <ProtectedRoute adminRequired>
                    <AddTagPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/edit-tag/:id" 
                element={
                  <ProtectedRoute adminRequired>
                    <EditTagPage />
                  </ProtectedRoute>
                } 
              />
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
    </AuthProvider>
  );
}

export default App;
