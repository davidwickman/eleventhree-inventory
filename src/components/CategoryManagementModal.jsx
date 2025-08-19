import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  ConfirmDialog,
} from './ui/alert-dialog';

const CategoryManagementModal = ({ 
  open, 
  onOpenChange, 
  activeTab, 
  allIngredients, 
  allRawIngredients, 
  allPaperGoods,
  customItems,
  onUpdateCustomItems,
  customCategories,
  onUpdateCustomCategories,
  inventory,
  onUpdateInventory
}) => {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState({});

  // Get current item type and categories based on active tab - memoized to prevent recreation
  const config = React.useMemo(() => {
    switch (activeTab) {
      case 'prepped-inventory':
      case 'prep':
        return {
          type: 'ingredients',
          title: 'Manage Prepped Ingredient Categories',
          items: allIngredients,
          defaultCategories: ['Base', 'Sauce', 'Cheese', 'Meat', 'Vegetable', 'Herb', 'Seasoning', 'Salad', 'Dry Goods']
        };
      case 'raw-inventory':
      case 'reorder':
        return {
          type: 'rawIngredients',
          title: 'Manage Raw Ingredient Categories',
          items: allRawIngredients,
          defaultCategories: ['Flour', 'Canned Goods', 'Cheese', 'Oil', 'Sauce', 'Herbs', 'Aromatics', 'Meat', 'Produce', 'Sauces', 'Supplies']
        };
      case 'paper-goods':
        return {
          type: 'paperGoods',
          title: 'Manage Paper Goods Categories',
          items: allPaperGoods,
          defaultCategories: ['Napkins', 'Pizza Boxes', 'To-Go Items', 'Containers', 'Service Items', 'Retail Items']
        };
      default:
        return {
          type: 'ingredients',
          title: 'Manage Categories',
          items: {},
          defaultCategories: []
        };
    }
  }, [activeTab, allIngredients, allRawIngredients, allPaperGoods]);

  // Extract categories from items - only when modal opens or items change
  useEffect(() => {
    if (open && config.items) {
      const categorySet = new Set();
      
      // Add default categories
      config.defaultCategories.forEach(cat => categorySet.add(cat));
      
      // Add custom categories
      const customCatsForType = customCategories[config.type] || [];
      customCatsForType.forEach(cat => categorySet.add(cat));
      
      // Add categories from existing items
      Object.values(config.items).forEach(item => {
        if (item && item.category) {
          categorySet.add(item.category);
        }
      });
      
      const categoriesArray = Array.from(categorySet).map(cat => ({
        name: cat,
        isBuiltIn: config.defaultCategories.includes(cat),
        itemCount: Object.values(config.items).filter(item => item && item.category === cat).length
      })).sort((a, b) => a.name.localeCompare(b.name));
      
      setCategories(categoriesArray);
      setEditingCategory(null);
      setNewCategoryName('');
    }
  }, [open, config.items, config.defaultCategories, customCategories, config.type]);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const trimmedName = newCategoryName.trim();
    
    // Check if category already exists
    if (categories.some(cat => cat.name.toLowerCase() === trimmedName.toLowerCase())) {
      alert('Category already exists');
      return;
    }
    
    // Update local categories list
    setCategories(prev => [...prev, {
      name: trimmedName,
      isBuiltIn: false,
      itemCount: 0
    }].sort((a, b) => a.name.localeCompare(b.name)));
    
    // Add to custom categories storage
    const updatedCustomCategories = { ...customCategories };
    if (!updatedCustomCategories[config.type]) {
      updatedCustomCategories[config.type] = [];
    }
    if (!updatedCustomCategories[config.type].includes(trimmedName)) {
      updatedCustomCategories[config.type].push(trimmedName);
    }
    
    onUpdateCustomCategories(updatedCustomCategories);
    setNewCategoryName('');
  };

  const handleEditCategory = (oldName, newName) => {
    if (!newName.trim() || oldName === newName.trim()) {
      setEditingCategory(null);
      return;
    }
    
    const trimmedNewName = newName.trim();
    
    // Check if new name already exists
    if (categories.some(cat => cat.name.toLowerCase() === trimmedNewName.toLowerCase() && cat.name !== oldName)) {
      alert('Category name already exists');
      return;
    }
    
    // Update categories list
    setCategories(prev => prev.map(cat => 
      cat.name === oldName 
        ? { ...cat, name: trimmedNewName }
        : cat
    ).sort((a, b) => a.name.localeCompare(b.name)));
    
    // Update custom categories storage
    const updatedCustomCategories = { ...customCategories };
    if (updatedCustomCategories[config.type]) {
      const index = updatedCustomCategories[config.type].indexOf(oldName);
      if (index !== -1) {
        updatedCustomCategories[config.type][index] = trimmedNewName;
      }
    }
    
    // Update custom items with new category name
    const updatedCustomItems = { ...customItems };
    
    Object.keys(updatedCustomItems[config.type] || {}).forEach(itemKey => {
      if (updatedCustomItems[config.type][itemKey].category === oldName) {
        updatedCustomItems[config.type][itemKey] = {
          ...updatedCustomItems[config.type][itemKey],
          category: trimmedNewName
        };
      }
    });
    
    onUpdateCustomCategories(updatedCustomCategories);
    onUpdateCustomItems(updatedCustomItems);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    
    if (category.isBuiltIn) {
      alert('Built-in categories cannot be deleted');
      return;
    }
    
    if (category.itemCount > 0) {
      setConfirmAction({
        title: 'Delete Category with Items',
        description: `The category "${categoryName}" contains ${category.itemCount} items. Deleting this category will also delete all items in it and their inventory data. This action cannot be undone.`,
        action: () => performDeleteCategory(categoryName),
        variant: 'destructive'
      });
      setConfirmOpen(true);
    } else {
      performDeleteCategory(categoryName);
    }
  };

  const performDeleteCategory = (categoryName) => {
    // Remove category from list
    setCategories(prev => prev.filter(cat => cat.name !== categoryName));
    
    // Remove from custom categories storage
    const updatedCustomCategories = { ...customCategories };
    if (updatedCustomCategories[config.type]) {
      updatedCustomCategories[config.type] = updatedCustomCategories[config.type].filter(cat => cat !== categoryName);
    }
    
    // Remove custom items in this category
    const updatedCustomItems = { ...customItems };
    const updatedInventory = { ...inventory };
    
    Object.keys(updatedCustomItems[config.type] || {}).forEach(itemKey => {
      if (updatedCustomItems[config.type][itemKey].category === categoryName) {
        delete updatedCustomItems[config.type][itemKey];
        delete updatedInventory[itemKey];
      }
    });
    
    onUpdateCustomCategories(updatedCustomCategories);
    onUpdateCustomItems(updatedCustomItems);
    onUpdateInventory(updatedInventory);
  };

  return (
    <>
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>{config.title}</AlertDialogTitle>
          </AlertDialogHeader>
          
          <div className="space-y-6">
            {/* Add New Category */}
            <div className="border rounded-lg p-4 bg-green-50">
              <h3 className="font-medium text-green-800 mb-2">Add New Category</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="flex-1 p-2 border rounded-md"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Categories List */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800 mb-2">Existing Categories</h3>
              {categories.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No categories found</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {categories.map((category) => (
                    <div 
                      key={category.name}
                      className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {editingCategory === category.name ? (
                          <input
                            type="text"
                            defaultValue={category.name}
                            autoFocus
                            className="font-medium p-1 border rounded"
                            onBlur={(e) => handleEditCategory(category.name, e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleEditCategory(category.name, e.target.value);
                              } else if (e.key === 'Escape') {
                                setEditingCategory(null);
                              }
                            }}
                          />
                        ) : (
                          <span className="font-medium">{category.name}</span>
                        )}
                        
                        <span className={`px-2 py-1 text-xs rounded ${
                          category.isBuiltIn 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {category.isBuiltIn ? 'Built-in' : 'Custom'}
                        </span>
                        
                        <span className="text-sm text-gray-500">
                          {category.itemCount} items
                        </span>
                      </div>
                      
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingCategory(category.name)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                          title="Edit category"
                        >
                          Edit
                        </button>
                        {!category.isBuiltIn && (
                          <button
                            onClick={() => handleDeleteCategory(category.name)}
                            className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                            title="Delete category"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Category Management Notes:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Built-in categories can be edited but not deleted</li>
                <li>• Custom categories can be freely edited and deleted</li>
                <li>• Deleting a category will also delete all items in that category</li>
                <li>• Category names must be unique within each item type</li>
                <li>• Press Enter to save edits, Escape to cancel</li>
              </ul>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => onOpenChange(false)}>
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmAction.title}
        description={confirmAction.description}
        onConfirm={confirmAction.action}
        variant={confirmAction.variant}
      />
    </>
  );
};

export default CategoryManagementModal;