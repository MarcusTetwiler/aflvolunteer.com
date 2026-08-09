import { useEffect, useRef, useState } from 'react';
import Nav from './components/Nav';
import Hero from './components/Hero';
import IntroContext from './components/IntroContext';
import ReadSection from './components/ReadSection';
import ElenasBench from './components/ElenasBench';
import Glossary from './components/Glossary';
import BuySection from './components/BuySection';
import AuthorSection from './components/AuthorSection';
import ContributeSection from './components/ContributeSection';
import Footer from './components/Footer';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { BOOK } from './site.config';
import { trackBuyClicked } from './analytics';
import { captureAttribution } from './attribution';
import { SAMPLE_UNLOCK_KEY, SAMPLE_UNLOCK_EVENT } from './sampleState';
import './App.css';

/**
 * Sticky mobile CTA.
 *
 * Understands funnel state rather than repeating one pitch forever:
 *   - book live                    -> Buy the book
 *   - pre-launch, sample unread    -> Read the opening
 *   - pre-launch, sample read      -> Get launch news (the next useful step;
 *                                     re-pitching a sample they just finished
 *                                     reads as broken)
 *
 * It also hides itself while a form field is focused, so it can't sit on top of
 * the iOS keyboard, and publishes its own height to a CSS variable so body
 * padding can never drift out of step with it.
 */
function StickyMobileCta() {
  const [visible, setVisible] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [typing, setTyping] = useState(false);
  const barRef = useRef(null);

  // Anchor: once the book is live the bar exists to sell; before that it exists
  // to move people into the sample.
  useEffect(() => {
    const target = document.getElementById(BOOK.available ? 'buy' : 'read');
    if (!target || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.15 }
    );
    obs.observe(target);
    return () => obs.disconnect();
  }, []);

  // Poll-free: the reader unlocks in another component, so listen for the event
  // it dispatches and read the persisted flag on mount.
  useEffect(() => {
    const read = () => {
      try {
        setUnlocked(window.localStorage.getItem(SAMPLE_UNLOCK_KEY) === '1');
      } catch {
        setUnlocked(false);
      }
    };
    read();
    window.addEventListener(SAMPLE_UNLOCK_EVENT, read);
    return () => window.removeEventListener(SAMPLE_UNLOCK_EVENT, read);
  }, []);

  // Get out of the way of the mobile keyboard.
  useEffect(() => {
    const isField = (el) =>
      el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT');
    const onFocus = (e) => { if (isField(e.target)) setTyping(true); };
    const onBlur = (e) => { if (isField(e.target)) setTyping(false); };
    document.addEventListener('focusin', onFocus);
    document.addEventListener('focusout', onBlur);
    return () => {
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('focusout', onBlur);
    };
  }, []);

  // Publish the real rendered height so body padding matches it exactly.
  const shown = visible && !typing;
  useEffect(() => {
    const root = document.documentElement;
    if (!shown || !barRef.current) {
      root.style.setProperty('--sticky-cta-h', '0px');
      return;
    }
    const set = () => {
      const h = barRef.current?.getBoundingClientRect().height || 0;
      root.style.setProperty('--sticky-cta-h', `${Math.round(h)}px`);
    };
    set();
    const ro = new ResizeObserver(set);
    ro.observe(barRef.current);
    return () => {
      ro.disconnect();
      root.style.setProperty('--sticky-cta-h', '0px');
    };
  }, [shown]);

  if (!shown) return null;

  let content;
  if (BOOK.available) {
    content = (
      <a
        className="btn btn--primary btn--block"
        href={BOOK.amazonUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackBuyClicked('sticky-bar')}
      >
        Buy the book
      </a>
    );
  } else if (unlocked) {
    content = (
      <a className="btn btn--primary btn--block" href="#buy">
        Get launch news
      </a>
    );
  } else {
    content = (
      <a className="btn btn--primary btn--block" href="#read">
        Read the opening
      </a>
    );
  }

  return <div className="sticky-cta" ref={barRef}>{content}</div>;
}

export default function App() {
  useEffect(() => {
    captureAttribution();
  }, []);

  return (
    <>
      <Nav />
      <Hero />
      <IntroContext />
      <ReadSection />
      <ElenasBench />
      <BuySection />
      <AuthorSection />
      <ContributeSection />
      <Glossary />
      <Footer />
      <StickyMobileCta />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
