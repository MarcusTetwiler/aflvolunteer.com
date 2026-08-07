import { useEffect, useRef, useState } from 'react';
import { SAMPLE, BOOK } from '../site.config';
import { CHAPTERS } from '../data/chapters';
import './ReadSection.css';

const UNLOCK_KEY = 'afl:sample-unlocked';

export default function ReadSection() {
  // Read during lazy init rather than in an effect, so a returning visitor
  // never sees the gate flash before the reader replaces it.
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return window.localStorage.getItem(UNLOCK_KEY) === '1';
    } catch {
      // Private browsing / storage disabled — gate simply shows again.
      return false;
    }
  });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting
  const [errors, setErrors] = useState({});
  const [activeChapter, setActiveChapter] = useState(CHAPTERS[0]?.id);
  const readerRef = useRef(null);
  const justUnlocked = useRef(false);

  useEffect(() => {
    if (unlocked && justUnlocked.current && readerRef.current) {
      readerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      justUnlocked.current = false;
    }
  }, [unlocked]);

  function validate() {
    const next = {};
    if (!name.trim()) next.name = 'Tell us who\u2019s reading.';
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
          name: name.trim(),
          email: email.trim(),
          list: 'sample-chapters',
        }),
      });
    } catch (err) {
      // Never block the read over a storage hiccup — the email was given in
      // good faith and the sample costs nothing to serve.
      console.error('Sample signup capture failed:', err);
    }

    try {
      window.localStorage.setItem(UNLOCK_KEY, '1');
    } catch {
      // Non-fatal.
    }

    justUnlocked.current = true;
    setStatus('idle');
    setUnlocked(true);
  }

  const chapter = CHAPTERS.find((c) => c.id === activeChapter) || CHAPTERS[0];

  return (
    <section className="read" id="read">
      <div className="container read__inner">
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
              <p className="read__form-label">Unlock the sample</p>

              <div className="read__field">
                <label htmlFor="read-name">Name</label>
                <input
                  id="read-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'read-name-err' : undefined}
                />
                {errors.name && (
                  <span className="read__error" id="read-name-err">{errors.name}</span>
                )}
              </div>

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
                {errors.email && (
                  <span className="read__error" id="read-email-err">{errors.email}</span>
                )}
              </div>

              <button type="submit" className="read__submit" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Opening\u2026' : SAMPLE.cta}
              </button>

              <p className="read__fine-print">
                Opens immediately, right here on the page. No spam, no drip
                sequence &mdash; occasional dispatches only.
              </p>
            </form>
          </div>
        ) : (
          <div className="read__reader" ref={readerRef}>
            <div className="read__tabs" role="tablist" aria-label="Sample chapters">
              {CHAPTERS.map((c) => (
                <button
                  key={c.id}
                  role="tab"
                  type="button"
                  aria-selected={c.id === activeChapter}
                  className={`read__tab${c.id === activeChapter ? ' is-active' : ''}`}
                  onClick={() => setActiveChapter(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <article className="read__prose">
              <h3 className="read__chapter-title">
                {chapter.kicker && (
                  <span className="read__chapter-number">{chapter.kicker}</span>
                )}
                {chapter.heading}
              </h3>

              {chapter.paragraphs.map((p, i) =>
                p === '***' ? (
                  <div key={i} className="read__break" aria-hidden="true">
                    <span />
                  </div>
                ) : (
                  <p key={i} className={i === 0 ? 'read__para read__para--first' : 'read__para'}>
                    {p}
                  </p>
                )
              )}
            </article>

            <div className="read__end">
              {BOOK.available ? (
                <>
                  <p className="read__end-copy">
                    That&rsquo;s the sample. The rest of the book is on Amazon.
                  </p>
                  <a
                    className="read__end-cta"
                    href={BOOK.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Keep reading
                  </a>
                </>
              ) : (
                <p className="read__end-copy">
                  That&rsquo;s the sample. The full book is on the way &mdash;
                  we&rsquo;ll email you when it lands.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
