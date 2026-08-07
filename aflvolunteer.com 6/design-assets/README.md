# Design assets — not deployed

Full-resolution masters. Everything in `public/` ships to the browser whether
it's referenced or not, so the unoptimized originals live here instead.

- `hero-watercolor.jpg` — 1036×1536, 716 kB
- `cta-watercolor.jpg` — 1036×636, 219 kB

The site serves derivatives generated from these: AVIF, WebP and JPEG at 1036,
768 and 480 px wide, plus `og.jpg` for social sharing. To regenerate after
changing a master, run `npm run images`.
