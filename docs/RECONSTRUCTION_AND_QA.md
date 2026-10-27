# Nation's Series v2.2 — Reconstructed implementation and QA

Date: October 25, 2026. This is a NEW reconstruction from the existing GitHub repository and author-approved v2.2 plan. It is not a recovered copy of the lost 75-addition/21-replacement ZIP. The prior 48-test claim does not apply to this archive.

## Implemented

- Recovered approved desktop/mobile championship hero artwork from the uploaded plan. Still images only: no video element, movie URL or video download.
- Retained six-step component-card builder, pagination, fabrication queue, original five field trials, workshop scoring, technical views for original frames, local saves, build sharing and build wall. Expanded to eight options per stage while retaining original IDs/statistics. Optional motor, propeller and pack controls, compatibility errors and immediate actual-model comparisons.
- Reconstructed procedural SVG garage presentation with eight distinct architectures, plausible balanced rotor mounting, material/power/sensor/controller modules, markings, accent colors, four palette liveries and cosmetic edge lights. Legacy technical renderer remains for original-frame projections. This is 2.5D/vector rendering, not photorealistic production art or full 3D.
- Deterministic fixed 120 Hz shared racing model: configuration-dependent mass, inertia/response, acceleration, speed, damping, reserve, wind, heat, boost and durability. Three course sectors, 24 gates, visible guidance/trajectory, collision penalty/recovery, split/PB feedback and compatible local position ghost.
- Guest pilot callsign/country and optional separate email consent. Callsign/country and aircraft are saved locally. Optional launch signup uses the existing API and confirms persisted:true before claiming success. No new online pilot/cloud hangar service is provisioned.
- Local personal hangar: save, name, duplicate, compare, tune, race, history restoration as new revision, prior result snapshots and eight example aircraft.
- Optional three-gate training, steering/boost learning, starting grid, countdown, responsive controls, unranked assist and honest leaderboard. Once used, guided assist remains unranked for the entire attempt, even if switched off.
- Sporting Talon profile finishes or is explicitly skipped before broadcast closure. Only an unassisted, completed second-place championship result qualifies for the unsolicited $25,000 offer. The amount is approved creative copy, not a verified manuscript fact or real payment.
- Accept reuses the existing FrontMap/TheaterBasemap/atlas/anonymous ledger with manual reveal states. Decline gives a brief geography glimpse. Either branch can continue immediately to the original cover and sample. Choices have no effect on race performance or access permissions.
- Versioned separate narrative continuity preserves unanswered offers and chosen branches through refresh. Replay/tune/hangar are direct; returning story is optional.
- Current Live sample refresh: Interlude I + Childhood, about 1,821 words, fetched October 25 from the canonical Google Doc. Manuscript modification returned October 22, 2026. No manuscript edits. Sample is free, with launch-list marketing separate.
- Spoiler associations removed from map/ledger labels and source comments; anonymous public/private contract taxonomy. Existing book cover/watercolors, map geometry and optional website destinations retained.

## Fresh automated checks

25 Node tests pass, plus ESLint and production build. Tests cover original catalog retention, all 32,768 primary engineering combinations (bounded or explicitly incompatible), hardware/cosmetic effects, deterministic contrasting builds, clean second-place vs idle retirement, penalties/energy, delayed steering, immutable snapshots, storage failures, narrative ordering/eligibility/duplicates/skip/decline/return, anonymous ledger labels and image-only hero.

Production entry approximately 348 kB minified /114 kB gzip, plus a separate approximately 124 kB /41 kB gzip map chunk. No new dependency added. This is a bundle-size result, not a phone-performance measurement.

The replacement ZIP is also reconstructed over the pinned original GitHub commit and tests, lint and production build are rerun there. Archive CRC, path traversal, expected entry set and per-file SHA-256 checks are verified.

## Actual browser inspection

Desktop cloud browser inspection completed for: image hero, entry button, all six builder stages, configuration feedback, fabrication queue/printing/inspection, guest profile with no email, training canvas and skip, starting-grid countdown and running championship controls.

Qualified narrative branches were tested separately with a disposable local scene-rehearsal fixture, NOT earned browser gameplay: profile pause/manual progression/finish, sporting closure, offer, refresh with unanswered offer, accept into all four existing map states, map-to-book, sample opening without an email gate, and decline/refresh into its short branch. The fixture is excluded from the ZIP and production.

Browser findings corrected: UUID availability in HTTP preview, hero heading contrast, gallery visibility before discovery, dialog focus containment, stale sample/availability copy, map overview cropping inherited from legacy styling, anonymous ledger classification labels and assist qualification after switching guidance off.

## Remaining acceptance work and differences from the lost implementation

- Real iPhone/touch ergonomics, landscape/safe areas/text zoom, screen-reader operation, low-end-device FPS and memory are not verified. No mobile viewport emulation or actual iPhone test is claimed.
- No complete, manually piloted qualifying browser race was achieved during QA. Model controllers demonstrate earned second place; human tutorial success and race balance still require playtesting. Talon's fixed fictional benchmark remains 27.80 s and should be calibrated by author playtests.
- Final garage/render quality and race visual fidelity require comparison with the approved PDF. The lost renderer/flight code was reconstructed, not recovered byte-for-byte; model/course versions explicitly identify the reconstruction and old timed records are not treated as comparable.
- Final video generation remains paused. Talon's profile is illustrated, not actual documentary footage. Optional race audio/announcer production remains pending; the experience is complete in silence.
- Persistent Same Build/Open Build friend challenges, server replay verification, verified sharing/rematches and cloud multi-aircraft sync remain approved future work. Local times/ghosts are never represented as server-verified.
- Existing production email/ESP/Redis configuration and actual Vercel analytics delivery are not tested. Optional signup failure does not block guest racing/reading.
- Canon review still needed for payment/currency, chronology/control on the retained fictional map, and final sporting profile wording. Seeded ledger coordinates are illustrative, not canon-confirmed mission sites.
- Live sample contains a malformed source phrase around 'her avatar idle on the roo Andrew'. It is preserved verbatim and flagged for author editorial review; it was not silently repaired here. Sample is the author's explicit exception to the interactive spoiler boundary.

## Architecture and future verifier

`engineering.js` + expanded `benchCatalog.js` define valid configurations and physical trade-offs. `raceModel.js` is the shared fixed-step model with explicit reconstruction model/course IDs. `localGarage.js` versions local build snapshots/results; `narrativeState.js` is the pure guarded story reducer. `NationsSeries.jsx` orchestrates hero/profile/grid/results/story/hangar; `FPVRace.jsx` handles live inputs/canvas; ElenasBench keeps its existing workshop with request/ready event integration. FrontMap adds optional journey filters but reuses its original data and geometry.

Canonical build serialization resolves implicit hardware and excludes cosmetics for compatible PB identity. The saved ghost is a position trace, not a canonical input log or proof. Future fair challenges need persistent frozen snapshots/attempt nonces, canonical tick input capture, server resimulation/parity and atomic accepted records before any verified claim.

Recommended follow-up: import on a review branch or reviewable Vercel build; run the acceptance checklist on an actual phone; tune visuals/handling without reopening the locked narrative; then implement verified social competition as a separate milestone.
