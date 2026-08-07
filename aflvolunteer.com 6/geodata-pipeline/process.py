import json
from shapely.geometry import shape, box, mapping
from shapely.ops import unary_union

# Continental view: Atlantic-adjacent western Europe through to the Urals
# region west of Moscow, Scandinavia down to the Mediterranean. The
# Poland/Ukraine theater becomes a hot zone inside a much larger visible
# map, rather than the entire frame.
# (lon_min, lat_min, lon_max, lat_max)
BBOX = (-11.0, 35.0, 48.0, 64.0)
clip_box = box(*BBOX)

COUNTRIES_OF_INTEREST = {
    'Poland', 'Ukraine', 'Belarus', 'Russia', 'Lithuania', 'Latvia', 'Estonia',
    'Slovakia', 'Czechia', 'Germany', 'Romania', 'Moldova', 'Hungary',
    'United Kingdom', 'France', 'Italy', 'Spain', 'Portugal', 'Ireland',
    'Norway', 'Sweden', 'Finland', 'Denmark', 'Austria', 'Switzerland',
    'Netherlands', 'Belgium', 'Greece', 'Turkey', 'Bulgaria', 'Serbia',
    'Croatia', 'Slovenia', 'Albania', 'North Macedonia', 'Bosnia and Herz.',
    'Montenegro', 'Kosovo',
}

def load_geojson(path):
    with open(path) as f:
        return json.load(f)

def clip_and_simplify(geom, tolerance=0.05):
    try:
        clipped = geom.intersection(clip_box)
    except Exception:
        return None
    if clipped.is_empty:
        return None
    simplified = clipped.simplify(tolerance, preserve_topology=True)
    if simplified.is_empty:
        return None
    return simplified

# ---- Countries ----
countries_data = load_geojson('countries.geojson')
country_features = []
for feat in countries_data['features']:
    name = feat['properties'].get('NAME')
    if name not in COUNTRIES_OF_INTEREST:
        continue
    geom = shape(feat['geometry'])
    clipped = clip_and_simplify(geom, tolerance=0.05)
    if clipped is None:
        continue
    country_features.append({'name': name, 'geom': clipped})

print('Countries kept:', [c['name'] for c in country_features])

# ---- Admin-1 (oblasts / voivodeships) for Poland + Ukraine only (keeps file small, matches ISW detail level) ----
admin1_data = load_geojson('admin1.geojson')
admin1_features = []
for feat in admin1_data['features']:
    admin = feat['properties'].get('admin')
    if admin not in ('Poland', 'Ukraine'):
        continue
    geom = shape(feat['geometry'])
    clipped = clip_and_simplify(geom, tolerance=0.05)
    if clipped is None:
        continue
    name = feat['properties'].get('name', '')
    admin1_features.append({'name': name, 'admin': admin, 'geom': clipped})

print('Admin-1 regions kept:', len(admin1_features))

# ---- Rivers ----
rivers_data = load_geojson('rivers.geojson')
river_features = []
for feat in rivers_data['features']:
    # scalerank: 0 = most major. At continental zoom only show the big rivers
    # (Volga, Dnieper, Danube, Vistula, Rhine, etc.) to avoid clutter.
    if feat['properties'].get('scalerank', 99) > 4:
        continue
    name = feat['properties'].get('name', '')
    geom = shape(feat['geometry'])
    clipped = clip_and_simplify(geom, tolerance=0.05)
    if clipped is None:
        continue
    river_features.append({'name': name, 'geom': clipped})

print('Rivers kept:', len(river_features))

# ---- Populated places (cities) for label reference, filter by population + bbox ----
places_data = load_geojson('places.geojson')
place_features = []
for feat in places_data['features']:
    props = feat['properties']
    lon, lat = feat['geometry']['coordinates'][:2]
    if not (BBOX[0] <= lon <= BBOX[2] and BBOX[1] <= lat <= BBOX[3]):
        continue
    pop = props.get('POP_MAX', 0) or 0
    name = props.get('NAME', '')
    if pop < 600000:
        continue
    place_features.append({'name': name, 'lon': lon, 'lat': lat, 'pop': pop})

print('Major cities kept:', len(place_features))
for p in sorted(place_features, key=lambda x: -x['pop'])[:30]:
    print(' ', p['name'], p['pop'])

# Save intermediate result
import pickle
with open('processed.pkl', 'wb') as f:
    pickle.dump({
        'countries': country_features,
        'admin1': admin1_features,
        'rivers': river_features,
        'places': place_features,
        'bbox': BBOX,
    }, f)

print('Saved processed.pkl')
