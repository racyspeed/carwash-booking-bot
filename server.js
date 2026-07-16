const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();
const { google } = require('googleapis');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
app.use(express.json());

// =====================
// 定数設定
// =====================

const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;
const GOOGLE_SERVICE_ACCOUNT = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

const LINE_API_URL = 'https://api.line.biz/v2/bot/message';
const PUSH_API_URL = 'https://api.line.biz/v2/bot/message/push';

// 営業時間定数
const BUSINESS_HOURS = {
  start: 10,
  end: 18,
  closedDays: [1, 2], // 月=1, 火=2
};

const COATING_PICKUP_HOURS = {
  start: 9,
  end: 12,
};

// =====================
// メニュー定義
// =====================

const MENUS = {
  wash: [
    {
      id: 'pure_wash',
      name: '純水手洗い洗車',
      subtitle: 'お手軽にスッキリ',
      prices: { SS: 5500, S: 5500, M: 6600, L: 6600, XL: 7700, XXL: 7700 },
      times: { SS: 2, S: 2, M: 2.5, L: 2.5, XL: 3, XXL: 3 },
    },
    {
      id: 'thorough_wash',
      name: '徹底洗車',
      subtitle: 'まずは愛車をスッピンにしてがスタート',
      prices: { SS: 44000, S: 44000, M: 55000, L: 55000, XL: 66000, XXL: 66000 },
      times: { SS: 15, S: 15, M: 15, L: 15, XL: 15, XXL: 15 },
      overnight: true, // 営業時間またがる
    },
    {
      id: 'thorough_wash_light',
      name: '徹底洗車ライト',
      subtitle: 'コーティングメンテナンスに最適',
      prices: { SS: 27500, S: 27500, M: 33000, L: 33000, XL: 38500, XXL: 38500 },
      times: { SS: 7, S: 7, M: 7, L: 7, XL: 7, XXL: 7 },
    },
  ],
  coating: [
    {
      id: 'ism_coat_none',
      name: 'ISM COAT(研磨なし)',
      duration: 3, // days
      prices: { SS: 110000, S: 121000, M: 132000, L: 143000, XL: 154000, XXL: 165000 },
    },
    {
      id: 'ism_coat_light',
      name: 'ISM COAT(軽研磨)',
      duration: 5,
      prices: { SS: 143000, S: 154000, M: 165000, L: 176000, XL: 187000, XXL: 198000 },
    },
    {
      id: 'ism_coat_heavy',
      name: 'ISM COAT(2周研磨)',
      duration: 7,
      prices: { SS: 176000, S: 187000, M: 198000, L: 209000, XL: 220000, XXL: 231000 },
    },
    {
      id: 'izm_coat_none',
      name: 'IZM COAT(研磨なし)',
      duration: 3,
      prices: { SS: 99000, S: 110000, M: 121000, L: 132000, XL: 143000, XXL: 154000 },
    },
    {
      id: 'izm_coat_light',
      name: 'IZM COAT(軽研磨)',
      duration: 5,
      prices: { SS: 132000, S: 143000, M: 154000, L: 165000, XL: 176000, XXL: 187000 },
    },
    {
      id: 'izm_coat_heavy',
      name: 'IZM COAT(2周研磨)',
      duration: 7,
      prices: { SS: 165000, S: 176000, M: 187000, L: 198000, XL: 209000, XXL: 220000 },
    },
    {
      id: 'over_coat_none',
      name: 'OVER COAT SEALANT(研磨なし)',
      duration: 3,
      prices: { SS: 66000, S: 77000, M: 88000, L: 99000, XL: 110000, XXL: 121000 },
    },
    {
      id: 'over_coat_light',
      name: 'OVER COAT SEALANT(軽研磨)',
      duration: 5,
      prices: { SS: 99000, S: 110000, M: 121000, L: 132000, XL: 143000, XXL: 154000 },
    },
    {
      id: 'over_coat_heavy',
      name: 'OVER COAT SEALANT(2周研磨)',
      duration: 7,
      prices: { SS: 132000, S: 143000, M: 154000, L: 165000, XL: 176000, XXL: 187000 },
    },
  ],
};

const OPTIONS = [
  { id: 'glass_front', name: 'フロントガラスのみ', time: 1, price: 5500 },
  { id: 'glass_full_no_roof', name: 'ガラス全面(ルーフなし)', time: 2, price: 22000 },
  { id: 'glass_full_roof', name: 'ガラス全面(ルーフあり)', time: 2.5, price: 25300 },
  { id: 'wheel_1', name: 'ホイールコーティング 1本', time: 1, price: 5500 },
  { id: 'wheel_4', name: 'ホイールコーティング 4本', time: 4, price: 22000 },
  { id: 'resin', name: '樹脂コーティング', time: 1, price: 8800 },
];

