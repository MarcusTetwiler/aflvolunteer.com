# -*- coding: utf-8 -*-
"""Generate src/data/mapAtlas.js with canvas coordinates projected from lat/lon."""
import json

def px(lon): return round((lon + 11.0) / 59.0 * 1000.0, 1)
def py(lat): return round(-26.1028 * lat + 1732.06, 1)
def P(lat, lon): return [px(lon), py(lat)]

# ── PINS ─────────────────────────────────────────────────────────────────────
# layer: places | military | infrastructure
# tier:  1 = anchor (permanent label)  2 = secondary (label on hover only)
# (id, name, country, lat, lon, status, layer, tier, origin, summary, dx, dy, anchor)
PINS = [
 ("london","London","United Kingdom",51.5074,-0.1278,"active","places",1,"real",
  "Departure point for the novel’s eastbound volunteers. Heathrow routes passengers and freight toward Rzeszów and the Polish frontier.",0,-14,"middle"),
 ("warsaw","Warsaw","Poland",52.2297,21.0122,"fortified","places",1,"real",
  "Polish capital and the European anchor named in the reconstruction corridor's advertising.",-8,-11,"end"),
 ("lublin","Lublin","Poland",51.2465,22.5684,"fortified","places",2,"real",
  "Polish city behind the frontier that supports Allied command, communications, rail movement, and air defense.",0,0,"middle"),
 ("rzeszow","Rzeszów","Poland",50.0413,21.9990,"active","places",2,"real",
  "Southeastern Polish transport hub and the principal gateway for people and freight moving toward the Ukrainian frontier.",0,0,"middle"),
 ("medyka","Camp Tadeusz","Medyka, Poland",49.8060,22.9250,"active","places",2,"fictional",
  "NATO-aligned volunteer training and staging camp near the former border crossing at Medyka.",0,0,"middle"),
 ("lviv","Lviv","Ukraine",49.8397,24.0297,"unknown","places",2,"real",
  "Western Ukrainian rail and road hub, the historic first stop east of the Polish border. Occupied; conditions unreported.",0,0,"middle"),
 ("zalissia","Zalissia","Ukraine",51.05,29.60,"unknown","places",1,"real",
  "National parkland and long-abandoned settlements northwest of Kyiv, threaded with Soviet-era infrastructure. Occupied; conditions unreported.",-9,-8,"end"),
 ("kyiv","Kyiv","Ukraine",50.4501,30.5234,"unknown","places",1,"real",
  "Ukraine’s capital on the Dnipro and a central geographic anchor of the eastern theater. Independence Square sits at its civic center. Occupied; conditions unreported.",10,5,"start"),
 ("odesa","Odesa","Ukraine",46.4825,30.7233,"unknown","places",1,"real",
  "Black Sea port city of broad streets, arcades, docks, container yards, and rail infrastructure. Occupied; conditions unreported.",-10,3,"end"),
 ("moscow","Moscow","Russia",55.7558,37.6173,"hostile","places",1,"real",
  "Russian capital and a major node on the reconstructed east-west rail system, ringed by depots, transfer stations, and checkpoints.",0,-14,"middle"),
 ("kaliningrad","Kaliningrad","Russian Federation",54.7104,20.4522,"hostile","military",1,"real",
  "Russian exclave on the Baltic, bordering Poland and Lithuania. Forms the western jaw of the Suwałki geography.",-10,-6,"end"),
 ("minsk","Minsk","Belarus",53.9006,27.5590,"hostile","military",1,"real",
  "Belarusian capital. Belarus forms the eastern side of the Suwałki strategic geography.",11,4,"start"),
 ("vilnius","Vilnius","Lithuania",54.6872,25.2797,"fortified","military",1,"real",
  "Lithuanian capital. The Baltic states connect to the rest of the alliance only through the Suwałki land bridge.",10,-6,"start"),
]

