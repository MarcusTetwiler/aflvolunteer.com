import { BOOK, CONTACT_EMAILS } from '../site.config';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <div className="footer__brand-name">{BOOK.title}</div>
          <div className="footer__stats">
            Available now · {BOOK.formats}
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
