import { INGREDIENTS } from '../data/ingredients';
import { RAW_INGREDIENTS } from '../data/rawIngredients';
import { PAPER_GOODS } from '../data/paperGoods';

export const loadInventoryFromJSON = async () => {
  try {
    const preppedResponse = await fetch('./data/prepped-inventory.json');
    const rawResponse = await fetch('./data/raw-inventory.json');
    const paperResponse = await fetch('./data/paper-inventory.json');
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

    if (paperResponse.ok) {
      const paperData = await paperResponse.json();
      Object.entries(paperData).forEach(([key, value]) => {
        if (PAPER_GOODS[key]) {
          inventory[key] = {
            count: value.count || 0
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
    // Separate prepped, raw, and paper items
    const preppedItems = {};
    const rawItems = {};
    const paperItems = {};

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
      } else if (PAPER_GOODS[key]) {
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

    // Save paper goods inventory
    const paperResponse = await fetch('./api/save-inventory.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Inventory-Type': 'paper'
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