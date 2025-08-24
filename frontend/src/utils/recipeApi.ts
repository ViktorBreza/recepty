import { API_ENDPOINTS } from '../config/api';

export const deleteRecipe = async (id: number, token: string): Promise<void> => {
  const response = await fetch(API_ENDPOINTS.RECIPE_DELETE(id), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to delete recipe');
  }
};