import { BOOK } from '../site.config';
import { trackBuyClicked } from '../analytics';
import './BuySection.css';

export default function BuySection() {
  const hasRetailers =
    BOOK.available && BOOK.otherRetailers && BOOK.otherRetailers.length > 0;

  const meta = [BOOK.formats, BOOK.pageCount ? `${BOOK.pageCount} pages` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <section className="buy" id="buy">
      <div
        className="buy__bg"
        role="img"
        aria-label="Watercolor field art: an FPV drone pilot in goggles gestures toward a swarm of drones under a smoke-and-fire sky above a pine forest."
      />

      <div className="container buy__inner">
        <div className="buy__cover-wrap">
          {BOOK.coverImage ? (
            <img
              className="buy__cover"
              src={BOOK.coverImage}
              alt={`Cover of ${BOOK.title}`}
              loading="lazy"
            />
          ) : (
            <div className="buy__cover buy__cover--fallback" aria-hidden="true">
              <span className="buy__cover-mark">⚑</span>
              <span className="buy__cover-title">{BOOK.title}</span>
            </div>
          )}
        </div>

        <div className="buy__copy">
          <p className="eyebrow">{BOOK.available ? 'Out Now' : 'Coming Soon'}</p>
          <h2 className="buy__title">{BOOK.title}</h2>
          <p className="buy__blurb">{BOOK.blurb}</p>

          {meta && <p className="buy__meta">{meta}</p>}

          <div className="buy__actions">
            {BOOK.available ? (
              <>
                <a
                  className="buy__primary"
                  href={BOOK.amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackBuyClicked('buy-section')}
                >
                  Buy on Amazon
                </a>
                <a className="buy__secondary" href="#read">
                  Read a sample first
                </a>
              </>
            ) : (
              <>
                <a
                  className="buy__primary buy__primary--pending"
                  href="#read"
                  onClick={() => trackBuyClicked('notify-me')}
                >
                  {BOOK.comingSoonLabel}
                </a>
                <a className="buy__secondary" href="#read">
                  Read the opening
                </a>
              </>
            )}
          </div>

          {hasRetailers && (
            <ul className="buy__retailers">
              {BOOK.otherRetailers.map((r) => (
                <li key={r.label}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer">
                    {r.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
