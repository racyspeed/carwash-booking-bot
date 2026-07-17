const express = require('express');
const crypto = require('crypto');
const { google } = require('googleapis');
const line = require('@line/bot-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// LINE Messaging API設定
const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || 'isE4fi6ZnD5T1phzTAy5lUt2zqoH5zUHWkONDlzly+KGh5WSoYQYp0ffOth/O1iBibby+Qy3oQhioV2Adi/pvgEIWtIpoCKO+M/zHP+1dab/Gcm8s7AnAgtc0Vq3G0Ci4iGdkVmuHto71q5lQslsTAdB04t89/10/w1cDnyIlFU=',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '860416f5696fb67c18d55d6f0575f96c'
};

const client = new line.Client(lineConfig);

// Google Calendar API設定
const serviceAccount = {
  type: "service_account",
  project_id: "carwashbooking-502611",
  private_key_id: "f0b438470a7c80e0f7eecac02fab48b4752c304e",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCz1OKdXriIl70N\n/CqH7+jpE84NfhhOfTuvavZX0g3lHsUKoqNuEk1S0kCF+q/9sY6MDhfe6DU98LGh\nbtSeX357N4UscBwsdOCU70TEhbGIW88HhvqAbebeFhulZJF4KE1AM4Sx4H0DbFAk\n1UNF4n6j0ZSoxRnPVLqEBmuPZjIt3DotCht93x3skT88UqSV/h0mlv88htEHgSUG\nk2b1Y3kMwh/2DlJ3PGAF4RTBSScjvQEKyBrC8cZJZgscaN5F+7sMM8tNCFcfm4jW\nf4Lcm35k8p66EVgrencFeVSQ/7spjofkG0Ih+Ia1Rp4Jf74C8BlA+JqJx3RK0Vjl\nqDL0dGh1AgMBAAECggEACyRTABYYz9m67G1lwzNhlmNUPnDEF8TZmFZDuhA5LSt5\nYN3Py2eV495EAikUk17XaqUK5JQ1jEdn8g0YXlGjWAYKGcU+caCyM3gZpiV0aPLr\nQleiGKf2iGcNQnOXMb8pfiNTAuRaSoaA9q9B8kgEuaioEcbYgQiKX9i3/FQEIuQq\nG1lnJJi7H7iCY8y8jBDzsxUsYAD4vyhEvFejH7mGrUAsRwwambYStgDqZBTxpp2r\nPzHy9hr/N1lfj4iGohXjiVIB588dptJjO5liMWuKq+wZGlv8du3ixOfVL+Z0PQQN\n4gjFlZ5iMnAheoESXTydvrpjvhdNKHpwZ5hSIMbiZwKBgQDcwQ4QZzaFbPUP1NE5\nrp828in8Bfr6xkRS8WfQ/Otcdgj7LHXj3beF22a8qefWer3tLYnkf5nt73e3iyLK\nNaMUk0/HvIJ833k9y6Sy7dYWLwiXH3m39gt9ntwMS5buV7fXQFbJS0uHt4zR2hci\nVIhFhQBn5qi0fgBCs05RQuEDDwKBgQDQizEg/0a71st+mkgOFJM2BPW7PAJpVYGM\nSIeSmzbNQkgxusl5C6dP3meICc3Vt0GZqEWMCMaQ3clzMO7wDqyWwq8KaqmB/U1h\nxX8Pr1z3A1V9oSS8HLJ8A8BMewV+RAdeQ5SUrjO01AgLIOefmis9mVk6ZKNqKlcJ\nRR/tikwMOwKBgFtdO2jmjtYiBjsLJZzt/M9M4rt/7iQkMtrxNrp0MyUNZSIvgItS\nlEY+TAMBfwZxvnGPS2bauOaVGcNJPpjaIii932MXThpIk3FT+1JixRxhUvjY+hN9\nLbxMJ16fWlRC0b+wzTp6g0QkX4/q53A59Dxxk31tJZ2uGIWCmINhXqdZAoGBAISt\nOalzn63b3wWB5HvIzUud5jSj3ijjtJLqhg5Y34nBNKsm2g0/w8eFiLq8+g6RE5RN\nwUlxP9tkr0ixBiMGQvl7jN+Esqk33WZpvwfcmrmwjlBqGDPx0gAiZtKBpiIJ5+Ip\n/rqFBfJyv1dNLO+WpxH+oQ0MgAcIPu1v4/s9dFqHAoGAaHe5wanWu//x2Vl249HD\naO02YF8MiSyuj5TqH7KTkjRNEQexNMjWYkuwyYtplciIMyjl/PpIxXna3VpCZkuB\nq/KwUx+yP3Pa3jq8GbHrPF+dK5yeUFdEX1GR9IcYSpXOWYc6qaRC76kY/Si8YiKG\nSkeoFYcR+f29N8m1+QM4dwQ=\n-----END PRIVATE KEY-----\n",
  client_email: "carwash-bot@carwashbooking-502611.iam.gserviceaccount.com",
  client_id: "101401107788820683308",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/carwash-bot%40carwashbooking-502611.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

const CALENDAR_ID = 'ba7fe62c075319e36884d0ec52c9f7defd7d2ce5828f8b3deeddا7890cb26a91@group.calendar.google.com';

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ['https://www.googleapis.com/auth/calendar']
});

