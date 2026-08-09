import { useEffect, useState } from 'react';
import { PUBLISHABLE_BUILDS } from '../data/buildWall';
import { WALL } from '../site.config';
import {
  trackBuildClicked,
  trackBuildSubmitIntent,
  trackBuildShared,
  trackBuildViewed,
} from '../analytics';
import BuildSubmitForm from './BuildSubmitForm';
import './BuildWall.css';

/**
 * Copy-link / native-share control for a single featured build.
 *
 * Uses the Web Share sheet where the platform offers one (mobile), and falls
 * back to clipboard. A featured builder sharing their own feature is the wall's
 * whole growth mechanism, so this needs to be one tap on a phone.
 */
function ShareBuild({ build }) {
  const [copied, setCopied] = useState(false);
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/#build-${build.id}`;

  async function share() {
    trackBuildShared(build.id);
    const payload = {
      title: `${build.builder} on the AFL Build Wall`,
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch {
        // Sheet dismissed, or share unavailable — fall through to copy.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard blocked; the anchor in the address bar is still shareable.
    }
  }

  return (
    <button type="button" className="wall__share" onClick={share}>
      {copied ? 'Link copied' : 'Share'}
    </button>
  );
}

function BuildCard({ build, featured }) {
  return (
    <li
      className={`wall__item${featured ? ' wall__item--featured' : ''}`}
      id={`build-${build.id}`}
    >
      <figure className="wall__figure">
        <img
          className="wall__image"
          src={`/images/wall/${build.id}.jpg`}
          alt={build.alt || `Drone build by ${build.builder}`}
          loading="lazy"
          decoding="async"
        />
        <figcaption className="wall__caption">
          <div className="wall__caption-head">
            <a
              className="wall__builder"
              href={build.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackBuildClicked(build.id)}
            >
              {build.builder}
            </a>
            <ShareBuild build={build} />
          </div>
          {build.caption && (
            <span className="wall__caption-text">{build.caption}</span>
          )}
        </figcaption>
      </figure>
    </li>
  );
}

export default function BuildWall() {
  const builds = PUBLISHABLE_BUILDS;
  const [showForm, setShowForm] = useState(false);

  // A shared #build-<id> link should land on that build and say so.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#build-')) return;
    const el = document.getElementById(hash.slice(1));
    if (!el) return;
    el.classList.add('is-linked');
    trackBuildViewed(hash.slice(7));
    const t = setTimeout(() => el.classList.remove('is-linked'), 2600);
    return () => clearTimeout(t);
  }, []);

  // With enough builds, the first one runs full width and the rest form a
  // denser grid — otherwise ten phone-width images become ten full screens of
  // scrolling. Below the threshold every tile is equal.
  const featureFirst = builds.length >= 4;

  return (
    <section className="wall" id="wall">
      <div className="container">
        <header className="wall__head">
          <p className="eyebrow">{WALL.eyebrow}</p>
          <h2 className="wall__title">{WALL.headline}</h2>
          <p className="wall__sub">{WALL.sub}</p>
        </header>

        {builds.length === 0 ? (
          <div className="wall__empty">
            <p className="wall__empty-copy">{WALL.emptyCopy}</p>
            {!showForm && (
              <button
                type="button"
                className="wall__empty-cta btn btn--primary"
                onClick={() => { setShowForm(true); trackBuildSubmitIntent('empty-state'); }}
              >
                {WALL.submitCta}
              </button>
            )}
          </div>
        ) : (
          <ul className={`wall__grid${featureFirst ? ' wall__grid--featured' : ''}`}>
            {builds.map((build, i) => (
              <BuildCard key={build.id} build={build} featured={featureFirst && i === 0} />
            ))}
          </ul>
        )}

        {showForm ? (
          <div className="wall__form-wrap">
            <BuildSubmitForm onClose={() => setShowForm(false)} />
          </div>
        ) : (
          builds.length > 0 && (
            <div className="wall__footer">
              <p className="wall__credit-note">{WALL.creditNote}</p>
              <button
                type="button"
                className="wall__submit btn btn--primary"
                onClick={() => { setShowForm(true); trackBuildSubmitIntent('wall-footer'); }}
              >
                {WALL.submitCta}
              </button>
            </div>
          )
        )}

        {builds.length === 0 && !showForm && (
          <p className="wall__credit-note wall__credit-note--standalone">
            {WALL.creditNote}
          </p>
        )}
      </div>
    </section>
  );
}
