<?php
/**
 * Plesk-kompatible PHP-Bridge für FastAPI
 * Leitet Requests an lokalen FastAPI-Service weiter
 * 
 * Für Production: Node.js Process Manager (PM2) empfohlen
 */

// Konfiguration
$fastapi_host = '127.0.0.1';
$fastapi_port = 8000;

// CORS Headers für Frontend-Integration  
header('Access-Control-Allow-Origin: https://menschlichkeit-oesterreich.at');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get request data
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];
$headers = getallheaders();
$body = file_get_contents('php://input');

// Prepare cURL request to FastAPI
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://{$fastapi_host}:{$fastapi_port}{$path}");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

// Set method
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

// Forward headers (except Host)
$forward_headers = [];
foreach ($headers as $key => $value) {
    if (strtolower($key) !== 'host') {
        $forward_headers[] = "{$key}: {$value}";
    }
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $forward_headers);

// Forward body for POST/PUT
if (in_array($method, ['POST', 'PUT', 'PATCH']) && !empty($body)) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

// Execute request
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$content_type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

if (curl_error($ch)) {
    http_response_code(502);
    echo json_encode([
        'success' => false,
        'message' => 'API service unavailable'
    ]);
} else {
    http_response_code($http_code);
    if ($content_type) {
        header("Content-Type: {$content_type}");
    }
    echo $response;
}

curl_close($ch);
?>