# ── LINES ────────────────────────────────────────────────────────────────────
LINES = [
 ("eastern-corridor","The Eastern Corridor","infrastructure","fictional","rail",
  "High-speed reconstruction corridor advertised in Mandarin as Construction Phase IV of XII. The novel depicts Chinese-marked infrastructure along the route; the corridor itself is fictional.",
  [P(55.5,48.0),P(56.3,44.0),P(56.1,40.4),P(55.76,37.62),P(54.78,32.05),P(53.90,27.56),P(52.10,23.70)]),
 ("corridor-projected","Eastern Corridor — Advertised Extension","infrastructure","fictional","rail-planned",
  "Advertised continuation toward Warsaw and western Europe. The map treats the extension as projected rather than confirmed infrastructure.",
  [P(52.10,23.70),P(52.23,21.01)]),
 ("air-route","London – Rzeszów Air Route","infrastructure","real","air",
  "Commercial air route from Heathrow to Rzeszów used by volunteers and other passengers entering the eastern theater.",
  [P(51.5074,-0.1278),P(51.9,8.0),P(51.6,15.0),P(50.0413,21.9990)]),
 ("dnipro","Dnipro River","terrain","real","water",
  "Ukraine's defining river, running south through Kyiv to the Black Sea and carrying long historical and cultural weight.",
  [P(53.3,30.5),P(52.1,30.9),P(51.0,30.5),P(50.45,30.52),P(49.1,33.4),P(48.46,35.05),P(47.1,34.8),P(46.6,32.6)]),
]

# ── AREAS ────────────────────────────────────────────────────────────────────
# (id, name, shortLabel, layer, origin, summary, polygon, labelAt, anchor)
AREAS = [
 ("depopulated-belt","Depopulated Reconstruction Belt","DEPOPULATED BELT","infrastructure","fictional",
  "Former population centers remain on official maps even where civilian life has largely withdrawn from the landscape.",
  [P(58.4,38.6),P(58.6,48.0),P(52.6,48.0),P(52.4,39.2),P(54.6,36.9),P(57.2,36.6)],
  P(57.6,42.5),"middle"),
 ("reconstruction-zone","Eastern Corridor Reconstruction Zone","RECONSTRUCTION ZONE","infrastructure","fictional",
  "Repaired roads, transfer stations, water towers, construction yards, prefab housing, and customs infrastructure follow the rail axis. Much of the signage is in Mandarin.",
  [P(56.9,39.0),P(56.6,32.0),P(55.0,27.0),P(53.2,22.9),P(51.2,21.0),P(51.0,23.6),P(52.6,27.9),P(53.6,32.4),P(54.4,39.2)],
  P(52.3,25.6),"middle"),
 ("still-earth","Sterilized Agricultural Belt","STILL EARTH","military","fictional",
  "Farmland deliberately rendered unusable and still recorded on official maps as agricultural land.",
  [P(50.6,26.2),P(50.2,29.6),P(48.4,29.9),P(47.6,27.4),P(48.6,25.4)],
  P(48.5,27.6),"middle"),
 ("medyka-sector","Medyka Front Sector","","military","fictional",
  "Military district around the former border crossing: covered roads, ruined rail, defensive belts, and layered drone defenses.",
  [P(50.25,22.3),P(50.15,23.6),P(49.45,23.7),P(49.4,22.4)],
  P(49.15,22.95),"middle"),
 ("suwalki-gap","Suwałki Corridor","SUWAŁKI","military","real",
  "The narrow land connection between Poland and Lithuania, separating Belarus from Kaliningrad. The alliance's only overland route to the Baltics.",
  [P(54.45,22.55),P(54.45,23.55),P(53.85,23.55),P(53.85,22.55)],
  P(54.15,21.75),"end"),
 ("black-sea","Black Sea","BLACK SEA","terrain","real",
  "Strategic maritime space linking Ukraine to international shipping and military routes.",
  [P(46.0,30.4),P(46.5,33.5),P(45.3,36.6),P(43.3,39.5),P(41.4,41.3),P(41.2,34.0),P(42.2,29.2),P(44.4,28.9)],
  P(43.4,34.5),"middle"),
]

