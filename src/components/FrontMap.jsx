import { useState, useRef, useEffect } from 'react';
import { ANDREW_CONTRACTS, ANDREW_STATUS_LABEL, ANDREW_CLASS_LABEL } from './andrewContracts';
import TheaterBasemap from './TheaterBasemap';
import './FrontMap.css';

// Coordinates are real-world projections (equirectangular, latitude-corrected,
// bbox -11.0–48.0E / 35.0–64.0N — most of Europe and western Russia — onto a
// 1000x880 canvas). See src/data/theaterMap.json and geodata-pipeline/.
// At this zoom the theater is a hot zone inside a much larger visible map,
// not the entire frame — the war is one churning piece of something bigger.
const LOCATIONS = [
  {
    id: 'medyka',
    name: 'Camp Tadeusz',
    country: 'Medyka, Poland',
    x: 575.8, y: 431.8,
    status: 'active',
    summary: 'A gritty volunteer intake camp pushed deep by the Russian advance, centered around an old statue of a Polish statesman.',
  },
  {
    id: 'lublin',
    name: 'Lublin',
    country: 'Poland',
    x: 569.0, y: 394.4,
    status: 'fortified',
    summary: 'An impenetrable, militarized fortress city — watchtowers, rail-fed artillery, autonomous turrets, and a secure underground NATO command bunker.',
  },
  {
    id: 'rzeszow',
    name: 'Rzeszów',
    country: 'Poland',
    x: 559.4, y: 425.9,
    status: 'active',
    summary: 'A city along the S19 highway, near the front.',
  },
  {
    id: 'lviv',
    name: 'Lviv',
    country: 'Ukraine',
    x: 593.7, y: 431.1,
    status: 'unknown',
    summary: 'Status unknown. Under enemy occupation.',
  },
  {
    id: 'zalissia',
    name: 'Zalissia & the Soviet Tunnels',
    country: 'Ukraine',
    x: 640, y: 370,
    status: 'unknown',
    summary: 'National park and Soviet-era tunnel network. Status unknown. Under enemy occupation.',
  },
  {
    id: 'kyiv',
    name: 'The Maidan',
    country: 'Kyiv, Ukraine',
    x: 703.8, y: 415.2,
    status: 'unknown',
    summary: 'Status unknown. Under enemy occupation.',
  },
  {
    id: 'odesa',
    name: 'Odesa',
    country: 'Ukraine',
    x: 707.2, y: 518.8,
    status: 'unknown',
    summary: 'Status unknown. Under enemy occupation.',
  },
  {
    id: 'moscow',
    name: 'Moscow',
    country: 'Russia',
    x: 824.0, y: 276.7,
    status: 'hostile',
    summary: 'The enemy capital.',
  },
  {
    id: 'london',
    name: 'London Command Center',
    country: 'United Kingdom',
    x: 184.3, y: 387.6,
    status: 'active',
    summary: 'A secretly retrofitted auditorium converted into a massive drone hangar.',
  },
];

