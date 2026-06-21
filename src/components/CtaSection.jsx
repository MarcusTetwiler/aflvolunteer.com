import { useState } from 'react';
import './CtaSection.css';

const REDLINE_URL = 'https://redline-afl.vercel.app/';

export default function CtaSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | error
  const [errors, setErrors] = useState({});

  function validate() {
    const next = {};
    if (!name.trim()) next.name = 'Tell us who\u2019s reporting for duty.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter a valid email.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setStatus('submitting');

    try {
      const res = await fetch('/api/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      if (!res.ok) throw new Error('Request failed');
    } catch (err) {
      // Even on a backend hiccup, don't block the reward — the email was typed
      // correctly and the person is ready to go. Log for later reconciliation.
      console.error('Volunteer capture failed:', err);
    }

    // Immediate reward, no waiting screen.
    window.open(REDLINE_URL, '_blank', 'noopener');
    setStatus('idle');
    setName('');
    setEmail('');
  }

  return (
    <section className="cta-section grain" id="volunteer">
      <div className="cta-section__bg" role="img" aria-label="An FPV drone pilot wearing goggles points toward a swarm of drones against a smoke-and-fire sky, with a pine forest below." />

      <div className="container cta-section__inner">
        <div className="cta-section__copy">
          <p className="eyebrow">Report For Duty</p>
          <h2 className="cta-section__title">Volunteer for the early reader program</h2>
          <p className="cta-section__sub">
            Free access to Redline, an editorial consensus engine built for
            volunteers like you to be part of the story. Read the current
            draft, leave your mark, and help shape what comes next.
          </p>

          <form className="cta-section__form" onSubmit={handleSubmit} noValidate>
            <div className="cta-section__field">
              <label htmlFor="cta-name">Name</label>
              <input
                id="cta-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'cta-name-err' : undefined}
              />
              {errors.name && <span className="cta-section__error" id="cta-name-err">{errors.name}</span>}
            </div>

            <div className="cta-section__field">
              <label htmlFor="cta-email">Email</label>
              <input
                id="cta-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'cta-email-err' : undefined}
              />
              {errors.email && <span className="cta-section__error" id="cta-email-err">{errors.email}</span>}
            </div>

            <button type="submit" className="cta-section__submit" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Granting access\u2026' : 'Enter Redline'}
            </button>
            <p className="cta-section__fine-print">
              You&rsquo;ll be granted access immediately. No newsletter, no spam — just dispatches from the front.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
