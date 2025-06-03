// src/components/InventoryList.jsx
import React from 'react';

const InventoryList = ({ inventory, updateCount, items, onEditItem, onDeleteItem, customItems = {} }) => {
  const categories = Object.entries(items).reduce((acc, [key, value]) => {
    if (!acc[value.category]) acc[value.category] = [];
    acc[value.category].push(key);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(categories).map(([category, ingredients]) => (
        <div key={category} className="border rounded-lg">
          <div className="bg-gray-100 p-2 font-bold rounded-t-lg">
            {category}
          </div>
          <div className="p-2 space-y-2">
            {ingredients.map(ing => (
              <div key={ing} 
                className="flex justify-between items-center p-3 border rounded hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{items[ing].name}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onEditItem(ing, 'ingredients')}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      title="Edit item"
                    >
                      Edit
                    </button>
                    {customItems[ing] && (
                      <button
                        onClick={() => onDeleteItem(ing, 'ingredients')}
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
                    onClick={() => updateCount(ing, -1)}
                    className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-medium">
                    {inventory[ing]?.count || 0}
                  </span>
                  <button 
                    onClick={() => updateCount(ing, 1)}
                    className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryList;