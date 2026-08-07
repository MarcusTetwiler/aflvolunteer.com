// ─────────────────────────────────────────────────────────────────────────────
//  SITE CONFIG — everything you need to edit lives in this one file.
//  No other file should need touching to update links, orgs, or book details.
// ─────────────────────────────────────────────────────────────────────────────

export const BOOK = {
  title: 'The American Foreign Legion',
  // Flip to true once the Amazon listing is live. While false, no Amazon link
  // renders anywhere: the buy button becomes `comingSoonLabel` and scrolls to
  // the email capture instead, and the nav button points at the free sample.
  available: false,
  // TODO: paste the real Amazon product URL (or https://www.amazon.com/dp/<ASIN>)
  amazonUrl: 'https://www.amazon.com/dp/REPLACE_WITH_ASIN',
  // Shown in place of the buy buttons while `available` is false.
  comingSoonLabel: 'Notify me at launch',
  // Optional secondary retailers. Delete any you don't use — the row hides itself
  // when the array is empty.
  otherRetailers: [
    // { label: 'Kindle', url: '' },
    // { label: 'Audiobook', url: '' },
  ],
  // TODO: drop a cover image at public/images/cover.jpg and leave this as-is,
  // or set to null to render the typographic fallback cover instead.
  coverImage: '/images/cover.jpg',
  formats: 'Paperback · Kindle',
  pageCount: null, // e.g. 312 — set to null to hide
  blurb:
    'Russia crossed into Poland and America stayed home. Americans ' +
      'went anyway, entering a war where drones have become weather ' +
      'and institutions capable of measuring everyone are no longer ' +
      'capable of protecting anyone.',
};

// ─────────────────────────────────────────────────────────────────────────────
//  FREE SAMPLE
//  Which chapters unlock behind the email gate. Text lives in src/data/chapters.js
// ─────────────────────────────────────────────────────────────────────────────

export const SAMPLE = {
  headline: 'Read the opening',
  sub:
    'Read the prologue and Chapter One free in your browser. Enter ' +
      'your email and the sample opens immediately below.',
  // Text of the unlock button.
  cta: 'Read the prologue and Chapter One',
};

// ─────────────────────────────────────────────────────────────────────────────
//  THE BUILD WALL
//  Featured builds live in src/data/buildWall.js. Nothing renders without a
//  recorded permission grant.
// ─────────────────────────────────────────────────────────────────────────────

export const WALL = {
  eyebrow: 'The Build Wall',
  headline: 'Built on real benches.',
  sub:
    'The novel opens with a girl building a drone at her kitchen ' +
      'table from resin, regrind, salvaged cells, and parts that ' +
      'refuse to fit the first time. Makers are already doing ' +
      'versions of this in the real world. These are their builds, ' +
      'shared with permission and credited to them.',
  emptyCopy:
    'The wall is just getting started. Built something worth ' +
      'showing? Send it in. You keep the rights; the site gives you ' +
      'full credit and a link back.',
  submitCta: 'Submit a build',
  submitEmail: 'wall@theamericanforeignlegion.com',
  submitSubject: 'Build Wall submission',
  creditNote:
    'Every image here is published with its maker\u2019s permission and remains ' +
    'theirs. Names link back to the builder. If you are featured and want your ' +
    'build removed, email us and it comes down.',
};

// ─────────────────────────────────────────────────────────────────────────────
//  GLOSSARY
//  Terms live in src/data/glossary.js.
// ─────────────────────────────────────────────────────────────────────────────

export const GLOSSARY_INTRO = {
  eyebrow: 'Glossary',
  headline: 'How much of this world already exists?',
  sub:
    'Fifty spoiler-free terms from the novel, marked so you can ' +
      'separate real technology, history, and geography from what the' +
      ' book invents. Most of it is real. That is the uncomfortable ' +
      'part.',
  footnote:
    'Every definition is spoiler-free. Each term can also be linked' +
      ' directly using its glossary URL.',
};

// ─────────────────────────────────────────────────────────────────────────────
//  AUTHOR
//  Photo is optional. Leave `photo` as null and the section renders text-only
//  rather than showing an empty frame.
// ─────────────────────────────────────────────────────────────────────────────

