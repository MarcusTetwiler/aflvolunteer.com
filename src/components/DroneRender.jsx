import { useId } from 'react';
import './DroneRender.css';

const finishes = {
  bone: { body: '#d6c5a7', light: '#eee0c7', dark: '#76654e', accent: '#9d693e' },
  rust: { body: '#a94f2b', light: '#d6804d', dark: '#572919', accent: '#211d19' },
  field: { body: '#59604c', light: '#879078', dark: '#30372d', accent: '#d0aa55' },
  charcoal: { body: '#343331', light: '#66635e', dark: '#191918', accent: '#c37949' },
};
const materialTone = {
  regrind: { line: '#76654e', panel: '#c8b493' },
  carbon: { line: '#171717', panel: '#2b2a28' },
  alloy: { line: '#5f625f', panel: '#aeb0aa' },
  gyroid: { line: '#8b6848', panel: '#cdbb9b' },
};

function TopChassis({ chassis, paint, ids }) {
  if (chassis === 'wing') return <g data-part="chassis">
    <path className="drone-part drone-part--chassis" d="M55 174 L216 105 L268 67 L300 42 L332 67 L384 105 L545 174 L371 194 L337 249 L300 230 L263 249 L229 194 Z" fill={`url(#${ids.body})`} stroke={paint.dark} strokeWidth="6" />
    <path d="M90 170 L250 124 L300 75 L350 124 L510 170 L355 170 L330 210 L270 210 L245 170 Z" fill="none" stroke={paint.light} strokeWidth="3" opacity=".55" />
    <path d="M112 169 L232 133 M488 169 L368 133" stroke={paint.accent} strokeWidth="6" opacity=".75" />
  </g>;
  const points = chassis === 'carrier'
    ? [[102,68],[218,48],[382,48],[498,68],[102,252],[218,272],[382,272],[498,252]]
    : [[130,68],[470,68],[130,252],[470,252]];
  return <g data-part="chassis">
    {points.map(([x,y], index) => <g key={`${x}-${y}`}>
      <path className="drone-part drone-part--chassis" d={`M300 160 L${x} ${y}`} stroke={`url(#${ids.arm})`} strokeWidth={chassis === 'carrier' ? 14 : 20} strokeLinecap="round" />
      {chassis === 'ducted' && <circle cx={x} cy={y} r="54" fill="#1c1a18" fillOpacity=".22" stroke={paint.body} strokeWidth="13" />}
      <g className="drone-render__rotor" transform={`translate(${x} ${y})`}>
        <ellipse rx={chassis === 'carrier' ? 35 : 45} ry="8" fill={paint.dark} opacity=".78" transform={`rotate(${index % 2 ? 18 : -18})`} />
        <ellipse rx={chassis === 'carrier' ? 35 : 45} ry="8" fill={paint.dark} opacity=".55" transform={`rotate(${index % 2 ? 108 : 72})`} />
        <circle r="13" fill={paint.accent} stroke={paint.dark} strokeWidth="5" />
      </g>
    </g>)}
    <path className="drone-part drone-part--chassis" d={chassis === 'ducted' ? 'M225 121 L271 91 H329 L375 121 L389 188 L339 226 H261 L211 188 Z' : chassis === 'carrier' ? 'M230 122 L273 94 H327 L370 122 L381 187 L336 222 H264 L219 187 Z' : 'M238 116 L278 91 H322 L362 116 L379 188 L335 224 H265 L221 188 Z'} fill={`url(#${ids.body})`} stroke={paint.dark} strokeWidth="6" />
    <path d="M256 126 L284 108 H316 L344 126 L354 180 L325 202 H275 L246 180 Z" fill="none" stroke={paint.light} strokeWidth="3" opacity=".65" />
  </g>;
}

