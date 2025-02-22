import { INGREDIENTS } from '../data/ingredients';
import { RAW_INGREDIENTS } from '../data/rawIngredients';

export const loadInventoryFromJSON = async () => {
  try {
    const preppedResponse = await fetch('./data/prepped-inventory.json');
    const rawResponse = await fetch('./data/raw-inventory.json');
    let inventory = {};

    if (preppedResponse.ok) {
      const preppedData = await preppedResponse.json();
      Object.entries(preppedData).forEach(([key, value]) => {
        if (INGREDIENTS[key]) {
          inventory[key] = {
            count: value.count || 0,
            needsPrep: Boolean(value.needsPrep),
            prepAmount: value.prepAmount || 0
          };
        }
      });
    }

    if (rawResponse.ok) {
      const rawData = await rawResponse.json();
      Object.entries(rawData).forEach(([key, value]) => {
        if (RAW_INGREDIENTS[key]) {
          inventory[key] = {
            count: value.count || 0,
            needsReorder: Boolean(value.needsReorder),
            reorderAmount: value.reorderAmount || 0
          };
        }
      });
    }

    return inventory;
  } catch (error) {
    console.error('Error loading inventory:', error);
    return {};
  }
};

export const saveInventoryToJSON = async (inventory) => {
  try {
    // Separate prepped and raw items
    const preppedItems = {};
    const rawItems = {};

    Object.entries(inventory).forEach(([key, value]) => {
      if (RAW_INGREDIENTS[key]) {
        rawItems[key] = {
          count: value.count || 0,
          needsReorder: Boolean(value.needsReorder),
          reorderAmount: value.reorderAmount || 0
        };
      } else if (INGREDIENTS[key]) {
        preppedItems[key] = {
          count: value.count || 0,
          needsPrep: Boolean(value.needsPrep),
          prepAmount: value.prepAmount || 0
        };
      }
    });

    // Save prepped inventory
    const preppedResponse = await fetch('./api/save-inventory.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Inventory-Type': 'prepped'
      },
      body: JSON.stringify(preppedItems)
    });

    // Save raw inventory
    const rawResponse = await fetch('./api/save-inventory.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Inventory-Type': 'raw'
      },
      body: JSON.stringify(rawItems)
    });

    if (!preppedResponse.ok || !rawResponse.ok) {
      throw new Error('Failed to save inventory');
    }
  } catch (error) {
    throw error;
  }
};