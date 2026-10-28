import { useEffect, useRef, useState } from 'react';
import { BOOK } from '../site.config';
import { CHAPTERS } from '../data/sampleLive';
import { trackSampleFinished, trackBuyClicked } from '../analytics';
import './ReadSection.css';

const SAMPLE_FINISHED_KEY = 'afl:sample-finished';

export default function ReadSection() {
  const unlocked = true;
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
  }, [unlocked]);

  function finishReading() {
    trackSampleFinished();
    finishedFired.current = true;
    setCollapsed(true);
    try { window.localStorage.setItem(SAMPLE_FINISHED_KEY, '1'); } catch { /* optional */ }

    // Collapsing the reader can remove several screens of document height. Do
    // not jump backward to the top of the sample afterwards. Let the browser
    // hold position when it can; otherwise advance to the next experience.
    requestAnimationFrame(() => {
      const next = document.getElementById('buy');
      if (!next) return;
      const rect = next.getBoundingClientRect();
      const naturallyVisible = rect.top >= 64 && rect.top <= window.innerHeight * 0.72;
      if (!naturallyVisible) next.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  return (
    <section className={`read read--book${collapsed ? ' is-collapsed' : ''}`} id="read" aria-label="The American Foreign Legion, Book 1: the opening">
      <div className="container read__inner">
        {collapsed ? (
          <button className="section-toggle" type="button" aria-expanded="false" aria-controls="sample-content" onClick={() => setCollapsed(false)}>
            <span><small>The American Foreign Legion · Book 1</small><strong>The opening</strong></span>
            <span>Read again&nbsp; +</span>
          </button>
        ) : (
          <div id="sample-content" ref={readerRef}>
            <header className="read__bookhead">
              <p className="eyebrow">The American Foreign Legion &mdash; Book 1</p>
              <a className="read__skip" href="#buy">Skip to the book &rarr;</a>
            </header>
            {CHAPTERS.map((chapter) => (
              <article className="read__prose" key={chapter.id} aria-labelledby={`read-${chapter.id}`}>
                <h3 className="read__chapter-title" id={`read-${chapter.id}`}>
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
            ))}
            <div className="read__end" ref={endRef}>
              <p className="read__end-copy">That&rsquo;s the opening. The story continues in the book.</p>
              {BOOK.available
                ? <a className="read__end-cta btn btn--primary" href={BOOK.amazonUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackBuyClicked('end-of-sample')}>Keep reading</a>
                : <a className="read__end-cta btn btn--primary" href="#buy" onClick={finishReading}>Continue &rarr;</a>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
