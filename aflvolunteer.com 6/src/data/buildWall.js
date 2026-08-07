// ─────────────────────────────────────────────────────────────────────────────
//  THE BUILD WALL
//
//  Homemade drone builds, featured with the builder's permission.
//
//  ⚠️  DO NOT ADD AN ENTRY WITHOUT `permission`.
//
//  Every entry carries its own permission record. Entries where
//  `permission.granted` is not exactly true are skipped at render — they will
//  not appear on the site no matter what else is filled in. This is deliberate:
//  it makes "I'll get permission later" impossible rather than merely
//  discouraged, and it means the wall can never accidentally publish something
//  you were still negotiating.
//
//  Workflow for each build:
//    1. Find a build you like. Note the specific detail you liked.
//    2. DM the builder BEFORE adding anything here. Offer credit + link back.
//    3. On a yes: screenshot the reply, save it in permissions/ (git-ignored),
//       and record the date and platform below.
//    4. Save their image to public/images/wall/<id>.jpg and add the entry.
//
//  Fields:
//    id          slug, also the image filename
//    builder     how they want to be credited (ask — some prefer real names,
//                most prefer the handle)
//    profileUrl  link back to them. This is what you're paying with. Required.
//    caption     your words on what's interesting about the build. One or two
//                sentences. Specific beats generic.
//    alt         image description for screen readers
//    permission  { granted, date, platform, note }
// ─────────────────────────────────────────────────────────────────────────────

export const BUILDS = [
  // ── Example entry. Delete this once you have a real one. ──
  // {
  //   id: 'kitchen-table-quad',
  //   builder: '@handle',
  //   profileUrl: 'https://instagram.com/handle',
  //   caption:
  //     'Resin-printed frame, hand-wound motors, and a battery pack rebuilt ' +
  //     'from salvaged cells. The regrind hopper on the desk is the detail.',
  //   alt: 'A small quadcopter with a translucent 3D-printed frame on a cluttered workbench.',
  //   permission: {
  //     granted: true,
  //     date: '2026-08-07',
  //     platform: 'Instagram DM',
  //     note: 'Asked for handle credit, no real name.',
  //   },
  // },
];

/**
 * Only builds with an explicit permission grant are ever rendered.
 * Anything missing or falsy is filtered out here rather than in the component,
 * so there is exactly one gate and no way around it.
 */
export const PUBLISHABLE_BUILDS = BUILDS.filter(
  (b) => b?.permission?.granted === true && b.profileUrl && b.builder
);
