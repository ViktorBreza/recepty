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
}
