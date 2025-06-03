// src/components/RawInventoryList.jsx
import React from 'react';

const RawInventoryList = ({ 
  inventory, 
  updateCount,
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
      // Calculate the delta from the current value
      const currentValue = inventory[ingredient]?.count || 0;
      const delta = numValue - currentValue;
      updateCount(ingredient, delta);
    }
  };

  const handleIncrement = (ingredient, delta) => {
    updateCount(ingredient, delta);
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
              const currentCount = inventory[itemKey]?.count || 0;

              return (
                <div 
                  key={itemKey} 
                  className="flex justify-between items-center p-3 border rounded hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
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
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleIncrement(itemKey, -0.1)}
                      className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      -0.1
                    </button>
                    <button
                      onClick={() => handleIncrement(itemKey, -1)}
                      className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      −1
                    </button>
                    <input
                      type="number"
                      value={currentCount}
                      onChange={(e) => handleInputChange(itemKey, e.target.value)}
                      step="0.1"
                      className="w-20 text-center border rounded p-1"
                    />
                    <button
                      onClick={() => handleIncrement(itemKey, 1)}
                      className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleIncrement(itemKey, 0.1)}
                      className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      +0.1
                    </button>
                    <span className="text-sm text-gray-500 ml-2">
                      {item.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RawInventoryList;