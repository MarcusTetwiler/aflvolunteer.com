import { useState, useRef, useEffect } from 'react';
import { ANDREW_CONTRACTS, ANDREW_STATUS_LABEL, ANDREW_CLASS_LABEL } from './andrewContracts';
import TheaterBasemap from './TheaterBasemap';
import './FrontMap.css';

// Coordinates are real-world projections (equirectangular, latitude-corrected,
// bbox 14.5–40.0E / 43.5–56.5N onto a 1000x880 canvas — see
// src/data/theaterMap.json and the geodata/project.py script that produced it).
// London falls off-canvas to the west at true scale, so it's shown as an
// edge indicator rather than a faked on-canvas position.
const LOCATIONS = [
  {
    id: 'medyka',
    name: 'Camp Tadeusz',
    country: 'Medyka, Poland',
    x: 332, y: 467,
    labelPos: 'bottom',
    status: 'active',
    summary: 'A gritty volunteer intake camp pushed deep by the Russian advance, centered around an old statue of a Polish statesman.',
  },
  {
    id: 'lublin',
    name: 'Lublin',
    country: 'Poland',
    x: 316, y: 379,
    labelPos: 'top',
    status: 'fortified',
    summary: 'An impenetrable, militarized fortress city — watchtowers, rail-fed artillery, autonomous turrets, and a secure underground NATO command bunker.',
  },
  {
    id: 'rzeszow',
    name: 'Rzeszów',
    country: 'Poland',
    x: 294, y: 453,
    labelPos: 'left',
    status: 'active',
    summary: 'A city along the S19 highway, near the front.',
  },
  {
    id: 'lviv',
    name: 'Lviv',
    country: 'Ukraine',
    x: 374, y: 465,
    labelPos: 'right',
    status: 'unknown',
    summary: 'Status unknown. Under enemy occupation.',
  },
  {
    id: 'zalissia',
    name: 'Zalissia & the Soviet Tunnels',
    country: 'Ukraine',
    x: 560, y: 415,
    labelPos: 'top',
    status: 'unknown',
    summary: 'National park and Soviet-era tunnel network. Status unknown. Under enemy occupation.',
  },
  {
    id: 'kyiv',
    name: 'The Maidan',
    country: 'Kyiv, Ukraine',
    x: 628, y: 428,
    labelPos: 'bottom',
    status: 'unknown',
    summary: 'Status unknown. Under enemy occupation.',
  },
  {
    id: 'odesa',
    name: 'Odesa',
    country: 'Ukraine',
    x: 636, y: 671,
    labelPos: 'top',
    status: 'unknown',
    summary: 'Status unknown. Under enemy occupation.',
  },
  {
    id: 'moscow',
    name: 'Moscow',
    country: 'Russia',
    x: 907, y: 102,
    labelPos: 'top',
    status: 'hostile',
    summary: 'The enemy capital.',
  },
];

// London sits real-world far to the west of this map's frame; shown as an
// edge tab rather than compressed onto canvas at a false position.
const LONDON_EDGE = {
  id: 'london',
  name: 'London Command Center',
  country: 'United Kingdom',
  edgeY: 345,
  summary: 'A secretly retrofitted auditorium converted into a massive drone hangar.',
};

const OFF_MAP = [
  {
    id: 'ngh',
    name: 'Northrop Grumman Housing Community',
    summary: 'A sterilized, corporate-issued suburban neighborhood where every mailbox bears the company logo and teenagers secretly hone their skills on drone simulators.',
  },
  {
    id: 'classroom',
    name: 'The Assessment Classroom',
    summary: 'A local school facility draped in recruitment banners where students\u2019 pattern-anticipation skills are covertly evaluated to draft military drone pilots.',
  },
  {
    id: 'heathrow',
    name: 'Heathrow Airport',
    summary: 'A bustling international transit hub where AFL volunteers first assemble at a lounge bar broadcasting drone races.',
  },
];

// Front line traced near the real Poland/Ukraine border, bulging east around
// the held corridor (Lublin / Rzeszów / Medyka) and looping to keep Lviv,
// Zalissia, Kyiv, and Odesa on the occupied side — all checked against the
// real projected coordinates above (held pins stay >=40px west of the line,
// occupied pins stay >=40px east of it across their y-range).
const FRONT_LINE_BODY = '430,55 C 415,155 435,215 405,295 C 378,345 358,395 353,435 C 349,470 351,505 365,545 C 385,595 420,625 450,665 C 470,695 465,735 478,775 C 488,805 478,840 490,875';
const FRONT_LINE = `M ${FRONT_LINE_BODY}`;

const STATUS_LABEL = {
  active: 'ACTIVE',
  fortified: 'FORTIFIED',
  unknown: 'UNKNOWN — OCCUPIED',
  hostile: 'HOSTILE CAPITAL',
};

