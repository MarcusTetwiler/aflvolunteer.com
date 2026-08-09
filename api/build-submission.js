// Vercel serverless function: POST /api/build-submission
//
// Inbound Build Wall submissions. Nothing here publishes anything: a submission
// lands in a pending queue and only appears on the site once Marcus adds it to
// src/data/buildWall.js with a permission record. See OUTREACH.md.
//
// Why a queue and not a publish path:
//   - PUBLISHABLE_BUILDS refuses to render without permission.granted === true,
//     and that flag is only honest if a human checked it.
//   - A form checkbox is a claim, not proof. The screenshot in permissions/ is
//     the proof. An inbound submission is *better* consent evidence than cold
//     outreach, but it still gets read by a person first.
//
// Storage:
//   submissions:pending           chronological list of submissions
//   submission:<id>               hash per submission
//
// Protections: honeypot field, per-IP rate limit, length caps on every field.

import {
  redisPipeline,
  isValidEmail,
  clientIp,
  rateLimit,
  ipBucket,
  trippedHoneypot,
} from './_shared.js';

const MAX = { handle: 80, contact: 160, profileUrl: 400, buildUrl: 400, note: 1200 };

function clean(v, cap) {
  return typeof v === 'string' ? v.trim().slice(0, cap) : '';
}

/** Only http(s), and never a javascript: or data: URL. */
function safeUrl(v, cap) {
  const s = clean(v, cap);
  if (!s) return '';
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.toString().slice(0, cap) : '';
  } catch {
    return '';
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};

  // Bots fill every field they can see. Accept and drop.
  if (trippedHoneypot(body)) {
    return res.status(200).json({ ok: true, queued: false });
  }

  const limit = await rateLimit(ipBucket('build-submission', req), 5, 3600);
  if (!limit.allowed) {
    return res.status(429).json({
      error: 'That is a lot of submissions from one place. Try again in an hour.',
    });
  }

  const handle = clean(body.handle, MAX.handle);
  const contact = clean(body.contact, MAX.contact);
  const profileUrl = safeUrl(body.profileUrl, MAX.profileUrl);
  const buildUrl = safeUrl(body.buildUrl, MAX.buildUrl);
  const note = clean(body.note, MAX.note);
  const acknowledged = body.acknowledged === true;

  if (!handle) {
    return res.status(400).json({ error: 'Tell us how you want to be credited.' });
  }
  if (!contact) {
    return res.status(400).json({ error: 'We need a way to reach you.' });
  }
  // An email contact should at least look like one; a handle is fine otherwise.
  if (contact.includes('@') && !contact.startsWith('@') && !isValidEmail(contact)) {
    return res.status(400).json({ error: 'That email address does not look right.' });
  }
  if (!buildUrl) {
    return res.status(400).json({ error: 'Add a link to the build — a post, photo, or thread.' });
  }
  if (!acknowledged) {
    return res.status(400).json({ error: 'Please confirm the build is yours and you are happy to be credited.' });
  }

  const id = `sub_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  const record = {
    id,
    handle,
    contact,
    profileUrl,
    buildUrl,
    note,
    acknowledged,
    status: 'pending',
    submittedAt: new Date().toISOString(),
    submitterIp: clientIp(req) || '',
  };

  try {
    const stored = await redisPipeline([
      [
        'HSET', `submission:${id}`,
        'id', record.id,
        'handle', record.handle,
        'contact', record.contact,
        'profileUrl', record.profileUrl,
        'buildUrl', record.buildUrl,
        'note', record.note,
        'acknowledged', String(record.acknowledged),
        'status', record.status,
        'submittedAt', record.submittedAt,
        'submitterIp', record.submitterIp,
      ],
      ['LPUSH', 'submissions:pending', JSON.stringify(record)],
    ]);

    if (!stored) {
      // No storage configured. Say so rather than pretending it was received —
      // unlike the sample gate, there is no consolation prize here, and a
      // builder who thinks they submitted will not submit again.
      console.error('Build submission with storage unconfigured:', id);
      return res.status(503).json({
        error: 'Submissions are temporarily unavailable. Please email us instead.',
      });
    }

    return res.status(200).json({ ok: true, queued: true, id });
  } catch (err) {
    console.error('Build submission error:', err);
    return res.status(500).json({
      error: 'Something went wrong saving that. Please email us instead.',
    });
  }
}
