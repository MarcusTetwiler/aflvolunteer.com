// ─────────────────────────────────────────────────────────────────────────────
//  GLOSSARY
//
//  Spoiler-free definitions for terms in the novel. Rendered as one section
//  with a per-term anchor (#g-<id>), so any term is directly linkable —
//  e.g. /#g-screamer-drone — without spawning a page per definition.
//
//  Fifty pages each carrying a two-sentence definition is the thin-content
//  pattern Google's scaled-content policy targets, and the risk is sitewide,
//  not just to those pages. One substantial section is both safer and better
//  for readers.
//
//  Fields:
//    id          slug, also the anchor target
//    term        display name
//    group       'tech' | 'world' | 'place' | 'history' | 'geo'
//    origin      'real'     = exists today
//                'invented' = created for the novel
//    definition  spoiler-free, one or two sentences
//
//  `origin` is the interesting column: readers want to know which of these
//  they could go read about tonight and which only exist in the book.
// ─────────────────────────────────────────────────────────────────────────────

export const GLOSSARY_GROUPS = [
  { id: 'all', label: 'All' },
  { id: 'real', label: 'Real' },
  { id: 'invented', label: 'From the novel' },
  { id: 'tech', label: 'Technology' },
  { id: 'place', label: 'Places' },
  { id: 'history', label: 'History' },
  { id: 'geo', label: 'Geopolitics' },
];

