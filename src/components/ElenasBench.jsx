import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { BENCH_STEPS, STAT_KEYS, TRIALS } from '../data/benchCatalog';
import DroneRender from './DroneRender';
import './ElenasBench.css';

const WALL_KEY = 'afl:bench-wall';
const SESSION_KEY = 'afl:bench-session';
const PAGE_SIZE = 4;
const FINISH = {
  finish: [
    { id: 'bone', name: 'BONE' }, { id: 'rust', name: 'RUST' },
    { id: 'field', name: 'FIELD GREEN' }, { id: 'charcoal', name: 'CHARCOAL' },
  ],
  condition: [
    { id: 'clean', name: 'CLEAN PRINT' }, { id: 'exposed', name: 'EXPOSED' },
    { id: 'repaired', name: 'FIELD-REPAIRED' }, { id: 'gyroid', name: 'GYROID / OPEN' },
  ],
  markings: [
    { id: 'stencil', name: 'FACTORY STENCIL' }, { id: 'band', name: 'IDENTIFICATION BAND' },
    { id: 'hand', name: 'HAND-MARKED' }, { id: 'none', name: 'UNMARKED' },
  ],
};
const NAME_FAMILIES = {
  scout: ['MOTH', 'WISP', 'GNAT', 'SHADE'],
  carrier: ['ROOK', 'MULE', 'ANVIL', 'WARDEN'],
  ducted: ['EMBER', 'LANTERN', 'SABLE', 'VESPER'],
  wing: ['TERN', 'KITE', 'NOMAD', 'ORBIT'],
};

const baseBuild = {
  ...Object.fromEntries(BENCH_STEPS.map((s) => [s.id, null])),
  condition: 'clean', markings: 'stencil',
};
const initialState = { phase: 'intro', resumePhase: null, step: 0, build: baseBuild, seed: null, revealed: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'start': return { ...state, phase: state.resumePhase || 'build', resumePhase: null };
    case 'select': return { ...state, build: { ...state.build, [action.category]: action.value } };
    case 'next': return state.step < BENCH_STEPS.length - 1 ? { ...state, step: state.step + 1 } : { ...state, phase: 'commit' };
    case 'back': return { ...state, step: Math.max(0, state.step - 1) };
    case 'print': return { ...state, phase: 'printing', seed: action.seed };
    case 'trials': return { ...state, phase: 'trials', revealed: 0 };
    case 'reveal': return { ...state, revealed: Math.min(TRIALS.length, state.revealed + 1) };
    case 'result': return { ...state, phase: 'result' };
    case 'return': return { ...state, resumePhase: state.phase, phase: 'intro' };
    case 'restart': return { ...initialState, phase: 'build', build: { ...baseBuild } };
    case 'load': return { ...initialState, ...action.payload, phase: 'result', revealed: TRIALS.length };
    default: return state;
  }
}

function hashString(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return h >>> 0;
}
function makeSeed() {
  if (globalThis.crypto?.getRandomValues) return crypto.getRandomValues(new Uint32Array(1))[0];
  return hashString(`${Date.now()}:${Math.random()}`);
}
function statsFor(build, seed) {
  const totals = Object.fromEntries(STAT_KEYS.map((k) => [k, 50]));
  BENCH_STEPS.forEach((step) => {
    const option = step.options.find((o) => o.id === build[step.id]);
    if (!option?.stats) return;
    STAT_KEYS.forEach((key) => { totals[key] += (option.stats[key] || 0) * 7; });
  });
  if (seed) STAT_KEYS.forEach((key) => { totals[key] += (hashString(`${seed}:${key}`) % 9) - 4; });
  return Object.fromEntries(STAT_KEYS.map((k) => [k, Math.max(18, Math.min(94, totals[k]))]));
}
function trialsFor(stats, seed) {
  return TRIALS.map((trial) => {
    const score = Object.entries(trial.weights).reduce((n, [key, weight]) => n + stats[key] * weight, 0);
    const noise = seed ? (hashString(`${seed}:${trial.id}`) % 13) - 6 : 0;
    const passed = score + noise >= 49;
    const strongest = Object.keys(trial.weights).sort((a, b) => stats[b] - stats[a])[0];
    return {
      ...trial, passed, score: Math.round(score + noise),
      notes: passed
        ? [`${strongest.toUpperCase()} RESPONSE: STABLE`, 'PRINT TOLERANCE: ACCEPTABLE']
        : [`${strongest.toUpperCase()} RESERVE: INSUFFICIENT`, noise < -2 ? 'FRAME ALIGNMENT: OUTSIDE TOLERANCE' : 'CORRECTION AUTHORITY: LIMITED'],
    };
  });
}
function identity(build, seed) {
  const value = seed || hashString(JSON.stringify(build));
  const family = NAME_FAMILIES[build.chassis] || NAME_FAMILIES.scout;
  return { serial: `E-${1000 + (value % 9000)}`, callsign: family[hashString(`${value}:name`) % family.length] };
}
function referralFlag(stats, passed, seed) {
  const avg = STAT_KEYS.reduce((n, key) => n + stats[key], 0) / STAT_KEYS.length;
  const peak = Math.max(...Object.values(stats));
  const score = avg + peak * .25 + passed * 8 + ((seed || 0) % 5);
  if (score >= 115) return 3;
  if (score >= 101) return 2;
  if (score >= 88) return 1;
  return 0;
}
function specialty(stats) {
  const labels = { endurance: 'LONG-RANGE', agility: 'CLOSE-CONTROL', durability: 'FIELD-DURABLE', sensing: 'NIGHT-RECON', signal: 'SIGNAL-RESILIENT' };
  return labels[STAT_KEYS.reduce((best, key) => stats[key] > stats[best] ? key : best, STAT_KEYS[0])];
}
function encode(payload) { try { return btoa(encodeURIComponent(JSON.stringify(payload))); } catch { return ''; } }
function decode(value) { try { return JSON.parse(decodeURIComponent(atob(value))); } catch { return null; } }
function stored(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || '') || fallback; } catch { return fallback; } }

