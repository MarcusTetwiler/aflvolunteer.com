import './DroneRender.css';

const finishColors = {
  bone: ['#d8c7aa', '#8a7556'], rust: ['#a84f28', '#231d19'],
  field: ['#59604c', '#c6a35d'], charcoal: ['#363432', '#a66a43'], repaired: ['#b8a486', '#8f4b2d'],
};

export default function DroneRender({ build = {}, printing = false, label = true }) {
  const chassis = build.chassis || 'scout';
  const material = build.material || 'regrind';
  const sensor = build.sensor || 'daylight';
  const finish = build.finish || 'bone';
  const [body, accent] = finishColors[finish] || finishColors.bone;
  const isWing = chassis === 'wing';
  const rotors = chassis === 'carrier'
    ? [[120,70],[240,52],[360,52],[480,70],[120,250],[240,268],[360,268],[480,250]]
    : chassis === 'ducted'
      ? [[150,92],[450,92],[150,228],[450,228]]
      : [[145,70],[455,70],[145,250],[455,250]];

  return (
    <div className={`drone-render${printing ? ' is-printing' : ''}`}>
      <svg viewBox="0 0 600 320" role="img" aria-label="Your configured fictional field drone">
        <defs>
          <filter id="bench-shadow"><feDropShadow dx="0" dy="8" stdDeviation="8" floodOpacity=".25" /></filter>
          <pattern id="gyroid" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M0 6 Q3 0 6 6 T12 6 M6 0 Q12 3 6 6 T6 12" fill="none" stroke={accent} strokeWidth="1" opacity=".45" />
          </pattern>
        </defs>
        <g className="drone-render__machine" filter="url(#bench-shadow)">
          {isWing ? (
            <path d="M65 170 L265 110 L300 72 L335 110 L535 170 L340 184 L320 238 L280 238 L260 184 Z" fill={body} stroke={accent} strokeWidth="5" />
          ) : (
            <>
              {rotors.map(([x,y], i) => (
                <g key={i} className="drone-render__rotor">
                  <line x1="300" y1="160" x2={x} y2={y} stroke={body} strokeWidth={chassis === 'carrier' ? 13 : 18} strokeLinecap="round" />
                  {chassis === 'ducted' && <circle cx={x} cy={y} r="53" fill="none" stroke={body} strokeWidth="12" />}
                  <circle cx={x} cy={y} r={chassis === 'carrier' ? 28 : 39} fill="none" stroke={accent} strokeWidth="4" />
                  <path d={`M${x-38} ${y} H${x+38} M${x} ${y-38} V${y+38}`} stroke={accent} strokeWidth="3" opacity=".8" />
                  <circle cx={x} cy={y} r="9" fill={accent} />
                </g>
              ))}
              <path d="M236 118 L278 91 H322 L364 118 L384 190 L334 226 H266 L216 190 Z" fill={body} stroke={accent} strokeWidth="5" />
            </>
          )}

          {material === 'gyroid' && <path d="M246 123 L282 101 H318 L354 123 L368 183 L326 213 H274 L232 183 Z" fill="url(#gyroid)" stroke={accent} strokeWidth="2" />}
          {material === 'carbon' && <path d="M255 125 L345 125 L362 183 L325 207 H275 L238 183 Z" fill="#292725" opacity=".72" />}
          {material === 'alloy' && <g fill="#c1b9aa" stroke="#665f56"><circle cx="265" cy="144" r="5"/><circle cx="335" cy="144" r="5"/><circle cx="300" cy="198" r="5"/></g>}

          <g className="drone-render__sensor">
            {sensor === 'thermal' && <><rect x="280" y="172" width="40" height="42" rx="8" fill="#211d1a"/><circle cx="300" cy="194" r="12" fill="#793d22" stroke="#e0b178" strokeWidth="4"/></>}
            {sensor === 'depth' && <><rect x="270" y="177" width="60" height="28" rx="5" fill="#211d1a"/><circle cx="284" cy="191" r="6" fill="#d2793f"/><circle cx="300" cy="191" r="6" fill="#d2793f"/><circle cx="316" cy="191" r="6" fill="#d2793f"/></>}
            {sensor === 'dual' && <><circle cx="284" cy="191" r="15" fill="#211d1a" stroke={accent} strokeWidth="4"/><circle cx="316" cy="191" r="15" fill="#211d1a" stroke={accent} strokeWidth="4"/></>}
            {sensor === 'daylight' && <circle cx="300" cy="192" r="15" fill="#212725" stroke="#758e8b" strokeWidth="5"/>}
          </g>
          {build.system === 'relay' && <path d="M300 112 V55 M286 58 Q300 42 314 58" fill="none" stroke={accent} strokeWidth="5" />}
          {build.system === 'edge' && <rect x="270" y="112" width="60" height="25" rx="3" fill="#201d1a" stroke={accent} strokeWidth="3" />}
          {build.power === 'endurance' && <rect x="267" y="135" width="66" height="24" rx="12" fill="#39342d" stroke={accent} strokeWidth="3" />}
          {build.power === 'experimental' && <path d="M270 154 H330" stroke="#d7b864" strokeWidth="9" strokeDasharray="8 5" />}
          {build.condition === 'repaired' && <><path d="M257 126 L280 151 L269 180" fill="none" stroke="#d4c3a8" strokeWidth="5"/><path d="M338 136 L318 158 L332 188" fill="none" stroke="#58604d" strokeWidth="6"/></>}
          {build.condition === 'exposed' && <path d="M270 146 H330 M280 162 H320" stroke="#25211e" strokeWidth="5" strokeDasharray="5 4" />}
          {build.condition === 'gyroid' && <path d="M246 123 L282 101 H318 L354 123 L368 183 L326 213 H274 L232 183 Z" fill="url(#gyroid)" stroke={accent} strokeWidth="2" />}
          {build.markings === 'band' && <path d="M226 174 H374" stroke="#c6a35d" strokeWidth="9" opacity=".9" />}
          {build.markings === 'hand' && <path d="M258 147 Q300 122 343 149" fill="none" stroke="#ded0b6" strokeWidth="5" />}
          {build.markings !== 'none' && <text x="300" y={isWing ? 164 : 174} textAnchor="middle" fill={finish === 'bone' ? '#493f33' : '#eadbc2'} fontFamily="monospace" fontSize="15" letterSpacing="3">E-7</text>}
        </g>
        {printing && <g className="drone-render__scan"><rect x="40" y="0" width="520" height="3" fill="#d2793f"/><rect x="40" y="0" width="520" height="28" fill="url(#scanfade)" opacity=".12"/></g>}
      </svg>
      {label && <span className="drone-render__label">FABRICATION MODEL // NOT TO SCALE</span>}
    </div>
  );
}