LAYERS = [
 ("places","Places","Cities, camps, and sites"),
 ("terrain","Terrain","Rivers and seas"),
 ("military","Military Geography","Corridors, sectors, and control"),
 ("infrastructure","Infrastructure","Rail, air, and reconstruction"),
]

def poly(pts): return "M " + " L ".join(f"{x},{y}" for x,y in pts) + " Z"
def line(pts):
    d = f"M {pts[0][0]},{pts[0][1]}"
    for x,y in pts[1:]: d += f" L {x},{y}"
    return d

pins = [{"id":i,"name":n,"country":c,"x":px(lo),"y":py(la),"status":s,
         "layer":ly,"tier":t,"origin":o,"summary":sm,
         "labelDx":dx,"labelDy":dy,"labelAnchor":an}
        for i,n,c,la,lo,s,ly,t,o,sm,dx,dy,an in PINS]
lines = [{"id":i,"name":n,"layer":ly,"origin":o,"kind":k,"summary":sm,
          "d":line(pts),"labelAt":pts[len(pts)//2]}
         for i,n,ly,o,k,sm,pts in LINES]
areas = [{"id":i,"name":n,"shortLabel":sl,"layer":ly,"origin":o,"summary":sm,
          "d":poly(pts),"labelAt":lab,"labelAnchor":an}
         for i,n,sl,ly,o,sm,pts,lab,an in AREAS]

header = '''// ─────────────────────────────────────────────────────────────────────────────
//  MAP ATLAS — The World of The American Foreign Legion
//
//  This is a worldbuilding artifact, not a route map. Every entry describes
//  something a cartographer inside this world could legitimately draw:
//  geography, infrastructure, and civic or military function.
//
//  SPOILER RULE: no entry may describe what happens somewhere, what is hidden
//  there, or what a character finds. Deliberately, there are no routes showing
//  who travelled where — a route reveals narrative sequence. Someone can read
//  this entire map before Chapter 1 and learn nothing about the plot.
//
//  GEOMETRY: all coordinates are generated, not hand-placed. Canvas is
//  1000x880, equirectangular:
//
//      x = (lon + 11.0) / 59.0 * 1000      // lon  -11.0E .. 48.0E
//      y = -26.1028 * lat + 1732.06        // lat  66.36N (y=0) .. 32.64N (y=880)
//
//  Do not edit coordinates by hand. Edit the lat/lon in
//  work/gen_atlas.py and regenerate, or add entries using the formula above.
//
//  origin: 'real' = exists today | 'fictional' = created for the novel
//  tier:   1 = anchor, permanent label | 2 = secondary, label on hover
// ─────────────────────────────────────────────────────────────────────────────

export const MAP_LAYERS = '''

out = header + json.dumps([{"id":i,"label":l,"note":n} for i,l,n in LAYERS], ensure_ascii=False, indent=2) + ";\n\n"
out += "export const MAP_PINS = " + json.dumps(pins, ensure_ascii=False, indent=2) + ";\n\n"
out += "export const MAP_LINES = " + json.dumps(lines, ensure_ascii=False, indent=2) + ";\n\n"
out += "export const MAP_AREAS = " + json.dumps(areas, ensure_ascii=False, indent=2) + ";\n"

open('src/data/mapAtlas.js','w',encoding='utf-8').write(out)

print(f"pins {len(pins)}  lines {len(lines)}  areas {len(areas)}")
off = [p['name'] for p in pins if not (0<=p['x']<=1000 and 0<=p['y']<=880)]
print("pins off canvas:", off or "none")
for l in lines:
    print(f"  line {l['name']:32} {len(l['d'].split(' L '))} pts")
