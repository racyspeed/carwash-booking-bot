# RACYSPEED LINE洗車予約ボット

LINE Messaging APIとGoogle Calendar APIを連携した、完全自動予約管理システム

## 🎯 機能

### ✅ 実装済み
- **LINE Messaging API統合**
  - テキストメッセージ受け取り
  - リッチメニュー・フレックスメッセージ対応
  - Webhook署名検証

- **予約フロー**
  1. メニュー選択（洗車3種類 + コーティング3種類）
  2. サイズ選択（S/M/L/XL）※洗車のみ
  3. コーティングパターン選択（3パターン）※コーティングのみ
  4. 日時指定（自動形式チェック）
  5. Google Calendar登録
  6. 予約確定メッセージ送信

- **ビジネスロジック**
  - 営業時間チェック（10:00～18:00）
  - 定休日チェック（月曜・火曜）
  - コーティング期間の重複チェック
  - 入力形式バリデーション

- **Google Calendar連携**
  - Service Account認証
  - イベント自動作成
  - 営業時間管理

### 📊 洗車メニュー

#### 洗車3種類
| メニュー | S | M | L | XL |
|---------|----|----|----|----|
| 純水手洗い洗車 | ¥5,500/2h | ¥6,600/2.5h | ¥6,600/2.5h | ¥7,700/3h |
| 徹底洗車 | ¥44,000/15h | ¥55,000/15h | ¥55,000/15h | ¥66,000/15h |
| 徹底洗車ライト | ¥27,500/7h | ¥33,000/7h | ¥33,000/7h | ¥38,500/7h |

#### コーティング3種類
- **ISM COAT** - ¥66,000
- **IZM COAT** - ¥110,000
- **OVER COAT SEALANT** - ¥220,000

パターン: 研磨なし（3日）/ 軽研磨（5日）/ 2周研磨（7日）

## 🚀 デプロイ手順

### 1. Railway へのデプロイ

```bash
# 既存プロジェクトが起動中
# https://web-production-7fc6d.up.railway.app
```

### 2. ローカルテスト（開発環境）

```bash
# 依存関係のインストール
npm install

# .env.exampleをコピーして環境変数を設定
cp .env.example .env

# 開発サーバー起動（nodemon自動再起動）
npm run dev

# 本番サーバー起動
npm start
```

## 📝 環境変数設定

Railway ダッシュボードで以下を設定：

```
LINE_CHANNEL_ACCESS_TOKEN=isE4fi6ZnD5T1phzTAy5lUt2zqoH5zUHWkONDlzly+KGh5WSoYQYp0ffOth/O1iBibby+Qy3oQhioV2Adi/pvgEIWtIpoCKO+M/zHP+1dab/Gcm8s7AnAgtc0Vq3G0Ci4iGdkVmuHto71q5lQslsTAdB04t89/10/w1cDnyIlFU=
LINE_CHANNEL_SECRET=860416f5696fb67c18d55d6f0575f96c
PORT=3000
NODE_ENV=production
```

## 🔧 LINE Developers 設定

### Webhook URL設定
- **URL**: `https://web-production-7fc6d.up.railway.app/webhook`
- **検証**: ✅ 自動検証済み

### チャネルアクセストークン
```
isE4fi6ZnD5T1phzTAy5lUt2zqoH5zUHWkONDlzly+KGh5WSoYQYp0ffOth/O1iBibby+Qy3oQhioV2Adi/pvgEIWtIpoCKO+M/zHP+1dab/Gcm8s7AnAgtc0Vq3G0Ci4iGdkVmuHto71q5lQslsTAdB04t89/10/w1cDnyIlFU=
```

## 🔐 Google Calendar API 設定

### Service Account認証
- **プロジェクト**: carwashbooking-502611
- **サービスアカウント**: carwash-bot@carwashbooking-502611.iam.gserviceaccount.com
- **カレンダーID**: ba7fe62c075319e36884d0ec52c9f7defd7d2ce5828f8b3deeddا7890cb26a91@group.calendar.google.com

Service Account JSON は server.js に埋め込み済み

## 💬 使用方法

### LINEユーザーの操作

1. **「予約」またはメニューからメニュー選択**
   ```
   ユーザー: 予約
   ボット: [メニュー選択画面を表示]
   ```

2. **メニューを選択**
   ```
   ユーザー: 純水手洗い洗車
   ボット: [サイズ選択画面を表示]
   ```

3. **サイズを選択（洗車の場合）**
   ```
   ユーザー: size_M
   ボット: 日時をお知らせください（例: 2024年7月20日 14:30）
   ```

4. **日時を入力**
   ```
   ユーザー: 2024年7月20日 14:30
   ボット: ✅ 予約確定メッセージ + Google Calendarに登録
   ```

### 日時入力形式
```
2024年7月20日 14:30
YYYY年M月D日 HH:mm
```

## 📊 API エンドポイント

### Webhook
```
POST /webhook

Headers:
  x-line-signature: [署名]
  Content-Type: application/json

Body:
{
  "events": [
    {
      "type": "message",
      "message": {
        "type": "text",
        "text": "予約"
      },
      "replyToken": "...",
      "source": {
        "userId": "..."
      }
    }
  ]
}
```

### ヘルスチェック
```
GET /

Response:
{
  "status": "Running",
  "timestamp": "2024-07-20T10:30:00.000Z"
}
```

## 🐛 トラブルシューティング

### Webhookが動作しない
1. LINE Developers で Webhook URL が正しく設定されているか確認
2. Railway ダッシュバード で Public URL を確認
3. ボット設定で Webhook の使用が ON になっているか確認

### Google Calendar に登録されない
1. Service Account のメールアドレスが カレンダーの共有設定に追加されているか確認
2. カレンダーID が正しいか確認
3. Cloud Console で Calendar API が有効になっているか確認

### 営業時間外エラー
- 営業時間: 10:00～18:00
- 定休日: 月曜・火曜
- コーティング期間中の新規予約は受け付けません

## 📦 必須パッケージ

- `express` - Webサーバー
- `@line/bot-sdk` - LINE API
- `googleapis` - Google Calendar API
- `google-auth-library` - Google認証
- `dotenv` - 環境変数管理

## 🔄 更新手順

### コード更新時
```bash
# GitHub にプッシュ
git add .
git commit -m "Update message"
git push

# Railway が自動デプロイ
```

### 環境変数更新時
1. Railway ダッシュボード → Variables
2. 値を更新 → Deploy をクリック

## 📞 連絡先・サポート

RACYSPEED 管理者までお問い合わせください

---

**最終更新**: 2024年7月
**バージョン**: 1.0.0
**ステータス**: ✅ 本番環境稼働中
