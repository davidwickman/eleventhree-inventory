# Eleventhree Pizza Inventory Management System

A comprehensive React-based inventory management application for pizza restaurant operations, featuring user authentication, real-time inventory tracking, prep planning, and supplier reordering.

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

### ✏️ Item Management
- **Add New Items**: Create custom items in any category
- **Edit All Items**: Modify both built-in and custom items
- **Smart Override System**: Edit built-in items without losing original data
- **Delete Protection**: Only custom items can be deleted
- Auto-generated system keys for new items
- Category-based organization

### 📋 Planning & Operations
- **End of Night Prep Lists**: Mark items for preparation with quantities
- **Reorder Management**: Track items needing restock with supplier amounts
- **Print-Friendly Lists**: Professional printouts with checkboxes and signature lines
- **Email Integration**: Send prep and reorder lists via email

### 💾 Data Management
- **Multiple Export Formats**: CSV exports for all inventory types
- **Automatic Backups**: JSON files with timestamped backups (50 versions retained)
- **Data Persistence**: Server-side storage with PHP backend
- **Inventory Clearing**: Bulk clear operations with confirmation dialogs

### 🎨 User Experience
- **Responsive Design**: Works on desktop and mobile devices
- **Tab-Based Navigation**: Easy switching between inventory types
- **Visual Feedback**: Color-coded alerts and status indicators
- **Confirmation Dialogs**: Prevent accidental data loss
- **Loading States**: Clear feedback during operations

## Technology Stack

- **Frontend**: React 19, Tailwind CSS
- **Backend**: PHP for server-side operations
- **Storage**: JSON files with automatic backup system
- **Email**: PHP mail() function for list distribution
- **UI Components**: Radix UI for accessible dialogs and alerts

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

3. **Create data directory structure**
   ```bash
   mkdir -p public/data/backups/{prepped,raw,paper,custom-items}
   ```

4. **Initialize data files**
   ```bash
   # Create empty JSON files
   echo '{}' > public/data/prepped-inventory.json
   echo '{}' > public/data/raw-inventory.json
   echo '{}' > public/data/paper-inventory.json
   echo '{"ingredients":{},"rawIngredients":{},"paperGoods":{}}' > public/data/custom-items.json
   ```

5. **Configure email settings** (optional)
   Edit `public/api/send-prep-list.php` and `public/api/send-reorder-list.php`:
   ```php
   $to = 'your-email@domain.com'; // Update recipient email
   ```

6. **Set permissions**
   ```bash
   chmod 755 public/api/
   chmod 644 public/api/*.php
   chmod 777 public/data/
   chmod 666 public/data/*.json
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
Builds the app for production to the `build` folder.

## Usage Guide

### Getting Started
1. **Login**: Click your name on the login screen
2. **Navigate**: Use tabs to switch between inventory types
3. **Count Items**: Use +/- buttons or direct input for quantities

### Managing Items
- **Add Items**: Click "Add Item" button and fill in the form
- **Edit Items**: Click blue "Edit" button next to any item
- **Delete Items**: Click red "Delete" button (custom items only)

### Planning Operations
- **Prep Planning**: Go to "End of Night Prep" tab, check items needing prep, set quantities
- **Reordering**: Go to "Reorder List" tab, check items to reorder, set amounts
- **Print Lists**: Use print buttons for physical copies
- **Email Lists**: Use email buttons to send to configured recipients

### Data Management
- **Export Data**: Use export buttons for CSV downloads
- **Clear Data**: Use clear buttons with confirmation for bulk operations
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
│   └── itemsStorage.jsx        # Custom items management
└── App.js              # Main application component

public/
├── api/                # PHP backend scripts
│   ├── save-inventory.php      # Save inventory data
│   ├── save-custom-items.php   # Save custom items
│   ├── send-prep-list.php      # Email prep lists
│   └── send-reorder-list.php   # Email reorder lists
└── data/               # Data storage directory
    ├── prepped-inventory.json  # Prepped inventory data
    ├── raw-inventory.json      # Raw inventory data
    ├── paper-inventory.json    # Paper goods data
    ├── custom-items.json       # Custom item definitions
    └── backups/               # Automatic backups
```

## Configuration

### Adding Built-in Items
Edit the files in `src/data/` to add new default items:
- `ingredients.js` - Prepped ingredients
- `rawIngredients.js` - Raw ingredients  
- `paperGoods.js` - Paper goods

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

**PHP errors**: Ensure web server has write permissions to `public/data/` directory
**Email not working**: Check PHP mail configuration and server settings
**Data not saving**: Verify JSON file permissions and PHP error logs
**Build errors**: Clear `node_modules` and reinstall dependencies

### Browser Storage Note
The app uses server-side storage. If switching to localStorage, note that browser storage limitations may apply.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section above
- Review PHP error logs for server-side issues
- Ensure all file permissions are correctly set