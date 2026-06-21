import theaterMap from '../data/theaterMap.json';

// Cities we explicitly label on the map (avoids clutter — ISW's own maps
// only label what's relevant to the story being told). Matched by name
// against the populated-places dataset; a few story-relevant towns (Lublin,
// Rzeszów, Medyka) aren't in that dataset at this population threshold, so
// they're projected separately and passed in as `extraPlaces`.
const LABELED_CITIES = new Set([
  'Warsaw', 'Kyiv', 'Lviv', 'Moscow', 'Odessa', 'Minsk', 'Kharkiv',
  'Dnipro', 'Donetsk', 'Vilnius', 'Riga', 'Bucharest', 'Chisinau',
  'Budapest', 'Krakow', 'Kraków',
]);

// Cities that are also rendered as the story's own interactive pins
// (FrontMap.jsx LOCATIONS) — suppressed here so we don't double-label the
// same real place with two overlapping dot+text pairs.
const SUPPRESSED_DUPLICATES = new Set(['Kyiv', 'Lviv', 'Moscow', 'Odessa']);

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
              <circle r="2.2" className="theater-basemap__place-dot" />
              <text x="6" y="3" className="theater-basemap__place-label">{p.name}</text>
            </g>
          ))}
        {extraPlaces.map((p) => (
          <g key={p.name} transform={`translate(${p.x}, ${p.y})`}>
            <circle r="2.2" className="theater-basemap__place-dot" />
            <text x="6" y="3" className="theater-basemap__place-label">{p.name}</text>
          </g>
        ))}
      </g>
    </g>
  );
}