const calendar = google.calendar({ version: 'v3', auth });

const MENUS = {
  '純水手洗い洗車': {
    type: 'wash',
    prices: { S: 5500, M: 6600, L: 6600, XL: 7700 },
    duration: { S: 120, M: 150, L: 150, XL: 180 }
  },
  '徹底洗車': {
    type: 'wash',
    prices: { S: 44000, M: 55000, L: 55000, XL: 66000 },
    duration: { S: 900, M: 900, L: 900, XL: 900 }
  },
  '徹底洗車ライト': {
    type: 'wash',
    prices: { S: 27500, M: 33000, L: 33000, XL: 38500 },
    duration: { S: 420, M: 420, L: 420, XL: 420 }
  },
  'ISM COAT': {
    type: 'coating',
    basePrice: 66000,
    duration: 420,
    patterns: ['研磨なし（3日）', '軽研磨（5日）', '2周研磨（7日）']
  },
  'IZM COAT': {
    type: 'coating',
    basePrice: 110000,
    duration: 420,
    patterns: ['研磨なし（3日）', '軽研磨（5日）', '2周研磨（7日）']
  },
  'OVER COAT SEALANT': {
    type: 'coating',
    basePrice: 220000,
    duration: 420,
    patterns: ['研磨なし（3日）', '軽研磨（5日）', '2周研磨（7日）']
  }
};

const userStates = new Map();

function isBusinessOpen(date) {
  const day = date.getDay();
  const hour = date.getHours();
  if (day === 1 || day === 2) return false;
  if (hour < 10 || hour >= 18) return false;
  return true;
}

function getNextAvailableSlot() {
  const now = new Date();
  let slot = new Date(now);
  slot.setMinutes(Math.ceil(slot.getMinutes() / 15) * 15);
  while (!isBusinessOpen(slot)) {
    slot.setHours(slot.getHours() + 1);
    if (slot.getHours() >= 18) {
      slot.setHours(10);
      slot.setDate(slot.getDate() + 1);
    }
  }
  return slot;
}

async function isCoatingInProgress(startDate, endDate) {
  try {
    const events = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      timeMax: startDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });
    const coatingEvent = events.data.items?.find(event =>
      event.summary?.includes('COAT') || event.summary?.includes('SEALANT')
    );
    return !!coatingEvent;
  } catch (error) {
    console.error('Error checking coating progress:', error);
    return false;
  }
}

