import { handleChatBody } from '../server/chat-api.mjs';

const ALLOWED_ORIGIN_PATTERNS = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https:\/\/[\w-]+\.vercel\.app$/,
];

function isOriginAllowed(req) {
  const origin = req.headers['origin'] || '';
  if (!origin) {
    // If no origin header, check referer header
    const referer = req.headers['referer'] || '';
    if (!referer) return true; // Direct/same-origin navigation without origin
    try {
      const parsed = new URL(referer).origin;
      return ALLOWED_ORIGIN_PATTERNS.some((p) => p.test(parsed));
    } catch {
      return false;
    }
  }
  return ALLOWED_ORIGIN_PATTERNS.some((p) => p.test(origin));
}

export default async function chat(req, res) {
  if (process.env.NODE_ENV === 'production' && !isOriginAllowed(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const ip = String(rawIp).split(',')[0].trim();
  const result = await handleChatBody(req.method, req.body, ip);
  return res.status(result.status).json(result.payload);
}
