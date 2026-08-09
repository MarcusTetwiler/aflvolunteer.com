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
    mapAtlas.js          GENERATED — do not hand-edit (npm run atlas)
    chapters.js          ← EDIT THIS: free sample chapter text
    buildWall.js         ← EDIT THIS: featured builds + permission records
    glossary.js          ← EDIT THIS: 50 spoiler-free term definitions
  components/
    Nav.jsx              sticky tab bar with scroll-spy
    Hero.jsx             The Front — the map
    FrontMap.jsx         interactive briefing map (Elena/Andrew POV toggle)
    IntroContext.jsx     Article 5 / occupation copy + field art
    ReadSection.jsx      email gate -> in-browser sample reader
    BuildWall.jsx        homemade-drone builds, permission-gated
    Glossary.jsx         50 terms, live search + Real/invented filters
    BuySection.jsx       cover, blurb, Amazon CTA
    AuthorSection.jsx    bio + optional portrait
    ContributeSection.jsx  philanthropy click-throughs
    Footer.jsx
api/
  _shared.js             Redis pipeline, unsubscribe tokens, validation
  volunteer.js           POST handler; consent record + optional ESP sync
  unsubscribe.js         one-click opt-out, returns a styled confirmation page
  export.js              key-protected CSV export
scripts/
  qa-responsive.py       repeatable responsive QA sweep (npm run qa)
  generate-map-atlas.py  regenerates src/data/mapAtlas.js from lat/lon
  generate-images.py     regenerates responsive derivatives + og.jpg
  inject-schema.mjs      postbuild: JSON-LD into dist/index.html
design-assets/           full-res masters (NOT deployed)
public/images/
  hero-watercolor-*.{avif,webp,jpg}   Intro/Context background, 3 widths
  cta-watercolor-*.{avif,webp,jpg}    Buy section background, 3 widths
  og.jpg                              1200x630 social share card
  cover.jpg              cover fallback (600x900)
  cover-{300,600,900}.{avif,webp,jpg}   responsive cover, 3 widths
  author.jpg             ← OPTIONAL: author portrait (none by default)