async function addEventToCalendar(userId, menuName, details) {
  try {
    const menu = MENUS[menuName];
    const startTime = new Date(details.dateTime);
    const endTime = new Date(startTime.getTime() + menu.duration[details.size] * 60000);

    let eventTitle = menuName;
    let eventDescription = `顧客ID: ${userId}\n`;

    if (menu.type === 'wash') {
      eventTitle += ` (${details.size})`;
      eventDescription += `サイズ: ${details.size}\n価格: ¥${menu.prices[details.size].toLocaleString()}`;
    } else {
      eventDescription += `パターン: ${details.pattern}\n価格: ¥${menu.basePrice.toLocaleString()}`;
    }

    const event = {
      summary: eventTitle,
      description: eventDescription,
      start: { dateTime: startTime.toISOString(), timeZone: 'Asia/Tokyo' },
      end: { dateTime: endTime.toISOString(), timeZone: 'Asia/Tokyo' },
      reminders: { useDefault: true }
    };

    const result = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      resource: event
    });

    return result.data;
  } catch (error) {
    console.error('Error adding event to calendar:', error);
    throw error;
  }
}

async function handleUserMessage(event) {
  const userId = event.source.userId;
  const userMessage = event.message.text?.toLowerCase();
  let userState = userStates.get(userId) || {};

  try {
    if (!userState.step) {
      if (userMessage === '予約' || userMessage === 'メニュー') {
        const buttons = Object.keys(MENUS).map((name) => ({
          type: 'button',
          action: { type: 'message', label: name, text: name }
        }));

        await client.replyMessage(event.replyToken, {
          type: 'flex',
          altText: '洗車メニュー選択',
          contents: {
            type: 'bubble',
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                { type: 'text', text: '洗車メニューを選択してください', weight: 'bold', size: 'lg' },
                { type: 'box', layout: 'vertical', margin: 'md', spacing: 'sm', contents: buttons }
              ]
            }
          }
        });
        return;
      }
    }

    if (userMessage && Object.keys(MENUS).includes(userMessage)) {
      userState.selectedMenu = userMessage;
      const menu = MENUS[userMessage];

      if (menu.type === 'wash') {
        userState.step = 'select_size';
        const sizeButtons = Object.keys(menu.prices).map(size => ({
          type: 'button',
          action: { type: 'message', label: `${size} - ¥${menu.prices[size].toLocaleString()}`, text: `size_${size}` }
        }));

        await client.replyMessage(event.replyToken, {
          type: 'flex',
          altText: 'サイズ選択',
          contents: {
            type: 'bubble',
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                { type: 'text', text: `${userMessage}`, weight: 'bold', size: 'lg' },
                { type: 'text', text: 'サイズを選択してください', size: 'sm', color: '#aaaaaa', margin: 'sm' },
                { type: 'box', layout: 'vertical', margin: 'md', spacing: 'sm', contents: sizeButtons }
              ]
            }
          }
        });
      } else {
        userState.step = 'select_coating_pattern';
        const patternButtons = menu.patterns.map(pattern => ({
          type: 'button',
          action: { type: 'message', label: pattern, text: `pattern_${pattern}` }
        }));

        await client.replyMessage(event.replyToken, {
          type: 'flex',
          altText: 'コーティングパターン選択',
          contents: {
            type: 'bubble',
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                { type: 'text', text: `${userMessage}`, weight: 'bold', size: 'lg' },
                { type: 'text', text: `価格: ¥${menu.basePrice.toLocaleString()}`, size: 'sm', margin: 'sm' },
                { type: 'text', text: '施工パターンを選択してください', size: 'sm', color: '#aaaaaa', margin: 'sm' },
                { type: 'box', layout: 'vertical', margin: 'md', spacing: 'sm', contents: patternButtons }
              ]
            }
          }
        });
      }

      userStates.set(userId, userState);
      return;
    }

    if (userState.step === 'select_size' && userMessage?.startsWith('size_')) {
      const size = userMessage.replace('size_', '').toUpperCase();
      userState.size = size;
      userState.step = 'select_datetime';

      const nextSlot = getNextAvailableSlot();
      const dateStr = nextSlot.toLocaleDateString('ja-JP');
      const timeStr = nextSlot.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: `サイズ: ${size}を選択しました。\n次のご都合の良い日時をお知らせください。\n(例: 2024年7月20日 14:30)\n\n次の利用可能枠: ${dateStr} ${timeStr}`
      });

      userStates.set(userId, userState);
      return;
    }

    if (userState.step === 'select_coating_pattern' && userMessage?.startsWith('pattern_')) {
      const pattern = userMessage.replace('pattern_', '');
      userState.pattern = pattern;
      userState.step = 'select_datetime';

      const nextSlot = getNextAvailableSlot();
      const dateStr = nextSlot.toLocaleDateString('ja-JP');
      const timeStr = nextSlot.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: `パターン: ${pattern}を選択しました。\n次のご都合の良い日時をお知らせください。\n(例: 2024年7月20日 09:00)\n\n次の利用可能枠: ${dateStr} ${timeStr}`
      });

      userStates.set(userId, userState);
      return;
    }

    if (userState.step === 'select_datetime' && userMessage) {
      const dateTimeRegex = /(\d{4})年(\d{1,2})月(\d{1,2})日\s*(\d{1,2}):(\d{2})/;
      const match = userMessage.match(dateTimeRegex);

      if (!match) {
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: '日時の形式が正しくありません。\n例: 2024年7月20日 14:30'
        });
        return;
      }

      const [, year, month, day, hour, minute] = match;
      const bookingDateTime = new Date(year, parseInt(month) - 1, day, hour, minute);

      if (!isBusinessOpen(bookingDateTime)) {
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: '申し訳ございません。ご指定の日時は営業時間外です。\n営業時間: 10:00～18:00\n定休日: 月曜・火曜\n別の日時でお願いいたします。'
        });
        return;
      }

      const menu = MENUS[userState.selectedMenu];
      if (menu.type === 'coating' && await isCoatingInProgress(bookingDateTime, bookingDateTime)) {
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: 'ご指定の日時はコーティング作業中です。別の日時でお願いいたします。'
        });
        return;
      }

      const bookingDetails = {
        dateTime: bookingDateTime,
        size: userState.size || 'N/A',
        pattern: userState.pattern || 'N/A'
      };

      await addEventToCalendar(userId, userState.selectedMenu, bookingDetails);

      let confirmMessage = `✅ 予約確定\n\n`;
      confirmMessage += `メニュー: ${userState.selectedMenu}\n`;
      confirmMessage += userState.size ? `サイズ: ${userState.size}\n` : '';
      confirmMessage += userState.pattern ? `パターン: ${userState.pattern}\n` : '';
      confirmMessage += `日時: ${bookingDateTime.toLocaleString('ja-JP')}\n`;
      confirmMessage += `\nご予約ありがとうございます！`;

      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: confirmMessage
      });

      userStates.delete(userId);
    }
  } catch (error) {
    console.error('Error handling message:', error);
    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: 'エラーが発生しました。もう一度お試しください。'
    });
  }
}