export const AUTHOR = {
  name: 'Marcus Tetwiler',
  // No portrait by design. If you ever want one, drop a 4:5 crop at
  // public/images/author.jpg and set this to '/images/author.jpg'; the layout
  // switches to two columns on its own. Left null, no image column renders.
  photo: null,
  // Occurrences of BOOK.title in these paragraphs render in italics automatically.
  bio: [
    'Marcus Tetwiler is a first-time novelist from Kansas who lives' +
      ' in the San Francisco Bay Area with his wife, Molly, and their' +
      ' black Labrador, Frances. He studied history and English at ' +
      'the University of Kansas and has spent the past decade working' +
      ' in technology startups.',
    'The American Foreign Legion is his first novel.',
  ],
  // Set to null to hide the contact line.
  contactEmail: 'support@theamericanforeignlegion.com',
  contactLabel: 'Write to Marcus',
};

// ─────────────────────────────────────────────────────────────────────────────
//  CONTRIBUTE
//  TODO: replace these five placeholders with your actual organizations.
//  Every field is required except `focus`.
// ─────────────────────────────────────────────────────────────────────────────

export const CAUSES_INTRO = {
  eyebrow: 'Contribute',
  headline: 'The war in this book is invented. The one it borrows from is not.',
  sub:
    'The war in this book is fictional. These organizations work in' +
      ' the real one, supporting medicine, demining, evacuation, ' +
      'logistics, and local Ukrainian capacity. Links go directly to ' +
      'them; this site does not collect or process donations.',
};

export const CAUSES = [
  {
    id: 'united24',
    name: 'UNITED24',
    focus: 'Official state platform',
    url: 'https://u24.gov.ua/',
    blurb:
      'Ukraine\u2019s official fundraising platform, launched by the president in ' +
      '2022. Donors pick a direction \u2014 medical aid, humanitarian demining, ' +
      'rebuilding, education, or defense \u2014 and funds route through the ' +
      'National Bank of Ukraine to the relevant ministry. Reports are published ' +
      'weekly and audited by Deloitte and BDO.',
  },
  {
    id: 'razom',
    name: 'Razom for Ukraine',
    focus: 'Local capacity',
    url: 'https://www.razomforukraine.org/',
    blurb:
      'A US-based nonprofit founded in 2014, before the full-scale invasion. ' +
      'Razom means \u201ctogether.\u201d The work runs from tactical medicine and ' +
      'mobile stabilization points at the front to psychological counseling and ' +
      'STEM programs for Ukrainian kids \u2014 emergency and long-haul at once.',
  },
  {
    id: 'bluecheck',
    name: 'BlueCheck Ukraine',
    focus: 'Grassroots funding',
    url: 'https://www.bluecheck.in/',
    blurb:
      'Local Ukrainian groups do most of the frontline humanitarian work and ' +
      'receive a sliver of direct international funding. BlueCheck exists to ' +
      'close that gap: it vets small NGOs with pro-bono due diligence from Ropes ' +
      '& Gray and Integrity Risk International, then moves money to them fast. ' +
      'Ninety cents of every dollar reaches the ground.',
  },
  {
    id: 'direct-relief',
    name: 'Direct Relief',
    focus: 'Medical supply chain',
    url: 'https://www.directrelief.org/place/ukraine/',
    blurb:
      'Unglamorous logistics at enormous scale \u2014 insulin, chemotherapy drugs, ' +
      'oxygen concentrators, backup power so hospital emergency rooms keep ' +
      'running through blackouts. Direct Relief takes no government funding and ' +
      'has delivered over $2.2 billion in aid to Ukraine. Donations marked for ' +
      'Ukraine stay with the Ukraine response.',
  },
  {
    id: 'msf',
    name: 'Doctors Without Borders',
    focus: 'Frontline medicine',
    url: 'https://www.doctorswithoutborders.org/what-we-do/where-we-work/ukraine',
    blurb:
      'MSF runs mobile clinics, ambulance referrals, and surgical support along ' +
      'a frontline more than a thousand kilometers long, plus trauma ' +
      'rehabilitation and mental health care further back. They also document ' +
      'what happens to hospitals: their 2026 report \u201cNo Safe Place to Heal\u201d ' +
      'catalogs attacks on Ukrainian medical facilities and staff.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  NAV
// ─────────────────────────────────────────────────────────────────────────────

export const NAV_LINKS = [
  { href: '#front', label: 'The Front' },
  { href: '#read', label: 'Read' },
  { href: '#wall', label: 'Builds' },
  { href: '#glossary', label: 'Glossary' },
  { href: '#buy', label: 'Buy' },
  { href: '#contribute', label: 'Contribute' },
];

export const CONTACT_EMAILS = [
  { label: 'Media Inquiries', address: 'media@theamericanforeignlegion.com' },
  { label: 'Partner Inquiries', address: 'partners@theamericanforeignlegion.com' },
  { label: 'Support Inquiries', address: 'support@theamericanforeignlegion.com' },
];
