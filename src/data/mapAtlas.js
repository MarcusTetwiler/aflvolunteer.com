// ─────────────────────────────────────────────────────────────────────────────
//  MAP ATLAS — The World of The American Foreign Legion
//
//  This is a worldbuilding artifact, not a route map. Every entry describes
//  something a cartographer inside this world could legitimately draw:
//  geography, infrastructure, and civic or military function.
//
//  SPOILER RULE: no entry may describe what happens somewhere, what is hidden
//  there, or what a character finds. Deliberately, there are no routes showing
//  who travelled where — a route reveals narrative sequence. Someone can read
//  this entire map before Chapter 1 and learn nothing about the plot.
//
//  GEOMETRY: all coordinates are generated, not hand-placed. Canvas is
//  1000x880, equirectangular:
//
//      x = (lon + 11.0) / 59.0 * 1000      // lon  -11.0E .. 48.0E
//      y = -26.1028 * lat + 1732.06        // lat  66.36N (y=0) .. 32.64N (y=880)
//
//  Do not edit coordinates by hand. Edit the lat/lon in
//  work/gen_atlas.py and regenerate, or add entries using the formula above.
//
//  origin: 'real' = exists today | 'fictional' = created for the novel
//  tier:   1 = anchor, permanent label | 2 = secondary, label on hover
// ─────────────────────────────────────────────────────────────────────────────

export const MAP_LAYERS = [
  {
    "id": "places",
    "label": "Places",
    "note": "Cities, camps, and sites"
  },
  {
    "id": "terrain",
    "label": "Terrain",
    "note": "Rivers and seas"
  },
  {
    "id": "military",
    "label": "Military Geography",
    "note": "Corridors, sectors, and control"
  },
  {
    "id": "infrastructure",
    "label": "Infrastructure",
    "note": "Rail, air, and reconstruction"
  }
];

