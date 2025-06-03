// src/components/PrepList.jsx
import React from 'react';

const PrepList = ({ inventory, togglePrep, updatePrepAmount, items, onEditItem, onDeleteItem, customItems = {} }) => {
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
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={inventory[ing]?.needsPrep || false}
                    onChange={() => togglePrep(ing)}
                    className="w-4 h-4"
                  />
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
                  <span className="text-sm text-gray-500">
                    (Current: {inventory[ing]?.count || 0})
                  </span>
                </div>
                {inventory[ing]?.needsPrep && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Prep:</span>
                    <button 
                      onClick={() => updatePrepAmount(ing, -1)}
                      className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-medium">
                      {inventory[ing]?.prepAmount || 0}
                    </span>
                    <button 
                      onClick={() => updatePrepAmount(ing, 1)}
                      className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="border-t-2 pt-4">
        <h2 className="font-bold text-lg mb-4 text-red-700">Prep List Summary</h2>
        <div className="space-y-2">
          {Object.entries(inventory)
            .filter(([_, value]) => value.needsPrep)
            .map(([ing, value]) => (
              <div key={ing} 
                className="p-3 bg-red-50 rounded border border-red-200"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{items[ing]?.name}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      ({items[ing]?.category})
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      Current: {value.count}
                    </span>
                    <span className="font-bold text-red-600">
                      Prep: {value.prepAmount}
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

export default PrepList;