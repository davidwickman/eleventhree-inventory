import React, { useState, useEffect } from 'react';
import { loadInventoryFromJSON, saveInventoryToJSON } from './utils/jsonStorage';
import { INGREDIENTS } from './data/ingredients';
import { RAW_INGREDIENTS } from './data/rawIngredients';
import InventoryList from './components/InventoryList';
import RawInventoryList from './components/RawInventoryList';
import PrepList from './components/PrepList';
import ReorderList from './components/ReorderList';
import PrintPrep from './components/PrintPrep';
import PrintReorder from './components/PrintReorder';
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
  const [inventory, setInventory] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('prepped-inventory');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'info' });
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showReorderPrintModal, setShowReorderPrintModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState({
    title: '',
    description: '',
    action: () => {},
    variant: 'destructive'
  });

  useEffect(() => {
    loadInventoryFromJSON()
      .then(data => {
        setInventory(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loading) {
      saveInventoryToJSON(inventory).catch(error => {
        showModal('Error', 'Failed to save inventory', 'error');
      });
    }
  }, [inventory, loading]);

  const showModal = (title, message, type = 'info') => {
    setModalContent({ title, message, type });
    setModalOpen(true);
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
      'prepped-inventory': {
        title: 'Clear Prepped Inventory',
        description: 'Are you sure you want to clear all prepped inventory counts? This action cannot be undone.',
        action: () => {
          setInventory(prev => 
            Object.keys(prev).reduce((acc, key) => ({
              ...acc,
              [key]: INGREDIENTS[key] ? { ...prev[key], count: 0 } : prev[key]
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
              [key]: RAW_INGREDIENTS[key] ? { ...prev[key], count: 0 } : prev[key]
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
    Object.entries(INGREDIENTS).forEach(([key, value]) => {
      rows.push([
        value.name,
        value.category,
        inventory[key]?.count || 0
      ]);
    });

    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prepped-inventory-${new Date().toLocaleDateString()}.csv`;
    a.click();
    showModal('Success', 'Prepped inventory has been exported to CSV', 'success');
  };

  const exportRawInventoryToCSV = () => {
    const rows = [['Item', 'Category', 'Current Count', 'Unit']];
    Object.entries(RAW_INGREDIENTS).forEach(([key, value]) => {
      rows.push([
        value.name,
        value.category,
        inventory[key]?.count || 0,
        value.unit
      ]);
    });

    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
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
        INGREDIENTS[ing].name,
        INGREDIENTS[ing].category,
        value.count,
        value.prepAmount
      ]);
    });

    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
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
        RAW_INGREDIENTS[ing].name,
        RAW_INGREDIENTS[ing].category,
        value.count,
        value.reorderAmount,
        RAW_INGREDIENTS[ing].unit
      ]);
    });

    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
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
        name: INGREDIENTS[ing].name,
        category: INGREDIENTS[ing].category,
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
        name: RAW_INGREDIENTS[ing].name,
        category: RAW_INGREDIENTS[ing].category,
        amount: value.reorderAmount,
        unit: RAW_INGREDIENTS[ing].unit,
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

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-green-800">Eleventhree Pizza</h1>
          <div className="flex gap-2">
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
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('prepped-inventory')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-t font-medium
              ${activeTab === 'prepped-inventory' 
                ? 'bg-white text-green-700 border-t border-x' 
                : 'bg-gray-100 text-gray-600'}`}
          >
            Prepped Inventory
          </button>
          <button
            onClick={() => setActiveTab('raw-inventory')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-t font-medium
              ${activeTab === 'raw-inventory' 
                ? 'bg-white text-green-700 border-t border-x' 
                : 'bg-gray-100 text-gray-600'}`}
          >
            Raw Inventory
          </button>
          <button
            onClick={() => setActiveTab('prep')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-t font-medium
              ${activeTab === 'prep'
                ? 'bg-white text-green-700 border-t border-x' 
                : 'bg-gray-100 text-gray-600'}`}
          >
            End of Night Prep
          </button>
          <button
            onClick={() => setActiveTab('reorder')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-t font-medium
              ${activeTab === 'reorder'
                ? 'bg-white text-green-700 border-t border-x' 
                : 'bg-gray-100 text-gray-600'}`}
          >
            Reorder List
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          {activeTab === 'prepped-inventory' ? (
            <InventoryList 
              inventory={inventory}
              updateCount={updateCount}
            />
          ) : activeTab === 'raw-inventory' ? (
            <RawInventoryList
              inventory={inventory}
              updateCount={updateCount}
            />
          ) : activeTab === 'prep' ? (
            <PrepList
              inventory={inventory}
              togglePrep={togglePrep}
              updatePrepAmount={updatePrepAmount}
            />
          ) : (
            <ReorderList
              inventory={inventory}
              toggleReorder={toggleReorder}
              updateReorderAmount={updateReorderAmount}
            />
          )}
        </div>

        {showPrintModal && (
          <div className="fixed inset-0 z-50">
            <PrintPrep 
              prepItems={Object.entries(inventory).filter(([_, value]) => value.needsPrep)} 
              onClose={() => setShowPrintModal(false)}
            />
          </div>
        )}

        {showReorderPrintModal && (
          <div className="fixed inset-0 z-50">
            <PrintReorder
              reorderItems={Object.entries(inventory).filter(([_, value]) => value.needsReorder)}
              onClose={() => setShowReorderPrintModal(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;