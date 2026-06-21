import FrontMap from './FrontMap';
import './Hero.css';

export default function Hero() {
  return (
    <header className="hero">
      <div className="container hero__top">
        <div className="hero__brand">
          <span className="hero__brand-mark" aria-hidden="true">⚑</span>
          The American Foreign Legion
        </div>
        <a href="#volunteer" className="hero__nav-cta">Volunteer</a>
      </div>

      <div className="container hero__map-wrap">
        <FrontMap />
      </div>
    </header>
  );
}
