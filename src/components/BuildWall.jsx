import { PUBLISHABLE_BUILDS } from '../data/buildWall';
import { WALL } from '../site.config';
import { trackBuildClicked, trackBuildSubmitIntent } from '../analytics';
import './BuildWall.css';

export default function BuildWall() {
  const builds = PUBLISHABLE_BUILDS;

  return (
    <section className="wall" id="wall">
      <div className="container">
        <header className="wall__head">
          <p className="eyebrow">{WALL.eyebrow}</p>
          <h2 className="wall__title">{WALL.headline}</h2>
          <p className="wall__sub">{WALL.sub}</p>
        </header>

        {builds.length === 0 ? (
          // Reads as "new," not "broken." Better than a stolen wall.
          <div className="wall__empty">
            <p className="wall__empty-copy">{WALL.emptyCopy}</p>
            <a
              className="wall__empty-cta"
              href={`mailto:${WALL.submitEmail}?subject=${encodeURIComponent(WALL.submitSubject)}`}
              onClick={() => trackBuildSubmitIntent('empty-state')}
            >
              {WALL.submitCta}
            </a>
          </div>
        ) : (
          <>
            <ul className="wall__grid">
              {builds.map((build) => (
                <li key={build.id} className="wall__item">
                  <figure className="wall__figure">
                    <img
                      className="wall__image"
                      src={`/images/wall/${build.id}.jpg`}
                      alt={build.alt || `Drone build by ${build.builder}`}
                      loading="lazy"
                      decoding="async"
                    />
                    <figcaption className="wall__caption">
                      <a
                        className="wall__builder"
                        href={build.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackBuildClicked(build.id)}
                      >
                        {build.builder}
                      </a>
                      {build.caption && (
                        <span className="wall__caption-text">{build.caption}</span>
                      )}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>

            <div className="wall__footer">
              <p className="wall__credit-note">{WALL.creditNote}</p>
              <a
                className="wall__submit"
                href={`mailto:${WALL.submitEmail}?subject=${encodeURIComponent(WALL.submitSubject)}`}
                onClick={() => trackBuildSubmitIntent('wall-footer')}
              >
                {WALL.submitCta}
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
