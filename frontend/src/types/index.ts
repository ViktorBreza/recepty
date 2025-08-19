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

// Рецепт
export interface Recipe {
  id: number;
  title: string;
  description: string | null;
  ingredients: Ingredient[];
  steps: string;
  servings: number;
  category: Category | null;
  tags: Tag[];
}