// Lublin / Rzeszów / Medyka / Lviv sit within ~45px of each other at this
// zoom (they're genuinely that close in reality). Rather than cram four
// always-on text labels into that space, they get a single focus ring with
// one external callout; each pin is still individually hoverable/clickable.
const FOCUS_CLUSTER = {
  ids: ['medyka', 'lublin', 'rzeszow', 'lviv'],
  cx: 574, cy: 421, r: 41,
  labelX: 460, labelY: 360,
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

// The main front: a single irregular boundary running the length of the
// visible Baltic-to-Black-Sea border, verified against every story pin's
// real-world projected position (see geodata-pipeline/ for the projection
// math). Held pins stay west of this curve, occupied pins stay east, with
// margins checked at each pin's exact y — tightest is ~9px through the
// Medyka/Lviv corridor, which mirrors how close those places actually sit
// in reality.
const FRONT_BOUNDARY_BODY = '560,90 640,150 590,210 C 545,260 615,300 580,350 C 555,375 582,392 580,410 C 578,420 582,427 585,432 C 590,440 575,460 605,490 C 625,510 655,525 700,550 C 730,565 690,595 720,630 C 750,670 760,750 780,880';
const FRONT_BOUNDARY = `M 600,20 C ${FRONT_BOUNDARY_BODY}`;

// Decorative salient/pocket blobs — organic, hand-irregular shapes that
// bulge across the main boundary in both directions. These are what make
// the front read as fluid and contested rather than a clean coastline; none
// sit within 25px of any story pin (verified in the geodata pipeline notes).
const SALIENTS = [
  // pushes occupied territory west, into held space
  { kind: 'occupied', d: 'M 632.6,145.2 L 635.6,153.1 L 638.9,159.5 L 640.3,164.2 L 638.1,167.1 L 632.5,168.5 L 624.5,168.5 L 614.9,167.5 L 604.7,165.6 L 594.7,163.2 L 585.3,160.2 L 577.3,156.9 L 571.2,153.2 L 567.7,149.3 L 567.3,145.3 L 570.7,141.3 L 576.4,137.1 L 582.0,132.4 L 585.2,126.9 L 586.0,120.5 L 585.9,113.6 L 586.5,106.4 L 589.3,99.0 L 595.0,92.0 L 602.2,86.8 L 609.0,84.7 L 613.8,87.2 L 615.8,94.3 L 618.4,99.6 L 624.2,98.8 L 631.4,94.5 L 637.7,90.6 L 641.0,90.1 L 641.7,93.1 L 640.5,98.9 L 638.1,106.8 L 635.4,116.0 L 633.1,126.0 L 631.9,135.9 L 632.6,145.2 Z' },
  // a held pocket stranded inside occupied territory (encircled holdout)
  { kind: 'held', d: 'M 585.9,259.6 L 584.0,263.3 L 581.0,266.3 L 577.4,268.8 L 573.4,270.6 L 569.1,271.8 L 564.7,272.3 L 560.2,272.0 L 555.8,270.8 L 551.6,268.7 L 547.8,265.8 L 544.5,262.1 L 541.7,258.0 L 539.5,253.5 L 538.0,249.0 L 537.4,244.5 L 537.7,240.3 L 539.0,236.7 L 541.4,233.6 L 544.7,231.2 L 548.2,228.7 L 551.4,225.9 L 554.4,223.0 L 557.5,220.6 L 561.0,218.9 L 564.9,218.2 L 569.1,218.3 L 573.6,219.5 L 578.4,221.6 L 583.2,224.6 L 587.6,228.2 L 590.9,231.9 L 592.6,235.5 L 592.0,238.5 L 588.9,240.7 L 585.5,243.0 L 584.4,246.4 L 585.0,250.7 L 586.0,255.3 L 585.9,259.6 Z' },
  { kind: 'occupied', d: 'M 675.1,592.1 L 679.0,597.4 L 683.1,601.9 L 685.6,605.3 L 684.7,607.7 L 680.9,609.2 L 675.0,610.4 L 668.1,611.7 L 661.1,613.7 L 655.0,616.8 L 650.8,621.4 L 648.0,625.9 L 644.6,626.8 L 640.5,624.2 L 635.8,619.2 L 630.8,612.9 L 625.6,606.3 L 620.9,599.9 L 617.1,593.9 L 615.0,588.6 L 615.3,584.3 L 618.5,581.2 L 624.6,579.2 L 630.1,577.2 L 630.7,573.3 L 627.6,568.0 L 626.9,563.1 L 629.6,559.2 L 634.9,556.3 L 642.0,554.6 L 649.8,553.9 L 657.7,554.4 L 664.5,556.2 L 669.5,559.1 L 672.1,563.3 L 673.0,568.4 L 672.9,574.1 L 672.7,580.2 L 673.1,586.3 L 675.1,592.1 Z' },
  { kind: 'held', d: 'M 845.9,471.5 L 847.5,477.1 L 847.5,481.3 L 843.5,483.2 L 837.5,484.2 L 831.8,485.6 L 826.8,487.0 L 822.3,487.2 L 817.8,485.3 L 813.4,482.1 L 808.9,478.7 L 804.2,476.2 L 799.3,475.8 L 794.7,476.5 L 791.7,475.0 L 790.3,471.6 L 790.2,466.5 L 791.3,460.3 L 793.4,453.3 L 796.4,446.0 L 800.1,438.7 L 804.4,431.9 L 809.0,426.0 L 813.9,421.3 L 818.8,418.3 L 823.6,417.4 L 828.3,418.8 L 833.0,421.5 L 838.1,424.5 L 843.2,427.5 L 847.9,430.7 L 851.8,434.1 L 854.3,437.7 L 855.1,441.6 L 854.1,445.9 L 852.0,450.4 L 849.5,455.3 L 847.2,460.4 L 845.8,465.8 L 845.9,471.5 Z' },
  { kind: 'held', d: 'M 877.9,355.1 L 876.6,359.6 L 874.0,363.1 L 870.3,365.7 L 865.7,367.5 L 860.4,368.5 L 854.7,368.9 L 848.7,368.8 L 842.6,368.1 L 836.8,366.9 L 831.4,365.4 L 826.7,363.6 L 822.8,361.6 L 820.0,359.4 L 818.6,357.1 L 818.5,354.8 L 819.9,352.4 L 822.3,349.7 L 825.5,346.6 L 829.3,342.9 L 833.6,338.5 L 837.9,333.3 L 842.0,328.1 L 845.4,324.2 L 847.8,323.2 L 848.6,326.5 L 850.2,328.5 L 854.3,326.1 L 859.8,323.7 L 865.7,324.0 L 870.9,326.3 L 874.4,330.0 L 875.1,334.6 L 872.2,339.3 L 867.9,342.8 L 868.0,343.2 L 872.4,342.6 L 875.8,345.2 L 877.6,349.9 L 877.9,355.1 Z' },
  { kind: 'occupied', d: 'M 797.9,650.1 L 797.1,654.4 L 795.3,658.0 L 792.6,661.0 L 789.2,663.5 L 785.3,665.5 L 781.0,667.1 L 776.5,668.6 L 771.9,669.8 L 767.4,670.9 L 763.1,672.0 L 759.0,672.5 L 755.0,672.3 L 751.1,670.8 L 747.3,667.9 L 744.1,664.0 L 742.3,659.7 L 742.6,656.0 L 745.4,653.4 L 748.7,651.0 L 750.7,648.0 L 751.9,644.4 L 752.8,640.4 L 753.8,636.2 L 755.4,631.9 L 758.3,627.8 L 762.3,624.2 L 766.6,622.0 L 770.3,622.3 L 772.7,625.7 L 774.2,630.0 L 776.6,630.8 L 780.3,628.1 L 784.2,626.7 L 787.9,627.7 L 791.3,630.6 L 794.1,634.8 L 796.3,639.8 L 797.6,645.1 L 797.9,650.1 Z' },
];

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
                aria-label="Map of Europe and western Russia showing a contested, irregular front line running from the Baltic to the Black Sea, with salients and pockets on both sides, and the eastern Poland theater highlighted."
              >
                <defs>
                  <clipPath id="occupiedClip">
                    <path d={`M 1000,0 L 600,0 L 600,20 C ${FRONT_BOUNDARY_BODY} L 1000,880 Z`} />
                  </clipPath>
                </defs>

                <TheaterBasemap variant="light" />

                {/* territory tint: held = bare basemap, occupied = warm rust wash */}
                <rect x="0" y="0" width="1000" height="880" className="front-map__occupied-fill" clipPath="url(#occupiedClip)" />

                {/* decorative salients/pockets — fluid, bubbling front texture */}
                {SALIENTS.map((s, i) => (
                  <path key={i} d={s.d} className={`front-map__salient front-map__salient--${s.kind}`} />
                ))}

                {/* the main boundary, inked double-stroke for a hand-drawn feel */}
                <path d={FRONT_BOUNDARY} className="front-map__frontline-shadow" />
                <path d={FRONT_BOUNDARY} className="front-map__frontline" />

                {/* focus ring around the dense Lublin/Rzeszów/Medyka/Lviv cluster */}
                <circle
                  cx={FOCUS_CLUSTER.cx} cy={FOCUS_CLUSTER.cy} r={FOCUS_CLUSTER.r}
                  className="front-map__focus-ring"
                />
                <line
                  x1={FOCUS_CLUSTER.cx - FOCUS_CLUSTER.r * 0.7} y1={FOCUS_CLUSTER.cy - FOCUS_CLUSTER.r * 0.7}
                  x2={FOCUS_CLUSTER.labelX + 70} y2={FOCUS_CLUSTER.labelY + 14}
                  className="front-map__focus-lead"
                />
                <text x={FOCUS_CLUSTER.labelX} y={FOCUS_CLUSTER.labelY} className="front-map__focus-label">
                  VOLUNTEER CORRIDOR
                </text>

                {/* location pins (no always-on text labels for the focus-cluster four —
                    those are reachable via hover/click only, to avoid crowding) */}
                {LOCATIONS.map((loc) => {
                  const inCluster = FOCUS_CLUSTER.ids.includes(loc.id);
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
                      <circle r={inCluster ? '7' : '9'} className="front-map__pin-halo" />
                      <circle r={inCluster ? '3' : '4'} className="front-map__pin-dot" />
                      {!inCluster && (
                        <text y="-14" textAnchor="middle" className="front-map__pin-label">
                          {loc.name}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* compass */}
                <g className="front-map__compass" transform="translate(42, 50)">
                  <circle r="18" />
                  <line x1="0" y1="-18" x2="0" y2="18" />
                  <line x1="-18" y1="0" x2="18" y2="0" />
                  <text y="-23" textAnchor="middle">N</text>
                </g>

                {/* scale bar */}
                <g className="front-map__scale" transform="translate(42, 850)">
                  <line x1="0" y1="0" x2="100" y2="0" />
                  <line x1="0" y1="-4" x2="0" y2="4" />
                  <line x1="100" y1="-4" x2="100" y2="4" />
                  <text x="0" y="16">0</text>
                  <text x="100" y="16" textAnchor="end">500 km</text>
                </g>
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

            <div className="front-map__footer-content">
              <div className="front-map__legend">
                <div className="front-map__legend-item">
                  <span className="front-map__legend-swatch front-map__legend-swatch--occupied" />
                  Assessed Russian-controlled territory
                </div>
                <div className="front-map__legend-item">
                  <span className="front-map__legend-line front-map__legend-line--front" />
                  The Front
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
            <div className="front-map__header front-map__header--andrew">
              <div className="front-map__header-text">
                <h2>Contract Ledger — Pre-Deployment Record</h2>
                <p>Talon Broadcast &amp; Private Engagements — Andrew</p>
              </div>
              <div className="front-map__header-logo">
                <span className="front-map__header-logo-mark front-map__header-logo-mark--andrew">⬡</span>
                <div>
                  <strong>RIG</strong>
                  <span>Performance Interface</span>
                </div>
              </div>
            </div>

            <div className="front-map__body">
              <svg
                className="front-map__svg front-map__svg--andrew"
                viewBox="0 0 1000 880"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="The same map as Elena's view, rendered as a dark interface, with Andrew's contract ledger marked across it instead of named locations."
              >
                <defs>
                  <radialGradient id="andrewGlow" cx="50%" cy="38%" r="85%">
                    <stop offset="0%" stopColor="#241D15" stopOpacity="0.9" />
                    <stop offset="65%" stopColor="#14110D" stopOpacity="1" />
                    <stop offset="100%" stopColor="#080705" stopOpacity="1" />
                  </radialGradient>
                  <pattern id="scanlines" width="3" height="3" patternUnits="userSpaceOnUse">
                    <path d="M 0 0 L 3 0" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
                  </pattern>
                </defs>

                <rect x="0" y="0" width="1000" height="880" fill="url(#andrewGlow)" />

                <TheaterBasemap variant="dark" />

                <rect x="0" y="0" width="1000" height="880" fill="url(#scanlines)" opacity="0.35" />

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
                    <circle r="7" className="andrew-pin-halo" />
                    <circle r="2.2" className="andrew-pin-dot" />
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
