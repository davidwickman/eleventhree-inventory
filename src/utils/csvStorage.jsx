import Papa from 'papaparse';
import { INGREDIENTS } from '../data/ingredients';
import { RAW_INGREDIENTS } from '../data/rawIngredients';

export const loadInventoryFromCSV = async () => {
  try {
    const preppedResponse = await fetch('./data/prepped-inventory.csv');
    const rawResponse = await fetch('./data/raw-inventory.csv');
    
    // If neither file exists, return empty inventory
    if (!preppedResponse.ok && !rawResponse.ok) {
      console.warn('No inventory files found');
      return {};
    }

    const inventory = {};

    // Load prepped inventory
    if (preppedResponse.ok) {
      const preppedText = await preppedResponse.text();
      const preppedParsed = Papa.parse(preppedText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });

      preppedParsed.data.forEach(row => {
        if (row.item_key) {
          inventory[row.item_key] = {
            count: Number(row.count) || 0,
            needsPrep: Boolean(row.needs_prep),
            prepAmount: Number(row.prep_amount) || 0
          };
        }
      });
    }

    // Load raw inventory
    if (rawResponse.ok) {
      const rawText = await rawResponse.text();
      const rawParsed = Papa.parse(rawText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });

      rawParsed.data.forEach(row => {
        if (row.item_key) {
          // Merge or update existing inventory items
          if (inventory[row.item_key]) {
            inventory[row.item_key] = {
              ...inventory[row.item_key],
              needsReorder: Boolean(row.needs_reorder),
              reorderAmount: Number(row.reorder_amount) || 0
            };
          } else {
            inventory[row.item_key] = {
              count: Number(row.count) || 0,
              needsReorder: Boolean(row.needs_reorder),
              reorderAmount: Number(row.reorder_amount) || 0
            };
          }
        }
      });
    }

    return inventory;
  } catch (error) {
    console.error('Error loading inventory:', error);
    return {};
  }
};

export const saveInventoryToCSV = async (inventory) => {
  // Debug log the incoming inventory
  console.log('Incoming inventory:', inventory);
  
  // Debug log the INGREDIENTS and RAW_INGREDIENTS
  console.log('INGREDIENTS:', INGREDIENTS);
  console.log('RAW_INGREDIENTS:', RAW_INGREDIENTS);

  const preppedItems = [['item_key', 'count', 'needs_prep', 'prep_amount']];
  const rawItems = [['item_key', 'count', 'needs_reorder', 'reorder_amount']];

  Object.entries(inventory).forEach(([key, value]) => {
    // Debug log each item being processed
    console.log('Processing key:', key, 'value:', value);
    console.log('Is RAW?', !!RAW_INGREDIENTS[key]);
    console.log('Is INGREDIENT?', !!INGREDIENTS[key]);

    if (RAW_INGREDIENTS[key]) {
      rawItems.push([
        key,
        value.count || 0,
        value.needsReorder ? 1 : 0,
        value.reorderAmount || 0
      ]);
    } 
    else if (INGREDIENTS[key]) {
      preppedItems.push([
        key,
        value.count || 0,
        value.needsPrep ? 1 : 0,
        value.prepAmount || 0
      ]);
    }
  });

  // Debug log the final arrays before conversion
  console.log('Final preppedItems:', preppedItems);
  console.log('Final rawItems:', rawItems);
  // Validate inventory input
  if (!inventory || typeof inventory !== 'object') {
    throw new Error('Invalid inventory data');
  }

  // Separate prepped and raw items
  const preppedItems = [['item_key', 'count', 'needs_prep', 'prep_amount']];
  const rawItems = [['item_key', 'count', 'needs_reorder', 'reorder_amount']];

// Add this logging before the fetch calls
console.log('Saving prepped inventory:', Papa.unparse(preppedItems));
console.log('Saving raw inventory:', Papa.unparse(rawItems));

  Object.entries(inventory).forEach(([key, value]) => {
    // Validate each inventory item
    if (!value || typeof value !== 'object') {
      console.warn(`Invalid inventory item for key: ${key}`);
      return;
    }

    // Check if it's a raw ingredient
    if (RAW_INGREDIENTS[key]) {
      rawItems.push([
        key,
        value.count || 0,
        value.needsReorder ? 1 : 0,
        value.reorderAmount || 0
      ]);
    } 
    // Check if it's a prepped ingredient
    else if (INGREDIENTS[key]) {
      preppedItems.push([
        key,
        value.count || 0,
        value.needsPrep ? 1 : 0,
        value.prepAmount || 0
      ]);
    }
  });

  try {
    // Save prepped inventory
    const preppedResponse = await fetch('./api/save-inventory.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/csv',
        'X-Inventory-Type': 'prepped'
      },
      body: Papa.unparse(preppedItems)
    });

    // Save raw inventory
    const rawResponse = await fetch('./api/save-inventory.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/csv',
        'X-Inventory-Type': 'raw'
      },
      body: Papa.unparse(rawItems)
    });

    // Helper function to handle response
    const handleResponse = async (response) => {
      if (!response.ok) {
        // Try to parse error text
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (parseError) {
          console.error('Failed to parse error response', parseError);
        }

        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      try {
        return await response.json();
      } catch (jsonError) {
        // If JSON parsing fails, log the response text
        const text = await response.text();
        console.error('Failed to parse JSON:', text);
        throw new Error('Invalid JSON response');
      }
    };

    // Process responses
    const [preppedResult, rawResult] = await Promise.all([
      handleResponse(preppedResponse),
      handleResponse(rawResponse)
    ]);

    return {
      prepped: preppedResult,
      raw: rawResult
    };

  } catch (error) {
    console.error('Inventory save error:', error);
    throw error;
  }
};