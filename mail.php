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

// ──── source_page ホワイトリスト（オープンリダイレクト対策） ────
// ※ スパム対策のリダイレクト先としても使うため先頭で確定させる
$allowed_pages = ['contact.html', 'service-hp.html', 'services.html', 'service-advisory.html', 'partners.html'];
$raw_source    = trim($_POST['source_page'] ?? 'contact.html');
$source_page   = in_array($raw_source, $allowed_pages) ? $raw_source : 'contact.html';

// ============================================
// TRESWIN フォームスパム対策
// ※ メール送信処理より前に必ず実行すること
// ============================================

// --- 判定1：ハニーポット ---
// 人間には見えない欄に値が入っている = bot
if (!empty($_POST['tw_website'])) {
    error_log('[TRESWIN] spam blocked (honeypot) IP=' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
    header("Location: {$source_page}?sent=1");
    exit;
}

// --- 判定2：送信までの経過時間 ---
// フォーム表示から3秒未満での送信 = botの速度
$tw_ts = isset($_POST['tw_ts']) ? (int)$_POST['tw_ts'] : 0;
if ($tw_ts === 0 || (time() - $tw_ts) < 3) {
    error_log('[TRESWIN] spam blocked (too fast) IP=' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
    header("Location: {$source_page}?sent=1");
    exit;
}

// --- 判定3：同一IPのレート制限（60秒に1通まで） ---
$_ip      = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$lockDir  = sys_get_temp_dir() . '/tw_formlock';
if (!is_dir($lockDir)) { @mkdir($lockDir, 0700, true); }
$lockFile = $lockDir . '/' . hash('sha256', $_ip);
if (file_exists($lockFile) && (time() - filemtime($lockFile)) < 60) {
    error_log('[TRESWIN] spam blocked (rate limit) IP=' . $_ip);
    header("Location: {$source_page}?sent=1");
    exit;
}
@touch($lockFile);

// --- 判定4：本文へのURL大量混入（3件以上 = 宣伝スパム）---
$_body_raw = $_POST['message'] ?? '';
if (preg_match_all('#https?://#i', $_body_raw) >= 3) {
    error_log('[TRESWIN] spam blocked (too many links) IP=' . $_ip);
    header("Location: {$source_page}?sent=1");
    exit;
}

// ============================================

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

// ──── 入力値の取得・サニタイズ ────
function clean($v) {
    return htmlspecialchars(trim(strip_tags($v ?? '')), ENT_QUOTES, 'UTF-8');
}

$name          = clean($_POST['name']          ?? '');
$company       = clean($_POST['company']       ?? '');
$email         = clean($_POST['email']         ?? '');
$phone         = clean($_POST['phone']         ?? '');
$inquiry_type  = clean($_POST['inquiry_type']  ?? $_POST['ctype'] ?? '');
$partner_type  = clean($_POST['partner_type']  ?? '');
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

// ──── 添付ファイル（任意） ────
$has_attachment    = false;
$attachment_name   = '';
$attachment_b64    = '';
$attachment_mime   = 'application/octet-stream';

if (!empty($_FILES['attachment']['name']) && $_FILES['attachment']['error'] !== UPLOAD_ERR_NO_FILE) {
    if ($_FILES['attachment']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['success' => false, 'errors' => ['添付ファイルのアップロードに失敗しました。']]);
        exit;
    }

    $allowed_ext = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'zip'];
    $max_size    = 8 * 1024 * 1024; // 8MB
    $orig_name   = $_FILES['attachment']['name'];
    $ext         = strtolower(pathinfo($orig_name, PATHINFO_EXTENSION));

    if (!in_array($ext, $allowed_ext, true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'errors' => ['添付ファイルの形式が対応していません。']]);
        exit;
    }
    if ($_FILES['attachment']['size'] > $max_size) {
        http_response_code(400);
        echo json_encode(['success' => false, 'errors' => ['添付ファイルは8MB以内でアップロードしてください。']]);
        exit;
    }

    $file_content = file_get_contents($_FILES['attachment']['tmp_name']);
    if ($file_content !== false) {
        $has_attachment  = true;
        $attachment_name = preg_replace('/[^a-zA-Z0-9_.\-]/', '_', $orig_name);
        $attachment_b64  = chunk_split(base64_encode($file_content));
    }
}

// ──── メール本文の組み立て ────
$is_partner = ($source_page === 'partners.html');
$body_lines = [
    "【" . SITE_NAME . "】" . ($is_partner ? "パートナー応募が届きました" : "お問い合わせが届きました"),
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
];

