import { useEffect, useMemo, useState } from 'react';
import { attribution } from '../attribution';
import { FIELD_SUPPLY_CATEGORIES, FIELD_SUPPLY_PRODUCTS } from '../data/fieldSupply';
import './FieldSupply.css';

function AllocationForm({ product }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    const clean = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setError('Enter a valid email.');
      return;
    }
    setState('sending');
    setError('');
    try {
      await fetch('/api/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: clean,
          list: product.waitlistList,
          ...attribution(),
        }),
      });
      setState('done');
    } catch {
      setState('done');
    }
  }

  if (state === 'done') {
    return (
      <div className="supply-waitlist__success" role="status">
        <strong>ALLOCATION REQUEST RECORDED</strong>
        <span>We’ll email you if this concept moves toward a civilian production run.</span>
      </div>
    );
  }

  return (
    <form className="supply-waitlist" onSubmit={submit} noValidate>
      <label htmlFor={`waitlist-${product.id}`}>Email for allocation notice</label>
      <div>
        <input
          id={`waitlist-${product.id}`}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(error)}
        />
        <button type="submit" disabled={state === 'sending'}>
          {state === 'sending' ? 'REQUESTING…' : 'JOIN ALLOCATION WAITLIST'}
        </button>
      </div>
      {error && <span className="supply-waitlist__error">{error}</span>}
      <small>No charge. No preorder. Product interest is recorded separately by item.</small>
    </form>
  );
}

function ProductDetail({ product, onClose }) {
  return (
    <div className="supply-detail" role="dialog" aria-modal="true" aria-label={`${product.name} product details`}>
      <button className="supply-detail__backdrop" type="button" aria-label="Close product details" onClick={onClose} />
      <article className="supply-detail__panel">
        <header className="supply-detail__header">
          <span>PRODUCT SPECIFICATION</span>
          <button type="button" onClick={onClose}>CLOSE ×</button>
        </header>
        <div className="supply-detail__body">
          <div className="supply-detail__media">
            <img src={product.heroImage || product.image} alt={`${product.name} concept product rendering`} />
            <span className="supply-badge">{product.status}</span>
          </div>
          <div className="supply-detail__copy">
            <p className="supply-kicker">{product.category} // {product.development}</p>
            <h2>{product.name}</h2>
            <p className="supply-detail__summary">{product.summary}</p>
            <dl className="supply-detail__specs">
              {product.specs.map(([label, value]) => (
                <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
              ))}
            </dl>
            <div className="supply-detail__truth">
              <strong>CIVILIAN INVENTORY: 0</strong>
              <p>
                This is an unreleased AFL concept, not a previously stocked retail item. Specifications are design targets and may change before any production decision.
              </p>
            </div>
            <AllocationForm product={product} />
          </div>
        </div>
      </article>
    </div>
  );
}

