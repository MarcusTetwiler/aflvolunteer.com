// Vercel serverless function: GET /api/export?key=…
//
// Exports the signup list as CSV, including a per-subscriber unsubscribe URL
// ready to be merged into your sends. This is how you get the list out of Redis
// and into an ESP without clicking through the Upstash data browser.
//
// Requires EXPORT_KEY to be set in Vercel's environment variables. Without it
// the endpoint refuses to run rather than exposing your list — an open export
// endpoint is a data breach with extra steps.
//
//   curl "https://YOUR-DOMAIN/api/export?key=YOUR_KEY" -o volunteers.csv
//
// Optional: &list=sample-chapters to export a single funnel.
// Optional: &kind=submissions to export the pending Build Wall queue instead.

import { redisPipeline, unsubscribeToken } from './_shared.js';

function csvCell(value) {
  const s = value === null || value === undefined ? '' : String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function exportSubmissions(req, res) {
  const result = await redisPipeline([['LRANGE', 'submissions:pending', '0', '-1']]);
  if (!result) return res.status(503).json({ error: 'Storage is not configured.' });

  const rows = (result[0]?.result || [])
    .map((raw) => { try { return JSON.parse(raw); } catch { return null; } })
    .filter(Boolean);

  const header = ['submitted_at', 'handle', 'contact', 'profile_url', 'build_url',
                  'acknowledged', 'status', 'note', 'id'];
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push([r.submittedAt, r.handle, r.contact, r.profileUrl, r.buildUrl,
                r.acknowledged, r.status, r.note, r.id].map(csvCell).join(','));
  }

  const stamp = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Disposition',
    `attachment; filename="afl-build-submissions-${stamp}.csv"`);
  return res.status(200).send(lines.join('\r\n'));
}

export default async function handler(req, res) {
  const expected = process.env.EXPORT_KEY;

  if (!expected) {
    return res.status(503).json({
      error: 'Export is disabled. Set EXPORT_KEY in your environment variables first.',
    });
  }

  const provided = req.query?.key;
  if (provided !== expected) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Build Wall queue shares the endpoint and the key, so there is one place to
  // guard rather than two.
  if (req.query?.kind === 'submissions') {
    return exportSubmissions(req, res);
  }

  const listName = typeof req.query?.list === 'string' && req.query.list.trim()
    ? req.query.list.trim()
    : 'all';
  const listKey = `volunteers:${listName}`;

  try {
    const result = await redisPipeline([
      ['LRANGE', listKey, '0', '-1'],
      ['SMEMBERS', 'volunteers:unsubscribed'],
    ]);

    if (!result) {
      return res.status(503).json({ error: 'Storage is not configured.' });
    }

    const rows = result[0]?.result || [];
    const optedOut = new Set(result[1]?.result || []);

    // Newest-first in Redis (LPUSH); the same address can appear more than once
    // if someone signed up twice, so keep only the first sighting of each.
    const seen = new Set();
    const records = [];
    for (const raw of rows) {
      let rec;
      try {
        rec = JSON.parse(raw);
      } catch {
        continue;
      }
      if (!rec?.email || seen.has(rec.email)) continue;
      seen.add(rec.email);
      records.push(rec);
    }

    const origin = `https://${req.headers.host}`;
    // `name` is retained for records created before the one-field gate; it is
    // simply blank for newer signups.
    const header = [
      'email', 'name', 'list', 'source', 'created_at',
      'status', 'consent_ip', 'attribution', 'unsubscribe_url',
    ];

    const lines = [header.join(',')];
    for (const r of records) {
      const status = optedOut.has(r.email) ? 'unsubscribed' : 'subscribed';
      const url =
        `${origin}/api/unsubscribe?email=${encodeURIComponent(r.email)}` +
        `&token=${unsubscribeToken(r.email)}`;
      lines.push([
        r.email, r.name, r.list, r.source, r.createdAt,
        status, r.consentIp, r.attribution, url,
      ].map(csvCell).join(','));
    }

    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="afl-${listName}-${stamp}.csv"`
    );
    return res.status(200).send(lines.join('\r\n'));
  } catch (err) {
    console.error('Export error:', err);
    return res.status(500).json({ error: 'Export failed.' });
  }
}