if ($customer_type) $body_lines[] = "【区分】 {$customer_type}";
if ($company)       $body_lines[] = "【会社名】 {$company}";
$body_lines[] = "【お名前】 {$name}";
$body_lines[] = "【メール】 {$email}";
if ($phone)          $body_lines[] = "【電話番号】 {$phone}";
if ($inquiry_type)   $body_lines[] = "【種別】 {$inquiry_type}";
if ($partner_type)   $body_lines[] = "【希望パートナー種別】 {$partner_type}";
$body_lines[] = "";
$body_lines[] = $is_partner ? "【自己紹介・実績】" : "【お問い合わせ内容】";
$body_lines[] = $message ?: "（内容なし）";
if ($has_attachment) {
    $body_lines[] = "";
    $body_lines[] = "【添付ファイル】 {$attachment_name}";
}
$body_lines[] = "";
$body_lines[] = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
$body_lines[] = "送信元ページ: https://tres-win.com/{$source_page}";
$body_lines[] = "送信日時: " . date('Y-m-d H:i:s');

$body = implode("\n", $body_lines);

// ──── メールヘッダー（PHPバージョン非公開） ────
$subject_text = $is_partner ? "【" . SITE_NAME . "】パートナー応募：{$name} 様" : "【" . SITE_NAME . "】お問い合わせ：{$name} 様";
$subject      = mb_encode_mimeheader($subject_text, 'UTF-8', 'B');
$from_name    = mb_encode_mimeheader(SITE_NAME . " お問い合わせフォーム", 'UTF-8', 'B');

if ($has_attachment) {
    $boundary = '----=_TRESWIN_' . md5(uniqid((string)microtime(), true));
    $headers  = implode("\r\n", [
        "From: {$from_name} <no-reply@tres-win.com>",
        "Reply-To: {$email}",
        "MIME-Version: 1.0",
        "Content-Type: multipart/mixed; boundary=\"{$boundary}\"",
    ]);

    $mime_body  = "--{$boundary}\r\n";
    $mime_body .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $mime_body .= "Content-Transfer-Encoding: base64\r\n\r\n";
    $mime_body .= base64_encode($body) . "\r\n\r\n";
    $mime_body .= "--{$boundary}\r\n";
    $mime_body .= "Content-Type: {$attachment_mime}; name=\"{$attachment_name}\"\r\n";
    $mime_body .= "Content-Transfer-Encoding: base64\r\n";
    $mime_body .= "Content-Disposition: attachment; filename=\"{$attachment_name}\"\r\n\r\n";
    $mime_body .= $attachment_b64 . "\r\n";
    $mime_body .= "--{$boundary}--";

    $sent = mail(TO_EMAIL, $subject, $mime_body, $headers);
} else {
    $headers = implode("\r\n", [
        "From: {$from_name} <no-reply@tres-win.com>",
        "Reply-To: {$email}",
        "MIME-Version: 1.0",
        "Content-Type: text/plain; charset=UTF-8",
        "Content-Transfer-Encoding: base64",
    ]);
    $body_encoded = base64_encode($body);

    // ──── 送信 ────
    $sent = mail(TO_EMAIL, $subject, $body_encoded, $headers);
}

// ──── 自動返信（送信者へ） ────
if ($sent) {
    $reply_body = implode("\n", [
        "{$name} 様",
        "",
        $is_partner ? "パートナーへのご応募ありがとうございます。" : "お問い合わせいただきありがとうございます。",
        "TRESWIN（トレスウィン）です。",
        "",
        $is_partner ? "以下の内容でご応募を受け付けました。" : "以下の内容でお問い合わせを受け付けました。",
        "3営業日以内に担当者よりご返信いたします。",
        "",
        "━━━━━━━━━━━━━━━━━━━━━━━━",
        ($partner_type ? "【希望パートナー種別】 {$partner_type}\n" : "") .
        ($inquiry_type ? "【種別】 {$inquiry_type}\n" : "") .
        "【お名前】 {$name}",
        "【メール】 {$email}",
        "",
        $is_partner ? "【自己紹介・実績】" : "【お問い合わせ内容】",
        $message ?: "（内容なし）",
        "━━━━━━━━━━━━━━━━━━━━━━━━",
        "",
        "※このメールは自動送信です。このメールへの返信はできません。",
        "",
        "TRESWIN（トレスウィン）",
        "https://tres-win.com",
        "Mail: info@tres-win.com",
    ]);

    $reply_subject = mb_encode_mimeheader($is_partner ? "【TRESWIN】パートナー応募を受け付けました" : "【TRESWIN】お問い合わせを受け付けました", 'UTF-8', 'B');
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
