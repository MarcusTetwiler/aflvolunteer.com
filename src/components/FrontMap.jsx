import { useState, useRef, useEffect } from 'react';
import './FrontMap.css';

// Approximate relative positions on a stylized 0-1000 x 0-1000 canvas,
// loosely keyed to real geography (Poland/Ukraine theater) but drawn as a
// hand-marked operations chart, not a literal basemap.
const LOCATIONS = [
  {
    id: 'london',
    name: 'London Command Center',
    country: 'United Kingdom',
    x: 90, y: 195,
    status: 'active',
    summary: 'A secretly retrofitted auditorium converted into a massive drone hangar.',
  },
  {
    id: 'medyka',
    name: 'Camp Tadeusz',
    country: 'Medyka, Poland',
    x: 455, y: 470,
    status: 'active',
    summary: 'A gritty volunteer intake camp pushed deep by the Russian advance, centered around an old statue of a Polish statesman.',
  },
  {
    id: 'lublin',
    name: 'Lublin',
    country: 'Poland',
    x: 480, y: 300,
    status: 'fortified',
    summary: 'An impenetrable, militarized fortress city — watchtowers, rail-fed artillery, autonomous turrets, and a secure underground NATO command bunker.',
  },
  {
    id: 'rzeszow',
    name: 'Rzeszów',
    country: 'Poland',
    x: 370, y: 410,
    status: 'active',
    summary: 'A city along the S19 highway, near the front.',
  },
  {
    id: 'lviv',
    name: 'Lviv',
    country: 'Ukraine',
    x: 600, y: 415,
    status: 'unknown',
    summary: 'Status unknown. Under enemy occupation.',
  },
  {
    id: 'zalissia',
    name: 'Zalissia & the Soviet Tunnels',
    country: 'Ukraine',
    x: 635, y: 460,
    status: 'unknown',
    summary: 'National park and Soviet-era tunnel network. Status unknown. Under enemy occupation.',
  },
  {
    id: 'kyiv',
    name: 'The Maidan',
    country: 'Kyiv, Ukraine',
    x: 700, y: 340,
    status: 'unknown',
    summary: 'Status unknown. Under enemy occupation.',
  },
  {
    id: 'odesa',
    name: 'Odesa',
    country: 'Ukraine',
    x: 640, y: 540,
    status: 'unknown',
    summary: 'Status unknown. Under enemy occupation.',
  },
  {
    id: 'moscow',
    name: 'Moscow',
    country: 'Russia',
    x: 880, y: 200,
    status: 'hostile',
    summary: 'The enemy capital.',
  },
];

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

// Rough front line path (hand-drawn feel) separating contested east from held west
const FRONT_LINE = 'M 560,80 C 540,160 600,230 560,310 C 525,380 580,460 555,560 C 540,640 590,720 560,800';

const STATUS_LABEL = {
  active: 'ACTIVE',
  fortified: 'FORTIFIED',
  unknown: 'UNKNOWN — OCCUPIED',
  hostile: 'HOSTILE CAPITAL',
};

export default function FrontMap() {
  const [activeId, setActiveId] = useState(null);
  const [pinned, setPinned] = useState(false); // true once tapped on touch devices
  const containerRef = useRef(null);

  const active = LOCATIONS.find((l) => l.id === activeId) || null;

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
      <div className="front-map__frame">
        <div className="front-map__taped-corner front-map__taped-corner--tl" aria-hidden="true" />
        <div className="front-map__taped-corner front-map__taped-corner--tr" aria-hidden="true" />

        <svg
          className="front-map__svg"
          viewBox="0 0 1000 880"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Operational map of the eastern theater showing volunteer corridors, occupied cities, and the front line."
        >
          <defs>
            <filter id="paperTexture" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="7" result="noise" />
              <feColorMatrix in="noise" type="matrix"
                values="0 0 0 0 0.16
                        0 0 0 0 0.14
                        0 0 0 0 0.11
                        0 0 0 0.05 0" />
            </filter>
            <radialGradient id="vignette" cx="50%" cy="42%" r="75%">
              <stop offset="60%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.18" />
            </radialGradient>
          </defs>

          {/* base paper */}
          <rect x="0" y="0" width="1000" height="880" fill="var(--paper-deep)" />
          <rect x="0" y="0" width="1000" height="880" filter="url(#paperTexture)" />

          {/* held / NATO territory wash (west) */}
          <path
            d="M 0,0 L 560,0 C 540,80 600,160 560,240 C 525,320 580,400 555,480 C 540,560 590,640 560,720 C 545,780 560,830 540,880 L 0,880 Z"
            fill="var(--khaki)" opacity="0.16"
          />

          {/* contested / occupied territory hatch (east) */}
          <g opacity="0.5">
            {Array.from({ length: 26 }).map((_, i) => (
              <line
                key={i}
                x1={560 + i * 24} y1="-20"
                x2={560 + i * 24 - 200} y2="900"
                stroke="var(--burnt)" strokeWidth="1" opacity="0.18"
              />
            ))}
          </g>

          {/* volunteer corridor: Heathrow-ish west edge -> Lublin -> Medyka -> Rzeszów */}
          <path
            d="M 30,150 C 160,200 330,260 480,300"
            fill="none" stroke="var(--burnt)" strokeWidth="2" strokeDasharray="1 10" strokeLinecap="round" opacity="0.7"
          />
          <path
            d="M 480,300 C 470,380 460,430 455,470"
            fill="none" stroke="var(--burnt)" strokeWidth="2" strokeDasharray="1 10" strokeLinecap="round" opacity="0.7"
          />
          <path
            d="M 480,300 C 430,350 395,385 370,410"
            fill="none" stroke="var(--burnt)" strokeWidth="2" strokeDasharray="1 10" strokeLinecap="round" opacity="0.7"
          />

          {/* the front line */}
          <path
            d={FRONT_LINE}
            fill="none"
            stroke="var(--burnt)"
            strokeWidth="3"
            strokeLinecap="round"
            className="front-map__frontline"
          />
          <text x="572" y="150" className="front-map__frontline-label" transform="rotate(8 572 150)">
            THE FRONT
          </text>

          {/* location pins */}
          {LOCATIONS.map((loc) => (
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
              <circle r="14" className="front-map__pin-halo" />
              <circle r="5.5" className="front-map__pin-dot" />
              <text y="-20" textAnchor="middle" className="front-map__pin-label">
                {loc.name}
              </text>
            </g>
          ))}

          <rect x="0" y="0" width="1000" height="880" fill="url(#vignette)" />
        </svg>

        {active && (
          <div
            className="front-map__brief"
            style={{
              left: `${(active.x / 1000) * 100}%`,
              top: `${(active.y / 880) * 100}%`,
            }}
          >
            <div className="front-map__brief-card">
              <div className="front-map__brief-pin-tape" aria-hidden="true" />
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
      </div>

      <div className="front-map__legend">
        <div className="front-map__legend-group">
          <span className="front-map__legend-swatch front-map__legend-swatch--active" /> Active
          <span className="front-map__legend-swatch front-map__legend-swatch--fortified" /> Fortified
          <span className="front-map__legend-swatch front-map__legend-swatch--unknown" /> Unknown
          <span className="front-map__legend-swatch front-map__legend-swatch--hostile" /> Hostile
        </div>
      </div>

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
  );
}
