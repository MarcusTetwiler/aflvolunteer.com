// ─────────────────────────────────────────────────────────────────────────────
//  First-touch attribution
//
//  Records where a visitor came from on their FIRST visit and keeps it, so a
//  signup that happens three sessions later is still credited to the campaign
//  that actually earned it. Last-touch would credit the direct visit instead.
//
//  Deliberately narrow: campaign tags, referrer host, and landing hash. No
//  fingerprinting, no cross-site identifiers, nothing that needs a cookie
//  banner. Referrer is reduced to its hostname so a full URL — which can carry
//  a search query or a private path — is never stored.
//
//  Written once and never overwritten. Cleared only if the reader clears storage.
// ─────────────────────────────────────────────────────────────────────────────

const KEY = 'afl:attribution';

const FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

function readStored() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Capture first-touch attribution if none is stored yet. Safe to call on every
 * page load; it no-ops once a record exists.
 */
export function captureAttribution() {
  try {
    if (readStored()) return;

    const params = new URLSearchParams(window.location.search);
    const record = {};

    for (const f of FIELDS) {
      const v = params.get(f);
      if (v) record[f] = v.slice(0, 120);
    }

    // Hostname only — never the full referring URL.
    if (document.referrer) {
      try {
        const host = new URL(document.referrer).hostname;
        if (host && host !== window.location.hostname) record.referrer = host;
      } catch {
        // Malformed referrer; skip it.
      }
    }

    // Which section they landed on, e.g. a shared #build-<id> or #g-<slug> link.
    if (window.location.hash) record.landing = window.location.hash.slice(1, 64);

    record.firstSeen = new Date().toISOString();

    // Store even when empty apart from the timestamp, so a later campaign visit
    // can't overwrite an earlier organic first touch.
    window.localStorage.setItem(KEY, JSON.stringify(record));
  } catch {
    // Private browsing or storage disabled — attribution is simply unavailable.
  }
}

/**
 * Attribution fields to merge into a signup payload. Returns {} when nothing
 * was captured, so callers can spread it unconditionally.
 */
export function attribution() {
  const rec = readStored();
  if (!rec) return {};
  const out = {};
  for (const [k, v] of Object.entries(rec)) {
    if (k === 'firstSeen') continue;
    out[k] = v;
  }
  if (rec.firstSeen) out.firstSeen = rec.firstSeen;
  return Object.keys(out).length ? { attribution: out } : {};
}
