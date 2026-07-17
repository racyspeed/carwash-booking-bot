const express = require('express');
const crypto = require('crypto');
const { google } = require('googleapis');
const line = require('@line/bot-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// LINE Messaging API設定
const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || 'isE4fI6ZnD5T1phzTAy5lUtzzqoH5zUHWkONDi2Iy+KGh5WSoYQYp0ffOth/O1iBibby+Oy3oQhioV2AdI/pvgEIWtIpoCKO+M/zHP+ldab/Gcm8s7AnAgtc0Yq3G0Ci4iGdkVmuHto71q5lQsIsTAdB04t89/1O/w1cDnyilFU=',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '860416f5696fb67c18d55d6f057f9f6c'
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

// ★修正済み: 正しいカレンダーID
const CALENDAR_ID = 'ba77e62c075319e36884d0ec52c9f7defd7d2ce5828f8b3deedda7890cb26a91@group.calendar.google.com';

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ['https://www.googleapis.com/auth/calendar']
});

const calendar = google.calendar({ version: 'v3', auth });

// ブランドカラー
const BRAND = {
  navy: '#0B1F3A',
  gold: '#C9A227',
  goldDark: '#8A6D1D',
  cream: '#F7F5F0',
  gray: '#8C8C8C',
  lightGray: '#B0B0B0'
};

const MENUS = {
  '純水手洗い洗車': {
    type: 'wash',
    prices: { SS: 5500, S: 5500, M: 6600, L: 6600, XL: 7700, XXL: 7700 },
    duration: { SS: 120, S: 120, M: 150, L: 150, XL: 180, XXL: 180 }
  },
  '徹底洗車': {
    type: 'wash',
    prices: { SS: 44000, S: 44000, M: 55000, L: 55000, XL: 66000, XXL: 66000 },
    duration: { SS: 900, S: 900, M: 900, L: 900, XL: 900, XXL: 900 }
  },
  '徹底洗車ライト': {
    type: 'wash',
    prices: { SS: 27500, S: 27500, M: 33000, L: 33000, XL: 38500, XXL: 38500 },
    duration: { SS: 420, S: 420, M: 420, L: 420, XL: 420, XXL: 420 }
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

async function isCoatingInProgress(startDate) {
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
    const durationMinutes = menu.type === 'wash' ? menu.duration[details.size] : menu.duration;
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

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

// ==== Flexメッセージ生成（デザイン改善版） ====

function buildHeader(subtitle, title) {
  return {
    type: 'box',
    layout: 'vertical',
    backgroundColor: BRAND.navy,
    paddingAll: 'lg',
    contents: [
      { type: 'text', text: "RACY'SPEED", color: BRAND.gold, weight: 'bold', size: 'sm' },
      { type: 'text', text: title, color: '#FFFFFF', weight: 'bold', size: 'xl', margin: 'sm' },
      ...(subtitle ? [{ type: 'text', text: subtitle, color: '#C9CEDC', size: 'xs', margin: 'sm' }] : [])
    ]
  };
}

function buildFooter(text) {
  return {
    type: 'box',
    layout: 'vertical',
    paddingAll: 'md',
    contents: [
      { type: 'text', text: text, size: 'xxs', color: BRAND.lightGray, align: 'center', wrap: true }
    ]
  };
}

function buildSelectableCard(label, subtitle, actionText, accentColor) {
  return {
    type: 'box',
    layout: 'vertical',
    margin: 'md',
    paddingAll: 'md',
    backgroundColor: BRAND.cream,
    cornerRadius: 'md',
    action: { type: 'message', label: label, text: actionText },
    contents: [
      { type: 'text', text: label, weight: 'bold', size: 'md', color: accentColor, wrap: true },
      { type: 'text', text: subtitle, size: 'xs', color: BRAND.gray, margin: 'xs', wrap: true }
    ]
  };
}

function buildCategoryFlex() {
  return {
    type: 'flex',
    altText: '洗車orコーティングを選択',
    contents: {
      type: 'bubble',
      header: buildHeader('まずはメニューの種類をお選びください', 'ご予約メニュー'),
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: 'lg',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            paddingAll: 'lg',
            backgroundColor: BRAND.navy,
            cornerRadius: 'md',
            action: { type: 'message', label: '洗車', text: 'category_wash' },
            contents: [
              { type: 'text', text: '🚗  洗車', weight: 'bold', size: 'lg', color: '#FFFFFF' },
              { type: 'text', text: '純水手洗い／徹底洗車／徹底洗車ライト', size: 'xs', color: '#C9CEDC', margin: 'xs', wrap: true }
            ]
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            paddingAll: 'lg',
            backgroundColor: BRAND.goldDark,
            cornerRadius: 'md',
            action: { type: 'message', label: 'コーティング', text: 'category_coating' },
            contents: [
              { type: 'text', text: '✨  コーティング', weight: 'bold', size: 'lg', color: '#FFFFFF' },
              { type: 'text', text: 'ISM COAT／IZM COAT／OVER COAT SEALANT', size: 'xs', color: '#F3E7C6', margin: 'xs', wrap: true }
            ]
          }
        ]
      },
      footer: buildFooter('営業時間 10:00-18:00（月・火定休）')
    }
  };
}

