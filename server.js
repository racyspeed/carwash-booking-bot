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

function parsePatternDays(pattern) {
  const match = pattern && pattern.match(/(\d+)日/);
  return match ? parseInt(match[1], 10) : 3;
}

async function addEventToCalendar(userId, menuName, details) {
  try {
    const menu = MENUS[menuName];
    const startTime = new Date(details.dateTime);
    let endTime;

    let eventTitle = menuName;
    let eventDescription = `顧客ID: ${userId}\n`;

    if (menu.type === 'wash') {
      const durationMinutes = menu.duration[details.size];
      endTime = new Date(startTime.getTime() + durationMinutes * 60000);
      eventTitle += ` (${details.size})`;
      eventDescription += `サイズ: ${details.size}\n価格: ¥${menu.prices[details.size].toLocaleString()}`;
    } else {
      // コーティングは施工期間全体（3日/5日/7日）をブロックする
      const patternDays = parsePatternDays(details.pattern);
      endTime = new Date(startTime.getTime() + patternDays * 24 * 60 * 60 * 1000);
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

async function getEventsInRange(startDate, endDate) {
  try {
    const res = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250
    });
    return res.data.items || [];
  } catch (error) {
    console.error('Error fetching events in range:', error);
    return [];
  }
}

function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildDayStatusMap(events, days) {
  const statusMap = {};
  for (const day of days) {
    const key = dateKey(day);
    const dow = day.getDay();

    if (dow === 1 || dow === 2) {
      statusMap[key] = { status: 'closed' };
      continue;
    }

    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0);
    const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59);

    const overlapping = events.filter(ev => {
      const evStart = new Date(ev.start.dateTime || ev.start.date);
      const evEnd = new Date(ev.end.dateTime || ev.end.date);
      return evStart < dayEnd && evEnd > dayStart;
    });

    const blockedByCoating = overlapping.some(ev =>
      ev.summary && (ev.summary.includes('COAT') || ev.summary.includes('SEALANT'))
    );

    if (blockedByCoating) {
      statusMap[key] = { status: 'blocked' };
    } else if (overlapping.length === 0) {
      statusMap[key] = { status: 'open' };
    } else {
      statusMap[key] = { status: 'partial' };
    }
  }
  return statusMap;
}

