// Andrew's view of "the map" isn't a place — it's a ledger. Pre-deployment,
// his contracts are public (Talon, broadcast, sponsored) or private
// (unbroadcast, real stakes — see canon: "kill confirmation required for
// full contract closure"). Geography barely registers to him; what
// registers is the contract system's own language. So instead of named
// cities, this generates a dense field of abstracted contract markers —
// sector/grid tags, not place names — deliberately withholding anything
// that would tie a specific contract to Elena or to this theater.

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
const CLASSIFICATIONS = ['talon', 'private']; // public/broadcast vs. unbroadcast

// Contract status uses the canon contract-system vocabulary, not narrative language.
const STATUSES = ['complete', 'complete', 'complete', 'partial']; // weighted toward complete

const COUNT = 130;
const MIN_SEPARATION = 16; // px in the 1000x880 canvas; keeps pins independently clickable

function generateContracts() {
  const contracts = [];
  const usedCodes = new Set();
  const placed = [];

  for (let i = 0; i < COUNT; i++) {
    const classification = CLASSIFICATIONS[rand() < 0.62 ? 0 : 1]; // talon-majority, matching "four public contracts in a night"
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

    // Rejection-sample a position so no two pins land close enough to be
    // hard to click independently. Falls back to "best of 40 tries" so a
    // dense canvas can never spin forever.
    let x, y, attempts = 0;
    let best = null, bestMinDist = -1;
    do {
      x = 40 + rand() * 920;
      y = 40 + rand() * 800;
      const minDist = placed.reduce(
        (min, p) => Math.min(min, Math.hypot(p.x - x, p.y - y)),
        Infinity
      );
      if (minDist > bestMinDist) { bestMinDist = minDist; best = { x, y }; }
      attempts++;
    } while (bestMinDist < MIN_SEPARATION && attempts < 40);
    ({ x, y } = best);
    placed.push({ x, y });

    const payout = classification === 'talon'
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

export const ANDREW_CONTRACTS = generateContracts();

export const ANDREW_STATUS_LABEL = {
  complete: 'CLOSED',
  partial: 'INTERRUPTED',
};

export const ANDREW_CLASS_LABEL = {
  talon: 'TALON — BROADCAST',
  private: 'PRIVATE CONTRACT',
};