export const GLOSSARY = [
  {
    "id": "aerial-minefield",
    "term": "Aerial Minefield",
    "group": "world",
    "origin": "invented",
    "definition": "A defensive arrangement in which unmanned systems occupy or protect a defined area of airspace."
  },
  {
    "id": "american-foreign-legion",
    "term": "American Foreign Legion",
    "group": "world",
    "origin": "invented",
    "definition": "A network of American volunteers serving alongside NATO-aligned forces overseas."
  },
  {
    "id": "anti-drone-netting",
    "term": "Anti-Drone Netting",
    "group": "tech",
    "origin": "real",
    "definition": "Physical mesh or barriers placed above positions and routes to prevent drones from directly reaching people or equipment below."
  },
  {
    "id": "ai-warfare",
    "term": "Artificial Intelligence in Warfare",
    "group": "tech",
    "origin": "real",
    "definition": "The use of AI systems to assist detection, prediction, targeting, logistics, and battlefield decision-making."
  },
  {
    "id": "autonomous-warfare",
    "term": "Autonomous Warfare",
    "group": "tech",
    "origin": "real",
    "definition": "Warfare in which machines increasingly perform navigation, identification, coordination, or combat functions with reduced human intervention."
  },
  {
    "id": "battlefield-3d-printing",
    "term": "Battlefield 3D Printing",
    "group": "tech",
    "origin": "real",
    "definition": "The use of additive manufacturing near the battlefield to make replacement components and repair equipment."
  },
  {
    "id": "battlefield-logistics",
    "term": "Battlefield Logistics",
    "group": "tech",
    "origin": "real",
    "definition": "The movement and maintenance of fuel, ammunition, food, medical supplies, equipment, and replacement parts during war."
  },
  {
    "id": "camp-tadeusz",
    "term": "Camp Tadeusz",
    "group": "world",
    "origin": "invented",
    "definition": "A NATO-aligned training and staging location near Medyka used by volunteers and allied forces."
  },
  {
    "id": "carrier-drone",
    "term": "Carrier Drone",
    "group": "tech",
    "origin": "real",
    "definition": "A larger drone capable of transporting or supporting smaller unmanned systems."
  },
  {
    "id": "command-and-control",
    "term": "Command and Control",
    "group": "tech",
    "origin": "real",
    "definition": "The systems and processes used to direct forces, exchange information, and coordinate military operations."
  },
  {
    "id": "dnipro-river",
    "term": "Dnipro River",
    "group": "place",
    "origin": "real",
    "definition": "One of Ukraine’s defining rivers, running through the country and carrying major historical and cultural significance."
  },
  {
    "id": "drone-detection",
    "term": "Drone Detection",
    "group": "tech",
    "origin": "real",
    "definition": "Technologies used to identify, locate, or track nearby unmanned aircraft and their signals."
  },
  {
    "id": "drone-jamming",
    "term": "Drone Jamming",
    "group": "tech",
    "origin": "real",
    "definition": "The disruption of wireless signals used by drones for navigation, positioning, or control."
  },
  {
    "id": "drone-logistics",
    "term": "Drone Logistics",
    "group": "tech",
    "origin": "real",
    "definition": "The use of unmanned aircraft to move supplies, equipment, or other material between locations."
  },
  {
    "id": "drone-mothership",
    "term": "Drone Mothership",
    "group": "tech",
    "origin": "real",
    "definition": "A larger aircraft or unmanned platform that carries, deploys, or services smaller drones."
  },
  {
    "id": "drone-swarm",
    "term": "Drone Swarm",
    "group": "tech",
    "origin": "real",
    "definition": "A group of drones coordinated to operate together across a shared mission or battlespace."
  },
  {
    "id": "drone-warfare",
    "term": "Drone Warfare",
    "group": "tech",
    "origin": "real",
    "definition": "The military use of remotely operated or autonomous aerial and ground systems for reconnaissance, logistics, and combat."
  },
  {
    "id": "electronic-warfare",
    "term": "Electronic Warfare",
    "group": "tech",
    "origin": "real",
    "definition": "Military operations that interfere with, detect, deceive, or exploit electronic communications and sensors."
  },
  {
    "id": "environmental-warfare",
    "term": "Environmental Warfare",
    "group": "tech",
    "origin": "real",
    "definition": "The deliberate use or destruction of environmental resources as part of military strategy."
  },
  {
    "id": "fiber-optic-drone",
    "term": "Fiber-Optic Drone",
    "group": "tech",
    "origin": "real",
    "definition": "A drone controlled through a physical fiber-optic connection rather than relying entirely on radio signals."
  },
  {
    "id": "fpv-drone",
    "term": "FPV Drone",
    "group": "tech",
    "origin": "real",
    "definition": "A drone flown using a live first-person camera feed that gives the operator an onboard view."
  },
  {
    "id": "fpv-drone-racing",
    "term": "FPV Drone Racing",
    "group": "tech",
    "origin": "real",
    "definition": "Competitive drone piloting through gates and obstacles using first-person-view controls."
  },
  {
    "id": "hardwired-drone",
    "term": "Hardwired Drone",
    "group": "tech",
    "origin": "real",
    "definition": "A drone whose control or communications link includes a physical cable rather than depending entirely on wireless transmission."
  },
  {
    "id": "interceptor-missile",
    "term": "Interceptor Missile",
    "group": "tech",
    "origin": "real",
    "definition": "A defensive missile designed to destroy an incoming aircraft, missile, or other airborne threat."
  },
  {
    "id": "jozef-pilsudski",
    "term": "Józef Piłsudski",
    "group": "history",
    "origin": "real",
    "definition": "A major Polish statesman and military leader associated with the restoration of Polish independence."
  },
  {
    "id": "kamikaze-drone",
    "term": "Kamikaze Drone",
    "group": "tech",
    "origin": "real",
    "definition": "A one-way attack drone designed to strike a target rather than return after its mission."
  },
  {
    "id": "kotwica-symbol",
    "term": "Kotwica",
    "group": "history",
    "origin": "real",
    "definition": "The historic Polish resistance symbol combining the letters P and W, strongly associated with the Polish Underground State."
  },
  {
    "id": "kyiv-ukraine",
    "term": "Kyiv",
    "group": "place",
    "origin": "real",
    "definition": "The capital of Ukraine and one of the central geographic reference points in AFL’s European conflict."
  },
  {
    "id": "loitering-munition",
    "term": "Loitering Munition",
    "group": "tech",
    "origin": "real",
    "definition": "A weapon that can remain airborne while searching for a target before conducting a strike."
  },
  {
    "id": "maidan-kyiv",
    "term": "Maidan",
    "group": "place",
    "origin": "real",
    "definition": "Kyiv’s central Independence Square and a location deeply associated with modern Ukrainian civic history."
  },
  {
    "id": "mazepynka-cap",
    "term": "Mazepynka",
    "group": "history",
    "origin": "real",
    "definition": "A distinctive style of military field cap associated with Ukrainian military tradition."
  },
  {
    "id": "medyka-poland",
    "term": "Medyka",
    "group": "place",
    "origin": "real",
    "definition": "A Polish town near the Ukrainian border and an important geographic gateway in the novel."
  },
  {
    "id": "micro-kit-fabricator",
    "term": "Micro-Kit Fabricator",
    "group": "world",
    "origin": "invented",
    "definition": "A portable fabrication system used to produce replacement polymer components in the field."
  },
  {
    "id": "nations-series",
    "term": "Nations Series",
    "group": "world",
    "origin": "invented",
    "definition": "A major international drone-racing competition featuring elite pilots, national identities, sponsors, and global audiences."
  },
  {
    "id": "nato",
    "term": "NATO",
    "group": "geo",
    "origin": "real",
    "definition": "The North Atlantic Treaty Organization, a political and military alliance connecting North American and European member states."
  },
  {
    "id": "nato-volunteer",
    "term": "NATO Volunteer",
    "group": "world",
    "origin": "invented",
    "definition": "A civilian or former service member who joins forces operating alongside NATO-aligned units without being part of a conventional American deployment."
  },
  {
    "id": "neural-interface",
    "term": "Neural Interface",
    "group": "tech",
    "origin": "real",
    "definition": "Technology that connects signals from the human nervous system with a computer or machine."
  },
  {
    "id": "neural-sync",
    "term": "Neural Sync",
    "group": "world",
    "origin": "invented",
    "definition": "A human-machine interface used to create a more direct connection between an operator and advanced control systems."
  },
  {
    "id": "radio-frequency-signature",
    "term": "Radio-Frequency Signature",
    "group": "tech",
    "origin": "real",
    "definition": "Electronic emissions that can reveal the presence or operation of transmitting equipment."
  },
  {
    "id": "reconnaissance-drone",
    "term": "Reconnaissance Drone",
    "group": "tech",
    "origin": "real",
    "definition": "An unmanned aircraft used primarily to observe terrain, forces, routes, or targets."
  },
  {
    "id": "rules-of-engagement",
    "term": "Rules of Engagement",
    "group": "tech",
    "origin": "real",
    "definition": "Instructions defining when and how military personnel are permitted to use force."
  },
  {
    "id": "rzeszow-poland",
    "term": "Rzeszów",
    "group": "place",
    "origin": "real",
    "definition": "A city in southeastern Poland that functions as an important transportation hub near Ukraine."
  },
  {
    "id": "screamer-drone",
    "term": "Screamer Drone",
    "group": "world",
    "origin": "invented",
    "definition": "A small drone designed to use powerful acoustic output as a battlefield weapon or disruption system."
  },
  {
    "id": "solid-state-battery",
    "term": "Solid-State Battery",
    "group": "tech",
    "origin": "real",
    "definition": "A battery design that uses solid materials in place of conventional liquid electrolytes."
  },
  {
    "id": "spider-drone",
    "term": "Spider Drone",
    "group": "world",
    "origin": "invented",
    "definition": "A large multi-legged ground combat drone designed to move across terrain and structures."
  },
  {
    "id": "still-earth",
    "term": "Still Earth",
    "group": "world",
    "origin": "invented",
    "definition": "A wartime policy associated with deliberately damaged or sterilized agricultural land."
  },
  {
    "id": "strait-of-hormuz",
    "term": "Strait of Hormuz",
    "group": "geo",
    "origin": "real",
    "definition": "A narrow maritime passage connecting the Persian Gulf with the Gulf of Oman and a major route for global energy shipping."
  },
  {
    "id": "taiwan-strait",
    "term": "Taiwan Strait",
    "group": "geo",
    "origin": "real",
    "definition": "The body of water separating Taiwan from mainland China and a major focus of contemporary security competition."
  },
  {
    "id": "talon",
    "term": "Talon",
    "group": "world",
    "origin": "invented",
    "definition": "The professional callsign associated with a globally recognized American drone pilot."
  },
  {
    "id": "whisper-pin",
    "term": "Whisper Pin",
    "group": "world",
    "origin": "invented",
    "definition": "A small wearable communications device capable of translating spoken language and supporting digital communication."
  }
];
