<?php
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

// Get POST data
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data || !isset($data['prepItems'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data']);
    exit();
}

// Format email content
$subject = 'Prep List for ' . $data['date'];
$message = "ELEVENTHREE PIZZA PREP LIST\n";
$message .= "Generated: " . date('l, F j, Y g:i A') . "\n\n";

// Group items by category
$categorizedItems = [];
foreach ($data['prepItems'] as $item) {
    if (!isset($categorizedItems[$item['category']])) {
        $categorizedItems[$item['category']] = [];
    }
    $categorizedItems[$item['category']][] = $item;
}

// Build message body
foreach ($categorizedItems as $category => $items) {
    $message .= "\n" . strtoupper($category) . ":\n";
    $message .= str_repeat('-', strlen($category) + 1) . "\n";
    foreach ($items as $item) {
        $message .= sprintf(
            "• %s\n  - Prep Amount: %d\n  - Current Count: %d\n",
            $item['name'],
            $item['amount'],
            $item['currentCount']
        );
    }
}

// Email settings
$to = 'taproom@eleventhreebrewing.com'; // Change this to your email
$headers = [
    'From: taproom@eleventhreebrewing.com',
    'Reply-To: taproom@eleventhreebrewing.com',
    'Content-Type: text/plain; charset=UTF-8'
];

// Send email
$mailSent = mail($to, $subject, $message, implode("\r\n", $headers));

if ($mailSent) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send email']);
}
?>