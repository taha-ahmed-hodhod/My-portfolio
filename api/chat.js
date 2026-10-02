import { handleChatBody } from '../server/chat-api.mjs';

export default async function chat(req, res) {
  const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const ip = String(rawIp).split(',')[0].trim();
  const result = await handleChatBody(req.method, req.body, ip);
  return res.status(result.status).json(result.payload);
}
