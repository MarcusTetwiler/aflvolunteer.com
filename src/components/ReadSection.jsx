import { useEffect, useRef, useState } from 'react';
import { SAMPLE, BOOK } from '../site.config';
import { attribution } from '../attribution';
import { SAMPLE_UNLOCK_KEY, markSampleUnlocked } from '../sampleState';
import { CHAPTERS } from '../data/chapters';
import {
  trackSampleUnlocked,
  trackChapterViewed,
  trackSampleFinished,
  trackBuyClicked,
} from '../analytics';
import './ReadSection.css';

const SAMPLE_FINISHED_KEY = 'afl:sample-finished';

export default function ReadSection() {
  const [unlocked, setUnlocked] = useState(() => {
    try { return window.localStorage.getItem(SAMPLE_UNLOCK_KEY) === '1'; }
    catch { return false; }
  });
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [errors, setErrors] = useState({});
  const [activeChapter, setActiveChapter] = useState(CHAPTERS[0]?.id);
  const [collapsed, setCollapsed] = useState(() => {
    try { return window.localStorage.getItem(SAMPLE_FINISHED_KEY) === '1'; }
    catch { return false; }
  });
  const readerRef = useRef(null);
  const endRef = useRef(null);
  const finishedFired = useRef(false);
  const justUnlocked = useRef(false);

  useEffect(() => {
    if (unlocked && justUnlocked.current && readerRef.current) {
      readerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      justUnlocked.current = false;
    }
  }, [unlocked]);

  useEffect(() => {
    if (!unlocked || !endRef.current || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !finishedFired.current) {
          finishedFired.current = true;
          trackSampleFinished();
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(endRef.current);
    return () => obs.disconnect();
  }, [unlocked, activeChapter]);

  function validate() {
    const next = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter a valid email.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setStatus('submitting');

    try {
      await fetch('/api/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          list: 'sample-chapters',
          ...attribution(),
        }),
      });
    } catch (err) {
      console.error('Sample signup capture failed:', err);
    }

    markSampleUnlocked();
    trackSampleUnlocked();
    justUnlocked.current = true;
    setStatus('idle');
    setUnlocked(true);
  }

  function selectChapter(id) {
    setActiveChapter(id);
    trackChapterViewed(id);
  }

  function finishReading() {
    trackSampleFinished();
    finishedFired.current = true;
    setCollapsed(true);
    try { window.localStorage.setItem(SAMPLE_FINISHED_KEY, '1'); } catch { /* optional */ }

    // Collapsing the reader can remove several screens of document height. Do
    // not jump backward to the top of the sample afterwards. Let the browser
    // hold position when it can; otherwise advance to the next experience.
    requestAnimationFrame(() => {
      const next = document.getElementById('wall');
      if (!next) return;
      const rect = next.getBoundingClientRect();
      const naturallyVisible = rect.top >= 64 && rect.top <= window.innerHeight * 0.72;
      if (!naturallyVisible) next.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  const chapter = CHAPTERS.find((c) => c.id === activeChapter) || CHAPTERS[0];
  const isLastChapter = activeChapter === CHAPTERS.at(-1)?.id;

  return (
    <section className={`read${collapsed ? ' is-collapsed' : ''}`} id="read">
      <div className="container read__inner">
        {collapsed ? (
          <button className="section-toggle" type="button" aria-expanded="false" aria-controls="sample-content" onClick={() => setCollapsed(false)}>
            <span><small>Sample</small><strong>Prologue + Chapter One</strong></span>
            <span>Read again&nbsp; +</span>
          </button>
        ) : (
          <div id="sample-content">
            <header className="read__head">
              <p className="eyebrow">Sample</p>
              <h2 className="read__title">{SAMPLE.headline}</h2>
              <p className="read__sub">{SAMPLE.sub}</p>
            </header>

            {!unlocked ? (
              <div className="read__gate">
                <div className="read__gate-preview" aria-hidden="true">
                  <div className="read__gate-chapter">Prologue</div>
                  {[96, 91, 88, 94, 72, 90, 85].map((w, i) => (
                    <div key={i} className="read__gate-line" style={{ width: `${w}%` }} />
                  ))}
                  <div className="read__gate-fade" />
                </div>

                <form className="read__form" onSubmit={handleSubmit} noValidate>
                  <p className="read__form-label">Open the sample</p>
                  <div className="read__field">
                    <label htmlFor="read-email">Email</label>
                    <input
                      id="read-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'read-email-err' : undefined}
                    />
                    {errors.email && <span className="read__error" id="read-email-err">{errors.email}</span>}
                  </div>
                  <button type="submit" className="read__submit btn btn--primary btn--block" disabled={status === 'submitting'}>
                    {status === 'submitting' ? 'Opening…' : SAMPLE.cta}
                  </button>
                  <p className="read__fine-print">
                    The sample opens immediately on this page. By submitting, you agree to occasional email about the book. Every message includes a one-click unsubscribe, and your address is never sold or shared.
                  </p>
                </form>
              </div>
            ) : (
              <div className="read__reader" ref={readerRef}>
                <div className="read__tabs">
                  {CHAPTERS.map((c) => (
                    <button key={c.id} type="button" aria-pressed={c.id === activeChapter} className={`read__tab${c.id === activeChapter ? ' is-active' : ''}`} onClick={() => selectChapter(c.id)}>
                      {c.label}
                    </button>
                  ))}
                </div>

                <article className="read__prose" aria-labelledby="read-chapter-heading">
                  <h3 className="read__chapter-title" id="read-chapter-heading">
                    {chapter.kicker && <span className="read__chapter-number">{chapter.kicker}</span>}
                    {chapter.heading}
                  </h3>
                  {chapter.paragraphs.map((p, i) =>
                    p === '***' ? (
                      <div key={i} className="read__break" aria-hidden="true"><span /></div>
                    ) : (
                      <p key={i} className={i === 0 ? 'read__para read__para--first' : 'read__para'}>{p}</p>
                    )
                  )}
                </article>

                <div className="read__end" ref={endRef}>
                  {!isLastChapter ? (
                    <>
                      <p className="read__end-copy">Continue the opening.</p>
                      <button className="read__end-cta btn btn--primary" type="button" onClick={() => { selectChapter(CHAPTERS[1].id); readerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                        Read Chapter One
                      </button>
                    </>
                  ) : BOOK.available ? (
                    <>
                      <p className="read__end-copy">That&rsquo;s the opening. Continue with the full book on Amazon.</p>
                      <a className="read__end-cta btn btn--primary" href={BOOK.amazonUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackBuyClicked('end-of-sample')}>Keep reading</a>
                    </>
                  ) : (
                    <p className="read__end-copy">That&rsquo;s the opening. We&rsquo;ll email you when the full book is available.</p>
                  )}
                  {isLastChapter && (
                    <button className="read__finish btn btn--secondary" type="button" onClick={finishReading}>Finish sample</button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
