# 洗車・コーティング店 LINE 予約システム

LINE Messaging API と Google Calendar を連携した、1人営業向けの自動予約管理システムです。

## 機能

- 📱 **LINE メニュー選択** - リッチメニューからワンタップで予約開始
- 🧼 **複数メニュー管理** - 洗車3種類 × コーティング9種類に対応
- 🚗 **車両サイズ別料金・時間** - SS/S/M/L/XL/XXL の6サイズに自動対応
- ⏰ **営業時間・定休日対応** - 営業時間内での自動スケジューリング
- 📅 **Google Calendar 連携** - 予約が自動的にカレンダーに追加
- 🔔 **自動リマインダー** - 予約2日前に自動送信
- ❌ **キャンセル機能** - 2日前までキャンセル可能
- 🎨 **オプション管理** - 複数のアドオンサービスに対応

## セットアップ手順

詳細な手順は [SETUP_GUIDE.md](./SETUP_GUIDE.md) を参照してください。

### クイックスタート

1. **LINE Official Account を準備**
   - チャネルアクセストークン
   - チャネルシークレット

2. **Google Cloud Platform を設定**
   - Calendar API 有効化
   - サービスアカウント作成
   - JSON キー取得

3. **環境変数を設定**
   ```bash
   cp .env.example .env
   # .env を編集して、トークンやキーを追加
   ```

4. **Railway にデプロイ**
   ```bash
   # GitHub リポジトリをRailwayに接続
   # 自動的にデプロイされます
   ```

5. **Webhook URL を LINE に設定**
   - Railway の Public URL + `/webhook` をコピー
   - LINE Developers の Webhook URL に貼り付け

## ローカルテスト

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev

# http://localhost:3000 でアクセス可能
```

## ファイル構成

```
carwash-booking-bot/
├── server.js           # メインサーバー
├── package.json        # 依存関係
├── Procfile           # デプロイ設定
├── .env.example       # 環境変数テンプレート
├── .gitignore         # Git除外ファイル
├── SETUP_GUIDE.md     # セットアップガイド
└── README.md          # このファイル
```

## メニュー構成

### 洗車メニュー
- **純水手洗い洗車** - ¥5,500～¥7,700 / 2～3時間
- **徹底洗車** - ¥44,000～¥66,000 / 15時間
- **徹底洗車ライト** - ¥27,500～¥38,500 / 7時間

### コーティングメニュー
- **ISM COAT** 3種類（研磨なし/軽研磨/2周研磨）
- **IZM COAT** 3種類（研磨なし/軽研磨/2周研磨）
- **OVER COAT SEALANT** 3種類（研磨なし/軽研磨/2周研磨）

### オプション
- 窓ガラスコーティング（複数種類）
- ホイールコーティング（1本/4本）
- 樹脂コーティング

## 営業情報

- **営業時間** - 10:00～18:00
- **定休日** - 月曜・火曜
- **コーティング引き取り** - 午前9:00～12:00（月火も可）

## API エンドポイント

### POST /webhook
LINE Messaging API からのイベントを受け取ります。

**Webhook URL**: `https://your-app.railway.app/webhook`

### GET /health
サーバーのヘルスチェック。

**レスポンス**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## トラブルシューティング

### Webhook が 404 エラー
- Railway の Public URL が正しいか確認
- `/webhook` パスが含まれているか確認

### Google Calendar に予約が反映されない
- サービスアカウントがカレンダーに招待されているか確認
- CALENDAR_ID が正しいか確認
- Railway のログで API エラーを確認

### リマインダーが送信されない
- Railway のログで cron ジョブが実行されているか確認
- LINE チャネルアクセストークンが正しいか確認

## 今後の拡張予定

- [ ] 複数営業者対応
- [ ] 支払い機能統合（Stripe/PayPay）
- [ ] 顧客管理画面
- [ ] 施工前・後の写真機能
- [ ] 顧客レビュー機能

## ライセンス

ISC

## サポート

問題が発生した場合は、Railway のログを確認するか、GitHub Issues で報告してください。
