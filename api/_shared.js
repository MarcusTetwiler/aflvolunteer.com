// Shared helpers for the serverless functions.
// Files under api/ beginning with an underscore are not routed as endpoints.

import crypto from 'node:crypto';

export function getRedisConfig() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

/**
 * Run an array of Redis commands as a single pipeline request.
 * Returns the parsed result array, or null if storage isn't configured.
 */
export async function redisPipeline(commands) {
  const cfg = getRedisConfig();
  if (!cfg) return null;

  const res = await fetch(`${cfg.url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  });

  if (!res.ok) {
    throw new Error(`Redis pipeline failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

/**
 * Deterministic per-email unsubscribe token.
 *
 * Prefers a dedicated UNSUBSCRIBE_SECRET. Falls back to deriving one from the
 * Redis token so unsubscribe links work without extra configuration — but set
 * the dedicated secret in production, because rotating your Redis credentials
 * would otherwise invalidate every unsubscribe link already sitting in
 * someone's inbox.
 */
export function unsubscribeToken(email) {
  const secret =
    process.env.UNSUBSCRIBE_SECRET ||
    process.env.KV_REST_API_TOKEN ||
    'insecure-development-fallback';

  return crypto
    .createHmac('sha256', secret)
    .update(String(email).trim().toLowerCase())
    .digest('hex')
    .slice(0, 32);
}

export function isValidEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Best-effort client IP, for the consent record CAN-SPAM expects you to keep. */
export function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return req.headers['x-real-ip'] || null;
}

export function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[c]);
}

/**
 * Fixed-window rate limit, backed by Redis INCR + EXPIRE.
 *
 * Returns { allowed, count, limit }. Fails OPEN when storage is unavailable:
 * a Redis outage should not take the signup form down with it. That is the right
 * trade for a book site — the downside of a missed limit is spam, not data loss.
 *
 * Both write endpoints were previously unauthenticated with no limit at all, so
 * one bot could fill the list.
 */
export async function rateLimit(key, limit, windowSeconds) {
  try {
    const res = await redisPipeline([
      ['INCR', key],
      ['EXPIRE', key, String(windowSeconds), 'NX'],
    ]);
    if (!res) return { allowed: true, count: 0, limit, degraded: true };
    const count = Number(res[0]?.result ?? 0);
    return { allowed: count <= limit, count, limit };
  } catch (err) {
    console.error('rateLimit error (failing open):', err);
    return { allowed: true, count: 0, limit, degraded: true };
  }
}

/** Coarse per-IP bucket key. */
export function ipBucket(prefix, req) {
  const ip = clientIp(req) || 'unknown';
  return `ratelimit:${prefix}:${ip}`;
}

/**
 * True when a honeypot field was filled. Real people never see it; bots that
 * fill every input do.
 */
export function trippedHoneypot(body, field = 'website') {
  const v = body?.[field];
  return typeof v === 'string' && v.trim().length > 0;
}
