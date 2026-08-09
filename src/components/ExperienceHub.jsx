import './ExperienceHub.css';

const EXPERIENCES = [
  { href: '#front', index: '01', title: 'The Front', copy: 'Explore the operating geography of the novel.', cta: 'Open map' },
  { href: '#wall', index: '02', title: 'Elena’s Bench', copy: 'Design, fabricate, and flight-test your own drone.', cta: 'Make your drone' },
  { href: '#read', index: '03', title: 'Read', copy: 'Read the Prologue and Chapter One free.', cta: 'Read the opening' },
  { href: '#glossary', index: '04', title: 'Fact + Future', copy: 'Find out how much of this world already exists.', cta: 'Explore glossary' },
  { href: '#contribute', index: '05', title: 'Contribute', copy: 'Meet organizations doing the real-world work now.', cta: 'Ways to help' },
];

export default function ExperienceHub() {
  return (
    <header className="experience-hub grain" id="home">
      <div className="container experience-hub__inner">
        <div className="experience-hub__copy">
          <p className="eyebrow">The American Foreign Legion</p>
          <h1>Enter the world before the book begins.</h1>
          <p>
            Explore the geography, technology, and opening chapters of <em>The American Foreign Legion</em>,
            a near-future war built from pieces of the present.
          </p>
        </div>

        <nav className="experience-hub__paths" aria-label="Explore The American Foreign Legion">
          {EXPERIENCES.map((item) => (
            <a className="experience-hub__path" href={item.href} key={item.href}>
              <span className="experience-hub__index">{item.index}</span>
              <span className="experience-hub__path-copy">
                <strong>{item.title}</strong>
                <small>{item.copy}</small>
              </span>
              <span className="experience-hub__path-cta">{item.cta} →</span>
            </a>
          ))}
        </nav>

        <a className="experience-hub__supply" href="#gear-store">
          <span>AFL FIELD SUPPLY</span>
          <strong>CURRENT INVENTORY: 0</strong>
          <span>ENTER →</span>
        </a>
      </div>
    </header>
  );
}
