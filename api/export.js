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

import { redisPipeline, unsubscribeToken } from './_shared.js';

function csvCell(value) {
  const s = value === null || value === undefined ? '' : String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
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
    const header = [
      'email', 'name', 'list', 'source', 'created_at',
      'status', 'consent_ip', 'unsubscribe_url',
    ];

    const lines = [header.join(',')];
    for (const r of records) {
      const status = optedOut.has(r.email) ? 'unsubscribed' : 'subscribed';
      const url =
        `${origin}/api/unsubscribe?email=${encodeURIComponent(r.email)}` +
        `&token=${unsubscribeToken(r.email)}`;
      lines.push([
        r.email, r.name, r.list, r.source, r.createdAt,
        status, r.consentIp, url,
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
