<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$name    = isset($input['name'])    ? htmlspecialchars(strip_tags($input['name']))    : '';
$email   = isset($input['email'])   ? htmlspecialchars(strip_tags($input['email']))   : '';
$brand   = isset($input['brand'])   ? htmlspecialchars(strip_tags($input['brand']))   : '';
$message = isset($input['message']) ? htmlspecialchars(strip_tags($input['message'])) : '';

if (!$name || !$email) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$resend_api_key = 'YOUR_RESEND_API_KEY'; // ← Replace with your key

$subject = 'Jauns pieprasījums no ' . $name . ($brand ? ' — ' . $brand : '');

$html  = '<p><strong>Vārds:</strong> ' . $name . '</p>';
$html .= '<p><strong>E-pasts:</strong> ' . $email . '</p>';
if ($brand)   $html .= '<p><strong>Zīmols:</strong> ' . $brand . '</p>';
if ($message) $html .= '<p><strong>Ziņojums:</strong></p><p>' . nl2br($message) . '</p>';

$payload = json_encode([
    'from'    => 'Motionmade <noreply@motionmade.online>',
    'to'      => ['info@motionmade.online'],
    'subject' => $subject,
    'html'    => $html
]);

$ch = curl_init('https://api.resend.com/emails');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $resend_api_key,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($status === 200 || $status === 201) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send']);
}
