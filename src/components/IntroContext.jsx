import './IntroContext.css';

export default function IntroContext() {
  return (
    <section className="intro-context grain" aria-label="Field sketch — Eastern Theater, exact location withheld">
      <div className="intro-context__bg" role="img" aria-label="A drone operator silhouetted against a smoke-streaked orange sky thick with a swarm of military drones, watching over volunteers gathered on a ridge above a distant city, while in the foreground an FPV pilot wearing goggles points toward the swarm." />

      <div className="container intro-context__copy-wrap">
        <div className="intro-context__copy">
          <p className="eyebrow">Article 5</p>
          <p className="intro-context__lead">
            Following the occupation of Ukraine, Russian forces advanced westward
            across the pre-war border, initiating a multi-pronged offensive into
            eastern Poland. This incursion constituted a breach of territory under
            Article 5 of the NATO Treaty.
          </p>
          <p className="intro-context__body">
            Despite the legal activation of the mutual defense clause, the United
            States of America declared neutrality. The front remains fluid.
          </p>
        </div>
      </div>
    </section>
  );
}
