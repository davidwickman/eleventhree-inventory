import React from 'react';
import { INGREDIENTS } from '../data/ingredients';

const PrepList = ({ inventory, togglePrep, updatePrepAmount }) => {
  const categories = Object.entries(INGREDIENTS).reduce((acc, [key, value]) => {
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
                  <span className="font-medium">{INGREDIENTS[ing].name}</span>
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
                    <span className="font-medium">{INGREDIENTS[ing].name}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      ({INGREDIENTS[ing].category})
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