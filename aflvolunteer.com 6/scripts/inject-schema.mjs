// Postbuild: inject glossary structured data into dist/index.html.
//
// Why a build step rather than a <script> tag in the React component: JSON-LD
// rendered client-side depends on the crawler executing JS before it reads the
// markup. Injecting at build time means the finished HTML already contains it,
// so it's there on first fetch with no rendering required.
//
// Generated from src/data/glossary.js so there's one source of truth — a
// hand-maintained copy in index.html would drift the first time a term changed.
//
// Schema: DefinedTermSet + DefinedTerm, which is what Google documents for
// glossaries. This does not make the page rank for "what is NATO"; it helps
// search engines understand what the page is, which is a different and more
// achievable thing.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = resolve(root, 'dist/index.html');

const SITE = 'https://aflvolunteer-com.vercel.app';

const { GLOSSARY } = await import(
  pathToFileURL(resolve(root, 'src/data/glossary.js')).href
);

const schema = {
  '@context': 'https://schema.org',
  '@type': 'DefinedTermSet',
  '@id': `${SITE}/#glossary`,
  name: 'The American Foreign Legion — Glossary',
  description:
    'Spoiler-free definitions of drone-warfare, geopolitical, and invented ' +
    'terms appearing in the novel The American Foreign Legion.',
  url: `${SITE}/#glossary`,
  hasDefinedTerm: GLOSSARY.map((entry) => ({
    '@type': 'DefinedTerm',
    '@id': `${SITE}/#g-${entry.id}`,
    name: entry.term,
    description: entry.definition,
    url: `${SITE}/#g-${entry.id}`,
  })),
};

const book = {
  '@context': 'https://schema.org',
  '@type': 'Book',
  name: 'The American Foreign Legion',
  author: { '@type': 'Person', name: 'Marcus Tetwiler' },
  url: `${SITE}/`,
  image: `${SITE}/images/og.jpg`,
  genre: ['War fiction', 'Literary fiction', 'Speculative fiction'],
};

let html = readFileSync(htmlPath, 'utf8');

if (html.includes('DefinedTermSet')) {
  console.log('inject-schema: already present, skipping');
  process.exit(0);
}

const tags =
  `<script type="application/ld+json">${JSON.stringify(book)}</script>` +
  `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;

if (!html.includes('</head>')) {
  console.error('inject-schema: no </head> found in dist/index.html');
  process.exit(1);
}

html = html.replace('</head>', `${tags}</head>`);
writeFileSync(htmlPath, html);

console.log(
  `inject-schema: added Book + DefinedTermSet (${GLOSSARY.length} terms) to dist/index.html`
);
