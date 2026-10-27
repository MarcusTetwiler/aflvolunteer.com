// Anonymous fictional ledger. Seeded sectors are illustrative, not canon-confirmed missions.
import landPoints from '../data/landPoints.json' with { type: 'json' };

const SEED = 86421;

function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(SEED);

const SECTOR_PREFIXES = ['NX', 'KL', 'TR', 'VQ', 'BD', 'HF', 'ZM', 'CW', 'PL', 'SR'];
const CLASSIFICATIONS = ['broadcast', 'private']; // public/broadcast vs. unbroadcast

// Contract status uses the canon contract-system vocabulary, not narrative language.
const STATUSES = ['complete', 'complete', 'complete', 'partial']; // weighted toward complete

const COUNT = 130;
const MIN_SEPARATION = 14; // px in the 1000x880 canvas; keeps pins independently clickable
const JITTER = 5; // px of random offset off the land-grid point, so dots don't look snapped to a grid

function generateContracts() {
  const contracts = [];
  const usedCodes = new Set();
  const placed = [];

  // Shuffle a copy of the land points (Fisher-Yates with the seeded RNG) so
  // we draw a different, deterministic subset each run without bias toward
  // the start of the array.
  const pool = landPoints.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  let poolIndex = 0;

  for (let i = 0; i < COUNT; i++) {
    const classification = CLASSIFICATIONS[rand() < 0.62 ? 0 : 1]; // illustrative public/private mix
    const status = STATUSES[Math.floor(rand() * STATUSES.length)];

    // Guarantee a unique sector code — wide enough range that collisions are
    // effectively impossible, but still verify and resample just in case.
    let code;
    do {
      const prefix = SECTOR_PREFIXES[Math.floor(rand() * SECTOR_PREFIXES.length)];
      const gridNum = Math.floor(rand() * 900) + 100;
      code = `${prefix}-${gridNum}`;
    } while (usedCodes.has(code));
    usedCodes.add(code);

    // Walk the shuffled land-point pool, taking the next point that clears
    // the minimum separation from everything already placed. The pool is
    // large relative to COUNT, so this always finds something without
    // needing rejection sampling against open ocean.
    let x, y;
    while (poolIndex < pool.length) {
      const [px, py] = pool[poolIndex];
      poolIndex++;
      const jx = px + (rand() - 0.5) * JITTER * 2;
      const jy = py + (rand() - 0.5) * JITTER * 2;
      const minDist = placed.reduce(
        (min, p) => Math.min(min, Math.hypot(p.x - jx, p.y - jy)),
        Infinity
      );
      if (minDist >= MIN_SEPARATION) {
        x = jx; y = jy;
        break;
      }
    }
    if (x === undefined) {
      // Pool exhausted (shouldn't happen at COUNT=130 against ~3200 points) —
      // fall back to the next pool point unfiltered rather than crash.
      const [px, py] = pool[i % pool.length];
      x = px; y = py;
    }
    placed.push({ x, y });

    const payout = classification === 'broadcast'
      ? ['Sponsored', 'Broadcast Tier I', 'Broadcast Tier II'][Math.floor(rand() * 3)]
      : status === 'complete' ? 'Full Payout' : 'Partial Payout — No Kill Confirmation';

    contracts.push({
      id: `contract-${i}`,
      code,
      classification,
      status,
      payout,
      x, y,
    });
  }
  return contracts;
}

export const LEDGER_CONTRACTS = generateContracts();

export const LEDGER_STATUS_LABEL = {
  complete: 'CLOSED',
  partial: 'INTERRUPTED',
};

export const LEDGER_CLASS_LABEL = {
  broadcast: 'BROADCAST EVENT',
  private: 'PRIVATE CONTRACT',
};
