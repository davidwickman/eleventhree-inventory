<?php
// public/api/save-custom-items.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get JSON data from request body
$jsonData = file_get_contents('php://input');
$customItems = json_decode($jsonData, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit();
}

// Set file path
$jsonFile = '../data/custom-items.json';
$backupDir = '../data/backups/custom-items';

// Create directories if they don't exist
if (!file_exists('../data')) mkdir('../data', 0777, true);
if (!file_exists($backupDir)) mkdir($backupDir, 0777, true);

// Create backup with timestamp
$backupFile = $backupDir . '/custom-items_' . date('Y-m-d_H-i-s') . '.json';

// Backup existing file
if (file_exists($jsonFile)) {
    copy($jsonFile, $backupFile);
    
    // Get all backup files and sort by modification time
    $files = glob($backupDir . '/custom-items_*.json');
    usort($files, function($a, $b) {
        return filemtime($b) - filemtime($a);
    });
    
    // Keep only the last 25 backups for custom items
    if (count($files) > 25) {
        for ($i = 25; $i < count($files); $i++) {
            unlink($files[$i]);
        }
    }
}

// Validate the structure
$validStructure = [
    'ingredients' => [],
    'rawIngredients' => [],
    'paperGoods' => []
];

foreach ($validStructure as $key => $defaultValue) {
    if (!isset($customItems[$key])) {
        $customItems[$key] = $defaultValue;
    }
}

// Save new data
if (file_put_contents($jsonFile, json_encode($customItems, JSON_PRETTY_PRINT)) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save custom items']);
    exit();
}

echo json_encode([
    'success' => true,
    'message' => 'Custom items saved successfully'
]);
?>