// src/utils/categoriesStorage.jsx

export const loadCategoriesFromJSON = async () => {
  try {
    const response = await fetch('./data/categories.json');
    
    if (response.ok) {
      const data = await response.json();
      return {
        ingredients: data.ingredients || [],
        rawIngredients: data.rawIngredients || [],
        paperGoods: data.paperGoods || []
      };
    } else if (response.status === 404) {
      // File doesn't exist, create it with default structure
      console.log('Categories file not found, will be created on first save');
      const defaultCategories = {
        ingredients: [],
        rawIngredients: [],
        paperGoods: []
      };
      
      // Try to create the file immediately
      try {
        await saveCategoriesToJSON(defaultCategories);
        console.log('Created new categories.json file');
      } catch (error) {
        console.warn('Could not create categories file immediately, will be created on first category addition');
      }
      
      return defaultCategories;
    }
    
    // Return empty structure for other errors
    return {
      ingredients: [],
      rawIngredients: [],
      paperGoods: []
    };
  } catch (error) {
    console.error('Error loading categories:', error);
    // Return default structure if there's any error
    return {
      ingredients: [],
      rawIngredients: [],
      paperGoods: []
    };
  }
};

export const saveCategoriesToJSON = async (categories) => {
  try {
    const response = await fetch('./api/save-categories.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categories)
    });

    if (!response.ok) {
      throw new Error('Failed to save categories');
    }

    const result = await response.json();
    if (result.created_file) {
      console.log('Categories file was created for the first time');
    }
    
    return result;
  } catch (error) {
    console.error('Error saving categories:', error);
    throw error;
  }
};