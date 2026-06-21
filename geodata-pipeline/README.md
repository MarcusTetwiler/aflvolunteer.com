# Geodata pipeline

Generates `src/data/theaterMap.json` — the real-world geography (country
borders, rivers, reference cities) used as the basemap under Elena's view of
the Front Map.

Source: Natural Earth's public-domain 1:50m vector data
(`nvkelso/natural-earth-vector` on GitHub). Not a live API call — these
scripts download a snapshot, clip it to the theater region, simplify it,
and project it once into the site's 1000×880 SVG coordinate space. The
output JSON is checked into the repo; the site does not fetch geodata at
runtime.

## Re-running

```bash
pip install shapely --break-system-packages
python process.py    # downloads + clips + simplifies -> processed.pkl
python project.py    # projects lat/lon -> SVG x/y -> theater_map_min.json
cp theater_map_min.json ../src/data/theaterMap.json
```

`process.py` needs `countries.geojson`, `admin1.geojson`,
`rivers.geojson`, and `places.geojson` in the same directory (download URLs
are at the top of the Natural Earth GitHub repo's `geojson/` folder if
they're not already present).

## Projection

Equirectangular with a cosine latitude correction at the bbox's center
latitude (`BBOX = (14.5, 43.5, 40.0, 57.0)` — roughly Germany's eastern
edge to Moscow, the Baltic to the Black Sea). This is the same projection
math `FrontMap.jsx`'s hardcoded pin coordinates were computed against — if
you change `BBOX` or the canvas size, every hardcoded `x`/`y` in
`LOCATIONS` (and the `FRONT_LINE_BODY` path) in `FrontMap.jsx` needs to be
recomputed to match, or pins will drift relative to the basemap underneath
them.

## Why some places aren't in the data

The "populated places" dataset only carries larger cities. Lublin, Rzeszów,
and Medyka aren't in it at this population threshold — their coordinates
are hardcoded directly in `FrontMap.jsx`'s `LOCATIONS` array instead, using
real-world lon/lat run through the same projection formula by hand.
