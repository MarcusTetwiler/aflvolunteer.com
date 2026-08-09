import { useState } from 'react';

import { attribution } from '../attribution';
import { trackBuildSubmitIntent, trackBuildSubmitSuccess } from '../analytics';
import './BuildSubmitForm.css';

/**
 * Inbound Build Wall submission.
 *
 * Asks for the minimum that makes a submission actionable: how to credit you,
 * how to reach you, a link to the build, and an acknowledgement. No image upload
 * — a link to an existing post is less work for the builder, avoids hosting
 * someone else's file before a human has looked at it, and keeps the original
 * in their control.
 *
 * Nothing submitted here is published. It joins a queue Marcus reads.
 */
export default function BuildSubmitForm({ onClose }) {
  const [values, setValues] = useState({
    handle: '',
    contact: '',
    profileUrl: '',
    buildUrl: '',
    note: '',
    acknowledged: false,
    website: '', // honeypot — hidden from people, catnip to bots
  });
  const [status, setStatus] = useState('idle'); // idle | sending | done
  const [error, setError] = useState('');

  const set = (k) => (e) =>
    setValues((v) => ({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError('');

    if (!values.handle.trim()) return setError('Tell us how you want to be credited.');
    if (!values.contact.trim()) return setError('We need a way to reach you.');
    if (!values.buildUrl.trim()) return setError('Add a link to the build.');
    if (!values.acknowledged) return setError('Please confirm the build is yours.');

    setStatus('sending');
    try {
      const res = await fetch('/api/build-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, ...attribution() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus('idle');
        setError(data.error || 'That did not go through. Please try again.');
        return;
      }
      trackBuildSubmitSuccess();
      setStatus('done');
    } catch {
      setStatus('idle');
      setError('That did not go through. Check your connection and try again.');
    }
  }

  if (status === 'done') {
    return (
      <div className="submit-form submit-form--done" role="status">
        <p className="submit-form__done-title">Got it.</p>
        <p className="submit-form__done-copy">
          Marcus reads these himself. If your build goes up you&rsquo;ll hear from
          him first &mdash; nothing is published without a reply from you.
        </p>
        {onClose && (
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <form className="submit-form" onSubmit={submit} noValidate>
      <p className="submit-form__intro">
        Links only, no uploads &mdash; point us at a post or photo you already
        have. Nothing is published until you&rsquo;ve been asked and said yes.
      </p>

      <div className="submit-form__field">
        <label htmlFor="sub-handle">Credit me as</label>
        <input
          id="sub-handle" type="text" value={values.handle} onChange={set('handle')}
          placeholder="@handle, a name, or a shop name" autoComplete="off"
        />
      </div>

      <div className="submit-form__field">
        <label htmlFor="sub-contact">Email or handle to reach you</label>
        <input
          id="sub-contact" type="text" value={values.contact} onChange={set('contact')}
          autoComplete="email"
        />
      </div>

      <div className="submit-form__field">
        <label htmlFor="sub-build">Link to the build</label>
        <input
          id="sub-build" type="url" value={values.buildUrl} onChange={set('buildUrl')}
          placeholder="https://" autoComplete="off"
        />
      </div>

      <div className="submit-form__field">
        <label htmlFor="sub-profile">
          Your profile <span className="submit-form__optional">optional</span>
        </label>
        <input
          id="sub-profile" type="url" value={values.profileUrl} onChange={set('profileUrl')}
          placeholder="https://" autoComplete="off"
        />
      </div>

      <div className="submit-form__field">
        <label htmlFor="sub-note">
          Anything about the build <span className="submit-form__optional">optional</span>
        </label>
        <textarea
          id="sub-note" rows="3" value={values.note} onChange={set('note')}
          placeholder="What it is, what was hard, what you'd do differently."
        />
      </div>

      {/* Honeypot. Off-screen rather than display:none, which some bots skip. */}
      <div className="submit-form__honeypot" aria-hidden="true">
        <label htmlFor="sub-website">Website</label>
        <input id="sub-website" type="text" tabIndex="-1" value={values.website}
               onChange={set('website')} autoComplete="off" />
      </div>

      <label className="submit-form__check">
        <input type="checkbox" checked={values.acknowledged} onChange={set('acknowledged')} />
        <span>
          This is my build, and I&rsquo;m happy to be credited if it&rsquo;s
          featured. I keep every right I have now.
        </span>
      </label>

      {error && <p className="submit-form__error" role="alert">{error}</p>}

      <div className="submit-form__actions">
        <button
          type="submit"
          className="btn btn--primary"
          disabled={status === 'sending'}
          onClick={() => trackBuildSubmitIntent('form')}
        >
          {status === 'sending' ? 'Sending\u2026' : 'Send it in'}
        </button>
        {onClose && (
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Cancel
          </button>
        )}
      </div>

      <p className="submit-form__fine">
        We use your contact detail to reply about this build and nothing else.
        Under 18? Please don&rsquo;t submit &mdash; ask a parent to get in touch
        instead.
      </p>
    </form>
  );
}
