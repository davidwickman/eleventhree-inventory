<?php
// public/api/save-categories.php
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
$categories = json_decode($jsonData, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit();
}

// Set file path
$jsonFile = '../data/categories.json';
$backupDir = '../data/backups/categories';

// Create directories if they don't exist
if (!file_exists('../data')) mkdir('../data', 0777, true);
if (!file_exists($backupDir)) mkdir($backupDir, 0777, true);

// Create backup with timestamp (only if file already exists)
if (file_exists($jsonFile)) {
    $backupFile = $backupDir . '/categories_' . date('Y-m-d_H-i-s') . '.json';
    copy($jsonFile, $backupFile);
    
    // Get all backup files and sort by modification time
    $files = glob($backupDir . '/categories_*.json');
    usort($files, function($a, $b) {
        return filemtime($b) - filemtime($a);
    });
    
    // Keep only the last 25 backups for categories
    if (count($files) > 25) {
        for ($i = 25; $i < count($files); $i++) {
            unlink($files[$i]);
        }
    }
}

// Validate and ensure proper structure
$validStructure = [
    'ingredients' => [],
    'rawIngredients' => [],
    'paperGoods' => []
];

// If file doesn't exist or categories is empty, initialize with valid structure
if (!file_exists($jsonFile) || empty($categories)) {
    $categories = $validStructure;
} else {
    // Ensure all required keys exist
    foreach ($validStructure as $key => $defaultValue) {
        if (!isset($categories[$key])) {
            $categories[$key] = $defaultValue;
        }
    }
}

// Save new data
if (file_put_contents($jsonFile, json_encode($categories, JSON_PRETTY_PRINT)) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save categories']);
    exit();
}

echo json_encode([
    'success' => true,
    'message' => 'Categories saved successfully',
    'created_file' => !file_exists($jsonFile)
]);
?>