// ─────────────────────────────────────────────────────────────────────────────
//  Funnel events
//
//  One place for every tracked interaction, so the event names stay consistent
//  and a failure in the analytics layer can never break the page.
//
//  NOTE: pageviews and Speed Insights work on every Vercel plan. Custom events
//  (everything below) require a Pro plan — on Hobby these calls simply do
//  nothing, which is why they're all wrapped and never awaited.
// ─────────────────────────────────────────────────────────────────────────────

import { track as vercelTrack } from '@vercel/analytics';

function safeTrack(event, props) {
  try {
    vercelTrack(event, props);
  } catch {
    // Analytics must never take the page down with it.
  }
}

/** Someone submitted the email gate and the sample opened. */
export const trackSampleUnlocked = () => safeTrack('sample_unlocked');

/** Someone switched to a chapter in the reader. Tells you if they got past the prologue. */
export const trackChapterViewed = (chapterId) =>
  safeTrack('chapter_viewed', { chapter: chapterId });

/** Someone reached the end of the sample. The strongest intent signal on the page. */
export const trackSampleFinished = () => safeTrack('sample_finished');

/** A buy click. `location` distinguishes nav / buy section / sticky bar / end of sample. */
export const trackBuyClicked = (location) => safeTrack('buy_clicked', { location });

/** A click through to one of the philanthropic organizations. */
export const trackCauseClicked = (causeId) => safeTrack('cause_clicked', { cause: causeId });

/** A click through to a featured builder's profile. Measures credit delivered. */
export const trackBuildClicked = (buildId) => safeTrack('build_clicked', { build: buildId });

/** Someone opened the submit-a-build mailto. Inbound interest from the target audience. */
export const trackBuildSubmitIntent = (location) =>
  safeTrack('build_submit_intent', { location });

/** Which glossary filter people reach for. Tells you what readers came to look up. */
export const trackGlossaryFilter = (filterId) =>
  safeTrack('glossary_filter', { filter: filterId });

/** POV switch on the front map — tells you whether Andrew's view gets used at all. */
export const trackMapPovChanged = (pov) => safeTrack('map_pov_changed', { pov });

/** Layer toggled on/off. Reveals which map layers readers actually care about. */
export const trackMapLayerToggled = (layer, on) =>
  safeTrack('map_layer_toggled', { layer, state: on ? 'on' : 'off' });

/** A map feature's detail card was opened. The map's real engagement signal. */
export const trackMapFeatureOpened = (id) => safeTrack('map_feature_opened', { feature: id });

/**
 * Glossary search. Fires on a settled query, not per keystroke — per-keystroke
 * events would bury the signal in partial words and burn quota for nothing.
 */
export const trackGlossarySearch = (term) =>
  safeTrack('glossary_search', { term: String(term).slice(0, 60).toLowerCase() });

/** A Build Wall entry's share/copy-link was used. */
export const trackBuildShared = (buildId) => safeTrack('build_shared', { build: buildId });

/** A build was landed on via a shared #build-<id> link. Measures the loop working. */
export const trackBuildViewed = (buildId) => safeTrack('build_viewed', { build: buildId });

/** An inbound build submission completed. */
export const trackBuildSubmitSuccess = () => safeTrack('build_submit_success');
