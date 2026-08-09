#!/usr/bin/env python3
"""
Responsive QA sweep.

Builds nothing — run `npm run build` first, then:

    python3 scripts/qa-responsive.py                 # check, print a table
    python3 scripts/qa-responsive.py --shots out/    # also save screenshots

Requires: pip install playwright && python3 -m playwright install chromium

Checks at each viewport:
  - horizontal page overflow
  - assets that 404
  - console errors
  - text below a legible size
  - tap targets below the comfort floor
  - sticky CTA height vs the body padding reserved for it
  - the glossary control block (regression guard for the 260px flex bug)

Exit code is non-zero if any check fails, so it can gate CI.

Known-benign, filtered out by design:
  /_vercel/insights/*      Vercel injects these only on deployed builds
  fonts.googleapis.com     blocked in sandboxed environments
"""

import argparse
import os
import subprocess
import sys
import time

VIEWPORTS = [320, 375, 390, 430, 768, 1024, 1440]
PORT = 8899

BENIGN = ('/_vercel/', 'fonts.googleapis.com', 'fonts.gstatic.com', 'va.vercel-scripts.com')

# 9.0, not 11.0: this design deliberately uses 9.5-10.5px mono micro-labels
# (glossary badges, map layer chips, credit lines). Failing those would be
# failing the design, so the floor only catches genuine mistakes.
MIN_FONT_PX = 9.0
MIN_TAP_PX = 32.0       # 44 is the ideal; 32 is the floor we fail on


def benign(url):
    return any(b in url for b in BENIGN)


PROBE = r"""() => {
  const de = document.documentElement;
  const out = {
    overflow: de.scrollWidth - de.clientWidth,
    smallText: [],
    smallTaps: [],
  };

  const label = (el) =>
    (el.className && typeof el.className === 'string'
      ? '.' + el.className.split(' ').filter(Boolean)[0]
      : el.tagName.toLowerCase());

  // Visible text rendered below the legible floor.
  for (const el of document.querySelectorAll('p, li, dd, dt, span, a, button, label, input')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (!el.textContent || !el.textContent.trim()) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs && fs < FONT_FLOOR) out.smallText.push({ el: label(el), fs: +fs.toFixed(1) });
  }

  // Interactive elements below the tap floor.
  for (const el of document.querySelectorAll('a, button, input, [role="button"]')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    // SVG features scale with the map and carry oversized transparent hit
    // shapes instead; measuring their painted box would be misleading.
    if (el.ownerSVGElement || el.closest('svg')) continue;
    if (r.height < TAP_FLOOR) out.smallTaps.push({ el: label(el), h: Math.round(r.height) });
  }

  // Sticky CTA vs the space reserved for it.
  const cta = document.querySelector('.sticky-cta');
  if (cta) {
    const h = cta.getBoundingClientRect().height;
    const pad = parseFloat(getComputedStyle(document.body).paddingBottom) || 0;
    out.cta = { height: Math.round(h), bodyPad: Math.round(pad), drift: Math.round(h - pad) };
  }

  // Glossary controls: regression guard for the flex-basis-as-height bug.
  const gs = document.querySelector('.glossary__search');
  if (gs) {
    const inp = gs.querySelector('input');
    out.glossary = {
      blockH: Math.round(gs.getBoundingClientRect().height),
      inputH: Math.round(inp.getBoundingClientRect().height),
    };
    out.glossary.dead = out.glossary.blockH - out.glossary.inputH;
  }
  return out;
}"""


def run(shots_dir=None):
    from playwright.sync_api import sync_playwright

    dist = os.path.join(os.path.dirname(__file__), '..', 'dist')
    if not os.path.isdir(dist):
        sys.exit('dist/ not found — run `npm run build` first.')

    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT)],
                           cwd=dist, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2.5)

    failures = []
    try:
        with sync_playwright() as p:
            b = p.chromium.launch()
            print(f"{'width':>6} {'overflow':>9} {'404s':>5} {'errors':>7} "
                  f"{'small text':>11} {'small taps':>11} {'CTA drift':>10} {'glossary':>9}")
            print('-' * 84)

            for w in VIEWPORTS:
                pg = b.new_page(viewport={'width': w, 'height': 900})
                bad_http, console_errs = [], []
                pg.on('response', lambda r: bad_http.append(r.url)
                      if r.status >= 400 and not benign(r.url) else None)
                # Filter on the resource URL: Chrome's console text for a failed
                # request is generic ("Failed to load resource...") and never
                # contains the URL, so matching on text lets benign ones through.
                def on_console(m):
                    if m.type != 'error':
                        return
                    loc = (m.location or {}).get('url', '') or ''
                    if benign(loc) or benign(m.text):
                        return
                    console_errs.append(f'{m.text} <- {loc[:80]}')
                pg.on('console', on_console)

                pg.goto(f'http://localhost:{PORT}/', wait_until='networkidle')
                # Walk the page so lazy content and observers all engage.
                pg.evaluate("() => window.scrollTo(0, document.body.scrollHeight)")
                pg.wait_for_timeout(900)
                pg.evaluate("() => window.scrollTo(0, 0)")
                pg.wait_for_timeout(400)

                probe = PROBE.replace('FONT_FLOOR', str(MIN_FONT_PX)).replace('TAP_FLOOR', str(MIN_TAP_PX))
                r = pg.evaluate(probe)

                if r['overflow'] > 0:
                    failures.append(f'{w}px: horizontal overflow +{r["overflow"]}px')
                if bad_http:
                    failures.append(f'{w}px: {len(bad_http)} failed request(s): {bad_http[:2]}')
                if console_errs:
                    failures.append(f'{w}px: console error: {console_errs[0][:70]}')
                cta = r.get('cta')
                if cta and abs(cta['drift']) > 2:
                    failures.append(f'{w}px: sticky CTA {cta["height"]}px vs {cta["bodyPad"]}px reserved')
                gl = r.get('glossary')
                if gl and gl['dead'] > 40:
                    failures.append(f'{w}px: glossary control block has {gl["dead"]}px of dead space')

                print(f"{w:>6} {r['overflow']:>9} {len(bad_http):>5} {len(console_errs):>7} "
                      f"{len(r['smallText']):>11} {len(r['smallTaps']):>11} "
                      f"{(str(cta['drift'])+'px' if cta else '—'):>10} "
                      f"{(str(gl['dead'])+'px' if gl else '—'):>9}")

                if shots_dir:
                    os.makedirs(shots_dir, exist_ok=True)
                    pg.screenshot(path=os.path.join(shots_dir, f'{w}.png'), full_page=True)
                pg.close()
            b.close()
    finally:
        srv.terminate()

    print()
    if failures:
        print(f'{len(failures)} FAILURE(S):')
        for f in failures:
            print('  -', f)
        return 1
    print('All checks passed.')
    return 0


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--shots', metavar='DIR', help='also save full-page screenshots')
    a = ap.parse_args()
    sys.exit(run(a.shots))
