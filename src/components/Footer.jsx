import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <div className="footer__brand-name">The American Foreign Legion</div>
          <div className="footer__stats">
            Current Draft: A26 · 80,000+ words available now · Book 1 Launch Date: TBD
          </div>
        </div>

        <nav className="footer__links" aria-label="Inquiries">
          <a href="mailto:media@theamericanforeignlegion.com">Media Inquiries</a>
          <a href="mailto:partners@theamericanforeignlegion.com">Partner Inquiries</a>
          <a href="mailto:support@theamericanforeignlegion.com">Support Inquiries</a>
        </nav>
      </div>
    </footer>
  );
}
