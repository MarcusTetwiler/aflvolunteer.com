import { BOOK, CONTACT_EMAILS } from '../site.config';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <img className="footer__art" src="/images/footer-bench-watercolor.jpg" alt="Watercolor workshop with aircraft parts and tools" width="1170" height="624" loading="lazy"/><div className="container footer__inner">
        <div className="footer__brand">
          <div className="footer__brand-name">{BOOK.title}</div>
          <div className="footer__stats">
            {BOOK.available ? 'Available now' : 'Coming soon'} · {BOOK.formats}<p className="footer__fiction">Nation’s Series is a fictional sporting experience from The American Foreign Legion.</p>
          </div>
        </div>

        <nav className="footer__links" aria-label="Inquiries">
          {CONTACT_EMAILS.map((c) => (
            <a key={c.address} href={`mailto:${c.address}`}>{c.label}</a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
