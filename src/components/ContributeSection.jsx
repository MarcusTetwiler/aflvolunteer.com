import { CAUSES } from '../site.config';
import { trackCauseClicked } from '../analytics';
import './ContributeSection.css';

export default function ContributeSection() {
  return (
    <section className="contribute" id="contribute">
      <div className="container contribute__inner">
        <header className="contribute__head">
          <p className="eyebrow">Contribute</p>
          <h2 className="contribute__title">This world is not invented.</h2>
          <p className="contribute__sub">
            <em>The American Foreign Legion</em> imagines one possible future from technologies, conflicts, institutions, and places that already exist.
          </p>
        </header>

        <div className="contribute__routes">
          <a className="contribute__route contribute__route--world" href="#glossary">
            <span>FACT + FUTURE</span>
            <h3>Curious how close that future is?</h3>
            <p>Explore the spoiler-free glossary of fact and future.</p>
            <strong>TOUR THE WORLD →</strong>
          </a>
          <a className="contribute__route contribute__route--help" href="#contribute-organizations">
            <span>REAL-WORLD ACTION</span>
            <h3>The people doing this work are real, too.</h3>
            <p>These organizations support medicine, demining, evacuation, logistics, and Ukrainian capacity today.</p>
            <strong>WAYS TO HELP ↓</strong>
          </a>
        </div>

        <ul className="contribute__grid" id="contribute-organizations">
          {CAUSES.map((cause, i) => (
            <li key={cause.id} className="contribute__card">
              <a className="contribute__card-link" href={cause.url} target="_blank" rel="noopener noreferrer" onClick={() => trackCauseClicked(cause.id)}>
                <span className="contribute__index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
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
          These organizations are listed because their work bears directly on the subject of the novel. No affiliation, sponsorship, or endorsement is implied. Donations are made directly through each organization&rsquo;s own site.
        </p>
      </div>
    </section>
  );
}
