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

      <div className="container hero__intro">
        <p className="eyebrow">Recovered Operations Document — Eastern Theater</p>
        <h1 className="hero__title">The Front</h1>
        <p className="hero__dek">
          The front is a fluid and brutal battleground pushed deep into eastern Poland,
          where soldiers face off against massive, unyielding swarms of enemy drones.
          A scarred landscape of salted earth, rusted tank traps, and hidden trenches
          where the war shifts by inches every day.
        </p>
      </div>

      <div className="container">
        <FrontMap />
      </div>
    </header>
  );
}
