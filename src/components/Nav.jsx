import { useEffect, useState } from 'react';
import { NAV_LINKS, BOOK } from '../site.config';
import './Nav.css';

export default function Nav() {
  const [active, setActive] = useState('#front');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Highlight whichever section currently owns the upper third of the viewport.
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const sections = NAV_LINKS
      .map((l) => document.getElementById(l.href.slice(1)))
      .filter(Boolean);
    if (!sections.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );

    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  return (
    <nav className={`nav${scrolled ? ' is-scrolled' : ''}`} aria-label="Primary">
      <div className="container nav__inner">
        <a href="#front" className="nav__brand">
          <span className="nav__brand-mark" aria-hidden="true">⚑</span>
          <span className="nav__brand-text">The American Foreign Legion</span>
        </a>

        <ul className="nav__links">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`nav__link${active === link.href ? ' is-active' : ''}`}
                aria-current={active === link.href ? 'true' : undefined}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {BOOK.available ? (
          <a
            className="nav__cta"
            href={BOOK.amazonUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Buy the book
          </a>
        ) : (
          <a className="nav__cta" href="#read">
            Read the opening
          </a>
        )}
      </div>
    </nav>
  );
}
