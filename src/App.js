import React, { useState, useEffect } from 'react';
import { loadInventoryFromJSON, saveInventoryToJSON } from './utils/jsonStorage';
import { loadItemsFromJSON, saveItemsToJSON, deleteCustomItem } from './utils/itemsStorage';
import { loadCategoriesFromJSON, saveCategoriesToJSON } from './utils/categoriesStorage';
import { getCategoriesForItemType, getDefaultCategoriesForType } from './utils/categoryStorage';
import { clearAppCache, forceDataRefresh } from './utils/antiCache';
import { initializeAllDataFiles } from './utils/dataFileManager';
import { INGREDIENTS } from './data/ingredients';
import { RAW_INGREDIENTS } from './data/rawIngredients';
import { PAPER_GOODS } from './data/paperGoods';
import InventoryList from './components/InventoryList';
import RawInventoryList from './components/RawInventoryList';
import PrepList from './components/PrepList';
import ReorderList from './components/ReorderList';
import PaperGoodsList from './components/PaperGoodsList';
import PrintPrep from './components/PrintPrep';
import PrintReorder from './components/PrintReorder';
import UserLogin from './components/UserLogin';
import AddItemModal from './components/AddItemModal';
import CategoryManagementModal from './components/CategoryManagementModal';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  ConfirmDialog,
} from './components/ui/alert-dialog';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [inventory, setInventory] = useState({});
  const [customItems, setCustomItems] = useState({
    ingredients: {},
    rawIngredients: {},
    paperGoods: {}
  });
  const [customCategories, setCustomCategories] = useState({
    ingredients: [],
    rawIngredients: [],
    paperGoods: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('prepped-inventory');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'info' });
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showReorderPrintModal, setShowReorderPrintModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState({
    title: '',
    description: '',
    action: () => {},
    variant: 'destructive'
  });

  // Combined items including custom items
  const allIngredients = { ...INGREDIENTS, ...customItems.ingredients };
  const allRawIngredients = { ...RAW_INGREDIENTS, ...customItems.rawIngredients };
  const allPaperGoods = { ...PAPER_GOODS, ...customItems.paperGoods };

  useEffect(() => {
    // Check for existing user session
    const savedUser = localStorage.getItem('inventoryAppUser');
    if (savedUser) {
      setCurrentUser(savedUser);
    }
  }, []);

  // Handle cache versioning and clearing
  useEffect(() => {
    // Check for app version mismatch
    const currentVersion = process.env.REACT_APP_VERSION || Date.now().toString();
    const storedVersion = localStorage.getItem('appVersion');
    
    if (storedVersion && storedVersion !== currentVersion) {
      console.log('App version changed, clearing cache...');
      forceDataRefresh();
      localStorage.setItem('appVersion', currentVersion);
    } else if (!storedVersion) {
      localStorage.setItem('appVersion', currentVersion);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      // First initialize all data files, then load the data
      initializeAllDataFiles()
        .then(() => {
          return Promise.all([
            loadInventoryFromJSON(),
            loadItemsFromJSON(),
            loadCategoriesFromJSON()
          ]);
        })
        .then(([inventoryData, itemsData, categoriesData]) => {
          setInventory(inventoryData);
          setCustomItems(itemsData);
          setCustomCategories(categoriesData);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading data:', error);
          showModal('Error', 'Failed to load data. Please try refreshing the page.', 'error');
          setLoading(false);
        });
    }
  }, [currentUser]);

  useEffect(() => {
    if (!loading && currentUser) {
      saveInventoryToJSON(inventory).catch(error => {
        showModal('Error', 'Failed to save inventory', 'error');
      });
    }
  }, [inventory, loading, currentUser]);

  useEffect(() => {
    if (!loading && currentUser) {
      saveItemsToJSON(customItems).catch(error => {
        showModal('Error', 'Failed to save custom items', 'error');
      });
    }
  }, [customItems, loading, currentUser]);

  useEffect(() => {
    if (!loading && currentUser) {
      saveCategoriesToJSON(customCategories).catch(error => {
        showModal('Error', 'Failed to save categories', 'error');
      });
    }
  }, [customCategories, loading, currentUser]);

  const handleLogin = (username) => {
    setCurrentUser(username);
    localStorage.setItem('inventoryAppUser', username);
    setLoading(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('inventoryAppUser');
    setInventory({});
    setCustomItems({
      ingredients: {},
      rawIngredients: {},
      paperGoods: {}
    });
    setCustomCategories({
      ingredients: [],
      rawIngredients: [],
      paperGoods: []
    });
  };

  const showModal = (title, message, type = 'info') => {
    setModalContent({ title, message, type });
    setModalOpen(true);
  };

  const handleUpdateInventory = (newInventory) => {
    setInventory(newInventory);
  };

  const handleAddItem = (itemData) => {
    const { type, key, name, category, unit } = itemData;
    
    // Get all available categories (built-in + custom)
    const defaultCategories = getDefaultCategoriesForType(type);
    const customCategoriesForType = customCategories[type] || [];
    const allAvailableCategories = [...defaultCategories, ...customCategoriesForType];
    
    if (!allAvailableCategories.includes(category)) {
      showModal('Invalid Category', `The category "${category}" does not exist. Please select an existing category or create it first.`, 'error');
      return;
    }
    
    setCustomItems(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: { name, category, unit }
      }
    }));

    showModal('Success', `${name} has been added to ${category}`, 'success');
  };

  const handleUpdateItem = (itemData) => {
    const { oldKey, type, key, name, category, unit, isBuiltIn } = itemData;
    
    // Get all available categories (built-in + custom)
    const defaultCategories = getDefaultCategoriesForType(type);
    const customCategoriesForType = customCategories[type] || [];
    const allAvailableCategories = [...defaultCategories, ...customCategoriesForType];
    
    if (!allAvailableCategories.includes(category)) {
      showModal('Invalid Category', `The category "${category}" does not exist. Please select an existing category or create it first.`, 'error');
      return;
    }
    
    setCustomItems(prev => {
      const newItems = { ...prev };
      
      // If editing a built-in item, we create an override in customItems
      if (isBuiltIn) {
        // For built-in items, we always keep the same key to maintain data integrity
        newItems[type][oldKey] = { name, category, unit };
      } else {
        // For custom items, handle key changes as before
        if (oldKey !== key && newItems[type][oldKey]) {
          delete newItems[type][oldKey];
        }
        newItems[type][key] = { name, category, unit };
      }
      
      return newItems;
    });

    // For custom items, handle inventory key changes
    if (!isBuiltIn && oldKey !== key && inventory[oldKey]) {
      setInventory(prev => {
        const newInventory = { ...prev };
        newInventory[key] = newInventory[oldKey];
        delete newInventory[oldKey];
        return newInventory;
      });
    }

    showModal('Success', `${name} has been updated`, 'success');
    setEditingItem(null);
  };

  const handleEditItem = (itemKey, itemType) => {
    const itemData = allIngredients[itemKey] || allRawIngredients[itemKey] || allPaperGoods[itemKey];
    if (itemData) {
      setEditingItem({
        key: itemKey,
        name: itemData.name,
        category: itemData.category,
        unit: itemData.unit,
        isBuiltIn: !customItems[itemType]?.[itemKey] // Check if it's a built-in item
      });
      setShowAddItemModal(true);
    }
  };

  const handleDeleteItem = (itemKey, itemType) => {
    const itemData = allIngredients[itemKey] || allRawIngredients[itemKey] || allPaperGoods[itemKey];
    const isBuiltIn = !customItems[itemType]?.[itemKey];
    
    if (isBuiltIn) {
      showModal('Cannot Delete', 'Built-in items cannot be deleted, but you can edit them to change their properties.', 'warning');
      return;
    }
    
    setConfirmAction({
      title: 'Delete Custom Item',
      description: `Are you sure you want to delete "${itemData?.name}"? This action cannot be undone and will also remove all inventory data for this item.`,
      action: async () => {
        try {
          const updatedItems = await deleteCustomItem(itemKey, itemType, customItems);
          setCustomItems(updatedItems);
          
          // Also remove from inventory
          setInventory(prev => {
            const newInventory = { ...prev };
            delete newInventory[itemKey];
            return newInventory;
          });
          
          showModal('Success', `${itemData?.name} has been deleted`, 'success');
        } catch (error) {
          showModal('Error', 'Failed to delete item', 'error');
        }
      },
      variant: 'destructive'
    });
    setConfirmOpen(true);
  };

  // Inventory handlers
  const updateCount = (ingredient, delta) => {
    setInventory(prev => ({
      ...prev,
      [ingredient]: {
        ...prev[ingredient],
        count: Math.max(0, ((prev[ingredient]?.count || 0) + delta))
      }
    }));
  };

  // Prep list handlers
  const togglePrep = (ingredient) => {
    setInventory(prev => ({
      ...prev,
      [ingredient]: {
        ...prev[ingredient],
        needsPrep: !(prev[ingredient]?.needsPrep || false),
        prepAmount: (prev[ingredient]?.needsPrep || false) ? 0 : (prev[ingredient]?.prepAmount || 0)
      }
    }));
  };

  const updatePrepAmount = (ingredient, delta) => {
    setInventory(prev => ({
      ...prev,
      [ingredient]: {
        ...prev[ingredient],
        prepAmount: Math.max(0, (prev[ingredient]?.prepAmount || 0) + delta)
      }
    }));
  };

  // Reorder list handlers
  const toggleReorder = (ingredient) => {
    setInventory(prev => ({
      ...prev,
      [ingredient]: {
        ...prev[ingredient],
        needsReorder: !(prev[ingredient]?.needsReorder || false),
        reorderAmount: (prev[ingredient]?.needsReorder || false) ? 0 : (prev[ingredient]?.reorderAmount || 0)
      }
    }));
  };

  const updateReorderAmount = (ingredient, delta) => {
    setInventory(prev => ({
      ...prev,
      [ingredient]: {
        ...prev[ingredient],
        reorderAmount: Math.max(0, ((prev[ingredient]?.reorderAmount || 0) + delta))
      }
    }));
  };

  const handleClear = (type) => {
    const actions = {
      'paper-goods': {
        title: 'Clear Paper Goods',
        description: 'Are you sure you want to clear all paper goods counts? This action cannot be undone.',
        action: () => {
          setInventory(prev => 
            Object.keys(prev).reduce((acc, key) => ({
              ...acc,
              [key]: allPaperGoods[key] ? { ...prev[key], count: 0 } : prev[key]
            }), {})
          );
          showModal('Cleared', 'Paper goods counts have been cleared', 'success');
        }
      },
      'prepped-inventory': {
        title: 'Clear Prepped Inventory',
        description: 'Are you sure you want to clear all prepped inventory counts? This action cannot be undone.',
        action: () => {
          setInventory(prev => 
            Object.keys(prev).reduce((acc, key) => ({
              ...acc,
              [key]: allIngredients[key] ? { ...prev[key], count: 0 } : prev[key]
            }), {})
          );
          showModal('Cleared', 'Prepped inventory has been cleared', 'success');
        }
      },
      'raw-inventory': {
        title: 'Clear Raw Inventory',
        description: 'Are you sure you want to clear all raw inventory counts? This action cannot be undone.',
        action: () => {
          setInventory(prev => 
            Object.keys(prev).reduce((acc, key) => ({
              ...acc,
              [key]: allRawIngredients[key] ? { ...prev[key], count: 0 } : prev[key]
            }), {})
          );
          showModal('Cleared', 'Raw inventory has been cleared', 'success');
        }
      },
      'prep': {
        title: 'Clear Prep List',
        description: 'Are you sure you want to clear the prep list? This action cannot be undone.',
        action: () => {
          setInventory(prev => 
            Object.keys(prev).reduce((acc, key) => ({
              ...acc,
              [key]: { ...prev[key], needsPrep: false, prepAmount: 0 }
            }), {})
          );
          showModal('Cleared', 'Prep list has been cleared', 'success');
        }
      },
      'reorder': {
        title: 'Clear Reorder List',
        description: 'Are you sure you want to clear the reorder list? This action cannot be undone.',
        action: () => {
          setInventory(prev => 
            Object.keys(prev).reduce((acc, key) => ({
              ...acc,
              [key]: { ...prev[key], needsReorder: false, reorderAmount: 0 }
            }), {})
          );
          showModal('Cleared', 'Reorder list has been cleared', 'success');
        }
      }
    };

    setConfirmAction({ ...actions[type], variant: 'destructive' });
    setConfirmOpen(true);
  };

  const exportPreparedInventoryToCSV = () => {
    const rows = [['Item', 'Category', 'Current Count']];
    Object.entries(allIngredients).forEach(([key, value]) => {
      rows.push([
        value.name,
        value.category,
        inventory[key]?.count || 0
      ]);
    });

    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const csvUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = csvUrl;
    a.download = `prepped-inventory-${new Date().toLocaleDateString()}.csv`;
    a.click();
    showModal('Success', 'Prepped inventory has been exported to CSV', 'success');
  };

  const exportRawInventoryToCSV = () => {
    const rows = [['Item', 'Category', 'Current Count', 'Unit']];
    Object.entries(allRawIngredients).forEach(([key, value]) => {
      rows.push([
        value.name,
        value.category,
        inventory[key]?.count || 0,
        value.unit
      ]);
    });

    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const csvUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = csvUrl;
    a.download = `raw-inventory-${new Date().toLocaleDateString()}.csv`;
    a.click();
    showModal('Success', 'Raw ingredients inventory has been exported to CSV', 'success');
  };

  const exportPrepListToCSV = () => {
    const prepItems = Object.entries(inventory)
      .filter(([_, value]) => value.needsPrep);

    if (prepItems.length === 0) {
      showModal('No Items', 'No items are marked for prep.', 'warning');
      return;
    }

    const rows = [['Item', 'Category', 'Current Count', 'Prep Amount']];
    prepItems.forEach(([ing, value]) => {
      rows.push([
        allIngredients[ing].name,
        allIngredients[ing].category,
        value.count,
        value.prepAmount
      ]);
    });

    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const csvUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = csvUrl;
    a.download = `prep-list-${new Date().toLocaleDateString()}.csv`;
    a.click();
    showModal('Success', 'Prep list has been exported to CSV', 'success');
  };

  const exportReorderListToCSV = () => {
    const reorderItems = Object.entries(inventory)
      .filter(([_, value]) => value.needsReorder);

    if (reorderItems.length === 0) {
      showModal('No Items', 'No items are marked for reorder.', 'warning');
      return;
    }

    const rows = [['Item', 'Category', 'Current Count', 'Order Amount', 'Unit']];
    reorderItems.forEach(([ing, value]) => {
      rows.push([
        allRawIngredients[ing].name,
        allRawIngredients[ing].category,
        value.count,
        value.reorderAmount,
        allRawIngredients[ing].unit
      ]);
    });

    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const csvUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `reorder-list-${new Date().toLocaleDateString()}.csv`;
    a.click();
    showModal('Success', 'Reorder list has been exported to CSV', 'success');
  };

  const handlePrint = () => {
    const prepItems = Object.entries(inventory)
      .filter(([_, value]) => value.needsPrep);

    if (prepItems.length === 0) {
      showModal('No Items', 'No items are marked for prep.', 'warning');
      return;
    }

    setShowPrintModal(true);
  };

  const handleReorderPrint = () => {
    const reorderItems = Object.entries(inventory)
      .filter(([_, value]) => value.needsReorder);

    if (reorderItems.length === 0) {
      showModal('No Items', 'No items are marked for reorder.', 'warning');
      return;
    }

    setShowReorderPrintModal(true);
  };

  const sendPrepList = async () => {
    const prepItems = Object.entries(inventory)
      .filter(([_, value]) => value.needsPrep)
      .map(([ing, value]) => ({
        name: allIngredients[ing].name,
        category: allIngredients[ing].category,
        amount: value.prepAmount,
        currentCount: value.count
      }));

    if (prepItems.length === 0) {
      showModal('No Items', 'No items are marked for prep.', 'warning');
      return;
    }

    try {
      showModal('Sending...', 'Preparing to send prep list...', 'info');
      const response = await fetch('./api/send-prep-list.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: new Date().toLocaleDateString(),
          prepItems
        })
      });

      if (!response.ok) throw new Error('Failed to send');
      showModal('Success', 'Prep list sent successfully!', 'success');
    } catch (error) {
      showModal('Error', 'Failed to send prep list. Please try again.', 'error');
      console.error('Error sending prep list:', error);
    }
  };

  const sendReorderList = async () => {
    const reorderItems = Object.entries(inventory)
      .filter(([_, value]) => value.needsReorder)
      .map(([ing, value]) => ({
        name: allRawIngredients[ing].name,
        category: allRawIngredients[ing].category,
        amount: value.reorderAmount,
        unit: allRawIngredients[ing].unit,
        currentCount: value.count
      }));

    if (reorderItems.length === 0) {
      showModal('No Items', 'No items are marked for reorder.', 'warning');
      return;
    }

    try {
      showModal('Sending...', 'Preparing to send reorder list...', 'info');
      const response = await fetch('./api/send-reorder-list.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: new Date().toLocaleDateString(),
          reorderItems
        })
      });

      if (!response.ok) throw new Error('Failed to send');
      showModal('Success', 'Reorder list sent successfully!', 'success');
    } catch (error) {
      showModal('Error', 'Failed to send reorder list. Please try again.', 'error');
      console.error('Error sending reorder list:', error);
    }
  };

  // Show login screen if no user is logged in
  if (!currentUser) {
    return <UserLogin onLogin={handleLogin} />;
  }

  if (loading) {
    return <div className="p-4 text-center">Loading inventory...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <AlertDialog open={modalOpen} onOpenChange={setModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className={
                modalContent.type === 'error' ? 'text-red-600' :
                modalContent.type === 'success' ? 'text-green-600' :
                modalContent.type === 'warning' ? 'text-yellow-600' :
                'text-blue-600'
              }>
                {modalContent.title}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {modalContent.message}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setModalOpen(false)}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={confirmAction.title}
          description={confirmAction.description}
          onConfirm={confirmAction.action}
          variant={confirmAction.variant}
        />

        <AddItemModal
          open={showAddItemModal}
          onOpenChange={(open) => {
            setShowAddItemModal(open);
            if (!open) setEditingItem(null);
          }}
          onAddItem={handleAddItem}
          onUpdateItem={handleUpdateItem}
          editingItem={editingItem}
          activeTab={activeTab}
          allIngredients={allIngredients}
          allRawIngredients={allRawIngredients}
          allPaperGoods={allPaperGoods}
          customCategories={customCategories}
        />

        <CategoryManagementModal
          open={showCategoryModal}
          onOpenChange={setShowCategoryModal}
          activeTab={activeTab}
          allIngredients={allIngredients}
          allRawIngredients={allRawIngredients}
          allPaperGoods={allPaperGoods}
          customItems={customItems}
          onUpdateCustomItems={setCustomItems}
          customCategories={customCategories}
          onUpdateCustomCategories={setCustomCategories}
          inventory={inventory}
          onUpdateInventory={handleUpdateInventory}
        />

        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-green-800">Eleventhree Pizza</h1>
            <p className="text-sm text-gray-600">Logged in as: {currentUser}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setEditingItem(null);
                setShowAddItemModal(true);
              }}
              className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
            >
              <span>+</span>
              Add Item
            </button>

            <button
              onClick={() => setShowCategoryModal(true)}
              className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2"
            >
              <span>📁</span>
              Manage Categories
            </button>

            <button
              onClick={() => {
                if (window.confirm('Clear all cached data and reload? This will not affect saved inventory.')) {
                  clearAppCache();
                }
              }}
              className="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center gap-2"
              title="Clear cache and reload"
            >
              <span>🔄</span>
              Refresh
            </button>
            
            {activeTab === 'prepped-inventory' && (
              <>
                <button 
                  onClick={exportPreparedInventoryToCSV}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Export Prepped Inventory
                </button>
                <button 
                  onClick={() => handleClear('prepped-inventory')}
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Clear Prepped Inventory
                </button>
              </>
            )}

            {activeTab === 'raw-inventory' && (
              <>
                <button 
                  onClick={exportRawInventoryToCSV}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Export Raw Inventory
                </button>
                <button 
                  onClick={() => handleClear('raw-inventory')}
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Clear Raw Inventory
                </button>
              </>
            )}

            {activeTab === 'prep' && (
              <>
                <button 
                  onClick={exportPrepListToCSV}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Export Prep List
                </button>
                <button 
                  onClick={handlePrint}
                  className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2"
                >
                  <span>🖨️</span>
                  Print List
                </button>
                <button 
                  onClick={sendPrepList}
                  className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                >
                  <span>📧</span>
                  Email List
                </button>
                <button 
                  onClick={() => handleClear('prep')}
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Clear List
                </button>
              </>
            )}

            {activeTab === 'reorder' && (
              <>
                <button 
                  onClick={exportReorderListToCSV}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Export Reorder List
                </button>
                <button 
                  onClick={handleReorderPrint}
                  className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2"
                >
                  <span>🖨️</span>
                  Print List
                </button>
                <button 
                  onClick={sendReorderList}
                  className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                >
                  <span>📧</span>
                  Email List
                </button>
                <button 
                  onClick={() => handleClear('reorder')}
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Clear List
                </button>
              </>
            )}

            {activeTab === 'paper-goods' && (
              <>
                <button 
                  onClick={() => handleClear('paper-goods')}
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Clear Counts
                </button>
              </>
            )}

            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('prepped-inventory')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-t font-medium whitespace-nowrap
              ${activeTab === 'prepped-inventory' 
                ? 'bg-white text-green-700 border-t border-x' 
                : 'bg-gray-100 text-gray-600'}`}
          >
            Prepped Inventory
          </button>
          <button
            onClick={() => setActiveTab('raw-inventory')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-t font-medium whitespace-nowrap
              ${activeTab === 'raw-inventory' 
                ? 'bg-white text-green-700 border-t border-x' 
                : 'bg-gray-100 text-gray-600'}`}
          >
            Raw Inventory
          </button>
          <button
            onClick={() => setActiveTab('prep')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-t font-medium whitespace-nowrap
              ${activeTab === 'prep'
                ? 'bg-white text-green-700 border-t border-x' 
                : 'bg-gray-100 text-gray-600'}`}
          >
            End of Night Prep
          </button>
          <button
            onClick={() => setActiveTab('reorder')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-t font-medium whitespace-nowrap
              ${activeTab === 'reorder'
                ? 'bg-white text-green-700 border-t border-x' 
                : 'bg-gray-100 text-gray-600'}`}
          >
            Reorder List
          </button>
          <button
            onClick={() => setActiveTab('paper-goods')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-t font-medium whitespace-nowrap
              ${activeTab === 'paper-goods'
                ? 'bg-white text-green-700 border-t border-x' 
                : 'bg-gray-100 text-gray-600'}`}
          >
            Paper Goods
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          {activeTab === 'prepped-inventory' ? (
            <InventoryList 
              inventory={inventory}
              updateCount={updateCount}
              items={allIngredients}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              customItems={customItems.ingredients}
            />
          ) : activeTab === 'raw-inventory' ? (
            <RawInventoryList
              inventory={inventory}
              updateCount={updateCount}
              items={allRawIngredients}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              customItems={customItems.rawIngredients}
            />
          ) : activeTab === 'prep' ? (
            <PrepList
              inventory={inventory}
              togglePrep={togglePrep}
              updatePrepAmount={updatePrepAmount}
              items={allIngredients}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              customItems={customItems.ingredients}
            />
          ) : activeTab === 'reorder' ? (
            <ReorderList
              inventory={inventory}
              toggleReorder={toggleReorder}
              updateReorderAmount={updateReorderAmount}
              items={allRawIngredients}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              customItems={customItems.rawIngredients}
            />
          ) : (
            <PaperGoodsList
              inventory={inventory}
              updateCount={updateCount}
              items={allPaperGoods}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              customItems={customItems.paperGoods}
            />
          )}
        </div>

        {showPrintModal && (
          <div className="fixed inset-0 z-50">
            <PrintPrep 
              prepItems={Object.entries(inventory).filter(([_, value]) => value.needsPrep)} 
              onClose={() => setShowPrintModal(false)}
              items={allIngredients}
            />
          </div>
        )}

        {showReorderPrintModal && (
          <div className="fixed inset-0 z-50">
            <PrintReorder
              reorderItems={Object.entries(inventory).filter(([_, value]) => value.needsReorder)}
              onClose={() => setShowReorderPrintModal(false)}
              items={allRawIngredients}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;