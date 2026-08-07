import { BOOK } from '../site.config';
import './BuySection.css';

export default function BuySection() {
  const hasRetailers =
    BOOK.available && BOOK.otherRetailers && BOOK.otherRetailers.length > 0;

  const meta = [BOOK.formats, BOOK.pageCount ? `${BOOK.pageCount} pages` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <section className="buy grain" id="buy">
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
                >
                  Buy on Amazon
                </a>
                <a className="buy__secondary" href="#read">
                  Read a sample first
                </a>
              </>
            ) : (
              <>
                <span className="buy__primary buy__primary--pending">
                  {BOOK.comingSoonLabel}
                </span>
                <a className="buy__secondary" href="#read">
                  Read the opening now
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
