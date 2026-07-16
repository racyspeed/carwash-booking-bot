const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(express.json());

// =====================
// 定数設定
// =====================

const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;

const PUSH_API_URL = 'https://api.line.biz/v2/bot/message/push';

// =====================
// メニュー定義
// =====================

const MENUS = {
  wash: [
    {
      id: 'pure_wash',
      name: '純水手洗い洗車',
      prices: { S: 5500, M: 6600, L: 6600, XL: 7700 },
      times: { S: 2, M: 2.5, L: 2.5, XL: 3 },
    },
    {
      id: 'thorough_wash',
      name: '徹底洗車',
      prices: { S: 44000, M: 55000, L: 55000, XL: 66000 },
      times: { S: 15, M: 15, L: 15, XL: 15 },
    },
    {
      id: 'thorough_wash_light',
      name: '徹底洗車ライト',
      prices: { S: 27500, M: 33000, L: 33000, XL: 38500 },
      times: { S: 7, M: 7, L: 7, XL: 7 },
    },
  ],
  coating: [
    { id: 'ism_coat_none', name: 'ISM COAT(研磨なし)', duration: 3 },
    { id: 'ism_coat_light', name: 'ISM COAT(軽研磨)', duration: 5 },
    { id: 'ism_coat_heavy', name: 'ISM COAT(2周研磨)', duration: 7 },
  ],
};

// ユーザーセッション管理
const userSessions = {};

// =====================
// ユーティリティ関数
// =====================

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
    console.log(`Message sent to ${userId}`);
  } catch (error) {
    console.error('LINE message error:', error.response?.data || error.message);
  }
}

function validateSignature(body, signature) {
  const hash = crypto.createHmac('sha256', CHANNEL_SECRET).update(body).digest('base64');
  return hash === signature;
}

// =====================
// メッセージハンドラー
// =====================

async function handleText(userId, text) {
  if (text === '予約') {
    userSessions[userId] = { step: 'menu_type' };
    
    await sendLineMessage(userId, {
      type: 'template',
      altText: 'メニュー選択',
      template: {
        type: 'buttons',
        text: 'ご利用メニューを選択してください',
        actions: [
          { type: 'postback', label: '洗車', data: 'action=menu_type&type=wash' },
          { type: 'postback', label: 'コーティング', data: 'action=menu_type&type=coating' },
        ],
      },
    });
  } else {
    await sendLineMessage(userId, {
      type: 'text',
      text: '「予約」と入力すると予約を開始できます。',
    });
  }
}

async function handlePostback(userId, postbackData) {
  const data = new URLSearchParams(postbackData);
  const action = data.get('action');

  if (action === 'menu_type') {
    const type = data.get('type');
    userSessions[userId] = { step: 'menu_select', type };
    
    const items = MENUS[type];
    await sendLineMessage(userId, {
      type: 'template',
      altText: 'メニュー選択',
      template: {
        type: 'buttons',
        text: 'ご利用のメニューを選択してください',
        actions: items.map((item) => ({
          type: 'postback',
          label: item.name,
          data: `action=menu_select&menu_id=${item.id}`,
        })),
      },
    });
  }

  if (action === 'menu_select') {
    const menuId = data.get('menu_id');
    userSessions[userId] = { ...userSessions[userId], step: 'size_select', menuId };
    
    await sendLineMessage(userId, {
      type: 'template',
      altText: '車サイズ選択',
      template: {
        type: 'buttons',
        text: 'お車のサイズをお選びください',
        actions: [
          { type: 'postback', label: 'S', data: `action=size_select&size=S` },
          { type: 'postback', label: 'M', data: `action=size_select&size=M` },
          { type: 'postback', label: 'L', data: `action=size_select&size=L` },
          { type: 'postback', label: 'XL', data: `action=size_select&size=XL` },
        ],
      },
    });
  }

  if (action === 'size_select') {
    const size = data.get('size');
    userSessions[userId] = { ...userSessions[userId], step: 'confirm', size };
    
    const menu = MENUS[userSessions[userId].type]?.find(m => m.id === userSessions[userId].menuId);
    const price = menu?.prices?.[size] || 0;
    const time = menu?.times?.[size] || menu?.duration || 0;
    
    await sendLineMessage(userId, {
      type: 'template',
      altText: '予約確認',
      template: {
        type: 'buttons',
        text: `ご予約内容\nメニュー: ${menu?.name}\nサイズ: ${size}\n料金: ¥${price}\n所要時間: ${time}時間\n\nこちらでよろしいですか？`,
        actions: [
          { type: 'postback', label: '予約する', data: 'action=confirm_booking' },
          { type: 'postback', label: 'キャンセル', data: 'action=cancel' },
        ],
      },
    });
  }

  if (action === 'confirm_booking') {
    await sendLineMessage(userId, {
      type: 'text',
      text: 'ご予約ありがとうございました！\n施工予定日の2日前にリマインダーをお送りいたします。',
    });
    
    delete userSessions[userId];
  }

  if (action === 'cancel') {
    await sendLineMessage(userId, {
      type: 'text',
      text: 'キャンセルしました。ご利用ありがとうございました。',
    });
    
    delete userSessions[userId];
  }
}

// =====================
// Webhook ハンドラー
// =====================

app.post('/webhook', async (req, res) => {
  const signature = req.get('x-line-signature');
  const body = JSON.stringify(req.body);

  if (!validateSignature(body, signature)) {
    return res.status(403).send('Forbidden');
  }

  try {
    const events = req.body.events;

    for (const event of events) {
      const userId = event.source.userId;

      if (event.type === 'message' && event.message.type === 'text') {
        await handleText(userId, event.message.text);
      }

      if (event.type === 'postback') {
        await handlePostback(userId, event.postback.data);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

// =====================
// ヘルスチェック
// =====================

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// =====================
// サーバー起動
// =====================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🔗 Webhook URL: https://web-production-7fc6d.up.railway.app/webhook`);
});

module.exports = app;