export default function FrontMap() {
  const [pov, setPov] = useState('elena'); // 'elena' | 'andrew'
  const [activeId, setActiveId] = useState(null);
  const [pinned, setPinned] = useState(false); // true once tapped on touch devices
  const containerRef = useRef(null);

  const active = LOCATIONS.find((l) => l.id === activeId) || null;
  const activeContract = ANDREW_CONTRACTS.find((c) => c.id === activeId) || null;
  const londonActive = activeId === LONDON_EDGE.id;

  function switchPov(next) {
    if (next === pov) return;
    setPov(next);
    setActiveId(null);
    setPinned(false);
  }

  useEffect(() => {
    function handleOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setActiveId(null);
        setPinned(false);
      }
    }
    document.addEventListener('pointerdown', handleOutside);
    return () => document.removeEventListener('pointerdown', handleOutside);
  }, []);

  function handleEnter(id) {
    if (!pinned) setActiveId(id);
  }
  function handleLeave() {
    if (!pinned) setActiveId(null);
  }
  function handleClick(id) {
    if (pinned && activeId === id) {
      setPinned(false);
      setActiveId(null);
    } else {
      setActiveId(id);
      setPinned(true);
    }
  }

  return (
    <div className="front-map" ref={containerRef}>
      <div className="front-map__pov-toggle" role="group" aria-label="Map perspective">
        <button
          type="button"
          className={pov === 'elena' ? 'is-active' : ''}
          onClick={() => switchPov('elena')}
          aria-pressed={pov === 'elena'}
        >
          Elena
        </button>
        <button
          type="button"
          className={pov === 'andrew' ? 'is-active' : ''}
          onClick={() => switchPov('andrew')}
          aria-pressed={pov === 'andrew'}
        >
          Andrew
        </button>
      </div>

      <div className={`front-map__frame front-map__frame--${pov}`}>
        {pov === 'elena' ? (
          <>
            {/* ---- ISW-style header bar ---- */}
            <div className="front-map__header">
              <div className="front-map__header-text">
                <h2>Russian Forces Advance Into Eastern Poland</h2>
                <p>Control of Terrain Assessment — Current Operational Period</p>
              </div>
              <div className="front-map__header-logo">
                <span className="front-map__header-logo-mark">⚑</span>
                <div>
                  <strong>AFL</strong>
                  <span>Eastern Theater Archive</span>
                </div>
              </div>
            </div>

            <div className="front-map__body">
              <svg
                className="front-map__svg"
                viewBox="0 0 1000 880"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="Map of Poland and Ukraine showing the front line, occupied cities, held territory, and volunteer corridors."
              >
                <defs>
                  <clipPath id="heldClip">
                    <path d={`M 0,0 L ${FRONT_LINE_BODY} L 0,880 Z`} />
                  </clipPath>
                  <clipPath id="occupiedClip">
                    <path d={`M 1000,0 L ${FRONT_LINE_BODY} L 1000,880 Z`} />
                  </clipPath>
                </defs>

                {/* real basemap: countries, rivers, reference cities.
                    Lublin/Rzeszów/Lviv/Kyiv/Odesa/Moscow are NOT passed here —
                    they're already rendered as the story's own interactive
                    pins below, so duplicating them as basemap dots would
                    double-label the same point. */}
                <TheaterBasemap />

                {/* assessed Russian-controlled territory (solid fill, east of line) */}
                <rect x="0" y="0" width="1000" height="880" className="front-map__held-fill" clipPath="url(#heldClip)" />
                <rect x="0" y="0" width="1000" height="880" className="front-map__occupied-fill" clipPath="url(#occupiedClip)" />

                {/* infiltration hatch band, ISW-style diagonal stripes along the line */}
                <g clipPath="url(#occupiedClip)" className="front-map__hatch">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <line
                      key={i}
                      x1={380 + i * 22} y1="-20"
                      x2={380 + i * 22 - 160} y2="900"
                    />
                  ))}
                </g>

                {/* volunteer corridor: London edge -> Lublin -> Medyka / Rzeszów */}
                <path
                  className="front-map__corridor"
                  d="M 0,345 C 120,360 220,372 316,379"
                />
                <path
                  className="front-map__corridor"
                  d="M 316,379 C 320,410 326,440 332,467"
                />
                <path
                  className="front-map__corridor"
                  d="M 316,379 C 308,405 300,430 294,453"
                />

                {/* the front line */}
                <path d={FRONT_LINE} className="front-map__frontline" />
                <text x="445" y="245" className="front-map__frontline-label" transform="rotate(14 445 245)">
                  THE FRONT
                </text>

                {/* location pins */}
                {LOCATIONS.map((loc) => {
                  const pos = loc.labelPos || 'top';
                  const labelProps = {
                    top: { x: 0, y: -18, textAnchor: 'middle' },
                    bottom: { x: 0, y: 24, textAnchor: 'middle' },
                    left: { x: -14, y: 4, textAnchor: 'end' },
                    right: { x: 14, y: 4, textAnchor: 'start' },
                  }[pos];
                  return (
                    <g
                      key={loc.id}
                      transform={`translate(${loc.x}, ${loc.y})`}
                      className={`front-map__pin front-map__pin--${loc.status} ${activeId === loc.id ? 'is-active' : ''}`}
                      onPointerEnter={() => handleEnter(loc.id)}
                      onPointerLeave={handleLeave}
                      onClick={() => handleClick(loc.id)}
                      tabIndex={0}
                      role="button"
                      aria-label={`${loc.name}, ${loc.country}. Status: ${STATUS_LABEL[loc.status]}`}
                      onFocus={() => handleEnter(loc.id)}
                      onBlur={handleLeave}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(loc.id); } }}
                    >
                      <circle r="13" className="front-map__pin-halo" />
                      <circle r="5" className="front-map__pin-dot" />
                      <text x={labelProps.x} y={labelProps.y} textAnchor={labelProps.textAnchor} className="front-map__pin-label">
                        {loc.name}
                      </text>
                    </g>
                  );
                })}

                {/* compass rose */}
                <g className="front-map__compass" transform="translate(48, 60)">
                  <circle r="22" />
                  <line x1="0" y1="-22" x2="0" y2="22" />
                  <line x1="-22" y1="0" x2="22" y2="0" />
                  <text y="-28" textAnchor="middle">N</text>
                  <text y="36" textAnchor="middle">S</text>
                  <text x="30" y="4" textAnchor="middle">E</text>
                  <text x="-30" y="4" textAnchor="middle">W</text>
                </g>

                {/* scale bar */}
                <g className="front-map__scale" transform="translate(48, 820)">
                  <line x1="0" y1="0" x2="120" y2="0" />
                  <line x1="0" y1="-5" x2="0" y2="5" />
                  <line x1="60" y1="-5" x2="60" y2="5" />
                  <line x1="120" y1="-5" x2="120" y2="5" />
                  <text x="0" y="18">0</text>
                  <text x="60" y="18" textAnchor="middle">150</text>
                  <text x="120" y="18" textAnchor="end">300 km</text>
                </g>
              </svg>

              {/* London edge indicator — true to real-world position (off-canvas west) */}
              <button
                type="button"
                className={`front-map__edge-tab ${londonActive ? 'is-active' : ''}`}
                style={{ top: `${(LONDON_EDGE.edgeY / 880) * 100}%` }}
                onPointerEnter={() => handleEnter(LONDON_EDGE.id)}
                onPointerLeave={handleLeave}
                onClick={() => handleClick(LONDON_EDGE.id)}
                onFocus={() => handleEnter(LONDON_EDGE.id)}
                onBlur={handleLeave}
                aria-label={`${LONDON_EDGE.name}, ${LONDON_EDGE.country}, approximately 1,450 km west, off this map`}
              >
                <span className="front-map__edge-tab-arrow">◄</span>
                <span className="front-map__edge-tab-label">London — 1,450 km W</span>
              </button>

              {/* inset locator map (very simplified continental silhouette) */}
              <div className="front-map__inset" aria-hidden="true">
                <svg viewBox="0 0 140 120">
                  <rect x="0" y="0" width="140" height="120" className="front-map__inset-bg" />
                  <rect x="22" y="18" width="96" height="84" className="front-map__inset-frame" />
                  <text x="70" y="14" textAnchor="middle" className="front-map__inset-label">EUROPE</text>
                </svg>
              </div>

              {active && (
                <div
                  className="front-map__brief"
                  style={{
                    left: `${(active.x / 1000) * 100}%`,
                    top: `${(active.y / 880) * 100}%`,
                  }}
                >
                  <div className="front-map__brief-card">
                    <p className="front-map__brief-label">Location</p>
                    <h3 className="front-map__brief-name">{active.name}</h3>
                    <p className="front-map__brief-meta">{active.country}</p>
                    <p className={`front-map__brief-status front-map__brief-status--${active.status}`}>
                      {STATUS_LABEL[active.status]}
                    </p>
                    <p className="front-map__brief-summary">{active.summary}</p>
                  </div>
                </div>
              )}

              {londonActive && (
                <div className="front-map__brief front-map__brief--edge" style={{ left: '6%', top: `${(LONDON_EDGE.edgeY / 880) * 100}%` }}>
                  <div className="front-map__brief-card">
                    <p className="front-map__brief-label">Location</p>
                    <h3 className="front-map__brief-name">{LONDON_EDGE.name}</h3>
                    <p className="front-map__brief-meta">{LONDON_EDGE.country}</p>
                    <p className="front-map__brief-status front-map__brief-status--active">ACTIVE</p>
                    <p className="front-map__brief-summary">{LONDON_EDGE.summary}</p>
                  </div>
                </div>
              )}
            </div>

            {/* ---- legend, credit, off-map ---- */}
            <div className="front-map__footer-content">
              <div className="front-map__legend">
                <div className="front-map__legend-item">
                  <span className="front-map__legend-swatch front-map__legend-swatch--held" />
                  NATO-held territory
                </div>
                <div className="front-map__legend-item">
                  <span className="front-map__legend-swatch front-map__legend-swatch--occupied" />
                  Assessed Russian-controlled territory
                </div>
                <div className="front-map__legend-item">
                  <span className="front-map__legend-line front-map__legend-line--front" />
                  The Front
                </div>
                <div className="front-map__legend-item">
                  <span className="front-map__legend-line front-map__legend-line--corridor" />
                  Volunteer corridor
                </div>
                <div className="front-map__legend-item">
                  <span className="front-map__legend-swatch front-map__legend-swatch--active" /> Active
                  <span className="front-map__legend-swatch front-map__legend-swatch--fortified" /> Fortified
                  <span className="front-map__legend-swatch front-map__legend-swatch--unknown" /> Unknown
                  <span className="front-map__legend-swatch front-map__legend-swatch--hostile" /> Hostile
                </div>
              </div>

              <p className="front-map__credit">
                Cartography: AFL Operations Desk. Base geography derived from public domain sources;
                front line, territory assessments, and all locations are fictional.
              </p>

              <div className="front-map__off-map">
                <p className="eyebrow">Off Map</p>
                <ul>
                  {OFF_MAP.map((loc) => (
                    <li key={loc.id}>
                      <span className="front-map__off-map-name">{loc.name}</span>
                      <span className="front-map__off-map-summary">{loc.summary}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="front-map__body">
              <svg
                className="front-map__svg front-map__svg--andrew"
                viewBox="0 0 1000 880"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="Andrew's contract ledger: a dense field of public and private drone contracts, shown as abstract grid markers rather than named places."
              >
                <defs>
                  <radialGradient id="andrewGlow" cx="50%" cy="38%" r="70%">
                    <stop offset="0%" stopColor="#2A2118" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#0E0C0A" stopOpacity="1" />
                  </radialGradient>
                  <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(216, 168, 120, 0.08)" strokeWidth="1" />
                  </pattern>
                </defs>

                <rect x="0" y="0" width="1000" height="880" fill="url(#andrewGlow)" />
                <rect x="0" y="0" width="1000" height="880" fill="url(#gridPattern)" />

                {/* contract markers — dense, numerous, unnamed */}
                {ANDREW_CONTRACTS.map((c) => (
                  <g
                    key={c.id}
                    transform={`translate(${c.x}, ${c.y})`}
                    className={`andrew-pin andrew-pin--${c.classification} andrew-pin--${c.status} ${activeId === c.id ? 'is-active' : ''}`}
                    onPointerEnter={() => handleEnter(c.id)}
                    onPointerLeave={handleLeave}
                    onClick={() => handleClick(c.id)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Contract ${c.code}. ${ANDREW_CLASS_LABEL[c.classification]}. Status: ${ANDREW_STATUS_LABEL[c.status]}`}
                    onFocus={() => handleEnter(c.id)}
                    onBlur={handleLeave}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(c.id); } }}
                  >
                    <circle r="9" className="andrew-pin-halo" />
                    <circle r="2.6" className="andrew-pin-dot" />
                  </g>
                ))}
              </svg>

              {activeContract && (
                <div
                  className="front-map__brief front-map__brief--andrew"
                  style={{
                    left: `${(activeContract.x / 1000) * 100}%`,
                    top: `${(activeContract.y / 880) * 100}%`,
                  }}
                >
                  <div className="andrew-brief-card">
                    <p className="andrew-brief-label">Contract</p>
                    <h3 className="andrew-brief-code">{activeContract.code}</h3>
                    <p className={`andrew-brief-class andrew-brief-class--${activeContract.classification}`}>
                      {ANDREW_CLASS_LABEL[activeContract.classification]}
                    </p>
                    <div className="andrew-brief-row">
                      <span>Status</span>
                      <span className={`andrew-brief-status andrew-brief-status--${activeContract.status}`}>
                        {ANDREW_STATUS_LABEL[activeContract.status]}
                      </span>
                    </div>
                    <div className="andrew-brief-row">
                      <span>Payout</span>
                      <span>{activeContract.payout}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="front-map__footer-content">
              <div className="andrew-ledger-summary">
                <span className="andrew-ledger-summary__count">{ANDREW_CONTRACTS.length}</span>
                <span className="andrew-ledger-summary__label">Contracts logged. The system doesn&rsquo;t ask why, only whether the kill was confirmed.</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
