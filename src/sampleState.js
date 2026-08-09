// Shared between ReadSection (which sets it) and the sticky CTA (which reacts).
// A module-level constant rather than two copies of the same string, and a
// custom event so the CTA updates the moment the sample opens instead of only
// on the next page load.
export const SAMPLE_UNLOCK_KEY = 'afl:sample-unlocked';
export const SAMPLE_UNLOCK_EVENT = 'afl:sample-unlocked';

export function markSampleUnlocked() {
  try {
    window.localStorage.setItem(SAMPLE_UNLOCK_KEY, '1');
  } catch {
    // Private browsing — the gate simply shows again next visit.
  }
  window.dispatchEvent(new Event(SAMPLE_UNLOCK_EVENT));
}
