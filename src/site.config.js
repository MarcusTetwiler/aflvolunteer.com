// ─────────────────────────────────────────────────────────────────────────────
//  SITE CONFIG — everything you need to edit lives in this one file.
//  No other file should need touching to update links, orgs, or book details.
// ─────────────────────────────────────────────────────────────────────────────

export const BOOK = {
  title: 'The American Foreign Legion',
  // Flip to true once the Amazon listing is live. While false, every buy
  // button renders as non-clickable "Coming soon" text instead of a dead link,
  // and the nav button points at the free sample instead.
  available: false,
  // TODO: paste the real Amazon product URL (or https://www.amazon.com/dp/<ASIN>)
  amazonUrl: 'https://www.amazon.com/dp/REPLACE_WITH_ASIN',
  // Shown in place of the buy buttons while `available` is false.
  comingSoonLabel: 'Coming soon',
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
    'Russia crossed into Poland and America stayed home. What crossed the ' +
    'border instead was a volunteer army with no flag, no legal standing, and ' +
    'nothing to fall back on but each other.',
};

// ─────────────────────────────────────────────────────────────────────────────
//  FREE SAMPLE
//  Which chapters unlock behind the email gate. Text lives in src/data/chapters.js
// ─────────────────────────────────────────────────────────────────────────────

export const SAMPLE = {
  headline: 'Read the opening',
  sub:
    'The prologue and the first chapter, free, in your browser. No download, ' +
    'no newsletter, no drip sequence. Leave an email and the sample opens ' +
    'below.',
  // Text of the unlock button.
  cta: 'Read the prologue and chapter one',
};

// ─────────────────────────────────────────────────────────────────────────────
//  THE BUILD WALL
//  Featured builds live in src/data/buildWall.js. Nothing renders without a
//  recorded permission grant.
// ─────────────────────────────────────────────────────────────────────────────

export const WALL = {
  eyebrow: 'The Build Wall',
  headline: 'Real builds, real benches.',
  sub:
    'The novel opens on a girl assembling a drone at her kitchen table from ' +
    'resin, regrind, and salvaged cells. People actually do this. These are ' +
    'their builds, featured with permission and credited to them.',
  emptyCopy:
    'The wall is just getting started. If you build your own, we would like to ' +
    'put it here \u2014 full credit, link back to you, and you keep every right ' +
    'you had before.',
  submitCta: 'Submit a build',
  submitEmail: 'wall@theamericanforeignlegion.com',
  submitSubject: 'Build Wall submission',
  creditNote:
    'Every image here is published with its maker\u2019s permission and remains ' +
    'theirs. Names link back to the builder. If you are featured and want your ' +
    'build removed, email us and it comes down.',
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
    'Marcus Tetwiler is a first-time novelist and lives in the San Francisco ' +
      'Bay Area with his wife, Molly, and their black Labrador, Frances. A ' +
      'Kansas native, Marcus studied history and English at the University of ' +
      'Kansas before beginning a career in technology, where he has spent the ' +
      'past decade working with innovative software companies.',
    'He looks forward to hearing from readers and continuing the story in ' +
      'future books.',
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
    'These five organizations work the ground the novel only imagines \u2014 ' +
    'frontline medicine, demining, evacuation, and the local groups who were ' +
    'there first. Links go directly to them. Nothing is collected here, and no ' +
    'part of any donation passes through this site.',
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
  { href: '#buy', label: 'Buy' },
  { href: '#author', label: 'Author' },
  { href: '#contribute', label: 'Contribute' },
];

export const CONTACT_EMAILS = [
  { label: 'Media Inquiries', address: 'media@theamericanforeignlegion.com' },
  { label: 'Partner Inquiries', address: 'partners@theamericanforeignlegion.com' },
  { label: 'Support Inquiries', address: 'support@theamericanforeignlegion.com' },
];
