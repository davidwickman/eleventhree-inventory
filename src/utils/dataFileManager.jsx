// src/utils/dataFileManager.jsx

export const ensureDataFileExists = async (filename, defaultContent) => {
  try {
    // Try to fetch the file first
    const response = await fetch(`./data/${filename}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    if (response.ok) {
      // File exists, return the content
      return await response.json();
    } else if (response.status === 404) {
      // File doesn't exist, create it
      console.log(`Creating missing data file: ${filename}`);
      await createDataFile(filename, defaultContent);
      return defaultContent;
    } else {
      // Other error, use default content
      console.warn(`Could not access ${filename}, using default content`);
      return defaultContent;
    }
  } catch (error) {
    console.error(`Error accessing ${filename}:`, error);
    // Try to create the file
    try {
      await createDataFile(filename, defaultContent);
      return defaultContent;
    } catch (createError) {
      console.error(`Could not create ${filename}:`, createError);
      return defaultContent;
    }
  }
};

const createDataFile = async (filename, content) => {
  try {
    const response = await fetch('./api/create-data-file.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: filename,
        content: content
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create ${filename}`);
    }

    const result = await response.json();
    console.log(`✅ Created data file: ${filename}`);
    return result;
  } catch (error) {
    console.error(`Failed to create ${filename}:`, error);
    throw error;
  }
};

export const initializeAllDataFiles = async () => {
  const defaultFiles = {
    'prepped-inventory.json': {},
    'raw-inventory.json': {},
    'paper-inventory.json': {},
    'custom-items.json': {
      ingredients: {},
      rawIngredients: {},
      paperGoods: {}
    },
    'categories.json': {
      ingredients: [],
      rawIngredients: [],
      paperGoods: []
    }
  };

  const results = {};
  
  for (const [filename, defaultContent] of Object.entries(defaultFiles)) {
    try {
      results[filename] = await ensureDataFileExists(filename, defaultContent);
    } catch (error) {
      console.error(`Failed to initialize ${filename}:`, error);
      results[filename] = defaultContent;
    }
  }

  return results;
};