export const MAP_PINS = [
  {
    "id": "london",
    "name": "London",
    "country": "United Kingdom",
    "x": 184.3,
    "y": 387.6,
    "status": "active",
    "layer": "places",
    "tier": 1,
    "origin": "real",
    "summary": "Departure point for the novel’s eastbound volunteers. Heathrow routes passengers and freight toward Rzeszów and the Polish frontier.",
    "labelDx": 0,
    "labelDy": -14,
    "labelAnchor": "middle",
    "mobileLabel": true
  },
  {
    "id": "warsaw",
    "name": "Warsaw",
    "country": "Poland",
    "x": 542.6,
    "y": 368.7,
    "status": "fortified",
    "layer": "places",
    "tier": 1,
    "origin": "real",
    "summary": "Polish capital and the European anchor named in the reconstruction corridor's advertising.",
    "labelDx": -8,
    "labelDy": -11,
    "labelAnchor": "end",
    "mobileLabel": true
  },
  {
    "id": "lublin",
    "name": "Lublin",
    "country": "Poland",
    "x": 569.0,
    "y": 394.4,
    "status": "fortified",
    "layer": "places",
    "tier": 2,
    "origin": "real",
    "summary": "Polish city behind the frontier that supports Allied command, communications, rail movement, and air defense.",
    "labelDx": 0,
    "labelDy": 0,
    "labelAnchor": "middle",
    "mobileLabel": false
  },
  {
    "id": "rzeszow",
    "name": "Rzeszów",
    "country": "Poland",
    "x": 559.3,
    "y": 425.8,
    "status": "active",
    "layer": "places",
    "tier": 2,
    "origin": "real",
    "summary": "Southeastern Polish transport hub and the principal gateway for people and freight moving toward the Ukrainian frontier.",
    "labelDx": 0,
    "labelDy": 0,
    "labelAnchor": "middle",
    "mobileLabel": false
  },
  {
    "id": "medyka",
    "name": "Camp Tadeusz",
    "country": "Medyka, Poland",
    "x": 575.0,
    "y": 432.0,
    "status": "active",
    "layer": "places",
    "tier": 2,
    "origin": "fictional",
    "summary": "NATO-aligned volunteer training and staging camp near the former border crossing at Medyka.",
    "labelDx": 0,
    "labelDy": 0,
    "labelAnchor": "middle",
    "mobileLabel": false
  },
  {
    "id": "lviv",
    "name": "Lviv",
    "country": "Ukraine",
    "x": 593.7,
    "y": 431.1,
    "status": "unknown",
    "layer": "places",
    "tier": 2,
    "origin": "real",
    "summary": "Western Ukrainian rail and road hub, the historic first stop east of the Polish border. Occupied; conditions unreported.",
    "labelDx": 0,
    "labelDy": 0,
    "labelAnchor": "middle",
    "mobileLabel": false
  },
  {
    "id": "zalissia",
    "name": "Zalissia",
    "country": "Ukraine",
    "x": 688.1,
    "y": 399.5,
    "status": "unknown",
    "layer": "places",
    "tier": 1,
    "origin": "real",
    "summary": "National parkland and long-abandoned settlements northwest of Kyiv, threaded with Soviet-era infrastructure. Occupied; conditions unreported.",
    "labelDx": -9,
    "labelDy": -8,
    "labelAnchor": "end",
    "mobileLabel": false
  },
  {
    "id": "kyiv",
    "name": "Kyiv",
    "country": "Ukraine",
    "x": 703.8,
    "y": 415.2,
    "status": "unknown",
    "layer": "places",
    "tier": 1,
    "origin": "real",
    "summary": "Ukraine’s capital on the Dnipro and a central geographic anchor of the eastern theater. Independence Square sits at its civic center. Occupied; conditions unreported.",
    "labelDx": 10,
    "labelDy": 5,
    "labelAnchor": "start",
    "mobileLabel": true
  },
  {
    "id": "odesa",
    "name": "Odesa",
    "country": "Ukraine",
    "x": 707.2,
    "y": 518.7,
    "status": "unknown",
    "layer": "places",
    "tier": 1,
    "origin": "real",
    "summary": "Black Sea port city of broad streets, arcades, docks, container yards, and rail infrastructure. Occupied; conditions unreported.",
    "labelDx": -10,
    "labelDy": 3,
    "labelAnchor": "end",
    "mobileLabel": true
  },
  {
    "id": "moscow",
    "name": "Moscow",
    "country": "Russia",
    "x": 824.0,
    "y": 276.7,
    "status": "hostile",
    "layer": "places",
    "tier": 1,
    "origin": "real",
    "summary": "Russian capital and a major node on the reconstructed east-west rail system, ringed by depots, transfer stations, and checkpoints.",
    "labelDx": 0,
    "labelDy": -14,
    "labelAnchor": "middle",
    "mobileLabel": true
  },
  {
    "id": "kaliningrad",
    "name": "Kaliningrad",
    "country": "Russian Federation",
    "x": 533.1,
    "y": 304.0,
    "status": "hostile",
    "layer": "military",
    "tier": 1,
    "origin": "real",
    "summary": "Russian exclave on the Baltic, bordering Poland and Lithuania. Forms the western jaw of the Suwałki geography.",
    "labelDx": -10,
    "labelDy": -6,
    "labelAnchor": "end",
    "mobileLabel": false
  },
  {
    "id": "minsk",
    "name": "Minsk",
    "country": "Belarus",
    "x": 653.5,
    "y": 325.1,
    "status": "hostile",
    "layer": "military",
    "tier": 1,
    "origin": "real",
    "summary": "Belarusian capital. Belarus forms the eastern side of the Suwałki strategic geography.",
    "labelDx": 11,
    "labelDy": 4,
    "labelAnchor": "start",
    "mobileLabel": false
  },
  {
    "id": "vilnius",
    "name": "Vilnius",
    "country": "Lithuania",
    "x": 614.9,
    "y": 304.6,
    "status": "fortified",
    "layer": "military",
    "tier": 1,
    "origin": "real",
    "summary": "Lithuanian capital. The Baltic states connect to the rest of the alliance only through the Suwałki land bridge.",
    "labelDx": 10,
    "labelDy": -6,
    "labelAnchor": "start",
    "mobileLabel": false
  }
];