export default function ElenasBench() {
  const [state, dispatch] = useReducer(reducer, initialState, (value) => stored(SESSION_KEY, value));
  const [wall, setWall] = useState(() => stored(WALL_KEY, []));
  const [published, setPublished] = useState(false);
  const [shared, setShared] = useState(false);
  const [optionPage, setOptionPage] = useState(0);
  const [wallFilter, setWallFilter] = useState('recent');
  const [view, setView] = useState('top');
  const [highlight, setHighlight] = useState(null);
  const touchStart = useRef(null);
  const installTimer = useRef(null);
  const fullScreen = state.phase !== 'intro';
  const stats = useMemo(() => statsFor(state.build, state.seed), [state.build, state.seed]);
  const trials = useMemo(() => trialsFor(stats, state.seed), [stats, state.seed]);
  const passed = trials.filter((t) => t.passed).length;
  const machine = identity(state.build, state.seed);
  const flag = referralFlag(stats, passed, state.seed);
  const current = BENCH_STEPS[state.step];
  const isFinish = current?.id === 'finish';
  const pages = Math.max(1, Math.ceil((current?.options.length || 0) / PAGE_SIZE));
  const options = current?.options.slice(optionPage * PAGE_SIZE, optionPage * PAGE_SIZE + PAGE_SIZE) || [];
  const selected = current ? state.build[current.id] : null;

  useEffect(() => {
    const sharedMachine = decode(new URLSearchParams(window.location.search).get('bench') || '');
    if (sharedMachine?.build && sharedMachine?.seed) dispatch({ type: 'load', payload: sharedMachine });
  }, []);
  useEffect(() => {
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(state)); } catch { /* optional local persistence */ }
  }, [state]);
  useEffect(() => {
    document.body.classList.toggle('bench-open', fullScreen);
    return () => document.body.classList.remove('bench-open');
  }, [fullScreen]);
  useEffect(() => {
    if (state.phase !== 'printing') return undefined;
    const timer = setTimeout(() => dispatch({ type: 'trials' }), 2700);
    return () => clearTimeout(timer);
  }, [state.phase]);
  useEffect(() => () => clearTimeout(installTimer.current), []);

  function publish() {
    const record = { id: machine.serial, build: state.build, callsign: machine.callsign, passed, flag, specialty: specialty(stats), seed: state.seed, created: Date.now() };
    const next = [record, ...wall.filter((item) => item.id !== record.id)].slice(0, 24);
    setWall(next); setPublished(true);
    try { localStorage.setItem(WALL_KEY, JSON.stringify(next)); } catch { /* session-only fallback */ }
  }
  async function share() {
    const url = new URL(window.location.href);
    url.searchParams.set('bench', encode({ build: state.build, seed: state.seed })); url.hash = 'bench';
    const data = { title: `${machine.serial} “${machine.callsign}”`, text: `${passed}/5 trials survived${flag ? ` · Tier ${flag} Referral Flag` : ''}`, url: url.toString() };
    try { if (navigator.share) await navigator.share(data); else await navigator.clipboard.writeText(data.url); setShared(true); setTimeout(() => setShared(false), 2000); } catch { /* dismissed */ }
  }
  function movePage(delta) { setOptionPage((page) => Math.max(0, Math.min(pages - 1, page + delta))); }
  function choose(category, value) {
    dispatch({ type: 'select', category, value });
    setHighlight(category);
    clearTimeout(installTimer.current);
    installTimer.current = setTimeout(() => setHighlight(null), 1250);
  }
  function swipeEnd(event) {
    if (touchStart.current == null) return;
    const distance = event.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(distance) > 45) movePage(distance < 0 ? 1 : -1);
    touchStart.current = null;
  }
  const filteredWall = wallFilter === 'referred' ? wall.filter((item) => item.flag) : wallFilter === 'survivors' ? wall.filter((item) => item.passed === 5) : wall;

  return (
    <section className="bench" id="wall">
      <div className="container">
        <header className="bench__head"><p className="eyebrow">Elena&rsquo;s Bench</p><h2>The printer is waiting.</h2><p>Build a field machine from what remains.</p></header>
        <div className="bench__entry" id="bench">
          <DroneRender build={{ chassis: 'scout', material: 'gyroid', power: 'endurance', sensor: 'thermal', system: 'relay', finish: 'bone' }} />
          <div><p className="bench__status">PRINTER 03 // AVAILABLE</p><h3>Six decisions.<br />Five field trials.</h3><p>No account. Approximately two minutes.</p><button className="btn btn--primary" type="button" onClick={() => dispatch({ type: 'start' })}>{state.resumePhase || state.step || state.seed ? 'Resume fabrication' : 'Begin fabrication'}</button></div>
        </div>

        {fullScreen && (
          <div className="bench-system" role="dialog" aria-modal="true" aria-label="Elena's Bench fabrication system">
            <header className="bench-system__header"><span>ELENA&rsquo;S BENCH // PRINTER 03</span><button type="button" onClick={() => dispatch({ type: 'return' })}>Save &amp; return</button></header>
            <main className="bench-system__main">
              {state.phase === 'build' && (
                <div className="bench__builder">
                  <div className="bench__visual"><DroneRender build={state.build} view={view} highlight={highlight} /><div className="bench__view-switch">{['top','front','profile'].map((item) => <button key={item} type="button" className={view === item ? 'is-on' : ''} onClick={() => setView(item)}>{item.toUpperCase()}</button>)}</div></div>
                  <div className="bench__choice">
                    <div className="bench__progress">{BENCH_STEPS.map((step, i) => <span key={step.id} className={i <= state.step ? 'is-on' : ''} />)}</div>
                    <p className="bench__step">{String(state.step + 1).padStart(2, '0')} / 06 &nbsp; {current.label}</p><h3>{current.prompt}</h3>
                    {isFinish ? <FinishControls build={state.build} choose={choose} /> : (
                      <>
                        <div className="bench__options" onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }} onTouchEnd={swipeEnd}>
                          {options.map((option) => <button key={option.id} type="button" className={selected === option.id ? 'is-selected' : ''} onClick={() => choose(current.id, option.id)}><span><b>{option.name}</b>{option.tag && <em>{option.tag}</em>}</span><small>{option.detail}</small></button>)}
                        </div>
                        <div className="bench__paging"><button disabled={optionPage === 0} onClick={() => movePage(-1)}>← Previous</button><span>{String(optionPage + 1).padStart(2, '0')} / {String(pages).padStart(2, '0')} &nbsp; {Array.from({ length: pages }, (_, i) => i === optionPage ? '●' : '○').join(' ')}</span><button disabled={optionPage === pages - 1} onClick={() => movePage(1)}>Next →</button></div>
                      </>
                    )}
                    <div className="bench__nav"><button className="btn btn--secondary" disabled={state.step === 0} onClick={() => { setOptionPage(0); dispatch({ type: 'back' }); }}>Back</button><button className="btn btn--primary" disabled={!selected} onClick={() => { setOptionPage(0); dispatch({ type: 'next' }); }}>{isFinish ? 'Finish build' : 'Continue'}</button></div>
                  </div>
                </div>
              )}
              {state.phase === 'commit' && <Moment className="bench__commit" status="FABRICATION QUEUE READY" build={state.build}><h3>DESIGNATION PENDING</h3><p>Selections cannot be changed after the queue is locked.</p><button className="btn btn--primary" onClick={() => dispatch({ type: 'print', seed: makeSeed() })}>Send to printer</button></Moment>}
              {state.phase === 'printing' && <Moment className="bench__printing" status="FABRICATION QUEUE LOCKED" build={state.build} printing><p>PRINTING // SERIAL SEED FIXED</p></Moment>}
              {state.phase === 'trials' && <TrialScreen trials={trials} revealed={state.revealed} build={state.build} next={() => dispatch({ type: 'reveal' })} finish={() => dispatch({ type: 'result' })} />}
              {state.phase === 'result' && <Result build={state.build} machine={machine} stats={stats} passed={passed} flag={flag} specialty={specialty(stats)} published={published} shared={shared} publish={publish} share={share} restart={() => dispatch({ type: 'restart' })} close={() => dispatch({ type: 'return' })} />}
            </main>
          </div>
        )}

        <div className="bench-wall">
          <div className="bench-wall__head"><div><p className="eyebrow">The Build Wall</p><h3>Recent field configurations.</h3></div><span>{wall.length} LOCAL BUILDS</span></div>
          <div className="bench-wall__filters"><button className={wallFilter === 'recent' ? 'is-on' : ''} onClick={() => setWallFilter('recent')}>Recent</button><button className={wallFilter === 'referred' ? 'is-on' : ''} onClick={() => setWallFilter('referred')}>Referred</button><button className={wallFilter === 'survivors' ? 'is-on' : ''} onClick={() => setWallFilter('survivors')}>5/5 Survivors</button></div>
          {filteredWall.length ? <ul>{filteredWall.map((item) => <li key={`${item.id}-${item.created}`}><DroneRender build={item.build} label={false}/><b>{item.id} &ldquo;{item.callsign}&rdquo;</b><span>{item.passed}/5 TRIALS · {item.specialty}</span>{item.flag > 0 && <em>TIER {item.flag} REFERRAL FLAG</em>}</li>)}</ul> : <div className="bench-wall__empty"><span>NO MATCHING FIELD CONFIGURATIONS</span><a href="#bench">BUILD THE FIRST</a></div>}
        </div>
      </div>
    </section>
  );
}

