// API Configuration
export const API_BASE_URL = 'http://127.0.0.1:8002';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  AUTH_REGISTER: `${API_BASE_URL}/auth/register`,
  AUTH_ME: `${API_BASE_URL}/auth/me`,
  
  // Recipes  
  RECIPES: `${API_BASE_URL}/recipes`,
  
  // Categories
  CATEGORIES: `${API_BASE_URL}/categories`,
  
  // Tags
  TAGS: `${API_BASE_URL}/tags`,
  
  // Media
  MEDIA_UPLOAD: `${API_BASE_URL}/media`,
};