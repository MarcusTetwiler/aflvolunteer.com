// Vercel serverless function: POST /api/volunteer
//
// Captures a signup, stores it in Upstash Redis, and — when an ESP is
// configured — forwards it so the list is actually mailable.
//
// Storage layout:
//   volunteer:<email>          hash, one per person (idempotent re-signups)
//   volunteers:all             chronological list of every signup
//   volunteers:<list>          per-funnel list, e.g. volunteers:sample-chapters
//   volunteers:unsubscribed    set of emails that have opted out
//
// Two things worth knowing:
//   1. Storage failures are soft. A config problem must never cost a reader
//      the sample they were promised.
//   2. An unsubscribed address is never silently resurrected by a later
//      signup. Re-subscribing has to be deliberate.

import {
  redisPipeline,
  unsubscribeToken,
  isValidEmail,
  clientIp,
  rateLimit,
  ipBucket,
  trippedHoneypot,
} from './_shared.js';

/**
 * Optional Beehiiv sync. No-ops unless both env vars are set, so the site
 * behaves identically before and after you connect an ESP.
 */
async function syncToBeehiiv(record) {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const pubId = process.env.BEEHIIV_PUBLICATION_ID;
  if (!apiKey || !pubId) return { synced: false, reason: 'not-configured' };

  try {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${pubId}/subscriptions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: record.email,
          reactivate_existing: false,
          send_welcome_email: true,
          utm_source: 'afl-site',
          ...(record.name
            ? { custom_fields: [{ name: 'Name', value: record.name }] }
            : {}),
        }),
      }
    );

    if (!res.ok) {
      console.error('Beehiiv sync failed:', res.status, await res.text());
      return { synced: false, reason: `http-${res.status}` };
    }
    return { synced: true };
  } catch (err) {
    console.error('Beehiiv sync error:', err);
    return { synced: false, reason: 'exception' };
  }
}

/** Allow-list the attribution keys and cap their length; never trust the client. */
function sanitizeAttribution(input) {
  if (!input || typeof input !== 'object') return '';
  const allowed = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content',
                   'utm_term', 'referrer', 'landing', 'firstSeen'];
  const out = {};
  for (const k of allowed) {
    const v = input[k];
    if (typeof v === 'string' && v.trim()) out[k] = v.trim().slice(0, 120);
  }
  return Object.keys(out).length ? JSON.stringify(out).slice(0, 800) : '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, list, attribution } = req.body || {};

  // Silently accept and discard bot submissions: a 200 gives a scraper no signal
  // to retry against, where a 400 tells it exactly what to fix.
  if (trippedHoneypot(req.body)) {
    return res.status(200).json({ ok: true, persisted: false });
  }

  const limit = await rateLimit(ipBucket('signup', req), 12, 3600);
  if (!limit.allowed) {
    return res.status(429).json({ error: 'Too many signups from this address. Try again later.' });
  }

  // Name is optional as of the one-field gate. Older records that already carry
  // a name are untouched; new signups simply omit it.
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  const record = {
    name: typeof name === 'string' && name.trim() ? name.trim() : '',
    email: cleanEmail,
    source: 'afl-site',
    list: typeof list === 'string' && list.trim() ? list.trim() : 'general',
    createdAt: new Date().toISOString(),
    // Consent record. CAN-SPAM doesn't require opt-in, but if a recipient ever
    // disputes a send, being able to show when and from where they signed up is
    // the difference between a complaint and a problem.
    consentIp: clientIp(req),
    consentUserAgent: (req.headers['user-agent'] || '').slice(0, 300),
    // First-touch attribution from the client, if any. Campaign tags and a
    // referrer hostname only — no cross-site identifiers.
    attribution: sanitizeAttribution(attribution),
  };

  const token = unsubscribeToken(cleanEmail);

  try {
    // Don't resurrect someone who already opted out.
    const check = await redisPipeline([
      ['SISMEMBER', 'volunteers:unsubscribed', cleanEmail],
    ]);

    if (!check) {
      console.error('Storage not configured: KV_REST_API_URL / KV_REST_API_TOKEN');
      return res.status(200).json({ ok: true, persisted: false });
    }

    if (check[0]?.result === 1) {
      // Honor the prior opt-out. The reader still gets the sample.
      return res.status(200).json({ ok: true, persisted: false, unsubscribed: true });
    }

    const hashKey = `volunteer:${cleanEmail}`;

    await redisPipeline([
      [
        'HSET', hashKey,
        'name', record.name,
        'email', record.email,
        'source', record.source,
        'list', record.list,
        'createdAt', record.createdAt,
        'consentIp', record.consentIp || '',
        'consentUserAgent', record.consentUserAgent,
        'attribution', record.attribution,
        'unsubscribeToken', token,
        'status', 'subscribed',
      ],
      ['LPUSH', 'volunteers:all', JSON.stringify(record)],
      ['LPUSH', `volunteers:${record.list}`, JSON.stringify(record)],
    ]);

    const esp = await syncToBeehiiv(record);

    return res.status(200).json({ ok: true, persisted: true, esp: esp.synced });
  } catch (err) {
    console.error('Volunteer capture error:', err);
    // Soft-fail: the reward should never be blocked by a storage hiccup.
    return res.status(200).json({ ok: true, persisted: false });
  }
}
