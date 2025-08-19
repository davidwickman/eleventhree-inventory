// src/utils/jsonStorage.jsx - Updated with auto-creation
import { INGREDIENTS } from '../data/ingredients';
import { RAW_INGREDIENTS } from '../data/rawIngredients';
import { PAPER_GOODS } from '../data/paperGoods';
import { addCacheBuster } from './antiCache';
import { ensureDataFileExists } from './dataFileManager';

export const loadInventoryFromJSON = async () => {
  try {
    // Ensure files exist before trying to load them
    const [preppedData, rawData, paperData] = await Promise.all([
      ensureDataFileExists('prepped-inventory.json', {}),
      ensureDataFileExists('raw-inventory.json', {}),
      ensureDataFileExists('paper-inventory.json', {})
    ]);
    
    let inventory = {};

    // Process prepped inventory
    Object.entries(preppedData).forEach(([key, value]) => {
      inventory[key] = {
        count: value.count || 0,
        needsPrep: Boolean(value.needsPrep),
        prepAmount: value.prepAmount || 0
      };
    });

    // Process raw inventory
    Object.entries(rawData).forEach(([key, value]) => {
      inventory[key] = {
        count: value.count || 0,
        needsReorder: Boolean(value.needsReorder),
        reorderAmount: value.reorderAmount || 0
      };
    });

    // Process paper goods
    Object.entries(paperData).forEach(([key, value]) => {
      inventory[key] = {
        count: value.count || 0
      };
    });

    return inventory;
  } catch (error) {
    console.error('Error loading inventory:', error);
    return {};
  }
};

export const saveInventoryToJSON = async (inventory) => {
  try {
    // Load custom items to determine item types
    let customItems = {};
    try {
      customItems = await ensureDataFileExists('custom-items.json', {
        ingredients: {},
        rawIngredients: {},
        paperGoods: {}
      });
    } catch (error) {
      console.warn('Could not load custom items for categorization:', error);
    }

    // Separate prepped, raw, and paper items
    const preppedItems = {};
    const rawItems = {};
    const paperItems = {};

    Object.entries(inventory).forEach(([key, value]) => {
      if (RAW_INGREDIENTS[key] || customItems.rawIngredients?.[key]) {
        rawItems[key] = {
          count: value.count || 0,
          needsReorder: Boolean(value.needsReorder),
          reorderAmount: value.reorderAmount || 0
        };
      } else if (INGREDIENTS[key] || customItems.ingredients?.[key]) {
        preppedItems[key] = {
          count: value.count || 0,
          needsPrep: Boolean(value.needsPrep),
          prepAmount: value.prepAmount || 0
        };
      } else if (PAPER_GOODS[key] || customItems.paperGoods?.[key]) {
        paperItems[key] = {
          count: value.count || 0
        };
      }
    });

    // Save prepped inventory
    const preppedResponse = await fetch('./api/save-inventory.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Inventory-Type': 'prepped',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(preppedItems)
    });

    // Save raw inventory
    const rawResponse = await fetch('./api/save-inventory.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Inventory-Type': 'raw',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(rawItems)
    });

    // Save paper goods inventory
    const paperResponse = await fetch('./api/save-inventory.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Inventory-Type': 'paper',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(paperItems)
    });

    if (!preppedResponse.ok || !rawResponse.ok || !paperResponse.ok) {
      throw new Error('Failed to save inventory');
    }
  } catch (error) {
    throw error;
  }
};