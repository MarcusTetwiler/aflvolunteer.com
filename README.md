# AFL Volunteer Site

Email-gated front door for *The American Foreign Legion*. Visitors explore
The Front, see the manuscript is real and active, and volunteer with their
name + email — which immediately opens **Redline**
(`https://redline-afl.vercel.app/`) in a new tab. No waiting screen, no
newsletter framing.

## Stack

- Vite + React (no router needed — single page)
- Vercel serverless function at `/api/volunteer` for email capture
- Upstash Redis (via Vercel Marketplace) for storage

## Structure

```
src/
  components/
    Hero.jsx            The Front — map, headline, dek
    FrontMap.jsx         interactive briefing map (static MVP: pins + tooltips)
    IntroContext.jsx     Article 5 / occupation copy + field art
    FeatureStory.jsx     "what you get" + Redline preview panel
    CtaSection.jsx       volunteer form -> Upstash -> redirect to Redline
    Footer.jsx
api/
  volunteer.js           POST handler, writes to Upstash via REST API
public/images/
  hero-watercolor.jpg    full art (Intro/Context section)
  cta-watercolor.jpg     cropped art (CTA section)
```

## Deploying

### 1. Push to GitHub

Create a new repo and upload this whole folder (GitHub web UI drag-and-drop
works fine, same as the Redline deploy) — or via git:

```bash
git init
git add .
git commit -m "AFL volunteer site"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Import into Vercel

Vercel → Add New → Project → import the GitHub repo. Framework preset
should auto-detect as Vite. No build settings need to change.

### 3. Connect Upstash Redis

Same as Redline's setup:

1. In the Vercel project → **Storage** tab → **Marketplace Database** → add
   an **Upstash** Redis database (or connect your existing one if you want
   both sites sharing storage — recommended if you'd rather keep one
   volunteer list).
2. Use the `KV` env var prefix so it produces `KV_REST_API_URL` and
   `KV_REST_API_TOKEN` — `api/volunteer.js` reads those directly.
3. **Redeploy** after connecting storage — env vars only inject into new
   builds, not the one that already ran.

### 4. Verify

Submit the form once. Two things should happen:
- A new browser tab opens to `redline-afl.vercel.app`
- In Upstash's data browser, you should see a `volunteer:<email>` hash and
  an entry pushed onto the `volunteers:all` list

If Upstash isn't wired yet, the form still works and still opens Redline —
`api/volunteer.js` fails soft so a storage hiccup never blocks the reward.

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

