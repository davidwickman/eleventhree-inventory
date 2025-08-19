// src/utils/categoryStorage.jsx
import { saveItemsToJSON } from './itemsStorage';

export const getCategoriesForItemType = (items) => {
  const categorySet = new Set();
  Object.values(items).forEach(item => {
    if (item.category) {
      categorySet.add(item.category);
    }
  });
  return Array.from(categorySet).sort();
};

export const getItemCountByCategory = (items, categoryName) => {
  return Object.values(items).filter(item => item.category === categoryName).length;
};

export const updateItemsWithNewCategory = async (oldCategoryName, newCategoryName, itemType, customItems) => {
  const updatedCustomItems = { ...customItems };
  
  // Update all custom items in the specified type that have the old category
  Object.keys(updatedCustomItems[itemType] || {}).forEach(itemKey => {
    if (updatedCustomItems[itemType][itemKey].category === oldCategoryName) {
      updatedCustomItems[itemType][itemKey] = {
        ...updatedCustomItems[itemType][itemKey],
        category: newCategoryName
      };
    }
  });
  
  // Save to server
  await saveItemsToJSON(updatedCustomItems);
  return updatedCustomItems;
};

export const deleteItemsInCategory = async (categoryName, itemType, customItems) => {
  const updatedCustomItems = { ...customItems };
  const deletedItemKeys = [];
  
  // Find and remove all custom items in the specified category
  Object.keys(updatedCustomItems[itemType] || {}).forEach(itemKey => {
    if (updatedCustomItems[itemType][itemKey].category === categoryName) {
      delete updatedCustomItems[itemType][itemKey];
      deletedItemKeys.push(itemKey);
    }
  });
  
  // Save to server
  await saveItemsToJSON(updatedCustomItems);
  return { updatedCustomItems, deletedItemKeys };
};

export const validateCategoryName = (categoryName, existingCategories, currentName = null) => {
  const trimmedName = categoryName.trim();
  
  if (!trimmedName) {
    return { isValid: false, error: 'Category name cannot be empty' };
  }
  
  if (trimmedName.length > 50) {
    return { isValid: false, error: 'Category name must be 50 characters or less' };
  }
  
  const isDuplicate = existingCategories.some(cat => 
    cat.toLowerCase() === trimmedName.toLowerCase() && 
    cat !== currentName
  );
  
  if (isDuplicate) {
    return { isValid: false, error: 'Category name already exists' };
  }
  
  return { isValid: true, error: null };
};

export const getDefaultCategoriesForType = (itemType) => {
  const defaultCategories = {
    ingredients: ['Base', 'Sauce', 'Cheese', 'Meat', 'Vegetable', 'Herb', 'Seasoning', 'Salad', 'Dry Goods'],
    rawIngredients: ['Flour', 'Canned Goods', 'Cheese', 'Oil', 'Sauce', 'Herbs', 'Aromatics', 'Meat', 'Produce', 'Sauces', 'Supplies'],
    paperGoods: ['Napkins', 'Pizza Boxes', 'To-Go Items', 'Containers', 'Service Items', 'Retail Items']
  };
  
  return defaultCategories[itemType] || [];
};

export const isCategoryBuiltIn = (categoryName, itemType) => {
  const defaultCategories = getDefaultCategoriesForType(itemType);
  return defaultCategories.includes(categoryName);
};