// components/PrintReorder.jsx
import React from 'react';
import { RAW_INGREDIENTS } from '../data/rawIngredients';

const PrintReorder = ({ reorderItems, onClose }) => {
  const date = new Date().toLocaleDateString();
  
  // Group items by category
  const itemsByCategory = reorderItems.reduce((acc, [key, item]) => {
    const category = RAW_INGREDIENTS[key].category;
    if (!acc[category]) acc[category] = [];
    acc[category].push({ key, ...item });
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-white overflow-auto">
      <div className="print:hidden p-4 bg-gray-100 border-b sticky top-0">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Print Preview</h1>
          <div className="space-x-2">
            <button
              onClick={() => { window.print(); }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Print
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <div className="print-page p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">
              Eleventhree Pizza Reorder List
            </h1>
            <p>{date}</p>
          </div>

          {Object.entries(itemsByCategory).length === 0 ? (
            <p className="text-center text-gray-500">
              No items marked for reorder
            </p>
          ) : (
            <>
              {Object.entries(itemsByCategory).map(([category, items]) => (
                <div key={category} className="mb-6">
                  <h2 className="text-xl font-bold border-b-2 border-black mb-3">
                    {category}
                  </h2>
                  <div className="space-y-3">
                    {items.map(({ key, count, reorderAmount }) => (
                      <div key={key} className="flex items-center gap-4">
                        <div className="w-5 h-5 border-2 border-black flex-shrink-0" />
                        <div className="flex-grow">
                          <span className="font-medium">
                            {RAW_INGREDIENTS[key].name}
                          </span>
                          <span className="text-gray-600 ml-2">
                            (Current: {count} {RAW_INGREDIENTS[key].unit})
                          </span>
                        </div>
                        <div className="font-bold flex-shrink-0">
                          Order: {reorderAmount} {RAW_INGREDIENTS[key].unit}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="mt-8 pt-4 border-t border-gray-400">
                <p className="font-medium mb-2">Notes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>All quantities should be verified before ordering</li>
                  <li>Generated from inventory system on {date}</li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-400">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="mb-2">Prepared by:</div>
                    <div className="border-b-2 border-black h-8" />
                  </div>
                  <div>
                    <div className="mb-2">Approved by:</div>
                    <div className="border-b-2 border-black h-8" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintReorder;