// src/components/PaperGoodsList.jsx
import React from 'react';
import { PAPER_GOODS } from '../data/paperGoods';

const PaperGoodsList = ({ 
  inventory, 
  updateCount 
}) => {
  const itemsByCategory = Object.entries(PAPER_GOODS).reduce((acc, [key, item]) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(key);
    return acc;
  }, {});

  const handleInputChange = (item, value) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      const currentValue = inventory[item]?.count || 0;
      const delta = numValue - currentValue;
      updateCount(item, delta);
    }
  };

  return (
    <div className="space-y-6">
      {Object.entries(itemsByCategory).map(([category, items]) => (
        <div key={category} className="border rounded-lg">
          <div className="bg-gray-100 p-2 font-bold rounded-t-lg">
            {category}
          </div>
          <div className="p-2 space-y-2">
            {items.map((itemKey) => {
              const item = PAPER_GOODS[itemKey];
              const currentCount = inventory[itemKey]?.count || 0;

              return (
                <div 
                  key={itemKey} 
                  className="flex justify-between items-center p-3 border rounded hover:bg-gray-50"
                >
                  <span className="font-medium">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCount(itemKey, -1)}
                      className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      −1
                    </button>
                    <input
                      type="number"
                      value={currentCount}
                      onChange={(e) => handleInputChange(itemKey, e.target.value)}
                      className="w-20 text-center border rounded p-1"
                    />
                    <button
                      onClick={() => updateCount(itemKey, 1)}
                      className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      +1
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

export default PaperGoodsList;