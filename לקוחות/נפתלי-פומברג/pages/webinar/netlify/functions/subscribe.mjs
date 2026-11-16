// פונקציה בצד השרת: מקבלת נרשם מהטופס ומוסיפה אותו לרשימה בסמוב.
// לפי התיעוד של סמוב (rest.smoove.io, נבדק ב־2026-11-15):
//   POST https://rest.smoove.io/v1/Contacts?updateIfExists=true
//   Authorization: Bearer <API key>
//   גוף: firstName, lastName, email, cellPhone, lists_ToSubscribe, canReceiveEmails, canReceiveSmsMessages, canReceiveWhatsappMessages, campaignSource
// משתני סביבה בנטליפיי:
//   SMOOVE_API_KEY  מפתח הגישה מחשבון סמוב (חובה, לא נשמר בקוד)
//   SMOOVE_LIST_ID  מזהה הרשימה (ברירת מחדל: 1186797)

const SMOOVE_URL = 'https://rest.smoove.io/v1/Contacts?updateIfExists=true';

// הדף יכול לשבת גם באתר הוורדפרס, ולשלוח לכאן מכתובת אחרת
const ALLOWED_ORIGINS = ['https://www.naftalihafakot.co.il', 'https://naftalihafakot.co.il'];
let corsHeaders = {};

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'content-type': 'application/json; charset=utf-8', ...corsHeaders },
  body: JSON.stringify(body)
});

function normPhone(v) {
  let d = String(v || '').replace(/[^\d+]/g, '');
  if (d.startsWith('+972')) d = '0' + d.slice(4);
  else if (d.startsWith('972')) d = '0' + d.slice(3);
  return d.replace(/\D/g, '');
}

export const handler = async (event) => {
  const origin = (event.headers && (event.headers.origin || event.headers.Origin)) || '';
  corsHeaders = ALLOWED_ORIGINS.includes(origin)
    ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' }
    : {};
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'POST') return json(405, { ok: false });

  let data;
  try { data = JSON.parse(event.body || ''); } catch { return json(400, { ok: false, error: 'bad_json' }); }

  // שדה מלכודת: אם מולא, זה בוט. עונים "הצלחה" ולא שומרים כלום.
  if (data.company) return json(200, { ok: true });

  const name = String(data.name || '').trim().slice(0, 80);
  const email = String(data.email || '').trim().slice(0, 120);
  const phone = normPhone(data.phone);
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !/^05\d{8}$/.test(phone) || data.consent !== true) {
    return json(400, { ok: false, error: 'invalid' });
  }

  const apiKey = process.env.SMOOVE_API_KEY;
  if (!apiKey) { console.error('SMOOVE_API_KEY is not set'); return json(500, { ok: false, error: 'config' }); }
  const listId = parseInt(process.env.SMOOVE_LIST_ID || '1186797', 10);

  const [firstName, ...rest] = name.split(/\s+/);
  const source = [data.utm_source, data.utm_medium, data.utm_campaign].filter(Boolean).join(' / ') || 'webinar-27-12';

  const contact = {
    firstName,
    lastName: rest.join(' '),
    email,
    cellPhone: phone,
    lists_ToSubscribe: [listId],
    canReceiveEmails: true,
    canReceiveSmsMessages: true,
    canReceiveWhatsappMessages: true,
    campaignSource: source.slice(0, 100)
  };

  try {
    const r = await fetch(SMOOVE_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(contact)
    });
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      console.error('Smoove error', r.status, text.slice(0, 300));
      return json(502, { ok: false, error: 'smoove', status: r.status });
    }
    return json(200, { ok: true });
  } catch (e) {
    console.error('Smoove request failed', e && e.message);
    return json(502, { ok: false, error: 'network' });
  }
};
