// Користувач
export interface User {
  id: number;
  email: string;
  username: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
}

// Категорії та теги
export interface Tag {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

// Інгредієнт
export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

// Медіа файл для кроку
export interface StepMedia {
  id?: string;
  type: 'image' | 'video';
  filename: string;
  url: string;
  alt?: string;
}

// Крок приготування
export interface CookingStep {
  id?: string;
  stepNumber: number;
  description: string;
  media?: StepMedia[];
}

// Рейтинг
export interface Rating {
  id: number;
  recipe_id: number;
  user_id?: number;
  session_id?: string;
  rating: number;
  created_at: string;
  updated_at?: string;
  user?: User;
}

// Коментар
export interface Comment {
  id: number;
  recipe_id: number;
  user_id?: number;
  session_id?: string;
  author_name: string;
  content: string;
  created_at: string;
  updated_at?: string;
  user?: User;
}

// Статистика рецепту
export interface RecipeStats {
  average_rating?: number | null;
  total_ratings: number;
  total_comments: number;
}

// Рецепт
export interface Recipe {
  id: number;
  title: string;
  description: string | null;
  ingredients: Ingredient[];
  steps: string | CookingStep[]; // Підтримуємо старий формат для зворотної сумісності
  servings: number;
  category: Category | null;
  tags: Tag[];
  ratings?: Rating[];
  comments?: Comment[];
}

// Запити для створення
export interface RatingCreate {
  recipe_id: number;
  rating: number;
  session_id?: string;
}

export interface CommentCreate {
  recipe_id: number;
  author_name: string;
  content: string;
  session_id?: string;
}
