import { useEffect, useState } from 'react';
import Nav from './components/Nav';
import Hero from './components/Hero';
import IntroContext from './components/IntroContext';
import ReadSection from './components/ReadSection';
import BuySection from './components/BuySection';
import AuthorSection from './components/AuthorSection';
import ContributeSection from './components/ContributeSection';
import Footer from './components/Footer';
import { BOOK } from './site.config';
import './App.css';

function StickyMobileCta() {
  const [visible, setVisible] = useState(false);

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

  if (!visible) return null;

  return (
    <div className="sticky-cta">
      {BOOK.available ? (
        <a href={BOOK.amazonUrl} target="_blank" rel="noopener noreferrer">
          Buy the book
        </a>
      ) : (
        <a href="#read">Read the opening</a>
      )}
    </div>
  );
}

export default function App() {
  return (
    <>
      <Nav />
      <Hero />
      <IntroContext />
      <ReadSection />
      <BuySection />
      <AuthorSection />
      <ContributeSection />
      <Footer />
      <StickyMobileCta />
    </>
  );
}