function buildWashMenuFlex() {
  const washNames = Object.keys(MENUS).filter(n => MENUS[n].type === 'wash');
  return {
    type: 'flex',
    altText: '洗車メニュー選択',
    contents: {
      type: 'bubble',
      header: buildHeader('ご希望の洗車コースをお選びください', '洗車メニュー'),
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: 'lg',
        contents: washNames.map(name =>
          buildSelectableCard(name, `SS/S ¥${MENUS[name].prices.S.toLocaleString()}〜 XXL ¥${MENUS[name].prices.XXL.toLocaleString()}`, name, BRAND.navy)
        )
      },
      footer: buildFooter('営業時間 10:00-18:00（月・火定休）')
    }
  };
}

function buildCoatingMenuFlex() {
  const coatingNames = Object.keys(MENUS).filter(n => MENUS[n].type === 'coating');
  return {
    type: 'flex',
    altText: 'コーティングメニュー選択',
    contents: {
      type: 'bubble',
      header: buildHeader('ご希望のコーティングをお選びください', 'コーティングメニュー'),
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: 'lg',
        contents: coatingNames.map(name =>
          buildSelectableCard(name, `¥${MENUS[name].basePrice.toLocaleString()}〜`, name, BRAND.goldDark)
        )
      },
      footer: buildFooter('コーティング期間中は他のご予約をお受けできません')
    }
  };
}

function buildSizeFlex(menuName, menu) {
  const sizeLabels = {
    SS: '軽自動車',
    S: 'コンパクトカー',
    M: 'セダン・ミニバン',
    L: 'ミニバン・SUV',
    XL: '大型SUV・ミニバン',
    XXL: '大型ミニバン・特大車'
  };
  const sizeButtons = Object.keys(menu.prices).map(size => ({
    type: 'box',
    layout: 'horizontal',
    margin: 'md',
    paddingAll: 'md',
    backgroundColor: BRAND.cream,
    cornerRadius: 'md',
    action: { type: 'message', label: size, text: `size_${size}` },
    contents: [
      {
        type: 'box',
        layout: 'vertical',
        flex: 1,
        contents: [
          { type: 'text', text: `サイズ ${size}`, weight: 'bold', size: 'sm', color: BRAND.navy },
          { type: 'text', text: sizeLabels[size], size: 'xxs', color: BRAND.gray, margin: 'xs' }
        ]
      },
      {
        type: 'text',
        text: `¥${menu.prices[size].toLocaleString()}`,
        weight: 'bold',
        size: 'sm',
        color: BRAND.goldDark,
        align: 'end',
        gravity: 'center'
      }
    ]
  }));

  return {
    type: 'flex',
    altText: 'サイズ選択',
    contents: {
      type: 'bubble',
      header: buildHeader(null, menuName),
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: 'lg',
        contents: [
          { type: 'text', text: '車のサイズをお選びください', weight: 'bold', size: 'md', color: BRAND.navy },
          ...sizeButtons
        ]
      },
      footer: buildFooter('サイズがご不明な場合はお気軽にお問い合わせください')
    }
  };
}

function buildPatternFlex(menuName, menu) {
  const patternButtons = menu.patterns.map(pattern => ({
    type: 'box',
    layout: 'vertical',
    margin: 'md',
    paddingAll: 'md',
    backgroundColor: BRAND.cream,
    cornerRadius: 'md',
    action: { type: 'message', label: pattern, text: `pattern_${pattern}` },
    contents: [
      { type: 'text', text: pattern, weight: 'bold', size: 'sm', color: BRAND.goldDark }
    ]
  }));

  return {
    type: 'flex',
    altText: 'コーティングパターン選択',
    contents: {
      type: 'bubble',
      header: buildHeader(`¥${menu.basePrice.toLocaleString()}〜`, menuName),
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: 'lg',
        contents: [
          { type: 'text', text: '施工パターンをお選びください', weight: 'bold', size: 'md', color: BRAND.navy },
          ...patternButtons
        ]
      },
      footer: buildFooter('コーティング期間中は他のご予約をお受けできません')
    }
  };
}

// ==== メッセージハンドラ ====

async function handleUserMessage(event) {
  const userId = event.source.userId;
  const userMessage = event.message.text?.toLowerCase();
  let userState = userStates.get(userId) || {};

  try {
    if (!userState.step) {
      if (userMessage === '予約' || userMessage === 'メニュー') {
        await client.replyMessage(event.replyToken, buildCategoryFlex());
        return;
      }
    }

    if (userMessage === 'category_wash') {
      await client.replyMessage(event.replyToken, buildWashMenuFlex());
      return;
    }

    if (userMessage === 'category_coating') {
      await client.replyMessage(event.replyToken, buildCoatingMenuFlex());
      return;
    }

    if (userMessage && Object.keys(MENUS).includes(userMessage)) {
      userState.selectedMenu = userMessage;
      const menu = MENUS[userMessage];

      if (menu.type === 'wash') {
        userState.step = 'select_size';
        await client.replyMessage(event.replyToken, buildSizeFlex(userMessage, menu));
      } else {
        userState.step = 'select_coating_pattern';
        await client.replyMessage(event.replyToken, buildPatternFlex(userMessage, menu));
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
      if (menu.type === 'coating' && await isCoatingInProgress(bookingDateTime)) {
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

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.post('/webhook', async (req, res) => {
  const signature = req.get('x-line-signature');

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
