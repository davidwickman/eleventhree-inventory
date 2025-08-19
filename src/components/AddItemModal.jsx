// src/components/AddItemModal.jsx
import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from './ui/alert-dialog';
import { getCategoriesForItemType, getDefaultCategoriesForType } from '../utils/categoryStorage';

const AddItemModal = ({ 
  open, 
  onOpenChange, 
  onAddItem, 
  onUpdateItem, 
  activeTab, 
  editingItem = null,
  allIngredients,
  allRawIngredients, 
  allPaperGoods,
  customCategories
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    key: ''
  });
  const [errors, setErrors] = useState({});
  const [availableCategories, setAvailableCategories] = useState([]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      if (editingItem) {
        // Populate form with existing item data
        setFormData({
          name: editingItem.name || '',
          category: editingItem.category || '',
          unit: editingItem.unit || '',
          key: editingItem.key || ''
        });
      } else {
        // Reset form for new item
        setFormData({
          name: '',
          category: '',
          unit: '',
          key: ''
        });
      }
      setErrors({});
    }
  }, [open, editingItem]);

  // Auto-generate key from name (only for new items)
  useEffect(() => {
    if (formData.name && !editingItem) {
      const key = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '')
        .slice(0, 20);
      setFormData(prev => ({ ...prev, key }));
    }
  }, [formData.name, editingItem]);

  // Update available categories when activeTab changes
  useEffect(() => {
    const updateCategories = () => {
      if (open) {
        const config = getItemConfig();
        const existingCategories = getCategoriesForItemType(config.items);
        const defaultCategories = getDefaultCategoriesForType(config.type);
        const customCategoriesForType = customCategories[config.type] || [];
        
        // Combine and deduplicate categories
        const allCategories = [...new Set([...defaultCategories, ...customCategoriesForType, ...existingCategories])].sort();
        setAvailableCategories(allCategories);
      }
    };
    
    updateCategories();
  }, [open, activeTab, allIngredients, allRawIngredients, allPaperGoods, customCategories]);

  // Get item type and categories based on active tab
  const getItemConfig = () => {
    switch (activeTab) {
      case 'prepped-inventory':
      case 'prep':
        return {
          type: 'ingredients',
          title: editingItem ? 'Edit Prepped Ingredient' : 'Add Prepped Ingredient',
          items: allIngredients,
          needsUnit: false
        };
      case 'raw-inventory':
      case 'reorder':
        return {
          type: 'rawIngredients',
          title: editingItem ? 'Edit Raw Ingredient' : 'Add Raw Ingredient',
          items: allRawIngredients,
          needsUnit: true
        };
      case 'paper-goods':
        return {
          type: 'paperGoods',
          title: editingItem ? 'Edit Paper Good' : 'Add Paper Good',
          items: allPaperGoods,
          needsUnit: true
        };
      default:
        return {
          type: 'ingredients',
          title: editingItem ? 'Edit Item' : 'Add Item',
          items: {},
          needsUnit: false
        };
    }
  };

  const config = getItemConfig();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (config.needsUnit && !formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }
    
    if (!formData.key.trim()) {
      newErrors.key = 'Key is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      if (editingItem) {
        onUpdateItem({
          oldKey: editingItem.key,
          type: config.type,
          key: formData.key,
          name: formData.name.trim(),
          category: formData.category.trim(),
          unit: config.needsUnit ? formData.unit.trim() : undefined,
          isBuiltIn: editingItem.isBuiltIn
        });
      } else {
        onAddItem({
          type: config.type,
          key: formData.key,
          name: formData.name.trim(),
          category: formData.category.trim(),
          unit: config.needsUnit ? formData.unit.trim() : undefined
        });
      }
      onOpenChange(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{config.title}</AlertDialogTitle>
        </AlertDialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter item name"
              className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`w-full p-2 border rounded-md ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select a category</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Don't see your category? Use "Manage Categories" to add new ones.
            </p>
          </div>

          {config.needsUnit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit *
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                placeholder="e.g., kg, bottles, cases, units"
                className={`w-full p-2 border rounded-md ${errors.unit ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.unit && <p className="text-red-500 text-xs mt-1">{errors.unit}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              System Key *
            </label>
            <input
              type="text"
              value={formData.key}
              onChange={(e) => handleInputChange('key', e.target.value)}
              placeholder="Auto-generated from name"
              disabled={!!editingItem}
              className={`w-full p-2 border rounded-md ${editingItem ? 'bg-gray-100' : ''} ${errors.key ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.key && <p className="text-red-500 text-xs mt-1">{errors.key}</p>}
            <p className="text-xs text-gray-500 mt-1">
              {editingItem ? 
                (editingItem.isBuiltIn ? 
                  'System key cannot be changed for built-in items' : 
                  'System key cannot be changed when editing'
                ) : 
                'This is the internal identifier for the item'
              }
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700"
          >
            {editingItem ? 'Update Item' : 'Add Item'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AddItemModal;