# Nation's Series v2.3 - Video handoff

Status: no final video is included. Posters are the functioning default. Use only original or properly licensed footage. Reference videos and third-party sports/anime assets are not licensed by this project.

## Integration point

Edit `src/media.config.js` only for file URLs. Place approved compressed files in `public/media/`. URLs omit `public`.

```js
export const MEDIA={
 hero:{desktop:'/media/nations-hero-desktop.mp4',mobile:'/media/nations-hero-mobile.mp4',poster:'/images/nations-hero.webp',mobilePoster:'/images/nations-hero-mobile.webp'},
 talon:{desktop:'/media/talon-profile-desktop.mp4',mobile:'/media/talon-profile-mobile.mp4',poster:'/images/talon-profile.svg'}
};
```

Empty desktop/mobile sources mean poster presentation. Replacing sources does not alter builder, race or narrative data. `ChampionshipMedia.jsx` is used in the opening hero and within `TalonProfile` in NationsSeries.jsx.

## Hero film

- Duration: 8-10 seconds, seamless first/last motion; start mid-flight.
- Desktop delivery: H.264 MP4, 1920x1080 or 1280x720, 16:9. Mobile: 720x1280, 9:16; separate directed crop, keep CTA-safe lower-left foreground.
- No audio dependency. Muted autoplay, playsInline and loop. Visible pause/play control. Reduced-motion users see the still instead of autoplay.
- Current lightweight WebP posters remain. Keep them until the final matching posters are approved. Intrinsic container fills a stable viewport; sources do not control layout height.
- Practical initial budget: desktop under 4MB, mobile under 2MB, 24/30 fps; test mobile network, decoding and motion legibility. These are delivery targets, not measured final file sizes.

## Talon documentary

- Duration: 8-10 seconds, nonlooping. Desktop 16:9; a mobile 4:5 crop may be supplied but current media container remains 16:9 with object-fit cover. If 4:5 framing is essential, adjust `.ns-profile-media` only after phone review; safe-center all critical action now.
- H.264 MP4, 1280x720 desktop; mobile 720x900 if composition survives cover crop, otherwise deliver 720x405. Keep titles readable and subtitle-safe.
- Manual play with native controls; audio is visitor-initiated. Silent comprehension is mandatory. Maintain the visible sporting introduction and transcript in TalonProfile.
- Native ended event completes the profile, then reducer enters BROADCAST ENDED and only afterward the eligible private offer. Never call offer directly from the film.
- Current authored SVG poster and four-beat 9-second fallback remain for no film. Production films should portray the black/silver aircraft and signature line, not deeper identity, war recruitment, sender identity, invented medals or unsupported career history.
- If file load fails, poster returns and manual Previous/Next/Continue/Skip controls remain available. No automatic offer is triggered by a media error. The profile's explicit Skip records a skipped exit.

## Installation QA

1. Keep empty sources until approved footage exists. Verify posters with no network video requests.
2. Install files and set URLs. Verify 200 responses, MIME types, byte-range support and no large image/video layout shifts.
3. Desktop/mobile: muted inline hero loops, first/last transition, pause control, blocked autoplay, slow loading, failed source, reduced motion and rotation.
4. Talon: play/pause/replay through native video controls, captions/transcript, no audio requirement, ended vs skip, refresh and hidden-tab behavior. Changing film must not move the private offer before profile exit.
5. For accessibility, bake readable dialogue captions into final film or add a tested WebVTT track if the production script exceeds the visible transcript. Update transcript to exactly match the approved sporting film; do not silently insert new canon.
6. Verify real phone performance and iOS autoplay behavior. Films remain unproduced/unvalidated in this delivery.
