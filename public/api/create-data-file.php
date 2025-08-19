<?php
// public/api/create-data-file.php
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
$requestData = json_decode($jsonData, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit();
}

if (!isset($requestData['filename']) || !isset($requestData['content'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing filename or content']);
    exit();
}

$filename = $requestData['filename'];
$content = $requestData['content'];

// Validate filename (security check)
$allowedFiles = [
    'prepped-inventory.json',
    'raw-inventory.json',
    'paper-inventory.json',
    'custom-items.json',
    'categories.json'
];

if (!in_array($filename, $allowedFiles)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid filename']);
    exit();
}

// Set file path
$dataDir = '../data';
$filePath = $dataDir . '/' . $filename;

// Create data directory if it doesn't exist
if (!file_exists($dataDir)) {
    if (!mkdir($dataDir, 0777, true)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create data directory']);
        exit();
    }
}

// Create backup directories
$backupDirs = [
    '../data/backups/prepped',
    '../data/backups/raw', 
    '../data/backups/paper',
    '../data/backups/custom-items',
    '../data/backups/categories'
];

foreach ($backupDirs as $dir) {
    if (!file_exists($dir)) {
        mkdir($dir, 0777, true);
    }
}

// Only create file if it doesn't already exist
if (file_exists($filePath)) {
    echo json_encode([
        'success' => true,
        'message' => 'File already exists',
        'created' => false
    ]);
    exit();
}

// Create the file with the provided content
if (file_put_contents($filePath, json_encode($content, JSON_PRETTY_PRINT)) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create file']);
    exit();
}

// Set proper permissions
chmod($filePath, 0666);

echo json_encode([
    'success' => true,
    'message' => 'File created successfully',
    'created' => true,
    'filename' => $filename
]);
?>