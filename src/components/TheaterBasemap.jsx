import theaterMap from '../data/theaterMap.json';

// At continental zoom we only label a curated set of major cities — enough
// to orient the reader (this is Europe, here's Moscow's distance from
// Poland) without turning the map into a gazetteer.
const LABELED_CITIES = new Set([
  'Paris', 'Berlin', 'Rome', 'Madrid', 'Warsaw', 'Vienna', 'Bucharest',
  'Minsk', 'St. Petersburg', 'Kharkiv', 'Athens', 'Istanbul', 'Budapest',
]);

// Cities that are also rendered as the story's own interactive pins
// (FrontMap.jsx LOCATIONS) — suppressed here so we don't double-label the
// same real place with two overlapping dot+text pairs.
const SUPPRESSED_DUPLICATES = new Set(['Kyiv', 'Moscow', 'London']);

export default function TheaterBasemap({ extraPlaces = [] }) {
  const { countries, rivers, places } = theaterMap;

  return (
    <g className="theater-basemap">
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
