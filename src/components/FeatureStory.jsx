import './FeatureStory.css';

const BENEFITS = [
  {
    id: 'redline',
    title: 'Access to Redline',
    body: 'The editorial consensus engine. Read the manuscript chapter by chapter and leave comments directly inside the text.',
  },
  {
    id: 'discount',
    title: '50% off at launch',
    body: 'Discounted book and audiobook pricing when Book 1 ships, as thanks for reading early.',
  },
  {
    id: 'drops',
    title: 'Early reader drops',
    body: 'Updates on new chapters, revisions, and the state of the front, sent only when there\u2019s something to report.',
  },
  {
    id: 'movement',
    title: 'Build the ecosystem',
    body: 'Volunteer and share the movement. Your read shapes the next draft.',
  },
];

export default function FeatureStory() {
  return (
    <section className="feature-story">
      <div className="container feature-story__inner">
        <div className="feature-story__copy">
          <p className="eyebrow">Currently Deployed</p>
          <h2 className="feature-story__title">What you get</h2>
          <p className="feature-story__sub">
            This isn&rsquo;t a waitlist. The manuscript is live, the draft is current,
            and your notes go straight into the next revision.
          </p>

          <ul className="feature-story__list">
            {BENEFITS.map((b) => (
              <li key={b.id}>
                <h3>{b.title}</h3>
                <p>{b.body}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="feature-story__panel" aria-hidden="true">
          <div className="redline-mock">
            <div className="redline-mock__topbar">
              <span className="redline-mock__mark" />
              <span className="redline-mock__title">Redline</span>
              <span className="redline-mock__meta">The American Foreign Legion — Draft A26 · 18 chapters</span>
            </div>
            <div className="redline-mock__body">
              <div className="redline-mock__sidebar">
                {['Prologue', 'Elena', 'Jack', 'Reese', 'Andrew', 'Elena II', 'Logan', 'Rupert II'].map((ch, i) => (
                  <div key={ch} className={`redline-mock__chapter ${i === 0 ? 'is-active' : ''}`}>
                    {ch}
                  </div>
                ))}
              </div>
              <div className="redline-mock__text">
                <div className="redline-mock__heading">Prologue</div>
                <div className="redline-mock__line" style={{ width: '94%' }} />
                <div className="redline-mock__line" style={{ width: '88%' }} />
                <div className="redline-mock__line redline-mock__line--marked" style={{ width: '91%' }} />
                <div className="redline-mock__line" style={{ width: '70%' }} />
                <div className="redline-mock__line" style={{ width: '85%' }} />
                <div className="redline-mock__line redline-mock__line--marked" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
