# 札幌こそだてX投稿ジェネレーター

札幌近郊の未就学児向けイベント・スポットのURLを入力すると、X（Twitter）投稿案を3件自動生成するWebアプリです。

## セットアップ

```bash
npm install
cp .env.example .env
# .env を開いて ANTHROPIC_API_KEY にAPIキーを設定
node server.js
# ブラウザで http://localhost:3000 を開く
```

## 機能

- URLからページ内容を自動スクレイピング
- Claude AIが札幌子育て向けX投稿文を3件生成
- 各投稿のコピーボタン・文字数カウンター
- レスポンシブ対応（スマホでも使えます）

## 注意事項

- JavaScriptで動的に生成されるページは取得できない場合があります
- `.env` ファイルは絶対にGitにコミットしないでください
