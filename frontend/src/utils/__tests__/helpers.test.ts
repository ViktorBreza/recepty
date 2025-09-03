// Basic utility function tests

describe('Utility Functions', () => {
  test('string formatting works correctly', () => {
    const testString = 'Hello World';
    expect(testString.toLowerCase()).toBe('hello world');
    expect(testString.toUpperCase()).toBe('HELLO WORLD');
  });

  test('number formatting for cooking times', () => {
    const formatTime = (minutes: number): string => {
      if (minutes < 60) {
        return `${minutes} хв`;
      }
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours} год ${mins} хв` : `${hours} год`;
    };

    expect(formatTime(30)).toBe('30 хв');
    expect(formatTime(60)).toBe('1 год');
    expect(formatTime(90)).toBe('1 год 30 хв');
    expect(formatTime(120)).toBe('2 год');
  });

  test('difficulty translation works', () => {
    const translateDifficulty = (difficulty: string): string => {
      const translations: Record<string, string> = {
        'easy': 'Легко',
        'medium': 'Середньо', 
        'hard': 'Складно'
      };
      return translations[difficulty] || difficulty;
    };

    expect(translateDifficulty('easy')).toBe('Легко');
    expect(translateDifficulty('medium')).toBe('Середньо');
    expect(translateDifficulty('hard')).toBe('Складно');
    expect(translateDifficulty('unknown')).toBe('unknown');
  });

  test('array operations work correctly', () => {
    const ingredients = ['мука', 'яйця', 'молоко'];
    
    expect(ingredients).toHaveLength(3);
    expect(ingredients).toContain('мука');
    expect(ingredients.join(', ')).toBe('мука, яйця, молоко');
  });

  test('object validation works', () => {
    const validateRecipe = (recipe: any): boolean => {
      return !!(recipe && recipe.title && recipe.description && recipe.prep_time >= 0);
    };

    const validRecipe = {
      title: 'Test Recipe',
      description: 'Test Description',
      prep_time: 15
    };

    const invalidRecipe = {
      title: '',
      description: 'Test Description'
    };

    expect(validateRecipe(validRecipe)).toBe(true);
    expect(validateRecipe(invalidRecipe)).toBe(false);
    expect(validateRecipe(null)).toBe(false);
  });
});