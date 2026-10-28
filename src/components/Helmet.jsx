import { useId } from 'react';
import { countryColors } from '../countries';

const STRIPE = { '061': '#d58a35', '063': '#cc4361', '064': '#df4a2f', '067': '#c49827' };
const FINISH = { bone: '#d6c5a7', rust: '#a94f2b', field: '#59604c', repaired: '#8d7c68', charcoal: '#2c2d2e', metal: '#c4ccce', 'hi-vis': '#e3b13a', pro: '#d37d66' };

// A racing helmet in side profile. The shell takes the aircraft's accent colour, the stripe
// takes the aircraft's livery, the band carries the pilot's national colours, and the
// callsign is painted on the side, so pilot and machine read as one identity.
export default function Helmet({ build = {}, country = 'Independent', callsign = '', size = 220, className = '', title }) {
  const id = useId().replace(/:/g, '');
  const shell = build.accent || FINISH[build.finish] || '#bfc8c8';
  const stripe = STRIPE[build.livery] || null;
  const [a, b, c] = countryColors(country);
  const name = (callsign || '').toUpperCase().slice(0, 10);
  const label = title || `Racing helmet in ${country} colours${name ? `, callsign ${name}` : ''}`;
  return (
    <svg className={`helmet ${className}`} viewBox="0 0 240 200" width={size} height={size * 200 / 240} role="img" aria-label={label}>
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset=".35" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".45" /></linearGradient>
        <linearGradient id={`${id}v`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#0a1016" /><stop offset=".55" stopColor="#1d3442" /><stop offset=".8" stopColor="#5f8aa0" /><stop offset="1" stopColor="#0d151c" /></linearGradient>
        <clipPath id={`${id}c`}><path d="M28 118C24 64 64 22 122 20c54-2 92 34 94 86 1 18-4 34-12 46l-30 10H70c-20 0-36-12-42-30z" /></clipPath>
        <filter id={`${id}d`} x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#000" floodOpacity=".45" /></filter>
      </defs>
      <ellipse cx="122" cy="186" rx="86" ry="8" fill="#000" opacity=".35" />
      <g filter={`url(#${id}d)`}>
        <path d="M28 118C24 64 64 22 122 20c54-2 92 34 94 86 1 18-4 34-12 46l-30 10H70c-20 0-36-12-42-30z" fill={shell} />
        <g clipPath={`url(#${id}c)`}>
          {/* national band */}
          <path d="M40 66C80 40 150 34 214 70v14C150 50 82 56 34 84z" fill={a} />
          <path d="M34 84C82 56 150 50 214 84v9C150 62 84 68 31 99z" fill={b} />
          <path d="M31 99C84 68 150 62 214 93v8C150 74 86 80 29 112z" fill={c} />
          {/* livery stripe over the crown */}
          {stripe && <path d="M118 18c-6 40-4 88 10 150h16c-14-62-14-110-8-150z" fill={stripe} opacity=".95" />}
          {/* chin bar shading */}
          <path d="M70 150h104l30-10c-6 14-18 24-36 26H76c-20 0-34-6-44-20z" fill="#000" opacity=".28" />
        </g>
        {/* visor */}
        <path d="M150 74c30 0 56 12 64 30 3 8 0 16-8 20-22 10-54 12-80 8-12-2-18-12-16-24 2-20 18-34 40-34z" fill={`url(#${id}v)`} stroke="#0a0e12" strokeWidth="3" />
        <path d="M158 84c22 2 40 10 46 20" fill="none" stroke="#cfe6f2" strokeOpacity=".5" strokeWidth="3" strokeLinecap="round" />
        {/* vents and trim */}
        <path d="M52 132h36M50 140h30" stroke="#0b0f13" strokeOpacity=".55" strokeWidth="4" strokeLinecap="round" />
        <circle cx="118" cy="104" r="5" fill="#2a2f34" stroke="#0b0f13" strokeWidth="2" />
        <path d="M28 118C24 64 64 22 122 20c54-2 92 34 94 86 1 18-4 34-12 46l-30 10H70c-20 0-36-12-42-30z" fill={`url(#${id}s)`} />
        {name && <text x="84" y="128" textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontWeight="700" fontSize={name.length > 7 ? 11 : 14} letterSpacing="1.5" fill="#0b0f13" fillOpacity=".78" transform="rotate(-8 84 128)">{name}</text>}
      </g>
    </svg>
  );
}
