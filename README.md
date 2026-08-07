# AFL Site

Front door for *The American Foreign Legion*. The book is published: visitors
explore The Front, read the first two chapters free behind a light email gate,
buy on Amazon, and can click through to a set of philanthropic organizations.

> The early-reader / Redline program is **retired**. The `CtaSection` and
> `FeatureStory` components that drove it have been removed. Existing signups
> are still in Redis under `volunteers:all`.

## Before launch: `BOOK.available`

The Amazon listing isn't live yet, so `BOOK.available` is set to `false` in
`src/site.config.js`. While it's false, no Amazon link renders anywhere — the
buy button becomes inert "Coming soon" text, the nav button and sticky mobile
bar point at the free sample instead, and the end-of-sample CTA becomes a
promise to email rather than a link.

**When the listing goes live:** paste the URL into `BOOK.amazonUrl` and flip
`available` to `true`. That's the whole launch checklist — every CTA turns on
at once.

## Editing content

**Almost everything you'll want to change lives in `src/site.config.js`** —
the Amazon link, cover image path, book blurb, nav labels, contact emails, and
the philanthropy organizations. Chapter text lives in `src/data/chapters.js`.
You shouldn't need to open a component to update copy.

## Stack

- Vite + React (single page, anchor-scroll tabs — no router)
- Vercel serverless function at `/api/volunteer` for email capture
- Upstash Redis (via Vercel Marketplace) for storage

## Structure

```
src/
  site.config.js         ← EDIT THIS: links, book details, orgs, nav
  data/
    chapters.js          ← EDIT THIS: free sample chapter text
  components/
    Nav.jsx              sticky tab bar with scroll-spy
    Hero.jsx             The Front — the map
    FrontMap.jsx         interactive briefing map (Elena/Andrew POV toggle)
    IntroContext.jsx     Article 5 / occupation copy + field art
    ReadSection.jsx      email gate -> in-browser sample reader
    BuySection.jsx       cover, blurb, Amazon CTA
    AuthorSection.jsx    bio + optional portrait
    ContributeSection.jsx  philanthropy click-throughs
    Footer.jsx
api/
  volunteer.js           POST handler, writes to Upstash via REST API
public/images/
  hero-watercolor.jpg    full art (Intro/Context section)
  cta-watercolor.jpg     cropped art
  cover.jpg              ← ADD THIS: book cover (2:3 ratio)
  author.jpg             ← OPTIONAL: author portrait (none by default)
```

## The email gate is not protection

The sample chapters ship inside the public JS bundle. Anyone who wants the text
without giving an email can read it out of the bundle. This is deliberate — for
a two-chapter sample the gate is a courtesy prompt, not DRM. If you ever need a
real gate, move the text to an `/api/chapters` route that checks for a signup
token before returning anything.

Note also that Amazon KDP Select exclusivity caps how much of the book you may
post on your own site (roughly 10%). Check two chapters against that limit.

## Signup storage

Every submission writes three things to Redis:

- `volunteer:<email>` — a hash (idempotent, re-signups overwrite cleanly)
- `volunteers:all` — chronological list of every signup
- `volunteers:<list>` — per-funnel list, e.g. `volunteers:sample-chapters`

The `list` field is what keeps the sample-chapter audience separable from the
retired early-reader list already sitting in the same database.

Storage failures are **soft** — `api/volunteer.js` returns 200 and the reader
still gets the sample. A config problem should never cost you the read.

## Deploying

Same as before: upload the folder to GitHub (web UI drag-and-drop is fine),
Vercel auto-detects the Vite preset, and `KV_REST_API_URL` / `KV_REST_API_TOKEN`
inject from the Upstash integration. **Redeploy after connecting storage** —
env vars only reach new builds.

## Migrating to Beehiiv later

`volunteers:all` is a Redis list of JSON strings (`{name, email, source,
createdAt}`), and `volunteer:<email>` is a hash with the same fields. To
move to Beehiiv:

- **Bulk migration**: pull everything off `volunteers:all` (`LRANGE
  volunteers:all 0 -1`) and import as a CSV, or
- **Live sync going forward**: add a `fetch` call to Beehiiv's subscribe
  endpoint inside `api/volunteer.js`, right alongside the Upstash write —
  the frontend doesn't need to change either way.

## MVP scope notes

The Front Map is intentionally static for v1: hand-placed pins with
hover/click tooltips, no toggleable layers (Drone Activity, Known/Unknown
Signals, etc.). The data model (`LOCATIONS` array in `FrontMap.jsx`) is
already shaped so layers could be added later by tagging each location and
filtering, without a rebuild.

## The map itself

Elena's view of the Front Map sits on a **real geographic basemap** — a
continental view of Europe and western Russia (Atlantic coast to Moscow,
Scandinavia to the Mediterranean), sourced from Natural Earth's
public-domain data and pre-processed into `src/data/theaterMap.json` (see
`geodata-pipeline/README.md` for how to regenerate it). The Poland/Ukraine
theater is a hot zone inside that much larger map, not the entire frame —
the war is one churning piece of something bigger, which is also why
London is a real on-canvas pin now instead of an off-map edge tab.

The front itself isn't a single clean line. It's a main boundary curve
plus several hand-authored organic "salient" and "pocket" blobs that bulge
across it in both directions — a held pocket stranded inside occupied
territory, an occupied salient pushing west — meant to read as fluid and
contested rather than a tidy coastline. All story locations (Camp Tadeusz,
Lublin, Rzeszów, Lviv, Zalissia, Kyiv, Odesa, Moscow, London) are fictional
and hand-placed on top of that real geography, using the same lat/lon →
SVG projection the basemap was built with, so they land at geographically
honest positions. Lublin/Rzeszów/Medyka/Lviv sit close enough together in
reality (~45px apart at this zoom) that they're shown as a single focus
ring with one external callout rather than four crowded individual labels
— each pin is still its own hoverable/clickable target underneath.

**If you move a pin or change the map's bounding box**, re-check it against
the front boundary and every salient blob — `FrontMap.jsx` has comments
documenting which side of the line every pin needs to stay on, but none of
that geometry self-corrects; it only protects pins at the coordinates it
was actually verified against (see `geodata-pipeline/README.md` for the
verification approach).

## Elena / Andrew toggle

The map has two POVs, switched via the toggle above the frame, and both
render the **same underlying geography** — `TheaterBasemap` is one
component used by both, themed via a `variant` prop (`"light"` for Elena,
`"dark"` for Andrew). This matters: toggling should read as one world seen
two ways, not two unrelated screens.

- **Elena** — the operational map described above.
- **Andrew** — the same countries, rivers, and projection, recolored dark
  (faint amber land fills, muted river glow) instead of replaced with an
  abstract background. Layered on top: ~130 procedurally generated
  drone-contract markers (sector codes like `NX-847`, classified
  Talon/broadcast or Private — shown via dot color — and
  Closed/Interrupted status — shown via a ring around the dot, since
  classification and status are independent axes on the same contract and
  both need to be visible at once). Generated in `andrewContracts.js` with
  a fixed random seed, so positions/codes are stable across reloads. Every
  contract sits on actual land, sampled from `src/data/landPoints.json` (a
  precomputed grid of points inside the real country polygons — see
  `geodata-pipeline/README.md` for how it's built), not scattered freely
  across the canvas including open ocean. Deliberately contains no
  character names or references to Elena — the two POVs don't leak into
  each other, only the geography is shared.

