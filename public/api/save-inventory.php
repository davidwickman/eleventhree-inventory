<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, X-Inventory-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get inventory type from header
$inventoryType = $_SERVER['HTTP_X_INVENTORY_TYPE'] ?? 'prepped';

// Get JSON data from request body
$jsonData = file_get_contents('php://input');
$inventory = json_decode($jsonData, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit();
}

// Set file paths based on inventory type
$jsonFile = $inventoryType === 'raw' ? '../data/raw-inventory.json' : '../data/prepped-inventory.json';
$backupDir = '../data/backups/' . $inventoryType;

// Create directories if they don't exist
if (!file_exists('../data')) mkdir('../data', 0777, true);
if (!file_exists($backupDir)) mkdir($backupDir, 0777, true);

// Create backup with timestamp
$backupFile = $backupDir . '/inventory_' . date('Y-m-d_H-i-s') . '.json';

// Backup existing file
if (file_exists($jsonFile)) {
    copy($jsonFile, $backupFile);
    
    // Get all backup files and sort by modification time
    $files = glob($backupDir . '/inventory_*.json');
    usort($files, function($a, $b) {
        return filemtime($b) - filemtime($a);
    });
    
    // Keep only the last 50 backups per type
    if (count($files) > 50) {
        for ($i = 50; $i < count($files); $i++) {
            unlink($files[$i]);
        }
    }
}

// Save new data
if (file_put_contents($jsonFile, json_encode($inventory, JSON_PRETTY_PRINT)) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save inventory']);
    exit();
}

echo json_encode([
    'success' => true,
    'type' => $inventoryType
]);