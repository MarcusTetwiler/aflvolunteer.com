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

Elena's view of the Front Map sits on a **real geographic basemap** —
actual Poland/Ukraine/Belarus/western-Russia country borders, rivers, and
reference cities, sourced from Natural Earth's public-domain data and
pre-processed into `src/data/theaterMap.json` (see
`geodata-pipeline/README.md` for how to regenerate it). The front line,
territory control fill, and all story locations (Camp Tadeusz, Lublin,
Rzeszów, Lviv, Zalissia, Kyiv, Odesa, Moscow) are fictional and hand-placed
on top of that real geography, using the same lat/lon → SVG projection the
basemap was built with — so they land at geographically honest positions,
not just plausible-looking ones. London falls genuinely off-canvas at true
scale (it's ~1,450km west of this map's frame), so it's shown as an edge
tab rather than compressed onto the map at a fake position.

**If you move a pin or change the map's bounding box**, re-check it against
the front line — `FrontMap.jsx` has a comment documenting which side of the
line every pin needs to stay on, but the curve only protects pins at the
coordinates it was actually verified against.

## Elena / Andrew toggle

The map has two POVs, switched via the toggle above the frame:

- **Elena** — the operational map described above.
- **Andrew** — a completely different visual system: a dark, numerous
  field of ~54 procedurally generated drone-contract markers (sector codes
  like `NX-847`, classified Talon/broadcast or Private, status
  Closed/Interrupted), reflecting that Andrew's pre-deployment world is a
  contract ledger, not a place. Generated in `andrewContracts.js` with a
  fixed random seed, so positions/codes are stable across reloads rather
  than reshuffling. Deliberately contains no character names or references
  to Elena — the two POVs don't leak into each other.

