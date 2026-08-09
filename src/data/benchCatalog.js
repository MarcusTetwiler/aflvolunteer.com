export const BENCH_STEPS = [
  {
    id: 'chassis', label: 'Chassis', prompt: 'Choose the airframe.',
    options: [
      { id: 'scout', name: 'SCOUT', detail: 'Light, quick, unforgiving.', stats: { endurance: 1, agility: 3, durability: -2, sensing: 0, signal: 0 } },
      { id: 'carrier', name: 'CARRIER', detail: 'Stable under added mass.', stats: { endurance: -1, agility: -2, durability: 3, sensing: 1, signal: 0 } },
      { id: 'ducted', name: 'DUCTED', detail: 'Protected and close-working.', stats: { endurance: -2, agility: 2, durability: 2, sensing: 0, signal: -1 } },
      { id: 'wing', name: 'LONGWING', detail: 'Built to stay out.', stats: { endurance: 3, agility: -2, durability: -1, sensing: 1, signal: 1 } },
    ],
  },
  {
    id: 'material', label: 'Material', prompt: 'Choose what survived the supply chain.',
    options: [
      { id: 'regrind', name: 'REGRIND', detail: 'Cheap, repairable, inconsistent.', stats: { endurance: 0, agility: 0, durability: -1, sensing: 0, signal: 0 }, tag: 'AVAILABLE' },
      { id: 'carbon', name: 'CARBON-NYLON', detail: 'Light and hard to replace.', stats: { endurance: 2, agility: 2, durability: 1, sensing: 0, signal: 0 }, tag: 'SCARCE' },
      { id: 'alloy', name: 'SALVAGED ALLOY', detail: 'Heavy, straight, dependable.', stats: { endurance: -2, agility: -1, durability: 3, sensing: 0, signal: 0 } },
      { id: 'gyroid', name: 'GYROID PRINT', detail: 'Open structure, easy to patch.', stats: { endurance: 1, agility: 1, durability: 0, sensing: 0, signal: 1 }, tag: 'PRINT 6H' },
    ],
  },
  {
    id: 'power', label: 'Power', prompt: 'Choose its temperament.',
    options: [
      { id: 'sprinter', name: 'SPRINTER', detail: 'Violent output, short reserve.', stats: { endurance: -3, agility: 3, durability: 0, sensing: 0, signal: 0 } },
      { id: 'endurance', name: 'ENDURANCE', detail: 'Slow discharge, long return.', stats: { endurance: 3, agility: -1, durability: 0, sensing: 0, signal: 1 } },
      { id: 'cold', name: 'COLD WEATHER', detail: 'Reliable below freezing.', stats: { endurance: 1, agility: -1, durability: 2, sensing: 0, signal: 0 } },
      { id: 'experimental', name: 'EXPERIMENTAL', detail: 'Remarkable when it behaves.', stats: { endurance: 2, agility: 2, durability: -2, sensing: 0, signal: 0 }, tag: 'UNPROVEN' },
    ],
  },
  {
    id: 'sensor', label: 'Sensor', prompt: 'Choose what it can see.',
    options: [
      { id: 'daylight', name: 'DAYLIGHT', detail: 'Clear glass. Minimal draw.', stats: { endurance: 1, agility: 0, durability: 1, sensing: 0, signal: 0 } },
      { id: 'thermal', name: 'THERMAL', detail: 'Heat remains when light fails.', stats: { endurance: -1, agility: 0, durability: 0, sensing: 3, signal: 0 }, tag: 'ONE LEFT' },
      { id: 'depth', name: 'DEPTH ARRAY', detail: 'Reads shape at close range.', stats: { endurance: -1, agility: -1, durability: 0, sensing: 2, signal: 1 } },
      { id: 'dual', name: 'DUAL OPTIC', detail: 'More context. More mass.', stats: { endurance: -2, agility: -1, durability: 0, sensing: 3, signal: 0 } },
    ],
  },
  {
    id: 'system', label: 'System', prompt: 'Choose how it stays oriented.',
    options: [
      { id: 'direct', name: 'DIRECT LINK', detail: 'Fast response, narrow reach.', stats: { endurance: 0, agility: 2, durability: 0, sensing: 0, signal: -1 } },
      { id: 'relay', name: 'RELAY', detail: 'The route bends around terrain.', stats: { endurance: -1, agility: 0, durability: 0, sensing: 0, signal: 3 } },
      { id: 'inertial', name: 'INERTIAL', detail: 'Keeps moving when the link drops.', stats: { endurance: 0, agility: 1, durability: 1, sensing: 0, signal: 2 } },
      { id: 'edge', name: 'EDGE LOGIC', detail: 'Interprets before transmitting.', stats: { endurance: -2, agility: 0, durability: -1, sensing: 2, signal: 2 }, tag: 'RESTRICTED' },
    ],
  },
  {
    id: 'finish', label: 'Finish', prompt: 'Leave a signature.', cosmetic: true,
    options: [
      { id: 'bone', name: 'BONE', detail: 'Unpigmented resin. Factory marks.' },
      { id: 'rust', name: 'RUST', detail: 'Burnt-orange shell. Black stencil.' },
      { id: 'field', name: 'FIELD GREEN', detail: 'Dull surface. Identification band.' },
      { id: 'repaired', name: 'FIELD-REPAIRED', detail: 'Mixed panels. Visible joins.' },
    ],
  },
];

export const STAT_KEYS = ['endurance', 'agility', 'durability', 'sensing', 'signal'];

export const TRIALS = [
  { id: 'range', name: 'RANGE TEST', weights: { endurance: 0.65, signal: 0.35 } },
  { id: 'wind', name: 'CROSSWIND', weights: { agility: 0.6, durability: 0.4 } },
  { id: 'loss', name: 'SIGNAL LOSS', weights: { signal: 0.7, durability: 0.3 } },
  { id: 'night', name: 'NIGHT FLIGHT', weights: { sensing: 0.7, signal: 0.3 } },
  { id: 'recovery', name: 'RECOVERY', weights: { durability: 0.55, agility: 0.45 } },
];

export const CALLSIGNS = ['MOTH', 'TALON', 'WREN', 'EMBER', 'ROOK', 'LANTERN', 'KITE', 'SABLE', 'ORBIT', 'CINDER'];
