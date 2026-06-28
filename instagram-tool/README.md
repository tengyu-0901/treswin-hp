# TRESWIN Instagram管理ツール

Instagram運用代行事業向けの管理ツールです。

## 機能

- **インサイト分析ダッシュボード** — フォロワー推移・リーチ・エンゲージメント率・オーディエンス属性
- **投稿一覧・詳細分析** — 各投稿のいいね・コメント・リーチ・保存数
- **コンテンツカレンダー** — 投稿スケジュール管理・予約投稿（cron実行）
- **クライアント管理** — 運用代行クライアントの登録・プラン・契約管理
- **月次レポート生成** — CSV出力対応

## セットアップ

### 1. Metaアプリの準備

1. [Meta Developer](https://developers.facebook.com/) でアプリを作成
2. `Instagram Graph API` を追加
3. リダイレクトURI: `http://localhost:3000/auth/callback`

### 2. バックエンド起動

```bash
cd backend
npm install
cp .env.example .env
# .env にMETA_APP_IDとMETA_APP_SECRETを設定
npm run dev
```

### 3. フロントエンド

`frontend/index.html` をブラウザで直接開くか、VSCode Live Serverで起動。

## 必要な権限（Metaアプリ）

- `instagram_basic`
- `instagram_manage_insights`
- `instagram_content_publish`
- `pages_show_list`
- `pages_read_engagement`

## API エンドポイント

| Method | Path | 説明 |
|--------|------|------|
| GET | /auth/login | Instagram OAuth開始 |
| GET | /auth/callback | OAuthコールバック |
| GET | /auth/status | 認証状態確認 |
| GET | /api/insights/account | アカウント情報 |
| GET | /api/insights/account-metrics | リーチ・インプレッション等 |
| GET | /api/insights/audience | オーディエンス属性 |
| GET | /api/insights/media | 投稿一覧+インサイト |
| GET | /api/insights/summary | サマリー（ER等） |
| POST | /api/media/publish/image | 画像投稿 |
| POST | /api/media/publish/carousel | カルーセル投稿 |
| POST | /api/media/publish/reel | リール投稿 |
| GET | /api/scheduler | 予約投稿一覧 |
| POST | /api/scheduler | 予約投稿登録 |
| GET | /api/clients | クライアント一覧 |
| POST | /api/clients | クライアント登録 |
| GET | /api/reports/monthly | 月次レポートデータ |
| GET | /api/reports/monthly/csv | CSVダウンロード |
