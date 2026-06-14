<?php
/**
 * TRESWIN お問い合わせメール送信スクリプト
 * 送信先: info@tres-win.com
 */

// セキュリティ: POSTのみ受け付ける
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method Not Allowed');
}

// ──── レート制限（同一IPから1分に5回まで） ────
session_start();
$ip  = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$key = 'mail_rate_' . md5($ip);
$now = time();
if (!isset($_SESSION[$key])) $_SESSION[$key] = [];
$_SESSION[$key] = array_filter($_SESSION[$key], fn($t) => $now - $t < 60);
if (count($_SESSION[$key]) >= 5) {
    http_response_code(429);
    echo json_encode(['success' => false, 'errors' => ['送信回数が上限に達しました。しばらくお待ちください。']]);
    exit;
}
$_SESSION[$key][] = $now;

header('Content-Type: application/json; charset=utf-8');

// 送信先
define('TO_EMAIL', 'info@tres-win.com');
define('SITE_NAME', 'TRESWIN');

// ──── source_page ホワイトリスト（オープンリダイレクト対策） ────
$allowed_pages = ['contact.html', 'service-hp.html', 'services.html', 'service-advisory.html'];
$raw_source    = trim($_POST['source_page'] ?? 'contact.html');
$source_page   = in_array($raw_source, $allowed_pages) ? $raw_source : 'contact.html';

// ──── 入力値の取得・サニタイズ ────
function clean($v) {
    return htmlspecialchars(trim(strip_tags($v ?? '')), ENT_QUOTES, 'UTF-8');
}

$name          = clean($_POST['name']          ?? '');
$company       = clean($_POST['company']       ?? '');
$email         = clean($_POST['email']         ?? '');
$inquiry_type  = clean($_POST['inquiry_type']  ?? $_POST['ctype'] ?? '');
$customer_type = clean($_POST['customer_type'] ?? '');
$message_raw   = $_POST['message'] ?? '';

// メッセージ長制限（3000文字）
if (mb_strlen($message_raw) > 3000) {
    http_response_code(400);
    echo json_encode(['success' => false, 'errors' => ['お問い合わせ内容は3000文字以内でご入力ください。']]);
    exit;
}
$message = clean($message_raw);

// ──── バリデーション ────
$errors = [];
if (empty($name))  $errors[] = 'お名前は必須です。';
if (empty($email)) $errors[] = 'メールアドレスは必須です。';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'メールアドレスの形式が正しくありません。';

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

// ──── メール本文の組み立て ────
$body_lines = [
    "【" . SITE_NAME . "】お問い合わせが届きました",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
];

if ($customer_type) $body_lines[] = "【区分】 {$customer_type}";
if ($company)       $body_lines[] = "【会社名】 {$company}";
$body_lines[] = "【お名前】 {$name}";
$body_lines[] = "【メール】 {$email}";
if ($inquiry_type)  $body_lines[] = "【種別】 {$inquiry_type}";
$body_lines[] = "";
$body_lines[] = "【お問い合わせ内容】";
$body_lines[] = $message ?: "（内容なし）";
$body_lines[] = "";
$body_lines[] = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
$body_lines[] = "送信元ページ: https://tres-win.com/{$source_page}";
$body_lines[] = "送信日時: " . date('Y-m-d H:i:s');

$body = implode("\n", $body_lines);

// ──── メールヘッダー（PHPバージョン非公開） ────
$subject   = mb_encode_mimeheader("【" . SITE_NAME . "】お問い合わせ：{$name} 様", 'UTF-8', 'B');
$from_name = mb_encode_mimeheader(SITE_NAME . " お問い合わせフォーム", 'UTF-8', 'B');
$headers   = implode("\r\n", [
    "From: {$from_name} <no-reply@tres-win.com>",
    "Reply-To: {$email}",
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
]);

$body_encoded = base64_encode($body);

// ──── 送信 ────
$sent = mail(TO_EMAIL, $subject, $body_encoded, $headers);

// ──── 自動返信（送信者へ） ────
if ($sent) {
    $reply_body = implode("\n", [
        "{$name} 様",
        "",
        "お問い合わせいただきありがとうございます。",
        "TRESWIN（トレスウィン）です。",
        "",
        "以下の内容でお問い合わせを受け付けました。",
        "3営業日以内に担当者よりご返信いたします。",
        "",
        "━━━━━━━━━━━━━━━━━━━━━━━━",
        ($inquiry_type ? "【種別】 {$inquiry_type}\n" : "") .
        "【お名前】 {$name}",
        "【メール】 {$email}",
        "",
        "【お問い合わせ内容】",
        $message ?: "（内容なし）",
        "━━━━━━━━━━━━━━━━━━━━━━━━",
        "",
        "※このメールは自動送信です。このメールへの返信はできません。",
        "",
        "TRESWIN（トレスウィン）",
        "https://tres-win.com",
        "Mail: info@tres-win.com",
    ]);

    $reply_subject = mb_encode_mimeheader("【TRESWIN】お問い合わせを受け付けました", 'UTF-8', 'B');
    $reply_from    = mb_encode_mimeheader("TRESWIN", 'UTF-8', 'B');
    $reply_headers = implode("\r\n", [
        "From: {$reply_from} <info@tres-win.com>",
        "MIME-Version: 1.0",
        "Content-Type: text/plain; charset=UTF-8",
        "Content-Transfer-Encoding: base64",
    ]);
    mail($email, $reply_subject, base64_encode($reply_body), $reply_headers);
}

// ──── レスポンス ────
if ($sent) {
    if (!empty($_POST['ajax'])) {
        echo json_encode(['success' => true]);
    } else {
        header("Location: {$source_page}?sent=1");
    }
} else {
    http_response_code(500);
    if (!empty($_POST['ajax'])) {
        echo json_encode(['success' => false, 'errors' => ['送信に失敗しました。時間をおいて再度お試しください。']]);
    } else {
        header("Location: {$source_page}?error=1");
    }
}
exit;
