import { useState, useRef, useEffect } from 'react';
import { ANDREW_CONTRACTS, ANDREW_STATUS_LABEL, ANDREW_CLASS_LABEL } from './andrewContracts';
import TheaterBasemap from './TheaterBasemap';
import { MAP_PINS, MAP_LINES, MAP_AREAS, MAP_LAYERS } from '../data/mapAtlas';
import {
  trackMapPovChanged,
  trackMapLayerToggled,
  trackMapFeatureOpened,
} from '../analytics';
import './FrontMap.css';

// Pins, lines, and areas all come from src/data/mapAtlas.js, where every
// coordinate is generated from real lat/lon rather than placed by hand. See
// that file's header for the projection formula and the spoiler rule.

// Lublin / Rzeszów / Medyka / Lviv sit within ~45px of each other at this
// zoom (they're genuinely that close in reality). Rather than cram four
// always-on text labels into that space, they get a single focus ring with
// one external callout; each pin is still individually hoverable/clickable.
const FOCUS_CLUSTER = {
  ids: ['medyka', 'lublin', 'rzeszow', 'lviv'],
  cx: 574, cy: 421, r: 41,
  // Sits immediately left of the ring, end-anchored, so it reads as annotating
  // the cluster. An earlier position at x=404 was chosen to dodge the Warsaw pin
  // in an isolated test render — against the real basemap that put the words in
  // eastern France, ~170px from the thing they label.
  labelX: 524, labelY: 425, labelAnchor: 'end',
};

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

