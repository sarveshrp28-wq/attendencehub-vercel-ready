<?php
declare(strict_types=1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    respond(405, ["message" => "Method not allowed. Use GET."]);
}

$dataFile = __DIR__ . DIRECTORY_SEPARATOR . "data" . DIRECTORY_SEPARATOR . "parent-alerts.json";
$alerts = [];

if (file_exists($dataFile)) {
    $raw = file_get_contents($dataFile);
    if ($raw !== false && trim($raw) !== "") {
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            $alerts = $decoded;
        }
    }
}

$studentId = normalize_text($_GET["student_id"] ?? "", 80);
$parentEmail = strtolower(normalize_text($_GET["parent_email"] ?? "", 200));
$limitRaw = $_GET["limit"] ?? 20;
$limit = is_numeric($limitRaw) ? (int)$limitRaw : 20;
if ($limit <= 0) {
    $limit = 20;
}
if ($limit > 100) {
    $limit = 100;
}

$filtered = array_filter($alerts, function (array $alert) use ($studentId, $parentEmail): bool {
    if ($studentId !== "" && ($alert["student_id"] ?? "") !== $studentId) {
        return false;
    }
    if ($parentEmail !== "" && strtolower((string)($alert["parent_email"] ?? "")) !== $parentEmail) {
        return false;
    }
    return true;
});

usort($filtered, function (array $a, array $b): int {
    return strcmp((string)($b["created_at"] ?? ""), (string)($a["created_at"] ?? ""));
});

$filtered = array_slice($filtered, 0, $limit);

respond(200, [
    "alerts" => array_values($filtered),
    "count" => count($filtered)
]);
