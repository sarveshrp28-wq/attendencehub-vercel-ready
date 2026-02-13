<?php
declare(strict_types=1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

function respond(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function normalize_text(mixed $value, int $maxLength = 300): string
{
    $text = is_string($value) ? trim($value) : "";
    if ($text === "") {
        return "";
    }
    if (mb_strlen($text, "UTF-8") > $maxLength) {
        $text = mb_substr($text, 0, $maxLength, "UTF-8");
    }
    return $text;
}

function read_alert_store(string $storePath): array
{
    if (!file_exists($storePath)) {
        return [];
    }

    $raw = file_get_contents($storePath);
    if ($raw === false || trim($raw) === "") {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function write_alert_store(string $storePath, array $alerts): bool
{
    $encoded = json_encode($alerts, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if ($encoded === false) {
        return false;
    }
    return file_put_contents($storePath, $encoded, LOCK_EX) !== false;
}

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    respond(405, ["message" => "Method not allowed. Use POST."]);
}

$rawBody = file_get_contents("php://input");
if ($rawBody === false || trim($rawBody) === "") {
    respond(400, ["message" => "Request body is required."]);
}

$body = json_decode($rawBody, true);
if (!is_array($body)) {
    respond(400, ["message" => "Invalid JSON body."]);
}

$studentId = normalize_text($body["student_id"] ?? "", 80);
$studentName = normalize_text($body["student_name"] ?? "", 120);
$parentName = normalize_text($body["parent_name"] ?? "", 120);
$parentPhone = normalize_text($body["parent_phone_number"] ?? "", 40);
$parentEmail = normalize_text($body["parent_email"] ?? "", 200);
$customMessage = normalize_text($body["message"] ?? "", 1000);
$attendancePercentageRaw = $body["attendance_percentage"] ?? null;
$attendancePercentage = is_numeric($attendancePercentageRaw) ? round((float)$attendancePercentageRaw, 2) : null;

if ($studentId === "" || $studentName === "" || $parentName === "" || $parentPhone === "") {
    respond(400, ["message" => "student_id, student_name, parent_name, and parent_phone_number are required."]);
}

if ($customMessage === "") {
    $percentageText = $attendancePercentage !== null ? "{$attendancePercentage}%" : "recent";
    $customMessage = "Attendance update: {$studentName} currently has {$percentageText} attendance. Please monitor and support regular attendance.";
}

$dataDir = __DIR__ . DIRECTORY_SEPARATOR . "data";
if (!is_dir($dataDir) && !mkdir($dataDir, 0755, true) && !is_dir($dataDir)) {
    respond(500, ["message" => "Could not initialize alert data directory."]);
}

$storePath = $dataDir . DIRECTORY_SEPARATOR . "parent-alerts.json";
$alerts = read_alert_store($storePath);

try {
    $alertId = "alert_" . bin2hex(random_bytes(8));
} catch (Throwable $error) {
    respond(500, ["message" => "Could not generate alert id."]);
}

$alertRecord = [
    "id" => $alertId,
    "created_at" => gmdate("c"),
    "student_id" => $studentId,
    "student_name" => $studentName,
    "parent_name" => $parentName,
    "parent_phone_number" => $parentPhone,
    "parent_email" => $parentEmail,
    "attendance_percentage" => $attendancePercentage,
    "message" => $customMessage
];

$alerts[] = $alertRecord;
if (count($alerts) > 500) {
    $alerts = array_slice($alerts, -500);
}

if (!write_alert_store($storePath, $alerts)) {
    respond(500, ["message" => "Could not persist parent alert."]);
}

$emailSent = false;
$emailAttempted = false;
$emailWarning = "";
if ($parentEmail !== "" && filter_var($parentEmail, FILTER_VALIDATE_EMAIL)) {
    $emailAttempted = true;
    $subject = "Attendance Alert: {$studentName}";
    $emailBody = "Hello {$parentName},\n\n{$customMessage}\n\nStudent: {$studentName}\nParent Contact: {$parentPhone}\n\n- Attendance Hub";
    $headers = "From: no-reply@attendancehub.local\r\n" .
        "Reply-To: no-reply@attendancehub.local\r\n" .
        "X-Mailer: PHP/" . phpversion();
    $emailSent = @mail($parentEmail, $subject, $emailBody, $headers);
    if (!$emailSent) {
        $emailWarning = "Alert saved, but email could not be sent by this PHP server.";
    }
}

respond(200, [
    "success" => true,
    "message" => "Parent alert saved successfully.",
    "alert" => $alertRecord,
    "email_attempted" => $emailAttempted,
    "email_sent" => $emailSent,
    "warning" => $emailWarning
]);
