import theaterMap from '../data/theaterMap.json';
import { MAP_PINS } from '../data/mapAtlas';

// At continental zoom we only label a curated set of major cities — enough
// to orient the reader (this is Europe, here's Moscow's distance from
// Poland) without turning the map into a gazetteer.
const LABELED_CITIES = new Set([
  'Paris', 'Berlin', 'Rome', 'Madrid', 'Warsaw', 'Vienna', 'Bucharest',
  'Minsk', 'St. Petersburg', 'Kharkiv', 'Athens', 'Istanbul', 'Budapest',
]);

// Cities the atlas already renders as interactive pins. The basemap yields to
// the atlas: an atlas pin carries status, layer membership and a detail card,
// where a basemap label is inert reference text.
//
// Derived from MAP_PINS rather than hand-listed, because a hand-list goes stale
// the moment a pin is added — which is exactly how Warsaw and Minsk ended up
// labelled twice.
const SUPPRESSED_DUPLICATES = new Set(MAP_PINS.map((p) => p.name));

export default function TheaterBasemap({ extraPlaces = [], variant = 'light' }) {
  const { countries, rivers, places } = theaterMap;

  return (
    <g className={`theater-basemap theater-basemap--${variant}`}>
      {/* country fills + borders */}
      {countries.map((c) => (
        <g key={c.name} className="theater-basemap__country">
          {c.paths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      ))}

      {/* rivers */}
      <g className="theater-basemap__rivers">
        {rivers.map((r, i) => (
          <g key={i}>
            {r.paths.map((d, j) => (
              <path key={j} d={d} />
            ))}
          </g>
        ))}
      </g>

      {/* reference city dots + labels (subdued — these are basemap context,
          not the story's own pins, which render above this layer) */}
      <g className="theater-basemap__places">
        {places
          .filter((p) => LABELED_CITIES.has(p.name) && !SUPPRESSED_DUPLICATES.has(p.name))
          .map((p) => (
            <g key={p.name} transform={`translate(${p.x}, ${p.y})`}>
              <circle r="2" className="theater-basemap__place-dot" />
              <text x="5" y="3" className="theater-basemap__place-label">{p.name}</text>
            </g>
          ))}
        {extraPlaces.map((p) => (
          <g key={p.name} transform={`translate(${p.x}, ${p.y})`}>
            <circle r="2" className="theater-basemap__place-dot" />
            <text x="5" y="3" className="theater-basemap__place-label">{p.name}</text>
          </g>
        ))}
      </g>
    </g>
  );
}
