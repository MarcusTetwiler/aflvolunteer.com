import { useMemo, useState } from 'react';
import { GLOSSARY, GLOSSARY_GROUPS } from '../data/glossary';
import { GLOSSARY_INTRO } from '../site.config';
import { trackGlossaryFilter } from '../analytics';
import './Glossary.css';

export default function Glossary() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GLOSSARY.filter((entry) => {
      const matchesFilter =
        filter === 'all' ||
        entry.origin === filter ||
        entry.group === filter;
      if (!matchesFilter) return false;
      if (!q) return true;
      return (
        entry.term.toLowerCase().includes(q) ||
        entry.definition.toLowerCase().includes(q)
      );
    });
  }, [query, filter]);

  function applyFilter(id) {
    setFilter(id);
    trackGlossaryFilter(id);
  }

  return (
    <section className="glossary" id="glossary">
      <div className="container">
        <header className="glossary__head">
          <p className="eyebrow">{GLOSSARY_INTRO.eyebrow}</p>
          <h2 className="glossary__title">{GLOSSARY_INTRO.headline}</h2>
          <p className="glossary__sub">{GLOSSARY_INTRO.sub}</p>
        </header>

        <div className="glossary__controls">
          <div className="glossary__search">
            <label className="glossary__search-label" htmlFor="glossary-search">
              Search terms
            </label>
            <input
              id="glossary-search"
              type="search"
              placeholder="Search 50 terms…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="glossary__filters" role="group" aria-label="Filter terms">
            {GLOSSARY_GROUPS.map((g) => (
              <button
                key={g.id}
                type="button"
                aria-pressed={filter === g.id}
                className={`glossary__filter${filter === g.id ? ' is-active' : ''}`}
                onClick={() => applyFilter(g.id)}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <p className="glossary__count" aria-live="polite">
          {results.length === GLOSSARY.length
            ? `${GLOSSARY.length} terms`
            : `${results.length} of ${GLOSSARY.length} terms`}
        </p>

        {results.length === 0 ? (
          <p className="glossary__no-results">
            Nothing matches that. Try a shorter search, or clear the filter.
          </p>
        ) : (
          <dl className="glossary__list">
            {results.map((entry) => (
              <div className="glossary__entry" key={entry.id} id={`g-${entry.id}`}>
                <dt className="glossary__term">
                  <span className="glossary__term-name">{entry.term}</span>
                  <span
                    className={`glossary__badge glossary__badge--${entry.origin}`}
                    title={
                      entry.origin === 'real'
                        ? 'This exists today'
                        : 'Created for the novel'
                    }
                  >
                    {entry.origin === 'real' ? 'Real' : 'From the novel'}
                  </span>
                </dt>
                <dd className="glossary__definition">{entry.definition}</dd>
              </div>
            ))}
          </dl>
        )}

        <p className="glossary__footnote">{GLOSSARY_INTRO.footnote}</p>
      </div>
    </section>
  );
}
