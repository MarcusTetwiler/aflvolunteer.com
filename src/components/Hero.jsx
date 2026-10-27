import {lazy,Suspense} from 'react';
const FrontMap=lazy(()=>import('./FrontMap'));
import './Hero.css';

export default function Hero() {
  return (
    <header className="hero" id="front">
      <div className="container hero__map-wrap">
        <Suspense fallback={<p role="status">Opening map…</p>}><FrontMap /></Suspense>
      </div>
    </header>
  );
}
