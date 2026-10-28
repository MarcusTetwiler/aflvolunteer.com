# Nation's Series v2.3 - QA report

Date: October 27, 2026 (author timezone). Source baseline: `7ebad2bad62e2de1175a1bd0ead63a838aec41f7` (GitHub main fetched read-only). The local v2.2 reconstruction is available; main now includes its uploaded files. No GitHub write or deployment was performed.

## Overall verdict

Source-complete, cumulative review import. Automated and source-render checks pass. NOT a public-launch sign-off. The requested browser screenshot / responsive gameplay verification is incomplete because the available browser tool could not start. Test real devices and humans before release.

## Executed

- 38 Node automated tests, all passing. Original catalog IDs and stats preserved; 32,768 engineering combinations checked for valid bounded output or explicit rejection.
- New tests cover country flags and national identities, three sponsor categories and legacy profile migration, 16 valid distinct fictional showcase configurations, unchanged cosmetic physics, 24 ordered sprint gates, separated personal-best course identity, modeled durations, consistent roster/ranking, meaningful missed-gate outcomes, media defaults, CTA changes and residual map identity protection.
- ESLint: pass. Production Vite build plus existing schema injection: pass.
- Clean cumulative ZIP extraction and fresh dependency installation followed by tests, lint and production build: pass. See archive verification report and retained checksums. This confirms no earlier patch archive is required.
- React server rendering (SSR): 13 journey scene structures, six builder stages, eight aircraft components, hero/footer and four existing map reveal steps. The scene harness changes initial state in a disposable QA copy only. No production scene bypass is shipped.
- Source asset audit: all 35 active literal image/font references exist. A 36th reference, `/images/author.jpg`, is only a commented setup example; AUTHOR.photo is null and no image is requested. Footer artwork exists at 1170 x 624.
- SVG aircraft/map exports and source-derived PDF compositions rendered and visually inspected. These are NOT browser screenshots or evidence of live CSS, device interactions or frame rate.

## Flight-model evidence

The course is now 820 metres with 24 gates and three sections. Shared aircraft physics is unchanged; course version is `world-final-v23-sprint-1`. Course spacing, radius, curvature and wind zone are changed together, not the clock.

Eight deterministic gate-following clean runs finish in 17.267-24.733 seconds. The mean is approximately 22.38 seconds. These are scripted successful runs, NOT observed first-time visitors. Heavy/endurance builds can place third; cleaner speed/agility builds can place second. Idle steering incurs misses and cannot automatically qualify. Late steering is tested to cause penalties, damage and longer adjusted time. All model comparisons are in docs/FLIGHT_MODEL_COMPARISONS.csv.

Talon's 12.00-second and other roster times are explicit fictional gameplay benchmarks, not manuscript records, live players, or server-verified scores. Talon is faster than even the course's theoretical maximum player speed. Changing calibration after human testing should increment the competition/course version. Do not compare old v2.2 PBs with the new sprint; trace keys are isolated and new hangar results include courseVersion.

## Browser limitation / not executed

The browser tool failed before opening the page: kernel exited with `bwrap: Can't create file at /home/agent/.codex/sessions: Read-only file system`. The supported preview server started, but this does not establish that a browser loaded the application. No alternate browser-control method was substituted.

- Browser viewport coverage this revision: NONE. Desktop/mobile/landscape screenshots: NONE.
- Actual physical iPhone, two-thumb controls, safe areas, resizing, real FPS and end-to-end human qualification: NOT TESTED.
- Keyboard, mouse and touch event handlers exist and compile; real interactions have not been validated this revision.
- Runtime console/network/visual overflow, font loading, focus traversal and real reduced-motion behavior remain pending. SSR does not substitute for these checks.
- Live email/signup deliverability, server environment variables and deployment: NOT TESTED. Guest play and separate consent are preserved in source.

## Observed defects and fixes

1. An obsolete unused identity-linked contract module remained in GitHub despite the previous manual deletion instruction. Removed from this full package; explicitly delete it in an existing repository.
2. Existing map header/footer still named Talon as the contract performance interface. Removed all residual champion branding and identity-linked CSS selectors; existing geometry and interactions reused. Added case-insensitive regression test.
3. Help summary covered the race field. Replaced with an optional help button that pauses flight; guidance/settings live in the paused panel.
4. Footer image was present, not missing. Replaced CSS-background-only presentation with an explicit retained image, intrinsic dimensions, responsive crop and gradient text backing.
5. The first race calibration initially tripped the old 27.8-second and image-only-source assertions. Updated those checks for the approved shorter course and future configurable media, while retaining image defaults and honest classification.
6. An unused import introduced during refactoring was caught by lint and removed.

## Implemented vs incomplete

Implemented: hero copy/poster, configurable media slots, more detailed reusable SVG aircraft, named cosmetic controls, dossier/flags/sponsors/local persistence, shorter playable canvas course, honest national leaderboard, concise Talon fallback/transcript, protected contract order and map branches, unchanged book/sample, 16 showcase builds and retained workshop, footer changes.

Incomplete: photorealistic garage/aircraft production art. Current renderer is a more detailed modular 2.5D SVG system, not photorealism or full 3D. Human-validated first-run timing and difficulty. Final hero and Talon films. Physical phone/browser QA. Cloud hangar, verified Race-a-Friend backend, real multiplayer and verified live results remain unimplemented. No extra dependency was added.

## Narrative / canon boundaries

Talon is US per the author's feedback. Sponsors and community pilots are newly authored fiction, not manuscript facts or real endorsements. No career medals, history or deeper identity is invented. The private sender is not Talon. $25,000 remains provisional prototype fiction. Map overlays are fictional narrative geography, not current conflict reporting. Manuscript, Live Doc and author-approved sample bytes are unchanged in this revision. The sample remains the author's explicit spoiler exception.

## Required import acceptance

Read docs/IMPORT_ACCEPTANCE.md and the v2.3 checklist in README.md. Minimum next step: real phone journey, both explicit narrative choices, refresh/storage denial, reduced motion, successful and failed races, retry/tune, showcase inspection, footer and first-chapter access. Then five moderated first-time visitors. Record completion, uncoached controls, race duration, retries and sample interest.

## Retained evidence

See docs/qa-evidence for clean-extraction dependency-install, test, lint and build logs. An initial offline npm install failed because one tarball was not cached; ordinary npm ci then installed 139 packages successfully. No dependency or lockfile edits were needed.
