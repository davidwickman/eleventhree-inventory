// src/components/ReorderList.jsx
import React from 'react';

const ReorderList = ({ 
  inventory, 
  toggleReorder, 
  updateReorderAmount,
  items,
  onEditItem,
  onDeleteItem,
  customItems = {}
}) => {
  const itemsByCategory = Object.entries(items).reduce((acc, [key, item]) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(key);
    return acc;
  }, {});

  const handleInputChange = (ingredient, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const currentAmount = inventory[ingredient]?.reorderAmount || 0;
      const delta = numValue - currentAmount;
      updateReorderAmount(ingredient, delta);
    }
  };

  return (
    <div className="space-y-6">
      {Object.entries(itemsByCategory).map(([category, itemKeys]) => (
        <div key={category} className="border rounded-lg">
          <div className="bg-gray-100 p-2 font-bold rounded-t-lg">
            {category}
          </div>
          <div className="p-2 space-y-2">
            {itemKeys.map((itemKey) => {
              const item = items[itemKey];
              const inventoryItem = inventory[itemKey] || {};
              const currentCount = inventoryItem.count || 0;

              return (
                <div 
                  key={itemKey} 
                  className="flex justify-between items-center p-3 border rounded hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={inventoryItem.needsReorder || false}
                      onChange={() => toggleReorder(itemKey)}
                      className="w-4 h-4"
                    />
                    <span className="font-medium">{item.name}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => onEditItem(itemKey, 'rawIngredients')}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                        title="Edit item"
                      >
                        Edit
                      </button>
                      {customItems[itemKey] && (
                        <button
                          onClick={() => onDeleteItem(itemKey, 'rawIngredients')}
                          className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                          title="Delete custom item"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      (Current: {currentCount} {item.unit})
                    </span>
                  </div>
                  
                  {inventoryItem.needsReorder && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Order:</span>
                      <button
                        onClick={() => updateReorderAmount(itemKey, -0.1)}
                        className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        -0.1
                      </button>
                      <button
                        onClick={() => updateReorderAmount(itemKey, -1)}
                        className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        −1
                      </button>
                      <input
                        type="number"
                        value={inventoryItem.reorderAmount || 0}
                        onChange={(e) => handleInputChange(itemKey, e.target.value)}
                        step="0.1"
                        className="w-20 text-center border rounded p-1"
                      />
                      <button
                        onClick={() => updateReorderAmount(itemKey, 1)}
                        className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => updateReorderAmount(itemKey, 0.1)}
                        className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        +0.1
                      </button>
                      <span className="text-sm text-gray-500 ml-2">
                        {item.unit}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="border-t-2 pt-4">
        <h2 className="font-bold text-lg mb-4 text-blue-700">
          Reorder List Summary
        </h2>
        <div className="space-y-2">
          {Object.entries(inventory)
            .filter(([_, item]) => item.needsReorder)
            .map(([itemKey, item]) => (
              <div 
                key={itemKey} 
                className="p-3 bg-blue-50 rounded border border-blue-200"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">
                      {items[itemKey]?.name}
                    </span>
                    <span className="text-sm text-gray-600 ml-2">
                      ({items[itemKey]?.category})
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      Current: {item.count} {items[itemKey]?.unit}
                    </span>
                    <span className="font-bold text-blue-600">
                      Order: {item.reorderAmount} {items[itemKey]?.unit}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ReorderList;