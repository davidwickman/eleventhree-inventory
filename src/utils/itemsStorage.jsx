// src/utils/itemsStorage.jsx

export const loadItemsFromJSON = async () => {
  try {
    const response = await fetch('./data/custom-items.json');
    
    if (response.ok) {
      const data = await response.json();
      return {
        ingredients: data.ingredients || {},
        rawIngredients: data.rawIngredients || {},
        paperGoods: data.paperGoods || {}
      };
    }
    
    // Return empty structure if file doesn't exist
    return {
      ingredients: {},
      rawIngredients: {},
      paperGoods: {}
    };
  } catch (error) {
    console.error('Error loading custom items:', error);
    return {
      ingredients: {},
      rawIngredients: {},
      paperGoods: {}
    };
  }
};

export const saveItemsToJSON = async (customItems) => {
  try {
    const response = await fetch('./api/save-custom-items.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customItems)
    });

    if (!response.ok) {
      throw new Error('Failed to save custom items');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving custom items:', error);
    throw error;
  }
};

export const deleteCustomItem = async (itemKey, itemType, customItems) => {
  try {
    const updatedItems = { ...customItems };
    if (updatedItems[itemType] && updatedItems[itemType][itemKey]) {
      delete updatedItems[itemType][itemKey];
    }
    
    await saveItemsToJSON(updatedItems);
    return updatedItems;
  } catch (error) {
    console.error('Error deleting custom item:', error);
    throw error;
  }
};