function FrontChassis({ chassis, paint, ids }) {
  if (chassis === 'wing') return <g data-part="chassis">
    <path className="drone-part drone-part--chassis" d="M42 170 Q164 119 260 132 L285 104 H315 L340 132 Q436 119 558 170 L344 184 L324 224 H276 L256 184 Z" fill={`url(#${ids.body})`} stroke={paint.dark} strokeWidth="6" />
    <path d="M77 165 Q180 141 267 151 M523 165 Q420 141 333 151" fill="none" stroke={paint.light} strokeWidth="4" opacity=".55" />
  </g>;
  const xs = chassis === 'carrier' ? [82,158,442,518] : [115,485];
  return <g data-part="chassis">
    {xs.map((x, i) => <g key={x}>
      <path d={`M300 170 L${x} ${150 + (i % 2) * 8}`} stroke={`url(#${ids.arm})`} strokeWidth="17" />
      {chassis === 'ducted' && <ellipse cx={x} cy="145" rx="56" ry="63" fill="none" stroke={paint.body} strokeWidth="13" />}
      <ellipse cx={x} cy="142" rx="52" ry="9" fill={paint.dark} opacity=".8" />
      <circle cx={x} cy="144" r="13" fill={paint.accent} stroke={paint.dark} strokeWidth="4" />
    </g>)}
    <path className="drone-part drone-part--chassis" d="M218 135 Q300 96 382 135 L365 210 Q300 241 235 210 Z" fill={`url(#${ids.body})`} stroke={paint.dark} strokeWidth="6" />
    <path d="M246 149 Q300 125 354 149 L343 193 Q300 211 257 193 Z" fill="none" stroke={paint.light} strokeWidth="3" opacity=".6" />
    <path d="M245 217 L230 256 M355 217 L370 256" stroke={paint.dark} strokeWidth="8" strokeLinecap="round" />
  </g>;
}

function ProfileChassis({ chassis, paint, ids }) {
  if (chassis === 'wing') return <g data-part="chassis">
    <path className="drone-part drone-part--chassis" d="M52 173 L248 135 L282 89 H321 L350 136 L548 175 L352 192 L324 227 H279 L250 191 Z" fill={`url(#${ids.body})`} stroke={paint.dark} strokeWidth="6" />
    <path d="M80 170 L260 157 L297 113 L332 158 L516 173" fill="none" stroke={paint.light} strokeWidth="4" opacity=".58" />
    <path d="M294 91 L306 43 L327 92" fill={paint.body} stroke={paint.dark} strokeWidth="5" />
  </g>;
  const rotors = chassis === 'carrier' ? [87,170,430,513] : [115,485];
  return <g data-part="chassis">
    {rotors.map((x, i) => <g key={x}>
      <path d={`M300 169 L${x} ${151 + (i % 2) * 11}`} stroke={`url(#${ids.arm})`} strokeWidth="17" />
      {chassis === 'ducted' && <circle cx={x} cy="149" r="52" fill="none" stroke={paint.body} strokeWidth="12" />}
      <ellipse cx={x} cy="144" rx="52" ry="9" fill={paint.dark} opacity=".82" />
      <circle cx={x} cy="145" r="12" fill={paint.accent} stroke={paint.dark} strokeWidth="4" />
    </g>)}
    <path className="drone-part drone-part--chassis" d="M219 141 Q266 106 356 130 L386 166 L359 212 L248 218 L213 184 Z" fill={`url(#${ids.body})`} stroke={paint.dark} strokeWidth="6" />
    <path d="M248 151 Q284 130 340 143 L355 169 L337 194 L265 198 L240 179 Z" fill="none" stroke={paint.light} strokeWidth="3" opacity=".6" />
    <path d="M250 216 L235 253 M352 211 L371 251" stroke={paint.dark} strokeWidth="8" strokeLinecap="round" />
  </g>;
}

