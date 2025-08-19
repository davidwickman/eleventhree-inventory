// Create: scripts/post-build.js
const fs = require('fs');
const path = require('path');

// Remove data directory from build (so it doesn't overwrite existing data)
const buildDataDir = path.join(__dirname, '../build/data');

if (fs.existsSync(buildDataDir)) {
    fs.rmSync(buildDataDir, { recursive: true, force: true });
    console.log('✅ Removed data directory from build to preserve existing data');
}

// Create a note file explaining the data directory
const buildDir = path.join(__dirname, '../build');
const noteFile = path.join(buildDir, 'DATA_DIRECTORY_INFO.txt');

fs.writeFileSync(noteFile, `
IMPORTANT: Data Directory Information
=====================================

The 'data' directory is not included in this build to prevent overwriting 
existing inventory data during deployment.

The application will automatically create the following files if they don't exist:
- data/prepped-inventory.json
- data/raw-inventory.json  
- data/paper-inventory.json
- data/custom-items.json
- data/categories.json

These files will be created in the public/data/ directory when the app first runs.

Deployment Process:
1. Extract this build over your existing installation
2. The data directory will remain untouched
3. If this is a fresh installation, data files will be created automatically
`);

console.log('✅ Build prepared for deployment');