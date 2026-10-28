import { useEffect, useRef, useState } from 'react';
import Nav from './components/Nav';
import NationsSeries from './components/NationsSeries';
import Hero from './components/Hero';
import IntroContext from './components/IntroContext';
import ReadSection from './components/ReadSection';
import ElenasBench from './components/ElenasBench';
import BuySection from './components/BuySection';
import AuthorSection from './components/AuthorSection';
import Community from './components/Community';
import { BookEnding, ExploreMore } from './components/BookEnding';
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
  const [pageState, setPageState] = useState({ pastHero: false, lowerSite: false, destinationVisible: false, pastRead: false });

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
      const readEl = document.getElementById('read');
      const ending = document.getElementById('ending');
      const pastRead = Boolean(readEl && readEl.getBoundingClientRect().bottom < window.innerHeight * 0.4);
      const endRect = ending?.getBoundingClientRect();
      setPageState({
        pastHero: window.scrollY > Math.min(480, window.innerHeight * 0.55),
        lowerSite: Boolean(endRect && endRect.top < window.innerHeight * 0.95),
        destinationVisible: false,
        pastRead,
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

  if (typing || !pageState.pastHero || pageState.lowerSite) return null;

  if (!pageState.pastRead) {
    return <div className="sticky-cta"><a className="btn btn--secondary btn--block" href="#buy">Skip to the book</a></div>;
  }
  if (BOOK.available) {
    return (
      <div className="sticky-cta">
        <a className="btn btn--primary btn--block" href={BOOK.amazonUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackBuyClicked('sticky-bar')}>Buy the book</a>
      </div>
    );
  }
  return <div className="sticky-cta"><a className="btn btn--primary btn--block" href="#ending">Buy the book</a></div>;
}

export default function App() {
  const [bookOpen,setBookOpen]=useState(()=>Boolean(location.hash && location.hash !== '#home'));
  const [raceRequest,setRaceRequest]=useState(null);
  useEffect(()=>{const sync=()=>setBookOpen(location.hash !== '#home' && Boolean(location.hash));window.addEventListener('hashchange',sync);return()=>window.removeEventListener('hashchange',sync);},[]);
  function showBook(id){setBookOpen(true);window.history.replaceState(null,'','#'+id);requestAnimationFrame(()=>{const target=document.getElementById(id);if(id==='launch-list')target?.querySelector('details')?.setAttribute('open','');target?.scrollIntoView({block:'start'});});}
  const [benchVisited, setBenchVisited] = useState(() => readFlag(BENCH_VISITED_KEY));
  function returnToBroadcast(){setBookOpen(false);window.history.replaceState(null,'','#home');window.scrollTo(0,0);}
  useEffect(()=>{const back=()=>returnToBroadcast();window.addEventListener('afl-return-broadcast',back);return()=>window.removeEventListener('afl-return-broadcast',back);},[]);

  useEffect(() => {
    captureAttribution();
  }, []);

  return (
    <>
      <div hidden={bookOpen}><NationsSeries onBuild={req=>{setRaceRequest(req);window.dispatchEvent(new CustomEvent('afl-build-request',{detail:req}));}} onBook={showBook}/></div>
      <ElenasBench raceRequest={raceRequest} onRaceReady={a=>window.dispatchEvent(new CustomEvent('afl-aircraft-ready',{detail:a}))} onRaceCancel={()=>setRaceRequest(null)}/>
      <div hidden={!bookOpen}>
        <Nav />
        <ReadSection />
        <BuySection />
        {bookOpen && <Hero />}
        <IntroContext />
        <Community />
        <AuthorSection />
        <BookEnding />
        <ExploreMore />
        <Footer />
        <div className="broadcast-return"><button type="button" className="btn btn--secondary" onClick={returnToBroadcast}>← Back to the Nations Series</button></div>
      </div>
      {bookOpen && <StickyMobileCta benchVisited={benchVisited} setBenchVisited={setBenchVisited} />}
      <Analytics />
      <SpeedInsights />
    </>
  );
}
