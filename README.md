# Eleventhree Pizza Inventory Management System

A comprehensive React-based inventory management application for pizza restaurant operations, featuring user authentication, real-time inventory tracking, prep planning, supplier reordering, and advanced category management.

## 🚀 New Features (Latest Update)

### 📁 **Category Management System**
- **Full CRUD Operations**: Add, edit, and delete custom categories for all item types
- **Real-time Integration**: Categories immediately available in item creation dropdowns
- **Smart Validation**: Prevents orphaned items and ensures data integrity
- **Built-in Protection**: Default categories can be edited but not deleted

### 🔄 **Deployment-Safe Data Persistence**
- **Auto File Creation**: Missing data files created automatically on startup
- **Deployment Protection**: Data files excluded from build to prevent overwriting
- **Zero Configuration**: Works on fresh installs and existing deployments
- **Backup System**: Automatic versioned backups with retention management

### ⚡ **Enhanced Cache Management**
- **Anti-Caching System**: Multiple strategies to prevent stale data issues
- **Version Detection**: Automatic cache clearing on app updates
- **Manual Refresh**: User-controlled cache clearing for troubleshooting
- **Device Compatibility**: Resolves caching issues on tablets and mobile devices

## Features

### 🔐 User Authentication
- Simple click-to-login system with predefined users (Dave, Slade)
- Session persistence across browser sessions
- User-specific access logging

### 📦 Inventory Management
- **Prepped Inventory**: Track prepared ingredients and their quantities
- **Raw Inventory**: Monitor raw ingredients with decimal precision
- **Paper Goods**: Manage disposable items and supplies
- Real-time count updates with increment/decrement controls
- Input validation and error handling

### ✏️ Advanced Item Management
- **Add New Items**: Create custom items in any category
- **Edit All Items**: Modify both built-in and custom items
- **Smart Override System**: Edit built-in items without losing original data
- **Delete Protection**: Only custom items can be deleted
- **Category Management**: Full CRUD operations for organizing items
- Auto-generated system keys for new items
- Category-based organization with validation

### 📋 Planning & Operations
- **End of Night Prep Lists**: Mark items for preparation with quantities
- **Reorder Management**: Track items needing restock with supplier amounts
- **Print-Friendly Lists**: Professional printouts with checkboxes and signature lines
- **Email Integration**: Send prep and reorder lists via email

### 💾 Robust Data Management
- **Multiple Export Formats**: CSV exports for all inventory types
- **Automatic Backups**: JSON files with timestamped backups (50 versions retained)
- **Data Persistence**: Server-side storage with PHP backend
- **Deployment Safety**: Data survives application updates
- **Inventory Clearing**: Bulk clear operations with confirmation dialogs

### 🎨 User Experience
- **Responsive Design**: Works on desktop and mobile devices
- **Tab-Based Navigation**: Easy switching between inventory types
- **Visual Feedback**: Color-coded alerts and status indicators
- **Confirmation Dialogs**: Prevent accidental data loss
- **Loading States**: Clear feedback during operations
- **Cache Controls**: Manual refresh options for reliability

## Technology Stack

- **Frontend**: React 19, Tailwind CSS
- **Backend**: PHP for server-side operations
- **Storage**: JSON files with automatic backup system
- **Email**: PHP mail() function for list distribution
- **UI Components**: Radix UI for accessible dialogs and alerts
- **Cache Management**: Multi-layered anti-caching system

## Installation

### Prerequisites
- Node.js 16+ and npm
- PHP 7.4+ with web server (Apache/Nginx)
- Write permissions for data directory

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd pizza-inventory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up deployment script**
   ```bash
   # Create scripts directory
   mkdir scripts
   
   # The post-build script will be created automatically
   # Updates package.json build script to exclude data files
   ```

4. **Configure email settings** (optional)
   Edit `public/api/send-prep-list.php` and `public/api/send-reorder-list.php`:
   ```php
   $to = 'your-email@domain.com'; // Update recipient email
   ```

5. **Set permissions** (for production server)
   ```bash
   chmod 755 public/api/
   chmod 644 public/api/*.php
   # Data directory and files will be created automatically
   ```

### Development