function MaterialLayer({ view, material, tone, ids }) {
  const path = view === 'top' ? 'M258 126 L284 108 H316 L342 126 L352 180 L324 201 H276 L248 180 Z' : view === 'front' ? 'M251 151 Q300 130 349 151 L338 190 Q300 207 262 190 Z' : 'M250 153 Q291 131 337 145 L351 169 L334 191 L266 196 L241 178 Z';
  if (material === 'carbon') return <g data-part="material"><path className="drone-part drone-part--material" d={path} fill={`url(#${ids.carbon})`} stroke={tone.line} strokeWidth="3" /></g>;
  if (material === 'alloy') return <g data-part="material"><path className="drone-part drone-part--material" d={path} fill={`url(#${ids.metal})`} stroke={tone.line} strokeWidth="3" />{[[273,155],[300,142],[327,155],[300,187]].map(([x,y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="4" fill="#5b5b56" stroke="#d8d8ce" strokeWidth="1" />)}</g>;
  if (material === 'gyroid') return <g data-part="material"><path className="drone-part drone-part--material" d={path} fill={`url(#${ids.gyroid})`} stroke={tone.line} strokeWidth="3" /></g>;
  return <g data-part="material"><path className="drone-part drone-part--material" d={path} fill={tone.panel} fillOpacity=".68" stroke={tone.line} strokeWidth="3" strokeDasharray="4 3" /></g>;
}

function PowerModule({ view, power, paint }) {
  const y = view === 'top' ? 139 : 161;
  if (power === 'sprinter') return <g data-part="power" className="drone-part drone-part--power"><rect x="265" y={y} width="70" height="24" rx="5" fill="#252220" stroke={paint.accent} strokeWidth="3"/><path d={`M277 ${y+6} H323`} stroke="#d05d37" strokeWidth="5" strokeDasharray="8 4"/></g>;
  if (power === 'endurance') return <g data-part="power" className="drone-part drone-part--power"><rect x="255" y={y} width="90" height="25" rx="13" fill="#33342f" stroke="#9caa7e" strokeWidth="3"/><path d={`M276 ${y+5} V${y+20} M300 ${y+5} V${y+20} M324 ${y+5} V${y+20}`} stroke="#697058" strokeWidth="2"/></g>;
  if (power === 'cold') return <g data-part="power" className="drone-part drone-part--power"><rect x="261" y={y} width="78" height="25" rx="5" fill="#8da0a0" stroke="#e4efeb" strokeWidth="3"/><path d={`M276 ${y+12} H324 M300 ${y+4} V${y+21}`} stroke="#4c6062" strokeWidth="3"/></g>;
  return <g data-part="power" className="drone-part drone-part--power"><path d={`M260 ${y+2} L277 ${y-5} H328 L341 ${y+9} L328 ${y+27} H273 L257 ${y+15} Z`} fill="#554b37" stroke="#dfbb60" strokeWidth="3"/><path d={`M272 ${y+11} H329`} stroke="#f0d574" strokeWidth="5" strokeDasharray="5 4"/></g>;
}

function SensorModule({ view, sensor, paint }) {
  const y = view === 'top' ? 191 : 201;
  if (sensor === 'thermal') return <g data-part="sensor" className="drone-part drone-part--sensor"><path d={`M276 ${y-17} H324 L330 ${y+12} L316 ${y+27} H284 L270 ${y+12} Z`} fill="#211e1b" stroke={paint.accent} strokeWidth="3"/><circle cx="300" cy={y+5} r="13" fill="#6d2f1d" stroke="#f2ae69" strokeWidth="5"/><circle cx="300" cy={y+5} r="5" fill="#171311"/></g>;
  if (sensor === 'depth') return <g data-part="sensor" className="drone-part drone-part--sensor"><rect x="263" y={y-10} width="74" height="30" rx="7" fill="#1f2221" stroke={paint.accent} strokeWidth="3"/>{[278,300,322].map(x => <circle key={x} cx={x} cy={y+5} r="7" fill="#c45f32" stroke="#f0b16e" strokeWidth="2"/>)}</g>;
  if (sensor === 'dual') return <g data-part="sensor" className="drone-part drone-part--sensor"><path d={`M260 ${y-10} Q300 ${y-28} 340 ${y-10} V${y+20} H260 Z`} fill="#252220" stroke={paint.accent} strokeWidth="3"/><circle cx="282" cy={y+3} r="14" fill="#101616" stroke="#809c99" strokeWidth="4"/><circle cx="318" cy={y+3} r="14" fill="#2e1711" stroke="#d88b52" strokeWidth="4"/></g>;
  return <g data-part="sensor" className="drone-part drone-part--sensor"><path d={`M278 ${y-12} H322 L330 ${y+11} L311 ${y+24} H289 L270 ${y+11} Z`} fill="#222725" stroke={paint.accent} strokeWidth="3"/><circle cx="300" cy={y+3} r="14" fill="#182322" stroke="#82aaa5" strokeWidth="5"/><circle cx="295" cy={y-2} r="4" fill="#d4ece7" opacity=".7"/></g>;
}

function SystemModule({ view, system, paint }) {
  const y = view === 'top' ? 113 : 124;
  if (system === 'relay') return <g data-part="system" className="drone-part drone-part--system"><path d={`M300 ${y+20} V${y-34}`} stroke={paint.accent} strokeWidth="5"/><path d={`M282 ${y-26} Q300 ${y-47} 318 ${y-26} M289 ${y-17} Q300 ${y-29} 311 ${y-17}`} fill="none" stroke={paint.light} strokeWidth="3"/><circle cx="300" cy={y-36} r="5" fill={paint.accent}/></g>;
  if (system === 'inertial') return <g data-part="system" className="drone-part drone-part--system"><circle cx="300" cy={y} r="22" fill="#252522" stroke={paint.accent} strokeWidth="3"/><circle cx="300" cy={y} r="12" fill="none" stroke="#d2b36f" strokeWidth="3"/><path d={`M300 ${y-18} V${y+18} M282 ${y} H318`} stroke="#a27b4b" strokeWidth="2"/></g>;
  if (system === 'edge') return <g data-part="system" className="drone-part drone-part--system"><rect x="266" y={y-15} width="68" height="30" rx="4" fill="#1d1e1d" stroke={paint.accent} strokeWidth="3"/><path d={`M276 ${y-6} H324 M276 ${y+2} H313 M276 ${y+10} H319`} stroke="#8c9e76" strokeWidth="3"/><circle cx="325" cy={y+9} r="3" fill="#d87942"/></g>;
  return <g data-part="system" className="drone-part drone-part--system"><path d={`M269 ${y} H331`} stroke={paint.accent} strokeWidth="5"/><path d={`M274 ${y} L261 ${y-24} M326 ${y} L339 ${y-24}`} stroke={paint.dark} strokeWidth="4"/><circle cx="261" cy={y-25} r="5" fill={paint.accent}/><circle cx="339" cy={y-25} r="5" fill={paint.accent}/></g>;
}

function FinishLayer({ view, build, paint }) {
  const y = view === 'top' ? 171 : 187;
  return <g data-part="finish" className="drone-part drone-part--finish">
    {build.condition === 'repaired' && <><path d={`M253 ${y-38} L281 ${y-12} L266 ${y+25}`} fill="none" stroke="#e0c9a6" strokeWidth="6"/><path d={`M345 ${y-30} L322 ${y-8} L340 ${y+22}`} fill="none" stroke="#64705a" strokeWidth="7"/></>}
    {build.condition === 'exposed' && <path d={`M264 ${y-21} H336 M273 ${y-8} H327 M280 ${y+5} H320`} stroke="#171615" strokeWidth="5" strokeDasharray="6 4"/>}
    {build.markings === 'band' && <path d={`M232 ${y} H368`} stroke="#ddb85d" strokeWidth="10" opacity=".9"/>}
    {build.markings === 'hand' && <path d={`M254 ${y-8} Q300 ${y-34} 346 ${y-7}`} fill="none" stroke="#efe0c7" strokeWidth="6"/>}
    {build.markings !== 'none' && <text x="300" y={y+8} textAnchor="middle" fill={build.finish === 'bone' ? '#493f33' : '#f2dfc0'} fontFamily="monospace" fontSize="14" letterSpacing="3">E-7</text>}
    {build.condition === 'clean' && <path d={`M255 ${y+31} Q300 ${y+40} 345 ${y+31}`} fill="none" stroke={paint.light} strokeWidth="2" opacity=".35"/>}
  </g>;
}

export default function DroneRender({ build = {}, printing = false, label = true, view = 'top', highlight = null }) {
  const rawId = useId().replace(/:/g, '');
  const ids = { body: `${rawId}-body`, arm: `${rawId}-arm`, carbon: `${rawId}-carbon`, metal: `${rawId}-metal`, gyroid: `${rawId}-gyroid`, shadow: `${rawId}-shadow` };
  const paint = finishes[build.finish] || finishes.bone;
  const tone = materialTone[build.material] || materialTone.regrind;
  const chassis = build.chassis || 'scout';
  const Chassis = view === 'front' ? FrontChassis : view === 'profile' ? ProfileChassis : TopChassis;
  return <div className={`drone-render drone-render--${view}${printing ? ' is-printing' : ''}${highlight ? ` is-installing highlight-${highlight}` : ''}`}>
    <svg viewBox="0 0 600 320" role="img" aria-label={`${view} view of your configured fictional field drone`}>
      <defs>
        <linearGradient id={ids.body} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={paint.light}/><stop offset=".48" stopColor={paint.body}/><stop offset="1" stopColor={paint.dark}/></linearGradient>
        <linearGradient id={ids.arm}><stop offset="0" stopColor={paint.dark}/><stop offset=".5" stopColor={paint.light}/><stop offset="1" stopColor={paint.dark}/></linearGradient>
        <linearGradient id={ids.metal}><stop offset="0" stopColor="#e0e1dc"/><stop offset=".45" stopColor="#8e918d"/><stop offset=".7" stopColor="#c8cac4"/><stop offset="1" stopColor="#666a67"/></linearGradient>
        <pattern id={ids.carbon} width="10" height="10" patternUnits="userSpaceOnUse"><path d="M-2 2 L2-2 M0 10 L10 0 M8 12 L12 8" stroke="#66635e" strokeWidth="3"/><path d="M-2 8 L8-2 M2 12 L12 2" stroke="#181817" strokeWidth="3"/></pattern>
        <pattern id={ids.gyroid} width="14" height="14" patternUnits="userSpaceOnUse"><path d="M0 7 Q3.5 0 7 7 T14 7 M7 0 Q14 3.5 7 7 T7 14" fill="none" stroke={tone.line} strokeWidth="1.6" opacity=".72"/></pattern>
        <filter id={ids.shadow}><feDropShadow dx="0" dy="9" stdDeviation="7" floodColor="#0d0b09" floodOpacity=".32"/></filter>
      </defs>
      <ellipse cx="300" cy="257" rx={chassis === 'wing' ? 225 : 175} ry="17" fill="#1a1714" opacity=".18"/>
      <g className="drone-render__machine" filter={`url(#${ids.shadow})`}>
        <Chassis chassis={chassis} paint={paint} ids={ids}/>
        <MaterialLayer view={view} material={build.material || 'regrind'} tone={tone} ids={ids}/>
        <PowerModule view={view} power={build.power || 'sprinter'} paint={paint}/>
        <SystemModule view={view} system={build.system || 'direct'} paint={paint}/>
        <SensorModule view={view} sensor={build.sensor || 'daylight'} paint={paint}/>
        <FinishLayer view={view} build={build} paint={paint}/>
      </g>
      {printing && <g className="drone-render__scan"><rect x="40" y="0" width="520" height="3" fill="#d2793f"/><rect x="40" y="0" width="520" height="28" fill="#d2793f" opacity=".12"/></g>}
    </svg>
    {highlight && <span className="drone-render__install-label">{highlight.toUpperCase()} INSTALLED</span>}
    {label && <span className="drone-render__label">{view.toUpperCase()} VIEW // FABRICATION MODEL // NOT TO SCALE</span>}
  </div>;
}
