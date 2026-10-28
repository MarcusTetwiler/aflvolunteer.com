import { useEffect, useState } from 'react';
import { COMMUNITY, RIVALS } from '../sporting';
import { countryFlag } from '../countries';
import DroneRender from './DroneRender';
import { lastRace, shareRace, LAST_RACE_KEY } from '../raceShare';
import { trackJourney } from '../analytics';
import './Community.css';

const pad = (n) => String(n).padStart(2, '0');

// Social proof for the Nations Series: who has raced, from where, in what, and how fast.
// The visitor's own time (from this device) slots into the board, with a reason to share it.
export default function Community() {
  const [mine, setMine] = useState(lastRace);
  const [note, setNote] = useState('');
  useEffect(() => {
    const sync = (e) => { if (!e.key || e.key === LAST_RACE_KEY) setMine(lastRace()); };
    const saved = () => setMine(lastRace());
    window.addEventListener('storage', sync);
    window.addEventListener('afl-race-saved', saved);
    return () => { window.removeEventListener('storage', sync); window.removeEventListener('afl-race-saved', saved); };
  }, []);
  const board = [...COMMUNITY.map((p) => ({ ...p, kind: 'pilot' })), ...(mine ? [{ id: 'you', callsign: mine.callsign || 'YOU', country: mine.country, time: mine.time, you: true }] : [])]
    .sort((a, b) => a.time - b.time);
  const nations = new Set(COMMUNITY.map((p) => p.country)).size;
  async function share() { const out = await shareRace(mine); setNote(out === 'copied' ? 'Challenge link copied.' : out === 'shared' ? 'Shared.' : out === 'failed' ? 'Could not share from this browser.' : ''); trackJourney('race_shared', { via: out, from: 'community' }); }
  return (
    <section className="community" id="community" aria-labelledby="community-title">
      <div className="container">
        <p className="eyebrow">Nations Series · World Final</p>
        <h2 id="community-title">Pilots from {nations} nations have raced.<br />Nobody has beaten Talon.</h2>
        <div className="community__layout">
          <ol className="community__board" aria-label="World Final times">
            <li className="is-talon"><span>—</span><b><span role="img" aria-label="United States">{countryFlag('United States')}</span> TALON</b><em>UNBEATEN</em><span>{RIVALS[0].time.toFixed(2)} s</span></li>
            {board.slice(0, 10).map((p, i) => (
              <li key={p.id} className={p.you ? 'is-you' : ''}><span>{pad(i + 1)}</span><b><span role="img" aria-label={p.country}>{countryFlag(p.country)}</span> {p.callsign}{p.you ? ' / YOU' : ''}</b><em>{p.you ? 'YOUR TIME' : p.aircraft}</em><span>{p.time.toFixed(2)} s</span></li>
            ))}
            {mine && board.findIndex((p) => p.you) >= 10 && <li className="is-you"><span>{pad(board.findIndex((p) => p.you) + 1)}</span><b><span role="img" aria-label={mine.country}>{countryFlag(mine.country)}</span> {mine.callsign} / YOU</b><em>YOUR TIME</em><span>{mine.time.toFixed(2)} s</span></li>}
          </ol>
          <div className="community__you">
            {mine ? <>
              <p className="community__label">YOUR TIME</p>
              <p className="community__time">{mine.time.toFixed(2)}<small> s</small></p>
              <p className="community__ask">Can a friend beat you?</p>
              <button className="btn btn--primary" type="button" onClick={share}>Share your race &rarr;</button>
              <p className="community__note" role="status">{note}</p>
            </> : <>
              <p className="community__label">YOUR TIME</p>
              <p className="community__ask">You haven&rsquo;t posted a time yet.</p>
              <a className="btn btn--primary" href="#home" onClick={() => window.dispatchEvent(new Event('afl-return-broadcast'))}>Race the World Final &rarr;</a>
            </>}
          </div>
        </div>
        <div className="community__grid" aria-label="Machines on the grid">
          {COMMUNITY.slice(0, 8).map((p) => (
            <article key={p.id}>
              <DroneRender build={p.build} label={false} />
              <p><span role="img" aria-label={p.country}>{countryFlag(p.country)}</span> {p.country}</p>
              <h3>{p.callsign}</h3>
              <p>{p.aircraft} · {p.time.toFixed(2)} s</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
