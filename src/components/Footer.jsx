import { BOOK, CONTACT_EMAILS } from '../site.config';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__art-wrap"><img className="footer__art" src="/images/footer-bench-watercolor.jpg" alt="Ink and watercolor pilot in FPV goggles, arm outstretched toward a racing drone under an orange sky" width="1170" height="624" loading="lazy"/></div><div className="container footer__inner">
        <div className="footer__brand">
          <div className="footer__brand-name">{BOOK.title}</div>
          <div className="footer__stats">
            {BOOK.available ? 'Available now' : 'Coming soon'} · {BOOK.formats}
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