```

## Responsive QA

```
npm run build && npm run qa              # check, print a table
python3 scripts/qa-responsive.py --shots out/   # also save screenshots
```

Checks 320/375/390/430/768/1024/1440px for horizontal overflow, failed
requests, console errors, text below a legible floor, tap targets below the
comfort floor, sticky-CTA height vs reserved body padding, and the glossary
control block. Exits non-zero on failure, so it can gate CI.

Requires `pip install playwright && python3 -m playwright install chromium`.

Two request failures are filtered as known-benign: `/_vercel/insights/*`
(injected only on deployed Vercel builds) and `fonts.googleapis.com` (blocked in
sandboxed environments).

## Design tokens

`src/index.css` holds the shared system. Prefer these over per-section media
queries:

- `--gutter` — page inset: 28px desktop, 20px ≤640px, 16px ≤380px
- `--control-h`, `--control-pad-x`, `--control-fs`, `--touch` — button sizing
- `--input-fs` — **16px**; anything smaller makes iOS Safari zoom on focus
- `--sticky-cta-h` — published at runtime by the sticky CTA; body padding reads
  it so the two can't drift
- `--burnt-ink`, `--khaki-ink` — accessible text variants. `--burnt` and
  `--khaki` measure 2.93:1 and 3.10:1 on paper, below the 4.5:1 WCAG AA
  threshold, so they are for fills, rules and large display type only. Use the
  `-ink` variants for body-size text and below.

`.btn` / `.btn--primary` / `.btn--secondary` / `.btn--block` normalise every CTA.

## The map

`FrontMap.jsx` renders a worldbuilding artifact, not a route map. 13 pins,
4 linear features, and 6 regional overlays across four toggleable layers:
Places, Terrain, Military Geography, Infrastructure.

**Spoiler rule.** Every entry describes what a cartographer inside this world
could legitimately draw — geography, infrastructure, civic and military
function. Nothing describes what happens somewhere, what is hidden there, or
what a character finds. There are deliberately **no character routes**: a route
reveals narrative sequence. The whole map can be read before Chapter 1 without
learning anything about the plot.

Features marked `origin: 'fictional'` show a "Does not exist. Created for the
novel." note in their brief card — same real-vs-invented distinction the
glossary makes.

**Coordinates are generated, never hand-placed.** Edit lat/lon in
`scripts/generate-map-atlas.py` and run `npm run atlas`. The projection is:

```
x = (lon + 11.0) / 59.0 * 1000      // lon  -11.0E .. 48.0E
y = -26.1028 * lat + 1732.06        // lat  66.36N (y=0) .. 32.64N (y=880)
```

Solved against the eight real-place pins to 0.19px. An earlier comment in
`FrontMap.jsx` claimed the latitude bounds were 35–64N; they are not, and using
those puts a pin ~65px out — enough to land Lublin in Slovakia.

Label positions (`labelDx`/`labelDy`/`labelAnchor` on pins, `labelAt` and
`shortLabel` on areas) are hand-tuned because centroid placement collided
badly — text ran off the canvas and sat on top of the rail line. If you add
features, render and *look* at the result before shipping.

**Global Context** (Strait of Hormuz, Taiwan Strait, Cape of Good Hope,
California) is not implemented. Those coordinates fall far outside the canvas —
Taiwan is more than twice the canvas width away — so they need a separate
world view or inset, not a layer toggle.

## Glossary

Fifty spoiler-free definitions in `src/data/glossary.js`, rendered as one
section with live search and filters. Each term carries an `origin` of `real`
or `invented` and shows a badge, so readers can tell what already exists from
what was built for the book.

Every term has an anchor: `/#g-screamer-drone` links straight to it. Useful for
social posts without needing a page per definition.

**Why one section and not 50 pages.** Fifty pages each carrying a two-sentence
definition is the thin, scaled-content pattern Google's spam policies target,
and the penalty risk is sitewide rather than limited to those pages. Separate
pages only make sense with 400+ words of original substance each.

**Realistic SEO expectations.** Head terms here ("what is NATO", "drone
warfare", "electronic warfare") are owned by Wikipedia, Britannica, and defense
institutions; a new domain will not outrank them. The invented terms
("Screamer Drone", "Camp Tadeusz") have no competition but no search volume
either — until people read the book, at which point they search the terms and
you own those results. The winnable middle is niche-but-real: fiber-optic drone,
anti-drone netting, Kotwica, Mazepynka.

`scripts/inject-schema.mjs` runs after `vite build` and injects `Book` and
`DefinedTermSet` JSON-LD into `dist/index.html`, generated from the glossary
data so it can't drift. Build-time rather than client-side, so crawlers get it
without executing JS.

**For SEM:** point paid traffic at the free sample, not at the glossary.
Definition pages convert badly.

## The Build Wall

A wall of real homemade drone builds, featured with permission. It doubles as
lead generation: someone who builds drones is the target reader. See
**OUTREACH.md** for the DM templates and workflow.

`PUBLISHABLE_BUILDS` in `src/data/buildWall.js` filters out any entry whose
`permission.granted` is not exactly `true`, so an unlicensed or half-finished
entry cannot render. Screenshots of each grant go in `permissions/`, which is
git-ignored — back them up somewhere else too.

**Ask before you publish.** Posting first and asking after turns a friendly
request into written evidence of infringement, and the audience you're courting
is exactly the audience that would notice.

With no entries the section renders a deliberate empty state with a submit CTA,
which reads as new rather than broken. From four builds up, the first tile runs
full width (21:9) and the rest form a denser grid — 3 columns, 4 above 1100px,
and **2 columns on mobile**, because ten phone-width images stacked is ten
screens of scrolling.

Each entry has a stable anchor: `/#build-<id>`. Landing on one scrolls to it and
outlines it briefly. Every tile carries a Share control that uses the native
share sheet where available and falls back to clipboard — a featured builder
sharing their own feature is the growth loop.

### Inbound submissions

`POST /api/build-submission` queues to `submissions:pending`. **Nothing is
published from it.** A form checkbox is a claim; the screenshot in
`permissions/` is the proof, and `PUBLISHABLE_BUILDS` still requires
`permission.granted === true` set by hand. An inbound submission is *better*
consent evidence than cold outreach, but a person still reads it first.

The form asks for links, not uploads — less work for the builder, and the site
never hosts someone's file before a human has looked at it. It also asks
under-18s not to submit.

## The email gate is not protection

The sample chapters ship inside the public JS bundle. Anyone who wants the text
without giving an email can read it out of the bundle. This is deliberate — for
a two-chapter sample the gate is a courtesy prompt, not DRM. If you ever need a
real gate, move the text to an `/api/chapters` route that checks for a signup
token before returning anything.

Note also that Amazon KDP Select exclusivity caps how much of the book you may
post on your own site (roughly 10%). Check two chapters against that limit.

## Email list

Signups write to Upstash Redis:

| Key | What |
| --- | --- |
| `volunteer:<email>` | Hash per person, incl. consent IP/UA and unsubscribe token |
| `volunteers:all` | Chronological list of every signup |
| `volunteers:<list>` | Per-funnel list, e.g. `volunteers:sample-chapters` |
| `volunteers:unsubscribed` | Set of opted-out addresses |

Storage failures are **soft** — `api/volunteer.js` returns 200 and the reader
still gets the sample. A config problem should never cost you the read.

An address in `volunteers:unsubscribed` is **never silently resurrected** by a
later signup. Re-subscribing has to be deliberate.

### Endpoints

- `POST /api/volunteer` — capture a signup
- `POST /api/build-submission` — inbound Build Wall submission (queued, never published)
- `GET|POST /api/unsubscribe?email=…&token=…` — one-click opt-out, no login
- `GET /api/export?key=…` — CSV of the list, incl. per-person unsubscribe URLs

```
curl "https://YOUR-DOMAIN/api/export?key=YOUR_KEY" -o volunteers.csv
curl "https://YOUR-DOMAIN/api/export?key=YOUR_KEY&kind=submissions" -o builds.csv
```

Add `&list=sample-chapters` to export a single funnel.

Both write endpoints carry a honeypot field and a per-IP fixed-window rate limit
(12/hour signups, 5/hour submissions). The limiter **fails open** if Redis is
unreachable: an outage should not take the signup form down. Spam is the cheaper
failure.

### Before you send your first email

CAN-SPAM requires a working opt-out in every commercial message, honored within
ten business days. `/api/unsubscribe` is that mechanism. Include both headers so
Gmail and Yahoo render a native unsubscribe button:

```
List-Unsubscribe: <https://YOUR-DOMAIN/api/unsubscribe?email=…&token=…>
List-Unsubscribe-Post: List-Unsubscribe=One-Click
```

The `unsubscribe_url` column in the CSV export is already built per subscriber —
merge it into your sends.

**This site cannot send email.** It captures addresses and can hand them to an
ESP; nothing here delivers a message. Set `BEEHIIV_API_KEY` and
`BEEHIIV_PUBLICATION_ID` and every signup forwards to Beehiiv automatically
(the code no-ops when they're absent). Until you connect an ESP, the launch
announcement is a manual export away.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `KV_REST_API_URL` | yes | Upstash, injected by the Vercel integration |
| `KV_REST_API_TOKEN` | yes | Upstash, injected by the Vercel integration |
| `UNSUBSCRIBE_SECRET` | recommended | Signs unsubscribe links. Falls back to the Redis token, but rotating Redis credentials would then break every link already in someone's inbox |
| `EXPORT_KEY` | for export | Long random string. Without it `/api/export` refuses to run rather than exposing the list |
| `BEEHIIV_API_KEY` | optional | Enables ESP sync |
| `BEEHIIV_PUBLICATION_ID` | optional | Enables ESP sync |

**Redeploy after changing env vars** — they only reach new builds.

## Images

Masters live in `design-assets/` and are **not** deployed; everything in
`public/` ships whether referenced or not. The site serves AVIF/WebP/JPEG at
1036, 768 and 480 px via CSS `image-set()`, plus `og.jpg` for social sharing.

```
pip install Pillow pillow-avif-plugin
npm run images
```

The hero went from a single 716 kB JPEG to 40 kB of AVIF on a phone. The cover
is served as a `<picture>` with AVIF/WebP/JPEG at 300, 600 and 900 px — a phone
downloads 18 kB rather than the 2.6 MB master.

## Analytics

`@vercel/analytics` and `@vercel/speed-insights` are mounted in `App.jsx`.
Custom funnel events live in `src/analytics.js`: `sample_unlocked`,
`chapter_viewed`, `sample_finished`, `buy_clicked` (tagged by location), and
`cause_clicked`.

Pageviews and Speed Insights work on any plan. **Custom events require Vercel
Pro** — on Hobby they silently no-op, so the funnel numbers won't appear.

## Deploying

Upload the folder to GitHub (web UI drag-and-drop is fine); Vercel auto-detects
the Vite preset and builds.