export const MAP_LINES = [
  {
    "id": "eastern-corridor",
    "name": "The Eastern Corridor",
    "layer": "infrastructure",
    "origin": "fictional",
    "kind": "rail",
    "summary": "High-speed reconstruction corridor advertised in Mandarin as Construction Phase IV of XII. The novel depicts Chinese-marked infrastructure along the route; the corridor itself is fictional.",
    "d": "M 1000.0,283.4 L 932.2,262.5 L 871.2,267.7 L 824.1,276.6 L 729.7,302.1 L 653.6,325.1 L 588.1,372.1",
    "labelAt": [
      824.1,
      276.6
    ]
  },
  {
    "id": "corridor-projected",
    "name": "Eastern Corridor — Advertised Extension",
    "layer": "infrastructure",
    "origin": "fictional",
    "kind": "rail-planned",
    "summary": "Advertised continuation toward Warsaw and western Europe. The map treats the extension as projected rather than confirmed infrastructure.",
    "d": "M 588.1,372.1 L 542.5,368.7",
    "labelAt": [
      542.5,
      368.7
    ]
  },
  {
    "id": "air-route",
    "name": "London – Rzeszów Air Route",
    "layer": "infrastructure",
    "origin": "real",
    "kind": "air",
    "summary": "Commercial air route from Heathrow to Rzeszów used by volunteers and other passengers entering the eastern theater.",
    "d": "M 184.3,387.6 L 322.0,377.3 L 440.7,385.2 L 559.3,425.8",
    "labelAt": [
      440.7,
      385.2
    ]
  },
  {
    "id": "dnipro",
    "name": "Dnipro River",
    "layer": "terrain",
    "origin": "real",
    "kind": "water",
    "summary": "Ukraine's defining river, running south through Kyiv to the Black Sea and carrying long historical and cultural weight.",
    "d": "M 703.4,340.8 L 710.2,372.1 L 703.4,400.8 L 703.7,415.2 L 752.5,450.4 L 780.5,467.1 L 776.3,502.6 L 739.0,515.7",
    "labelAt": [
      752.5,
      450.4
    ]
  }
];

export const MAP_AREAS = [
  {
    "id": "depopulated-belt",
    "name": "Depopulated Reconstruction Belt",
    "shortLabel": "DEPOPULATED BELT",
    "layer": "infrastructure",
    "origin": "fictional",
    "summary": "Former population centers remain on official maps even where civilian life has largely withdrawn from the landscape.",
    "d": "M 840.7,207.7 L 1000.0,202.4 L 1000.0,359.1 L 850.8,364.3 L 811.9,306.8 L 806.8,239.0 Z",
    "labelAt": [
      906.8,
      228.5
    ],
    "labelAnchor": "middle"
  },
  {
    "id": "reconstruction-zone",
    "name": "Eastern Corridor Reconstruction Zone",
    "shortLabel": "",
    "layer": "infrastructure",
    "origin": "fictional",
    "summary": "Repaired roads, transfer stations, water towers, construction yards, prefab housing, and customs infrastructure follow the rail axis. Much of the signage is in Mandarin.",
    "d": "M 847.5,246.8 L 728.8,254.6 L 644.1,296.4 L 574.6,343.4 L 542.4,395.6 L 586.4,400.8 L 659.3,359.1 L 735.6,332.9 L 850.8,312.1 Z",
    "labelAt": [
      620.3,
      366.9
    ],
    "labelAnchor": "middle"
  },
  {
    "id": "still-earth",
    "name": "Sterilized Agricultural Belt",
    "shortLabel": "STILL EARTH",
    "layer": "military",
    "origin": "fictional",
    "summary": "Farmland deliberately rendered unusable and still recorded on official maps as agricultural land.",
    "d": "M 630.5,411.3 L 688.1,421.7 L 693.2,468.7 L 650.8,489.6 L 616.9,463.5 Z",
    "labelAt": [
      654.2,
      466.1
    ],
    "labelAnchor": "middle"
  },
  {
    "id": "medyka-sector",
    "name": "Medyka Front Sector",
    "shortLabel": "",
    "layer": "military",
    "origin": "fictional",
    "summary": "Military district around the former border crossing: covered roads, ruined rail, defensive belts, and layered drone defenses.",
    "d": "M 564.4,420.4 L 586.4,423.0 L 588.1,441.3 L 566.1,442.6 Z",
    "labelAt": [
      575.4,
      449.1
    ],
    "labelAnchor": "middle"
  },
  {
    "id": "suwalki-gap",
    "name": "Suwałki Corridor",
    "shortLabel": "SUWAŁKI",
    "layer": "military",
    "origin": "real",
    "summary": "The narrow land connection between Poland and Lithuania, separating Belarus from Kaliningrad. The alliance's only overland route to the Baltics.",
    "d": "M 568.6,310.8 L 585.6,310.8 L 585.6,326.4 L 568.6,326.4 Z",
    "labelAt": [
      555.1,
      318.6
    ],
    "labelAnchor": "end"
  },
  {
    "id": "black-sea",
    "name": "Black Sea",
    "shortLabel": "BLACK SEA",
    "layer": "terrain",
    "origin": "real",
    "summary": "Strategic maritime space linking Ukraine to international shipping and military routes.",
    "d": "M 701.7,531.3 L 754.2,518.3 L 806.8,549.6 L 855.9,601.8 L 886.4,651.4 L 762.7,656.6 L 681.4,630.5 L 676.3,573.1 Z",
    "labelAt": [
      771.2,
      599.2
    ],
    "labelAnchor": "middle"
  }
];