function FinishControls({ build, choose }) {
  return <div className="bench__finish">{Object.entries(FINISH).map(([category, options]) => <fieldset key={category}><legend>{category === 'finish' ? 'Resin' : category}</legend><div>{options.map((option) => <button type="button" key={option.id} className={build[category] === option.id ? 'is-selected' : ''} onClick={() => choose(category, option.id)}>{option.name}</button>)}</div></fieldset>)}</div>;
}
function Moment({ className, status, build, printing, children }) { return <div className={className}><p className="bench__status">{status}</p><DroneRender build={build} printing={printing} />{children}</div>; }
function TrialScreen({ trials, revealed, build, next, finish }) {
  const current = trials[Math.min(revealed, trials.length - 1)];
  return <div className="bench__trials"><p className="bench__status">FIELD TRIAL // {Math.min(revealed + 1, 5)} OF 5</p><div className="bench__trial-machine"><DroneRender build={build} label={false}/></div><h3>{current.name}</h3>{revealed > 0 && <div className={`bench__diagnostic ${trials[revealed - 1].passed ? 'is-pass' : 'is-fail'}`}><strong>{trials[revealed - 1].passed ? 'PASSED' : 'FAILED'}</strong>{trials[revealed - 1].notes.map((note) => <span key={note}>{note}</span>)}</div>}<ol>{trials.map((trial, i) => <li key={trial.id} className={i < revealed ? (trial.passed ? 'is-pass' : 'is-fail') : i === revealed ? 'is-current' : ''}>{trial.name}<b>{i < revealed ? (trial.passed ? 'PASS' : 'FAIL') : i === revealed ? 'READY' : 'LOCKED'}</b></li>)}</ol>{revealed < trials.length ? <button className="btn btn--primary" onClick={next}>Run test</button> : <button className="btn btn--primary" onClick={finish}>Open field report</button>}</div>;
}
function Result({ build, machine, stats, passed, flag, specialty: earned, published, shared, publish, share, restart, close }) {
  const [view, setView] = useState('top');
  return <div className="bench__result"><div className="bench__artifact"><div className="bench__artifact-head"><span>ELENA&rsquo;S BENCH</span><span>FIELD CONFIGURATION</span></div><p className="bench__serial">{machine.serial}</p><h3>{machine.callsign}</h3><DroneRender build={build} label={false} view={view}/><div className="bench__artifact-views">{['top','front','profile'].map((item) => <button key={item} className={view === item ? 'is-on' : ''} onClick={() => setView(item)}>{item.toUpperCase()}</button>)}</div><div className="bench__grade"><strong>{passed}/5</strong><span>TRIALS SURVIVED</span></div><p className="bench__specialty">{earned}</p>{flag > 0 && <p className={`bench__flag bench__flag--${flag}`}>TIER {flag} REFERRAL FLAG</p>}<div className="bench__result-stats">{STAT_KEYS.slice(0,4).map((key) => <span key={key}>{key.toUpperCase()}<b>{stats[key]}</b></span>)}</div><footer>THE AMERICAN FOREIGN LEGION</footer></div><div className="bench__result-actions"><button className="btn btn--primary" onClick={share}>{shared ? 'Link copied' : 'Share build'}</button><button className="btn btn--secondary" onClick={publish} disabled={published}>{published ? 'Added to wall' : 'Add to build wall'}</button><button className="bench__again" onClick={restart}>Build again</button><button className="bench__again" onClick={close}>Return to site</button></div></div>;
}
