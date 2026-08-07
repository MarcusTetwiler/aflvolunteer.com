import FrontMap from './FrontMap';
import './Hero.css';

export default function Hero() {
  return (
    <header className="hero" id="front">
      <div className="container hero__map-wrap">
        <FrontMap />
      </div>
    </header>
  );
}
