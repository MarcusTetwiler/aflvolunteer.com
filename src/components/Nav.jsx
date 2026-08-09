import { useEffect, useMemo, useRef, useState } from 'react';
import { NAV_LINKS, BOOK } from '../site.config';
import { trackBuyClicked } from '../analytics';
import './Nav.css';

export default function Nav() {
  const links = useMemo(() => {
    const withoutGear = NAV_LINKS.filter((link) => link.href !== '#gear');
    const gear = { href: '#gear-store', label: 'Gear' };
    return [...withoutGear, gear];
  }, []);

  const [active, setActive] = useState('#front');
  const [scrolled, setScrolled] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const sections = links.map((link) => document.getElementById(link.href === '#gear-store' ? 'gear' : link.href.slice(1))).filter(Boolean);
    if (!sections.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );
    sections.forEach((section) => obs.observe(section));
    return () => obs.disconnect();
  }, [links]);

  useEffect(() => {
    const el = listRef.current?.querySelector('.nav__link.is-active');
    if (!el || !listRef.current) return;
    const list = listRef.current;
    const elLeft = el.offsetLeft;
    const elRight = elLeft + el.offsetWidth;
    if (elLeft < list.scrollLeft || elRight > list.scrollLeft + list.clientWidth) {
      list.scrollTo({ left: elLeft - list.clientWidth / 2 + el.offsetWidth / 2, behavior: 'smooth' });
    }
  }, [active]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const update = () => {
      list.dataset.moreRight = list.scrollWidth - list.clientWidth - list.scrollLeft > 4 ? 'true' : 'false';
      list.dataset.moreLeft = list.scrollLeft > 4 ? 'true' : 'false';
    };
    update();
    list.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      list.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <nav className={`nav${scrolled ? ' is-scrolled' : ''}`} aria-label="Primary">
      <div className="container nav__inner">
        <a href="#home" className="nav__brand">
          <span className="nav__brand-mark" aria-hidden="true">⚑</span>
          <span className="nav__brand-text">The American Foreign Legion</span>
        </a>

        <ul className="nav__links" ref={listRef}>
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={`nav__link${active === link.href || (link.href === '#gear-store' && active === '#gear') ? ' is-active' : ''}`} aria-current={active === link.href || (link.href === '#gear-store' && active === '#gear') ? 'true' : undefined}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {BOOK.available ? (
          <a className="nav__cta btn btn--primary" href={BOOK.amazonUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackBuyClicked('nav')}>
            Buy the book
          </a>
        ) : (
          <a className="nav__cta btn btn--primary" href="#read">Read the opening</a>
        )}
      </div>
    </nav>
  );
}
