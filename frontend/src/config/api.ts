// API Configuration
export const API_BASE_URL = `http://${window.location.hostname}:8001`;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  AUTH_REGISTER: `${API_BASE_URL}/auth/register`,
  AUTH_ME: `${API_BASE_URL}/auth/me`,
  
  // Recipes  
  RECIPES: `${API_BASE_URL}/recipes`,
  RECIPE_DELETE: (id: number) => `${API_BASE_URL}/recipes/${id}`,
  
  // Categories
  CATEGORIES: `${API_BASE_URL}/categories`,
  
  // Tags
  TAGS: `${API_BASE_URL}/tags`,
  
  // Media
  MEDIA_UPLOAD: `${API_BASE_URL}/media`,
  
  // Ratings
  RATINGS: `${API_BASE_URL}/ratings`,
  
  // Comments
  COMMENTS: `${API_BASE_URL}/comments`,
};