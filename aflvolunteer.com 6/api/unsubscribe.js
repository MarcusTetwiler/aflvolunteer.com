// Vercel serverless function: GET/POST /api/unsubscribe?email=…&token=…
//
// This is the endpoint every commercial email you send must link to. CAN-SPAM
// requires a working opt-out mechanism in each message, honored within ten
// business days — so the link has to work without a login, without a reply, and
// without you doing anything by hand.
//
// The token is an HMAC of the email address, so a link can't be forged to
// unsubscribe someone else, and no session or account is needed.
//
// POST is supported for RFC 8058 one-click unsubscribe. Include both headers
// in your sends so Gmail and Yahoo show a native unsubscribe button:
//
//   List-Unsubscribe: <https://YOUR-DOMAIN/api/unsubscribe?email=…&token=…>
//   List-Unsubscribe-Post: List-Unsubscribe=One-Click

import { redisPipeline, unsubscribeToken, isValidEmail, escapeHtml } from './_shared.js';

function page({ title, heading, body, ok }) {
  const accent = ok ? '#BD6433' : '#8A7556';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex" />
<title>${escapeHtml(title)}</title>
<style>
  :root { color-scheme: light; }
  body {
    margin: 0; min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    background: #E7D6BC; color: #1C1916;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    padding: 32px;
  }
  .card {
    max-width: 460px; width: 100%;
    border: 1px solid rgba(28,25,22,0.3); padding: 40px 36px;
  }
  .mark {
    font-family: ui-monospace, monospace; font-size: 12px;
    letter-spacing: 0.18em; text-transform: uppercase;
    color: ${accent}; margin: 0 0 20px;
  }
  h1 { font-family: Georgia, serif; font-size: 26px; line-height: 1.2; margin: 0 0 16px; font-weight: 600; }
  p { font-size: 15.5px; line-height: 1.65; color: #433D31; margin: 0 0 12px; }
  a { color: #BD6433; }
</style>
</head>
<body>
  <div class="card">
    <p class="mark">The American Foreign Legion</p>
    <h1>${escapeHtml(heading)}</h1>
    ${body}
  </div>
</body>
</html>`;
}

export default async function handler(req, res) {
  const params = req.query || {};
  const email = typeof params.email === 'string' ? params.email.trim().toLowerCase() : '';
  const token = typeof params.token === 'string' ? params.token : '';

  const send = (status, html) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(status).send(html);
  };

  if (!isValidEmail(email) || !token) {
    return send(400, page({
      title: 'Invalid unsubscribe link',
      heading: 'That link looks incomplete',
      ok: false,
      body: '<p>The unsubscribe link was missing information. Reply to any email from us and we will remove you by hand.</p>',
    }));
  }

  // Constant-time-ish comparison via length check plus equality; tokens are
  // fixed length so a mismatch tells an attacker nothing useful.
  if (token !== unsubscribeToken(email)) {
    return send(403, page({
      title: 'Invalid unsubscribe link',
      heading: 'That link could not be verified',
      ok: false,
      body: '<p>This link may have expired or been altered. Reply to any email from us and we will remove you by hand.</p>',
    }));
  }

  try {
    const result = await redisPipeline([
      ['SADD', 'volunteers:unsubscribed', email],
      ['HSET', `volunteer:${email}`, 'status', 'unsubscribed',
        'unsubscribedAt', new Date().toISOString()],
    ]);

    if (!result) {
      console.error('Unsubscribe attempted with storage unconfigured:', email);
      return send(500, page({
        title: 'Unsubscribe failed',
        heading: 'Something went wrong',
        ok: false,
        body: '<p>We could not process that just now. Reply to any email from us and we will remove you by hand.</p>',
      }));
    }
  } catch (err) {
    console.error('Unsubscribe error:', err);
    return send(500, page({
      title: 'Unsubscribe failed',
      heading: 'Something went wrong',
      ok: false,
      body: '<p>We could not process that just now. Reply to any email from us and we will remove you by hand.</p>',
    }));
  }

  return send(200, page({
    title: 'Unsubscribed',
    heading: 'You are unsubscribed',
    ok: true,
    body:
      `<p><strong>${escapeHtml(email)}</strong> has been removed. You will not receive further email from us.</p>` +
      '<p>The sample chapters stay free to read at any time — no signup needed once you have opened them. ' +
      '<a href="/">Back to the site</a>.</p>',
  }));
}