export default function FieldSupply() {
  const [open, setOpen] = useState(() => window.location.hash === '#gear-store');
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const featured = FIELD_SUPPLY_PRODUCTS[0];
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FIELD_SUPPLY_PRODUCTS.filter((product) => {
      const categoryMatch = category === 'All' || product.category === category;
      const queryMatch = !q || `${product.name} ${product.category} ${product.descriptor}`.toLowerCase().includes(q);
      return categoryMatch && queryMatch;
    });
  }, [category, query]);

  useEffect(() => {
    const syncHash = () => setOpen(window.location.hash === '#gear-store');
    window.addEventListener('hashchange', syncHash);
    window.addEventListener('popstate', syncHash);
    return () => {
      window.removeEventListener('hashchange', syncHash);
      window.removeEventListener('popstate', syncHash);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('supply-open', open);
    return () => document.body.classList.remove('supply-open');
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key !== 'Escape') return;
      if (selected) setSelected(null);
      else {
        setOpen(false);
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, selected]);

  function enterStore() {
    setOpen(true);
    window.history.replaceState(null, '', '#gear-store');
  }

  function leaveStore() {
    setSelected(null);
    setOpen(false);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  }

  return (
    <section className="field-supply" id="gear">
      <div className="container field-supply__teaser">
        <div>
          <p className="eyebrow">AFL Gear</p>
          <h2>Field Supply.</h2>
          <p>Objects, tools, and artifacts from a future that feels uncomfortably close.</p>
        </div>
        <div className="field-supply__teaser-status">
          <span>CURRENT INVENTORY</span><strong>0</strong><small>Civilian allocation unavailable.</small>
        </div>
        <button className="btn btn--primary" type="button" onClick={enterStore}>Enter Field Supply</button>
      </div>

      <div className="field-supply__rail container" aria-label="Featured Field Supply concepts">
        {FIELD_SUPPLY_PRODUCTS.slice(0, 4).map((product) => (
          <button key={product.id} type="button" onClick={() => { enterStore(); setSelected(product); }}>
            <img src={product.image} alt="" />
            <span>{product.status}</span>
            <strong>{product.name}</strong>
          </button>
        ))}
      </div>

      {open && (
        <div className="supply-store" aria-label="AFL Field Supply store">
          <div className="supply-store__announcement">CIVILIAN ALLOCATION UNAVAILABLE <span /> FIELD UNITS PRIORITIZED</div>
          <header className="supply-store__nav">
            <button className="supply-store__brand" type="button" onClick={() => { setSelected(null); window.scrollTo({ top: 0 }); }}>
              <strong>AFL</strong><span>FIELD SUPPLY</span>
            </button>
            <nav aria-label="Field Supply"><button type="button" className="is-on">SHOP</button><button type="button" onClick={() => document.getElementById('supply-standards')?.scrollIntoView()}>STANDARDS</button></nav>
            <button className="supply-store__close" type="button" onClick={leaveStore}>RETURN TO SITE ×</button>
          </header>

          <main className="supply-store__scroll">
            <section className="supply-store__hero">
              <div className="supply-store__hero-copy">
                <p>AFL FIELD SUPPLY</p>
                <h1>Objects from a future that has not happened yet.</h1>
                <p className="supply-store__lede">A browsable catalog of functional concepts, field materials, and issue goods drawn from the world of <em>The American Foreign Legion</em>.</p>
                <div className="supply-store__inventory"><span>CURRENT INVENTORY: <b>0</b></span><span>FIELD UNITS PRIORITIZED</span></div>
                <div className="supply-store__notice"><strong>CIVILIAN ALLOCATION UNAVAILABLE</strong><span>Every item is currently a concept or in development. Join a product-specific allocation waitlist to register interest.</span></div>
              </div>
              <button className="supply-feature" type="button" onClick={() => setSelected(featured)}>
                <img src={featured.heroImage} alt="Whisper Pin realistic concept rendering" />
                <div><span>FEATURED ITEM</span><h2>WHISPER PIN</h2><p>Wearable AI voice interface.</p><strong>VIEW SPECIFICATION →</strong></div>
              </button>
            </section>

            <section className="supply-catalog" aria-label="Field Supply catalog">
              <div className="supply-catalog__tools">
                <div className="supply-catalog__categories" aria-label="Product categories">
                  {FIELD_SUPPLY_CATEGORIES.map((item) => (
                    <button key={item} type="button" className={category === item ? 'is-on' : ''} onClick={() => setCategory(item)}>{item}</button>
                  ))}
                </div>
                <label className="supply-catalog__search"><span>SEARCH</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Whisper, fiber, resin…" /></label>
              </div>

              <div className="supply-grid">
                {shown.map((product) => (
                  <article className="supply-card" key={product.id}>
                    <button className="supply-card__media" type="button" onClick={() => setSelected(product)}>
                      <img src={product.image} alt={`${product.name} concept rendering`} />
                    </button>
                    <div className="supply-card__body">
                      <span>{product.status} // {product.development}</span>
                      <h3>{product.name}</h3>
                      <p>{product.descriptor}</p>
                      <button type="button" onClick={() => setSelected(product)}>VIEW SPECS / JOIN WAITLIST</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="supply-standards" id="supply-standards">
              <p>STANDARDS // DISCLOSURE</p>
              <h2>Inventory zero is part of the interface. The disclosure is not.</h2>
              <div>
                <p>Products marked <strong>CONCEPT / IN DEVELOPMENT</strong> are unreleased ideas. “Out of stock” is the Field Supply presentation, not a claim that an item was previously manufactured or sold.</p>
                <p>A portion of any future AFL Field Supply revenue is intended to support one of the organizations listed in Contribute. The beneficiary and percentage will be published before any item becomes purchasable.</p>
              </div>
            </section>
          </main>
          {selected && <ProductDetail product={selected} onClose={() => setSelected(null)} />}
        </div>
      )}
    </section>
  );
}
