import pickle
import json
from shapely.geometry import mapping

with open('processed.pkl', 'rb') as f:
    data = pickle.load(f)

BBOX = data['bbox']  # (lon_min, lat_min, lon_max, lat_max)
lon_min, lat_min, lon_max, lat_max = BBOX

# Canvas size (matches our existing FrontMap SVG viewBox)
W, H = 1000, 880

# Simple equirectangular projection with a cosine latitude correction at the
# bbox's center latitude, which keeps shapes from looking horizontally
# stretched/compressed at this latitude band (44-57.5N).
import math
center_lat = (lat_min + lat_max) / 2
lat_correction = math.cos(math.radians(center_lat))

lon_span = (lon_max - lon_min) * lat_correction
lat_span = (lat_max - lat_min)

# Fit to canvas preserving aspect ratio, centered
scale = min(W / lon_span, H / lat_span)
proj_w = lon_span * scale
proj_h = lat_span * scale
offset_x = (W - proj_w) / 2
offset_y = (H - proj_h) / 2

def project(lon, lat):
    x = (lon - lon_min) * lat_correction * scale + offset_x
    # SVG y grows downward; latitude grows upward, so flip
    y = (lat_max - lat) * scale + offset_y
    return round(x, 2), round(y, 2)

def ring_to_path(coords):
    pts = [project(lon, lat) for lon, lat in coords]
    if not pts:
        return ''
    d = f"M {pts[0][0]},{pts[0][1]} " + ' '.join(f"L {x},{y}" for x, y in pts[1:]) + " Z"
    return d

def geom_to_paths(geom):
    """Return list of SVG path 'd' strings for a (Multi)Polygon."""
    paths = []
    geom_type = geom.geom_type
    if geom_type == 'Polygon':
        polys = [geom]
    elif geom_type == 'MultiPolygon':
        polys = list(geom.geoms)
    elif geom_type == 'GeometryCollection':
        polys = [g for g in geom.geoms if g.geom_type in ('Polygon', 'MultiPolygon')]
        flat = []
        for p in polys:
            if p.geom_type == 'MultiPolygon':
                flat.extend(list(p.geoms))
            else:
                flat.append(p)
        polys = flat
    else:
        return paths
    for poly in polys:
        exterior = list(poly.exterior.coords)
        paths.append(ring_to_path(exterior))
        for interior in poly.interiors:
            paths.append(ring_to_path(list(interior.coords)))
    return paths

def line_to_path(geom):
    """Return list of SVG path 'd' strings for a (Multi)LineString."""
    paths = []
    geom_type = geom.geom_type
    if geom_type == 'LineString':
        lines = [geom]
    elif geom_type == 'MultiLineString':
        lines = list(geom.geoms)
    else:
        return paths
    for line in lines:
        pts = [project(lon, lat) for lon, lat in line.coords]
        if len(pts) < 2:
            continue
        d = f"M {pts[0][0]},{pts[0][1]} " + ' '.join(f"L {x},{y}" for x, y in pts[1:])
        paths.append(d)
    return paths

# ---- Build output ----
output = {
    'canvas': {'w': W, 'h': H},
    'countries': [],
    'rivers': [],
    'places': [],
}

for c in data['countries']:
    paths = geom_to_paths(c['geom'])
    if not paths:
        continue
    output['countries'].append({'name': c['name'], 'paths': paths})

for r in data['rivers']:
    paths = line_to_path(r['geom'])
    if not paths:
        continue
    output['rivers'].append({'name': r['name'], 'paths': paths})

for p in data['places']:
    x, y = project(p['lon'], p['lat'])
    if 0 <= x <= W and 0 <= y <= H:
        output['places'].append({'name': p['name'], 'x': x, 'y': y, 'pop': p['pop']})

with open('theater_map.json', 'w') as f:
    json.dump(output, f)

print('countries:', len(output['countries']))
print('rivers:', len(output['rivers']))
print('places in view:', len(output['places']))

import os
print('file size:', os.path.getsize('theater_map.json'), 'bytes')