async function hasConflict(startTime, endTime) {
  const events = await getEventsInRange(startTime, endTime);
  return events.some(ev => {
    const evStart = new Date(ev.start.dateTime || ev.start.date);
    const evEnd = new Date(ev.end.dateTime || ev.end.date);
    return evStart < endTime && evEnd > startTime;
  });
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

const WEEKDAY_JA = ['日', '月', '火', '水', '木', '金', '土'];
const LEAD_DAYS = 2; // 予約・キャンセルは2日前まで

function getMonthMatrix(year, monthIndex) {
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, monthIndex, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

function getDateStatus(date, today, events) {
  const dow = date.getDay();
  if (dow === 1 || dow === 2) return 'closed';

  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.round((dateOnly - todayOnly) / (24 * 60 * 60 * 1000));

  if (diffDays < 0) return 'past';
  if (diffDays < LEAD_DAYS) return 'lead'; // 2日前ルールにより予約不可

  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
  const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

  const overlapping = events.filter(ev => {
    const evStart = new Date(ev.start.dateTime || ev.start.date);
    const evEnd = new Date(ev.end.dateTime || ev.end.date);
    return evStart < dayEnd && evEnd > dayStart;
  });

  const blockedByCoating = overlapping.some(ev =>
    ev.summary && (ev.summary.includes('COAT') || ev.summary.includes('SEALANT'))
  );

  if (blockedByCoating) return 'blocked';
  if (overlapping.length === 0) return 'open';
  return 'partial';
}

const STATUS_META = {
  open: { label: '○', color: '#0B1F3A', bg: '#F7F5F0' },
  partial: { label: '△', color: '#B5850C', bg: '#FBF1DC' },
  blocked: { label: '✕', color: '#B0B0B0', bg: '#EDEDED' },
  closed: { label: '休', color: '#B0B0B0', bg: '#EDEDED' },
  lead: { label: '✕', color: '#B0B0B0', bg: '#EDEDED' },
  past: { label: '－', color: '#DADADA', bg: '#F5F5F5' }
};

function buildMonthCalendarBubble(menuName, year, monthIndex, events, today) {
  const weeks = getMonthMatrix(year, monthIndex);
  const monthLabel = `${year}年${monthIndex + 1}月`;

  const weekdayHeader = {
    type: 'box',
    layout: 'horizontal',
    contents: WEEKDAY_JA.map((w, idx) => ({
      type: 'text',
      text: w,
      size: 'xxs',
      align: 'center',
      weight: 'bold',
      color: (idx === 1 || idx === 2) ? BRAND.gray : BRAND.navy,
      flex: 1
    }))
  };

  const weekRows = weeks.map(week => ({
    type: 'box',
    layout: 'horizontal',
    margin: 'xs',
    contents: week.map(date => {
      if (!date) {
        return { type: 'box', layout: 'vertical', flex: 1, contents: [{ type: 'filler' }] };
      }
      const status = getDateStatus(date, today, events);
      const meta = STATUS_META[status];
      const clickable = status === 'open' || status === 'partial';

      const cell = {
        type: 'box',
        layout: 'vertical',
        flex: 1,
        margin: 'xs',
        paddingAll: 'xs',
        cornerRadius: 'sm',
        backgroundColor: meta.bg,
        alignItems: 'center',
        contents: [
          {
            type: 'text',
            text: `${date.getDate()}`,
            size: 'xs',
            align: 'center',
            weight: clickable ? 'bold' : 'regular',
            color: clickable ? BRAND.navy : BRAND.lightGray
          },
          { type: 'text', text: meta.label, size: 'xxs', align: 'center', color: meta.color, margin: 'xs' }
        ]
      };
      if (clickable) {
        cell.action = { type: 'message', label: `${monthIndex + 1}/${date.getDate()}`, text: `date_${dateKey(date)}` };
      }
      return cell;
    })
  }));

  return {
    type: 'bubble',
    header: buildHeader(menuName, monthLabel),
    body: {
      type: 'box',
      layout: 'vertical',
      paddingAll: 'md',
      contents: [
        { type: 'text', text: '○空きあり　△一部予約あり　✕予約不可', size: 'xxs', color: BRAND.gray, wrap: true },
        { type: 'separator', margin: 'sm' },
        weekdayHeader,
        ...weekRows
      ]
    },
    footer: buildFooter('ご予約・キャンセルは2日前まで承ります。月・火は定休日です。')
  };
}

function generateHourlySlots() {
  const slots = [];
  for (let h = 10; h <= 17; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
  }
  return slots;
}

function buildTimeSelectionFlex(menuName, dateKeyStr, dayEvents) {
  const [y, m, d] = dateKeyStr.split('-').map(Number);
  const slots = generateHourlySlots();

  const buttons = slots.map(time => {
    const [hh, mm] = time.split(':').map(Number);
    const slotStart = new Date(y, m - 1, d, hh, mm);
    const slotEnd = new Date(slotStart.getTime() + 60 * 60000);

    const taken = dayEvents.some(ev => {
      const evStart = new Date(ev.start.dateTime || ev.start.date);
      const evEnd = new Date(ev.end.dateTime || ev.end.date);
      return evStart < slotEnd && evEnd > slotStart;
    });

    const row = {
      type: 'box',
      layout: 'horizontal',
      margin: 'sm',
      paddingAll: 'sm',
      backgroundColor: taken ? '#EDEDED' : BRAND.cream,
      cornerRadius: 'md',
      contents: [
        { type: 'text', text: time, size: 'sm', color: taken ? BRAND.lightGray : BRAND.navy, flex: 3, gravity: 'center' },
        { type: 'text', text: taken ? '✕' : '○', size: 'md', weight: 'bold', color: taken ? BRAND.lightGray : BRAND.navy, flex: 1, align: 'end', gravity: 'center' }
      ]
    };
    if (!taken) {
      row.action = { type: 'message', label: time, text: `time_${time}` };
    }
    return row;
  });

  return {
    type: 'flex',
    altText: '時間を選択',
    contents: {
      type: 'bubble',
      header: buildHeader(menuName, `${m}/${d} のご希望時間`),
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: 'lg',
        contents: buttons
      },
      footer: buildFooter('ご来店予定時間の目安です')
    }
  };
}

async function replyDateSelection(replyToken, menuName) {
  const today = new Date();

  const rangeStart = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
  const rangeEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0, 23, 59, 59);
  const events = await getEventsInRange(rangeStart, rangeEnd);

  const currentMonthBubble = buildMonthCalendarBubble(menuName, today.getFullYear(), today.getMonth(), events, today);
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const nextMonthBubble = buildMonthCalendarBubble(menuName, nextMonth.getFullYear(), nextMonth.getMonth(), events, today);

  await client.replyMessage(replyToken, {
    type: 'flex',
    altText: '予約日を選択',
    contents: {
      type: 'carousel',
      contents: [currentMonthBubble, nextMonthBubble]
    }
  });
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
      userState.step = 'select_date';
      userStates.set(userId, userState);

      await replyDateSelection(event.replyToken, userState.selectedMenu);
      return;
    }

    if (userState.step === 'select_coating_pattern' && userMessage?.startsWith('pattern_')) {
      const pattern = userMessage.replace('pattern_', '');
      userState.pattern = pattern;
      userState.step = 'select_date';
      userStates.set(userId, userState);

      await replyDateSelection(event.replyToken, userState.selectedMenu);
      return;
    }

    if (userState.step === 'select_date' && userMessage?.startsWith('date_')) {
      const dateKeyStr = userMessage.replace('date_', '');
      userState.selectedDate = dateKeyStr;
      userState.step = 'select_time';
      userStates.set(userId, userState);

      const [y, m, d] = dateKeyStr.split('-').map(Number);
      const dayStart = new Date(y, m - 1, d, 0, 0, 0);
      const dayEnd = new Date(y, m - 1, d, 23, 59, 59);
      const dayEvents = await getEventsInRange(dayStart, dayEnd);

      await client.replyMessage(event.replyToken, buildTimeSelectionFlex(userState.selectedMenu, dateKeyStr, dayEvents));
      return;
    }

    if (userState.step === 'select_time' && userMessage?.startsWith('time_')) {
      const time = userMessage.replace('time_', '');
      const [hour, minute] = time.split(':').map(Number);
      const [year, month, day] = userState.selectedDate.split('-').map(Number);
      const bookingDateTime = new Date(year, month - 1, day, hour, minute);

      if (!isBusinessOpen(bookingDateTime)) {
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: '申し訳ございません。ご指定の日時は営業時間外です。\n営業時間: 10:00～18:00\n定休日: 月曜・火曜\nお手数ですが「予約」と送信してやり直してください。'
        });
        userStates.delete(userId);
        return;
      }

      const menu = MENUS[userState.selectedMenu];
      const durationMinutes = menu.type === 'wash' ? menu.duration[userState.size] : 60;
      const provisionalEnd = new Date(bookingDateTime.getTime() + durationMinutes * 60000);

      const conflict = await hasConflict(bookingDateTime, provisionalEnd);
      if (conflict) {
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: '申し訳ございません。ちょうど今、その時間は埋まってしまいました。\nお手数ですが「予約」と送信してやり直してください。'
        });
        userStates.delete(userId);
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
      confirmMessage += userState.size !== 'N/A' && userState.size ? `サイズ: ${userState.size}\n` : '';
      confirmMessage += userState.pattern !== 'N/A' && userState.pattern ? `パターン: ${userState.pattern}\n` : '';
      confirmMessage += `日時: ${bookingDateTime.toLocaleString('ja-JP')}\n`;
      confirmMessage += `\nご予約ありがとうございます！`;

      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: confirmMessage
      });

      userStates.delete(userId);
      return;
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