```bash
npm start
```
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
```
Builds the app for production to the `build` folder. Data files are automatically excluded to preserve existing inventory during deployment.

## 🚀 Deployment Process

### Simple Deployment (Recommended)
1. **Build**: `npm run build` (automatically excludes data files)
2. **Package**: Zip the build folder contents
3. **Deploy**: Upload and extract over existing installation
4. **Result**: App updates, data remains safe, missing files created automatically

### Benefits of New System
- ✅ **No Data Loss**: Inventory survives deployments
- ✅ **Zero Configuration**: Works on fresh installs automatically
- ✅ **No Manual Setup**: Data files created as needed
- ✅ **Cache Reliability**: Eliminates stale data issues
- ✅ **Same Process**: Your deployment method stays unchanged

## Usage Guide

### Getting Started
1. **Login**: Click your name on the login screen
2. **Navigate**: Use tabs to switch between inventory types
3. **Count Items**: Use +/- buttons or direct input for quantities

### Managing Categories
1. **Access**: Click "📁 Manage Categories" button
2. **Add**: Enter name in green box and click "Add"
3. **Edit**: Click "Edit" next to any category, modify inline
4. **Delete**: Click "Delete" on custom categories (built-in protected)

### Managing Items
- **Add Items**: Click "Add Item" button and fill in the form
- **Edit Items**: Click blue "Edit" button next to any item
- **Delete Items**: Click red "Delete" button (custom items only)
- **Categories**: Use category dropdown or create new categories first

### Planning Operations
- **Prep Planning**: Go to "End of Night Prep" tab, check items needing prep, set quantities
- **Reordering**: Go to "Reorder List" tab, check items to reorder, set amounts
- **Print Lists**: Use print buttons for physical copies
- **Email Lists**: Use email buttons to send to configured recipients

### Data Management
- **Export Data**: Use export buttons for CSV downloads
- **Clear Data**: Use clear buttons with confirmation for bulk operations
- **Refresh Cache**: Use orange refresh button if experiencing data issues
- **Backup**: Automatic backups created on every save

## File Structure

```
src/
├── components/          # React components
│   ├── InventoryList.jsx       # Prepped inventory display
│   ├── RawInventoryList.jsx    # Raw ingredients display
│   ├── PaperGoodsList.jsx      # Paper goods display
│   ├── PrepList.jsx            # Prep planning interface
│   ├── ReorderList.jsx         # Reorder management
│   ├── CategoryManagementModal.jsx  # Category CRUD operations
│   ├── UserLogin.jsx           # Authentication component
│   ├── AddItemModal.jsx        # Item creation/editing modal
│   ├── PrintPrep.jsx           # Print-friendly prep lists
│   ├── PrintReorder.jsx        # Print-friendly reorder lists
│   └── ui/                     # UI components (alerts, dialogs)
├── data/                # Static data definitions
│   ├── ingredients.js          # Built-in prepped ingredients
│   ├── rawIngredients.js       # Built-in raw ingredients
│   └── paperGoods.js           # Built-in paper goods
├── utils/               # Utility functions
│   ├── jsonStorage.jsx         # Inventory data management
│   ├── itemsStorage.jsx        # Custom items management
│   ├── categoriesStorage.jsx   # Category data management
│   ├── categoryStorage.jsx     # Category utility functions
│   ├── dataFileManager.jsx     # Auto file creation system
│   └── antiCache.jsx           # Cache management utilities
└── App.js              # Main application component

public/
├── api/                # PHP backend scripts
│   ├── save-inventory.php      # Save inventory data
│   ├── save-custom-items.php   # Save custom items
│   ├── save-categories.php     # Save category data
│   ├── create-data-file.php    # Auto file creation
│   ├── send-prep-list.php      # Email prep lists
│   └── send-reorder-list.php   # Email reorder lists
└── data/               # Data storage directory (auto-created)
    ├── prepped-inventory.json  # Prepped inventory data
    ├── raw-inventory.json      # Raw inventory data
    ├── paper-inventory.json    # Paper goods data
    ├── custom-items.json       # Custom item definitions
    ├── categories.json         # Custom categories
    └── backups/               # Automatic backups

scripts/
└── post-build.js       # Build process data exclusion
```

## Configuration

### Adding Built-in Items
Edit the files in `src/data/` to add new default items:
- `ingredients.js` - Prepped ingredients
- `rawIngredients.js` - Raw ingredients  
- `paperGoods.js` - Paper goods

### Adding Built-in Categories
Update the default categories in `src/utils/categoryStorage.jsx`:
```javascript
const defaultCategories = {
  ingredients: ['Base', 'Sauce', 'Cheese', /* add new categories */],
  // ...
};
```

### Email Configuration
Update email settings in the PHP files in `public/api/`:
- Change recipient email addresses
- Modify email templates and formatting
- Configure SMTP settings if needed

### User Management
Add/remove users in `src/components/UserLogin.jsx`:
```javascript
const USERS = ['Dave', 'Slade', 'NewUser'];
```

## Troubleshooting

### Common Issues

**Data appears stale**: Click the orange "🔄 Refresh" button to clear cache
**Categories not appearing**: Ensure you're on the correct tab when managing categories
**Deployment data loss**: Ensure you're using the new build process that excludes data files
**PHP errors**: Ensure web server has write permissions to `public/data/` directory
**Email not working**: Check PHP mail configuration and server settings
**Build errors**: Clear `node_modules` and reinstall dependencies

### Cache Issues
The new system includes multiple anti-caching strategies:
- Automatic version detection and cache clearing
- Cache-busting headers on all data requests
- Manual refresh functionality
- Service worker cache management

### Data Recovery
- All operations create automatic backups
- Backups stored in `public/data/backups/` with timestamps
- 50 most recent backups retained per data type
- Manual restore possible by copying backup files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly including deployment scenarios
5. Update documentation if needed
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section above
- Use the manual refresh button for cache-related issues
- Review PHP error logs for server-side issues
- Ensure all file permissions are correctly set
- Verify data files are being created automatically`