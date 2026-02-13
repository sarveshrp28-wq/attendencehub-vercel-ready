<?php
declare(strict_types=1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

const MAX_FILE_BYTES = 5 * 1024 * 1024;

function respond(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    respond(405, ["message" => "Method not allowed. Use POST."]);
}

if (!isset($_FILES["photo"])) {
    respond(400, ["message" => "Photo file is required."]);
}

$file = $_FILES["photo"];
if (!is_array($file) || !isset($file["error"], $file["tmp_name"], $file["size"])) {
    respond(400, ["message" => "Invalid upload payload."]);
}

if ((int)$file["error"] !== UPLOAD_ERR_OK) {
    respond(400, ["message" => "Upload failed."]);
}

$size = (int)$file["size"];
if ($size <= 0 || $size > MAX_FILE_BYTES) {
    respond(400, ["message" => "Image must be greater than 0 and up to 5MB."]);
}

$tmpPath = (string)$file["tmp_name"];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = $finfo ? (string)finfo_file($finfo, $tmpPath) : "";
if ($finfo) {
    finfo_close($finfo);
}

$allowedMimeToExtension = [
    "image/jpeg" => "jpg",
    "image/png" => "png",
    "image/webp" => "webp",
];

if (!array_key_exists($mimeType, $allowedMimeToExtension)) {
    respond(400, ["message" => "Only JPG, PNG, and WEBP files are allowed."]);
}

$uploadRoot = __DIR__ . DIRECTORY_SEPARATOR . "uploads" . DIRECTORY_SEPARATOR . "students";
if (!is_dir($uploadRoot) && !mkdir($uploadRoot, 0755, true) && !is_dir($uploadRoot)) {
    respond(500, ["message" => "Could not create upload directory."]);
}

try {
    $fileName = "student_" . bin2hex(random_bytes(12)) . "." . $allowedMimeToExtension[$mimeType];
} catch (Throwable $error) {
    respond(500, ["message" => "Could not generate file name."]);
}

$targetPath = $uploadRoot . DIRECTORY_SEPARATOR . $fileName;
if (!move_uploaded_file($tmpPath, $targetPath)) {
    respond(500, ["message" => "Could not save uploaded file."]);
}

$isHttps = isset($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] !== "off";
$scheme = $isHttps ? "https" : "http";
$host = $_SERVER["HTTP_HOST"] ?? "localhost:8000";
$scriptDir = (string)dirname($_SERVER["SCRIPT_NAME"] ?? "");
$scriptDir = str_replace("\\", "/", $scriptDir);
$scriptDir = rtrim($scriptDir, "/");
$basePath = $scriptDir === "." ? "" : $scriptDir;
$relativePath = $basePath . "/uploads/students/" . $fileName;
$publicUrl = $scheme . "://" . $host . $relativePath;

respond(200, [
    "url" => $publicUrl,
    "file_name" => $fileName,
    "mime_type" => $mimeType,
    "size" => $size
]);