// =====================
// Database 初期化
// =====================

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  // ユーザーテーブル
  db.run(`CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    line_user_id TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 予約テーブル
  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    line_user_id TEXT,
    menu_type TEXT,
    menu_id TEXT,
    car_size TEXT,
    service_type TEXT,
    start_time DATETIME,
    end_time DATETIME,
    duration_hours REAL,
    options TEXT,
    total_price INTEGER,
    status TEXT,
    calendar_event_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
  )`);

  // セッションテーブル（ユーザーの選択状態を管理）
  db.run(`CREATE TABLE IF NOT EXISTS sessions (
    user_id TEXT PRIMARY KEY,
    line_user_id TEXT,
    current_step TEXT,
    menu_type TEXT,
    menu_id TEXT,
    car_size TEXT,
    options TEXT,
    start_time TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
  )`);
});

// =====================
// Google Calendar 初期化
// =====================

const oauth2Client = new google.auth.GoogleAuth({
  credentials: GOOGLE_SERVICE_ACCOUNT,
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// =====================
// ユーティリティ関数
// =====================

// LINE メッセージ送信
async function sendLineMessage(userId, messages) {
  try {
    await axios.post(
      `${PUSH_API_URL}/push`,
      {
        to: userId,
        messages: Array.isArray(messages) ? messages : [messages],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
        },
      }
    );
  } catch (error) {
    console.error('LINE メッセージ送信エラー:', error.response?.data || error.message);
  }
}

// Webhook 署名検証
function validateSignature(body, signature) {
  const hash = crypto
    .createHmac('sha256', CHANNEL_SECRET)
    .update(body)
    .digest('base64');
  return hash === signature;
}

// 営業日かどうかの判定
function isBusinessDay(date) {
  const dayOfWeek = date.getDay();
  return !BUSINESS_HOURS.closedDays.includes(dayOfWeek);
}

// 営業時間内かどうかの判定
function isWithinBusinessHours(date) {
  const hour = date.getHours();
  return hour >= BUSINESS_HOURS.start && hour < BUSINESS_HOURS.end;
}

// 次の営業日を取得
function getNextBusinessDate(date = new Date()) {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  
  while (!isBusinessDay(next)) {
    next.setDate(next.getDate() + 1);
  }
  
  return next;
}

// 利用可能な時間スロットを取得
async function getAvailableSlots(startDate, durationHours, isCoating = false) {
  return new Promise((resolve, reject) => {
    let checkDate = new Date(startDate);
    checkDate.setHours(BUSINESS_HOURS.start, 0, 0, 0);

    // コーティングの場合、営業時間無視
    if (isCoating) {
      resolve([
        {
          date: formatDate(startDate),
          time: '相談（施工日をご連絡します）',
        },
      ]);
      return;
    }

    const availableSlots = [];

    // 次の7日間をチェック
    for (let i = 0; i < 7; i++) {
      if (isBusinessDay(checkDate)) {
        // 営業時間内で開始できるか確認
        for (let hour = BUSINESS_HOURS.start; hour < BUSINESS_HOURS.end; hour++) {
          const slotStart = new Date(checkDate);
          slotStart.setHours(hour, 0, 0, 0);

          // 既存予約との重複チェック
          db.get(
            `SELECT * FROM bookings WHERE 
             DATE(start_time) = ? AND 
             status = 'confirmed'`,
            [formatDate(slotStart)],
            (err, row) => {
              if (!err && !row) {
                availableSlots.push({
                  date: formatDate(slotStart),
                  time: `${hour}:00`,
                });
              }
            }
          );
        }
      }
      checkDate.setDate(checkDate.getDate() + 1);
      checkDate.setHours(BUSINESS_HOURS.start, 0, 0, 0);
    }

    setTimeout(() => resolve(availableSlots), 100);
  });
}

// 日付フォーマット
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// 日時フォーマット
function formatDateTime(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

// =====================
// LINE イベントハンドラー
// =====================

// 予約選択フロー
async function handleMenuSelection(userId, lineUserId, text) {
  // 予約フロー開始
  const messages = [
    {
      type: 'text',
      text: 'ご利用メニューを選択してください',
    },
    {
      type: 'template',
      altText: 'メニュー選択',
      template: {
        type: 'buttons',
        text: 'どのメニューをご利用ですか？',
        actions: [
          {
            type: 'postback',
            label: '洗車',
            data: 'action=select_menu_type&type=wash',
          },
          {
            type: 'postback',
            label: 'コーティング',
            data: 'action=select_menu_type&type=coating',
          },
        ],
      },
    },
  ];

  await sendLineMessage(lineUserId, messages);
}

// =====================
// POST /webhook - LINE Webhook
// =====================

app.post('/webhook', (req, res) => {
  const signature = req.get('x-line-signature');
  const body = JSON.stringify(req.body);

  // 署名検証
  if (!validateSignature(body, signature)) {
    return res.status(403).send('Forbidden');
  }

  const events = req.body.events;

  events.forEach((event) => {
    if (event.type === 'message' && event.message.type === 'text') {
      const userId = event.source.userId;
      const lineUserId = event.source.userId;
      const text = event.message.text;

      // テキストメッセージ処理
      if (text === '予約') {
        handleMenuSelection(userId, lineUserId, text);
      }
    }

    if (event.type === 'postback') {
      const userId = event.source.userId;
      const lineUserId = event.source.userId;
      const data = new URLSearchParams(event.postback.data);

      const action = data.get('action');

      // メニュー選択処理
      if (action === 'select_menu_type') {
        const menuType = data.get('type');
        handleMenuTypeSelection(lineUserId, menuType);
      }

      // メニュー選択処理
      if (action === 'select_menu') {
        const menuId = data.get('menu_id');
        handleMenuItemSelection(lineUserId, menuId);
      }

      // 車サイズ選択処理
      if (action === 'select_size') {
        const menuId = data.get('menu_id');
        const carSize = data.get('size');
        handleCarSizeSelection(lineUserId, menuId, carSize);
      }

      // 日時確認処理
      if (action === 'confirm_booking') {
        const menuId = data.get('menu_id');
        const carSize = data.get('size');
        const dateTime = data.get('datetime');
        handleBookingConfirmation(lineUserId, menuId, carSize, dateTime);
      }
    }
  });

  res.sendStatus(200);
});

// メニュータイプ選択
async function handleMenuTypeSelection(lineUserId, menuType) {
  let messages = [];

  if (menuType === 'wash') {
    messages = [
      {
        type: 'text',
        text: 'ご利用の洗車メニューを選択してください',
      },
      {
        type: 'template',
        altText: '洗車メニュー',
        template: {
          type: 'buttons',
          text: 'どのメニューをご利用ですか？',
          actions: MENUS.wash.map((item) => ({
            type: 'postback',
            label: item.name,
            data: `action=select_menu&menu_id=${item.id}`,
          })),
        },
      },
    ];
  } else if (menuType === 'coating') {
    messages = [
      {
        type: 'text',
        text: 'ご利用のコーティングメニューを選択してください',
      },
      {
        type: 'template',
        altText: 'コーティングメニュー',
        template: {
          type: 'buttons',
          text: 'どのコーティングをご利用ですか？',
          actions: MENUS.coating.slice(0, 3).map((item) => ({
            type: 'postback',
            label: item.name,
            data: `action=select_menu&menu_id=${item.id}`,
          })),
        },
      },
    ];
  }

  await sendLineMessage(lineUserId, messages);
}

// メニュー項目選択
async function handleMenuItemSelection(lineUserId, menuId) {
  const messages = [
    {
      type: 'text',
      text: 'お客様のお車のサイズをお選びください',
    },
    {
      type: 'template',
      altText: '車サイズ選択',
      template: {
        type: 'buttons',
        text: 'お車のサイズは？',
        actions: [
          { type: 'postback', label: 'SS/S', data: `action=select_size&menu_id=${menuId}&size=S` },
          { type: 'postback', label: 'M', data: `action=select_size&menu_id=${menuId}&size=M` },
          { type: 'postback', label: 'L', data: `action=select_size&menu_id=${menuId}&size=L` },
          { type: 'postback', label: 'XL/XXL', data: `action=select_size&menu_id=${menuId}&size=XL` },
        ],
      },
    },
  ];

  await sendLineMessage(lineUserId, messages);
}

// 車サイズ選択
async function handleCarSizeSelection(lineUserId, menuId, carSize) {
  const messages = [
    {
      type: 'text',
      text: 'ご希望の日時を選択してください（今後実装）',
    },
    {
      type: 'template',
      altText: '日時確認',
      template: {
        type: 'buttons',
        text: '予約内容を確認しますか？',
        actions: [
          { type: 'postback', label: '確認して予約', data: `action=confirm_booking&menu_id=${menuId}&size=${carSize}&datetime=2024-01-01T10:00` },
          { type: 'postback', label: 'キャンセル', data: 'action=cancel' },
        ],
      },
    },
  ];

  await sendLineMessage(lineUserId, messages);
}

// 予約確定
async function handleBookingConfirmation(lineUserId, menuId, carSize, dateTime) {
  const messages = [
    {
      type: 'text',
      text: 'ご予約ありがとうございました！\nカレンダーにご予約内容を追加いたしました。',
    },
    {
      type: 'text',
      text: '施工予定日の2日前に、リマインダーメッセージをお送りいたします。',
    },
  ];

  await sendLineMessage(lineUserId, messages);
}

// =====================
// GET /health - ヘルスチェック
// =====================

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// =====================
// リマインダータスク
// =====================

// 毎日10:00にリマインダーを送信
cron.schedule('0 10 * * *', async () => {
  console.log('リマインダータスク実行...');

  // 2日後の予約を取得
  const remindDate = new Date();
  remindDate.setDate(remindDate.getDate() + 2);
  const remindDateStr = formatDate(remindDate);

  db.all(
    `SELECT * FROM bookings WHERE DATE(start_time) = ? AND status = 'confirmed'`,
    [remindDateStr],
    async (err, rows) => {
      if (err) {
        console.error('リマインダー取得エラー:', err);
        return;
      }

      for (const booking of rows) {
        const message = {
          type: 'text',
          text: `明日のご予約をお待ちしております！\n${booking.service_type}\n${booking.start_time}`,
        };

        await sendLineMessage(booking.line_user_id, message);
      }
    }
  );
});

// =====================
// サーバー起動
// =====================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Webhook URL: http://localhost:${PORT}/webhook`);
});

module.exports = app;
