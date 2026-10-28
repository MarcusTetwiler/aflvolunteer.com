import { BOOK } from '../site.config';
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
      </div>
    </footer>
  );
}
