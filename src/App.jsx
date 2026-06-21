import { useEffect, useState } from 'react';
import Hero from './components/Hero';
import IntroContext from './components/IntroContext';
import FeatureStory from './components/FeatureStory';
import CtaSection from './components/CtaSection';
import Footer from './components/Footer';
import './App.css';

function StickyMobileCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById('volunteer');
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
      <a href="#volunteer">Volunteer — Enter Redline</a>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Hero />
      <IntroContext />
      <FeatureStory />
      <CtaSection />
      <Footer />
      <StickyMobileCta />
    </>
  );
}