function verifySignature(rawBody, signature) {
  const hmac = crypto.createHmac('sha256', lineConfig.channelSecret);
  hmac.update(rawBody);
  const computed = hmac.digest('base64');
  return signature === computed;
}

// 重要: rawBodyを保持するため express.json() の verify オプションを使用
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.post('/webhook', async (req, res) => {
  const signature = req.get('x-line-signature');
  console.log('受信署名:', signature);
  console.log('計算署名:', crypto.createHmac('sha256', lineConfig.channelSecret).update(req.rawBody || Buffer.from('')).digest('base64'));
  console.log('rawBody存在:', !!req.rawBody);

  if (!signature || !verifySignature(req.rawBody, signature)) {
    console.error('署名検証に失敗しました');
    return res.status(403).json({ error: 'Invalid signature' });
  }

  try {
    const events = req.body.events;

    res.status(200).json({ success: true });

    await Promise.all(events.map(async (event) => {
      if (event.type === 'message' && event.message.type === 'text') {
        await handleUserMessage(event);
      }
    }));
  } catch (error) {
    console.error('Webhook error:', error);
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'Running', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 LINE洗車予約ボット起動`);
  console.log(`📍 Webhook: https://web-production-7fc6d.up.railway.app/webhook`);
  console.log(`⏰ ポート: ${PORT}`);
  console.log(`📅 カレンダー: ${CALENDAR_ID}`);
});
