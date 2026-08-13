# TRESWIN TikTok動画（Remotion）

TRESWINの各事業を紹介するTikTok向け縦型動画（1080×1920, 30fps）をRemotionで生成するプロジェクト。

## セットアップ

```bash
cd remotion-tiktok
npm install
```

## プレビュー（Remotion Studio）

```bash
npm start
```

## レンダリング

```bash
npm run build
# → out/career-support.mp4
```

## 構成

- `src/Root.tsx` — コンポジション登録（`CareerSupport`, 15秒 / 450フレーム）
- `src/CareerVideo.tsx` — シーンを`Sequence`で連結するメインコンポーネント
- `src/scenes/` — 各シーン（フック→問題提起→ブランド訴求→提供価値→CTA）
- `src/components/` — Kinetic Typography用の共通パーツ（フェード、テキストアニメ、背景演出）
- `src/theme.ts` — TRESWINブランドカラー・サイズ定義（shared.cssと同じ配色）
- `public/fonts/` — Noto Sans/Serif JP・DM Monoのサブセットフォント（レンダリング時のネットワーク依存をなくすため、動画内で使う文字だけを含むwoff2をローカル同梱）

## 新しい動画を作る場合

1. `src/scenes/` に新しいシーンを追加
2. `src/CareerVideo.tsx` の `SCENES` 配列に登録
3. 内容を差し替える場合、`public/fonts/` のサブセットに含まれない文字を使うなら、Google Fonts css2 API の `text=` パラメータで該当文字だけの新しいwoff2を取得し直す必要がある
