// Vercel serverless function: POST /api/volunteer
// Stores each signup in Upstash Redis (via the Vercel Marketplace KV integration).
// Designed so a later migration to Beehiiv (or any ESP) can read straight out of
// this same Redis list/hash without touching the frontend.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, list } = req.body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required.' });
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }

  const restUrl = process.env.KV_REST_API_URL;
  const restToken = process.env.KV_REST_API_TOKEN;

  if (!restUrl || !restToken) {
    console.error('Upstash env vars missing: KV_REST_API_URL / KV_REST_API_TOKEN');
    // Don't block the user's path to Redline over a config issue — fail soft.
    return res.status(200).json({ ok: true, persisted: false });
  }

  // `list` distinguishes which funnel the signup came from, so the sample-chapter
  // audience stays separable from the retired early-reader list already in Redis.
  const record = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    source: 'afl-site',
    list: typeof list === 'string' && list.trim() ? list.trim() : 'general',
    createdAt: new Date().toISOString(),
  };

  try {
    // Store as a hash keyed by email (idempotent re-signups overwrite cleanly)
    // and also push onto a list for easy chronological export later.
    const hashKey = `volunteer:${record.email}`;

    const pipeline = [
      ['HSET', hashKey, 'name', record.name, 'email', record.email, 'source', record.source, 'list', record.list, 'createdAt', record.createdAt],
      ['LPUSH', 'volunteers:all', JSON.stringify(record)],
      ['LPUSH', `volunteers:${record.list}`, JSON.stringify(record)],
    ];

    const upstashRes = await fetch(`${restUrl}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${restToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pipeline),
    });

    if (!upstashRes.ok) {
      const text = await upstashRes.text();
      console.error('Upstash write failed:', upstashRes.status, text);
      return res.status(200).json({ ok: true, persisted: false });
    }

    return res.status(200).json({ ok: true, persisted: true });
  } catch (err) {
    console.error('Volunteer capture error:', err);
    // Still soft-fail — the reward (Redline access) should never be blocked
    // by a storage hiccup.
    return res.status(200).json({ ok: true, persisted: false });
  }
}