const FEATURE_LABEL = {
  rail: 'Rail Corridor',
  'rail-planned': 'Advertised Rail Extension',
  air: 'Air Route',
  water: 'Waterway',
  corridor: 'Strategic Corridor',
};

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
  // All layers start visible; the map is meant to read as a finished artifact
  // on arrival, not as an empty frame the reader has to assemble.
  const [layers, setLayers] = useState(() => new Set(MAP_LAYERS.map((l) => l.id)));
  const containerRef = useRef(null);
  const hoverCapable = useRef(true);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const apply = () => { hoverCapable.current = mq.matches; };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const shown = (layer) => layers.has(layer);

  function toggleLayer(id) {
    trackMapLayerToggled(id, !layers.has(id));
    setLayers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setActiveId(null);
    setPinned(false);
  }

  const visiblePins = MAP_PINS.filter((p) => shown(p.layer));
  const visibleLines = MAP_LINES.filter((l) => shown(l.layer));
  const visibleAreas = MAP_AREAS.filter((a) => shown(a.layer));

  // The brief card serves pins, lines and areas alike; normalise them so it
  // only has to deal with one shape.
  const active =
    visiblePins.find((l) => l.id === activeId) ||
    [...visibleLines, ...visibleAreas]
      .filter((f) => f.id === activeId)
      .map((f) => ({ ...f, x: f.labelAt[0], y: f.labelAt[1] }))[0] ||
    null;
  const activeContract = ANDREW_CONTRACTS.find((c) => c.id === activeId) || null;

  function switchPov(next) {
    if (next !== pov) trackMapPovChanged(next);
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

  // Hover-driven preview only where hovering is a real input. On touch (and on
  // narrow viewports where the detail card docks across the foot of the map) a
  // hover-opened card covers the feature that opened it, which fires
  // pointer-leave, which hides the card, which uncovers the feature — an
  // enter/leave oscillation that made the card flicker and swallowed taps.
  // There, only an explicit tap opens a card.
  function handleEnter(id) {
    if (!hoverCapable.current) return;
    if (!pinned) setActiveId(id);
  }
  function handleLeave() {
    if (!hoverCapable.current) return;
    if (!pinned) setActiveId(null);
  }
  function handleClick(id) {
    if (pinned && activeId === id) {
      setPinned(false);
      setActiveId(null);
    } else {
      setActiveId(id);
      setPinned(true);
      trackMapFeatureOpened(id);
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
                <h2>The Eastern Front</h2>
                <p>Terrain, control, infrastructure, and the routes that still function.</p>
              </div>
              <div className="front-map__header-logo">
                <span className="front-map__header-logo-mark">⚑</span>
                <div>
                  <strong>AFL</strong>
                  <span>Eastern Theater Archive</span>
                </div>
              </div>
            </div>

            <div className="front-map__layers" role="group" aria-label="Map layers">
              <span className="front-map__layers-label">Layers</span>
              {MAP_LAYERS.map((layer) => (
                <button
                  key={layer.id}
                  type="button"
                  aria-pressed={layers.has(layer.id)}
                  title={layer.note}
                  className={`front-map__layer${layers.has(layer.id) ? ' is-on' : ''}`}
                  onClick={() => toggleLayer(layer.id)}
                >
                  {layer.label}
                </button>
              ))}
            </div>

            <div className="front-map__body">
              <svg
                className="front-map__svg"
                viewBox="0 0 1000 880"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="Map of Europe and western Russia. A contested, irregular front line runs from the Baltic to the Black Sea with salients and pockets on both sides. Cities, a Chinese-administered reconstruction rail corridor entering from the east, the Dnipro, the Black Sea, the Suwalki Corridor, and shaded regional overlays are marked. Layer toggles above the map control what is shown."
              >
                <defs>
                  <clipPath id="occupiedClip">
                    <path d={`M 1000,0 L 600,0 L 600,20 C ${FRONT_BOUNDARY_BODY} L 1000,880 Z`} />
                  </clipPath>
                </defs>

                <TheaterBasemap variant="light" />

                {/* territory tint: held = bare basemap, occupied = warm rust wash */}
                <rect x="0" y="0" width="1000" height="880" className="front-map__occupied-fill" clipPath="url(#occupiedClip)" />

                {/* regional overlays sit under the front line so the boundary
                    always reads clearly on top of them */}
                {visibleAreas.map((area) => (
                  <g
                    key={area.id}
                    className={`front-map__area front-map__area--${area.id} ${activeId === area.id ? 'is-active' : ''}`}
                    onPointerEnter={() => handleEnter(area.id)}
                    onPointerLeave={handleLeave}
                    onClick={() => handleClick(area.id)}
                    tabIndex={0}
                    role="button"
                    aria-label={`${area.name}. Region.`}
                    onFocus={() => handleEnter(area.id)}
                    onBlur={handleLeave}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(area.id); } }}
                  >
                    <path d={area.d} className="front-map__area-fill" />
                    <path d={area.d} className="front-map__area-hit" />
                    {area.shortLabel && (
                      <text
                        x={area.labelAt[0]} y={area.labelAt[1]}
                        textAnchor={area.labelAnchor}
                        className="front-map__area-label"
                      >
                        {area.shortLabel}
                      </text>
                    )}
                  </g>
                ))}

                {/* decorative salients/pockets — fluid, bubbling front texture */}
                {SALIENTS.map((s, i) => (
                  <path key={i} d={s.d} className={`front-map__salient front-map__salient--${s.kind}`} />
                ))}

                {/* the main boundary, inked double-stroke for a hand-drawn feel */}
                <path d={FRONT_BOUNDARY} className="front-map__frontline-shadow" />
                <path d={FRONT_BOUNDARY} className="front-map__frontline" />

                {/* linear features: rail, air route, river, corridor */}
                {visibleLines.map((ln) => (
                  <g
                    key={ln.id}
                    className={`front-map__line front-map__line--${ln.kind} ${activeId === ln.id ? 'is-active' : ''}`}
                    onPointerEnter={() => handleEnter(ln.id)}
                    onPointerLeave={handleLeave}
                    onClick={() => handleClick(ln.id)}
                    tabIndex={0}
                    role="button"
                    aria-label={`${ln.name}.`}
                    onFocus={() => handleEnter(ln.id)}
                    onBlur={handleLeave}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(ln.id); } }}
                  >
                    {/* invisible fat stroke widens the hit target to something
                        a finger can actually land on */}
                    <path d={ln.d} className="front-map__line-hit" />
                    <path d={ln.d} className="front-map__line-stroke" />
                  </g>
                ))}

                {/* focus ring around the dense Lublin/Rzeszów/Medyka/Lviv cluster */}
                <circle
                  cx={FOCUS_CLUSTER.cx} cy={FOCUS_CLUSTER.cy} r={FOCUS_CLUSTER.r}
                  className="front-map__focus-ring"
                />
                <line
                  x1={FOCUS_CLUSTER.cx - FOCUS_CLUSTER.r} y1={FOCUS_CLUSTER.cy}
                  x2={FOCUS_CLUSTER.labelX + 4} y2={FOCUS_CLUSTER.labelY - 4}
                  className="front-map__focus-lead"
                />
                <text
                  x={FOCUS_CLUSTER.labelX}
                  y={FOCUS_CLUSTER.labelY}
                  textAnchor={FOCUS_CLUSTER.labelAnchor}
                  className="front-map__focus-label"
                >
                  VOLUNTEER CORRIDOR
                </text>

                {/* location pins (no always-on text labels for the focus-cluster four —
                    those are reachable via hover/click only, to avoid crowding) */}
                {visiblePins.map((loc) => {
                  const inCluster = FOCUS_CLUSTER.ids.includes(loc.id);
                  const labelled = !inCluster && loc.tier === 1;
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
                      {/* Invisible touch target. The visible dot renders at
                          about 1.3px on a phone; this gives the tap somewhere
                          to land without changing the drawing. */}
                      <circle r="26" className="front-map__pin-hit" />
                      <circle r={inCluster ? '7' : '9'} className="front-map__pin-halo" />
                      <circle r={inCluster ? '3' : '4'} className="front-map__pin-dot" />
                      {labelled && (
                        <text
                          x={loc.labelDx} y={loc.labelDy}
                          textAnchor={loc.labelAnchor}
                          className={`front-map__pin-label${loc.mobileLabel ? ' front-map__pin-label--mobile' : ''}`}
                        >
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
                    {pinned && (
                      <button
                        type="button"
                        className="front-map__brief-close"
                        aria-label="Close detail"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPinned(false);
                          setActiveId(null);
                        }}
                      >
                        &times;
                      </button>
                    )}
                    <p className="front-map__brief-label">
                      {active.country ? 'Location' : active.kind ? FEATURE_LABEL[active.kind] : 'Region'}
                    </p>
                    <h3 className="front-map__brief-name">{active.name}</h3>
                    {active.country && (
                      <p className="front-map__brief-meta">{active.country}</p>
                    )}
                    {active.status && (
                      <p className={`front-map__brief-status front-map__brief-status--${active.status}`}>
                        {STATUS_LABEL[active.status]}
                      </p>
                    )}
                    <p className="front-map__brief-summary">{active.summary}</p>
                    {active.origin === 'fictional' && (
                      <p className="front-map__brief-origin">Fictional feature created for the novel.</p>
                    )}
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
                  <span className="front-map__legend-swatch front-map__legend-swatch--unknown" /> Occupied
                  <span className="front-map__legend-swatch front-map__legend-swatch--hostile" /> Hostile
                </div>
              </div>

              <p className="front-map__credit">
Cartography: AFL Operations Desk. Base geography reflects real places.
                Front lines, control assessments, operational overlays, and
                novel-specific sites are fictional.
              </p>
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
                  <strong>TALON</strong>
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
          </>
        )}
      </div>
    </div>
  );
}
