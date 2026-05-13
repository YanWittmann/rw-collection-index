<?php
$config = require_once __DIR__ . '/config.php';

header('Access-Control-Allow-Origin: ' . $config['allowed_origin']);
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

$storageDir = rtrim($config['storage_dir'], '/\\') . '/';
if (!is_dir($storageDir)) {
    mkdir($storageDir, 0755, true);
}

if (!isset($_FILES['savefile']) || $_FILES['savefile']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    exit;
}

if ($_FILES['savefile']['size'] > $config['max_file_size']) {
    http_response_code(413);
    exit;
}

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$userHash = hash('sha256', $ip . $config['ip_salt']);
$rateLimitFile = $storageDir . 'rate_limit.json';

$fp = fopen($rateLimitFile, 'c+');
if (!$fp) {
    http_response_code(500);
    exit;
}

flock($fp, LOCK_EX);
$fileSize = filesize($rateLimitFile);
$rateData = [];
if ($fileSize > 0) {
    $json = fread($fp, $fileSize);
    $rateData = json_decode($json, true) ?: [];
}

$now = time();
$cutoff = $now - $config['rate_limit_seconds'];

foreach ($rateData as $hash => &$timestamps) {
    $timestamps = array_filter($timestamps, function($ts) use ($cutoff) {
        return $ts > $cutoff;
    });
}
$rateData = array_filter($rateData);

$userRequests = $rateData[$userHash] ?? [];
if (count($userRequests) >= $config['rate_limit_requests']) {
    flock($fp, LOCK_UN);
    fclose($fp);
    http_response_code(429);
    exit;
}

$rateData[$userHash][] = $now;
ftruncate($fp, 0);
rewind($fp);
fwrite($fp, json_encode($rateData));
flock($fp, LOCK_UN);
fclose($fp);

$tempPath = $_FILES['savefile']['tmp_name'];
$fileHash = hash_file('sha256', $tempPath);
$savePath = $storageDir . $fileHash . '.sav';

if (file_exists($savePath)) {
    http_response_code(200);
    exit;
}

if (move_uploaded_file($tempPath, $savePath)) {
    $metaPath = $storageDir . $fileHash . '_meta.txt';
    $metaContent = "date: " . date('c') . "\n";
    $metaContent .= "original_name: " . $_FILES['savefile']['name'] . "\n";
    $metaContent .= "size: " . $_FILES['savefile']['size'] . " bytes\n";
    $metaContent .= "user_agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'unknown') . "\n";

    $rawNote = $_POST['note'] ?? '';
    $note = trim(strip_tags(mb_substr($rawNote, 0, 400)));
    if ($note !== '') {
        $metaContent .= "note: " . $note . "\n";
    }

    file_put_contents($metaPath, $metaContent);
    http_response_code(200);
} else {
    http_response_code(500);
}