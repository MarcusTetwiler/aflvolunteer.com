import { useEffect, useRef, useState } from 'react';
import { BOOK, CONTACT_EMAILS } from '../site.config';
import { trackBuyClicked, trackJourney } from '../analytics';
import { lastRace, shareRace } from '../raceShare';
import LaunchSignup from './LaunchSignup';
import Glossary from './Glossary';
import ContributeSection from './ContributeSection';
import FieldSupply from './FieldSupply';
import BuildWall from './BuildWall';
import { LocalWorkshop } from './ElenasBench';
import './BookEnding.css';

// The homepage ending: one primary action (buy), one social loop (share your race).
export function BookEnding() {
  const [note, setNote] = useState('');
  const [race, setRace] = useState(lastRace);
  useEffect(() => { const s = () => setRace(lastRace()); window.addEventListener('afl-race-saved', s); return () => window.removeEventListener('afl-race-saved', s); }, []);
  async function share() {
    if (!race) { window.dispatchEvent(new Event('afl-return-broadcast')); return; }
    const out = await shareRace(race);
    setNote(out === 'copied' ? 'Challenge link copied.' : out === 'shared' ? 'Shared.' : out === 'failed' ? 'Could not share from this browser.' : '');
    trackJourney('race_shared', { via: out, from: 'ending' });
  }
  return (
    <section className="ending" id="ending" aria-label="Get the book">
      <div className="container ending__inner">
        <div className="ending__buy">
          <p className="eyebrow">{BOOK.title} · Book 1</p>
          {BOOK.available
            ? <a className="btn btn--primary ending__cta" href={BOOK.amazonUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackBuyClicked('ending')}>Buy the book &rarr;</a>
            : <><p className="ending__soon">Buy the book: coming soon.</p><LaunchSignup inline /></>}
        </div>
        <div className="ending__share">
          <p className="eyebrow">{race ? `Your time: ${race.time.toFixed(2)} s` : 'Nations Series'}</p>
          <button type="button" className="ending__share-btn" onClick={share}>{race ? 'Share your race →' : 'Race the World Final →'}</button>
          <p className="ending__ask">{race ? 'Can a friend beat you? Nobody has beaten Talon.' : 'Nobody has beaten Talon.'}</p>
          <p className="ending__note" role="status">{note}</p>
        </div>
      </div>
    </section>
  );
}

const ROWS = [
  { id: 'glossary', label: 'Fact + Future', hint: 'How much of this world already exists', render: () => <Glossary defaultExpanded /> },
  { id: 'contribute', label: 'Real World', hint: 'Organizations doing this work now, and ways to help', render: () => <ContributeSection /> },
  { id: 'gear', label: 'Field Supply', hint: 'Objects from the book’s near future · waitlist', render: () => <FieldSupply /> },
  { id: 'workshop', label: 'Drone workshop', hint: 'Five field trials for any aircraft you build', render: () => <LocalWorkshop /> },
  { id: 'credits', label: 'Contributors + Credits', hint: 'Real builders and the people behind the site', render: () => <><p className="explore__credit">Written by Marcus Tetwiler.</p><BuildWall /></> },
  { id: 'contact', label: 'Contact', hint: 'Media, partners, support', render: () => <ul className="explore__contact">{CONTACT_EMAILS.map((c) => <li key={c.address}><a href={`mailto:${c.address}`}>{c.label}</a><span>{c.address}</span></li>)}</ul> },
];
const ALIASES = { '#glossary': 'glossary', '#contribute': 'contribute', '#gear': 'gear', '#gear-store': 'gear', '#wall': 'credits', '#credits': 'credits', '#contact': 'contact', '#workshop': 'workshop' };

// Optional depth, collapsed under the ending. Rows render their content only once opened.
export function ExploreMore() {
  const [open, setOpen] = useState(() => new Set());
  const refs = useRef({});
  useEffect(() => {
    const sync = () => {
      const h = window.location.hash; const id = ALIASES[h] || (h.startsWith('#g-') ? 'glossary' : null);
      if (!id) return;
      setOpen((s) => new Set(s).add(id));
      requestAnimationFrame(() => refs.current[id]?.scrollIntoView({ block: 'start' }));
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  const toggle = (id) => setOpen((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else { n.add(id); trackJourney('explore_opened', { row: id }); } return n; });
  return (
    <section className="explore" id="explore" aria-labelledby="explore-title">
      <div className="container">
        <h2 className="explore__title" id="explore-title">Explore more</h2>
        <div className="explore__rows">
          {ROWS.map((row) => (
            <div className={`explore__row${open.has(row.id) ? ' is-open' : ''}`} key={row.id} ref={(el) => { refs.current[row.id] = el; }} id={`explore-${row.id}`}>
              <button type="button" className="explore__head" aria-expanded={open.has(row.id)} aria-controls={`explore-body-${row.id}`} onClick={() => toggle(row.id)}>
                <span><strong>{row.label}</strong><small>{row.hint}</small></span><i aria-hidden="true">{open.has(row.id) ? '−' : '+'}</i>
              </button>
              {open.has(row.id) && <div className="explore__body" id={`explore-body-${row.id}`}>{row.render()}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
