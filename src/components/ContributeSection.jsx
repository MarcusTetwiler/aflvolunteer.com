import { CAUSES, CAUSES_INTRO } from '../site.config';
import './ContributeSection.css';

export default function ContributeSection() {
  return (
    <section className="contribute" id="contribute">
      <div className="container contribute__inner">
        <header className="contribute__head">
          <p className="eyebrow">{CAUSES_INTRO.eyebrow}</p>
          <h2 className="contribute__title">{CAUSES_INTRO.headline}</h2>
          <p className="contribute__sub">{CAUSES_INTRO.sub}</p>
        </header>

        <ul className="contribute__grid">
          {CAUSES.map((cause, i) => (
            <li key={cause.id} className="contribute__card">
              <a
                className="contribute__card-link"
                href={cause.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="contribute__index" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div className="contribute__card-body">
                  {cause.focus && <span className="contribute__focus">{cause.focus}</span>}
                  <h3 className="contribute__name">{cause.name}</h3>
                  <p className="contribute__blurb">{cause.blurb}</p>
                </div>

                <span className="contribute__arrow" aria-hidden="true">→</span>
              </a>
            </li>
          ))}
        </ul>

        <p className="contribute__disclaimer">
          These organizations are listed because their work bears on the subject
          of this novel. Listing is not endorsement by them of the book, and no
          affiliation or sponsorship is implied in either direction. Donations
          are made directly on each organization&rsquo;s own site.
        </p>
      </div>
    </section>
  );
}
