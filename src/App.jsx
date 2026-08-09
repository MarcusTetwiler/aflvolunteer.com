import { useEffect, useRef, useState } from 'react';
import Nav from './components/Nav';
import ExperienceHub from './components/ExperienceHub';
import Hero from './components/Hero';
import IntroContext from './components/IntroContext';
import ReadSection from './components/ReadSection';
import ElenasBench from './components/ElenasBench';
import Glossary from './components/Glossary';
import BuySection from './components/BuySection';
import AuthorSection from './components/AuthorSection';
import ContributeSection from './components/ContributeSection';
import FieldSupply from './components/FieldSupply';
import Footer from './components/Footer';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { BOOK } from './site.config';
import { trackBuyClicked } from './analytics';
import { captureAttribution } from './attribution';
import { SAMPLE_UNLOCK_KEY, SAMPLE_UNLOCK_EVENT } from './sampleState';
import './App.css';
import './batch-fixes.css';

const BENCH_VISITED_KEY = 'afl:journey:bench-visited';

function readFlag(key) {
  try { return window.localStorage.getItem(key) === '1'; } catch { return false; }
}

/**
 * iOS-safe overlay lock.
 * Fixed full-screen experiences remember the exact page position before opening
 * and restore it after closing, instead of leaving Safari to infer a new scroll
 * position after body overflow changes.
 */
function useOverlayScrollState(onBenchVisited) {
  const lockedY = useRef(0);
  const wasOverlay = useRef(false);
  const hadBench = useRef(false);

  useEffect(() => {
    const body = document.body;
    const overlayOpen = () => body.classList.contains('bench-open') || body.classList.contains('supply-open');

    const sync = () => {
      const nowOpen = overlayOpen();
      const benchNow = body.classList.contains('bench-open');

      if (nowOpen && !wasOverlay.current) {
        lockedY.current = window.scrollY;
        body.style.position = 'fixed';
        body.style.top = `-${lockedY.current}px`;
        body.style.left = '0';
        body.style.right = '0';
        body.style.width = '100%';
      }

      if (benchNow && !hadBench.current) {
        hadBench.current = true;
        try { window.localStorage.setItem(BENCH_VISITED_KEY, '1'); } catch { /* optional */ }
        onBenchVisited(true);
      }

      if (!nowOpen && wasOverlay.current) {
        body.style.position = '';
        body.style.top = '';
        body.style.left = '';
        body.style.right = '';
        body.style.width = '';
        window.scrollTo(0, lockedY.current);
        hadBench.current = false;
      }

      wasOverlay.current = nowOpen;
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [onBenchVisited]);
}

function StickyMobileCta({ benchVisited, setBenchVisited }) {
  const [unlocked, setUnlocked] = useState(() => readFlag(SAMPLE_UNLOCK_KEY));
  const [typing, setTyping] = useState(false);
  const [pageState, setPageState] = useState({ pastHero: false, lowerSite: false, destinationVisible: false });

  useOverlayScrollState(setBenchVisited);

  useEffect(() => {
    const read = () => setUnlocked(readFlag(SAMPLE_UNLOCK_KEY));
    window.addEventListener(SAMPLE_UNLOCK_EVENT, read);
    return () => window.removeEventListener(SAMPLE_UNLOCK_EVENT, read);
  }, []);

  useEffect(() => {
    const isField = (el) => el && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
    const onFocus = (event) => { if (isField(event.target)) setTyping(true); };
    const onBlur = (event) => { if (isField(event.target)) setTyping(false); };
    document.addEventListener('focusin', onFocus);
    document.addEventListener('focusout', onBlur);
    return () => {
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('focusout', onBlur);
    };
  }, []);

  useEffect(() => {
    const update = () => {
      const lower = document.getElementById('contribute');
      const targetId = BOOK.available ? 'buy' : !unlocked ? 'read' : !benchVisited ? 'wall' : 'buy';
      const target = document.getElementById(targetId);
      const targetRect = target?.getBoundingClientRect();
      setPageState({
        pastHero: window.scrollY > Math.min(480, window.innerHeight * 0.55),
        lowerSite: Boolean(lower && lower.getBoundingClientRect().top < window.innerHeight * 0.78),
        destinationVisible: Boolean(targetRect && targetRect.bottom > 80 && targetRect.top < window.innerHeight * 0.82),
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [unlocked, benchVisited]);

  if (typing || !pageState.pastHero || pageState.lowerSite || pageState.destinationVisible) return null;

  if (BOOK.available) {
    return (
      <div className="sticky-cta">
        <a className="btn btn--primary btn--block" href={BOOK.amazonUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackBuyClicked('sticky-bar')}>
          Buy the book
        </a>
      </div>
    );
  }

  const next = !unlocked
    ? { href: '#read', label: 'Read the opening' }
    : !benchVisited
      ? { href: '#wall', label: 'Make your drone' }
      : { href: '#buy', label: 'Explore the book' };

  return (
    <div className="sticky-cta">
      <a className="btn btn--primary btn--block" href={next.href}>{next.label}</a>
    </div>
  );
}

export default function App() {
  const [benchVisited, setBenchVisited] = useState(() => readFlag(BENCH_VISITED_KEY));

  useEffect(() => {
    captureAttribution();
  }, []);

  return (
    <>
      <Nav />
      <ExperienceHub />
      <Hero />
      <IntroContext />
      <ReadSection />
      <ElenasBench />
      <BuySection />
      <AuthorSection />
      <ContributeSection />
      <Glossary />
      <FieldSupply />
      <Footer />
      <StickyMobileCta benchVisited={benchVisited} setBenchVisited={setBenchVisited} />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
