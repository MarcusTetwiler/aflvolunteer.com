#!/usr/bin/env python3
"""Responsive + journey QA for the cumulative AFL website batch.

Run after `npm run build`:
    python3 scripts/qa-responsive.py
    python3 scripts/qa-responsive.py --shots out/

The progressive sticky CTA intentionally reserves *no* body padding. It must
float without changing document height, so this version checks for unexpected
body padding rather than the retired CTA-height/body-padding parity rule.
"""
import argparse
import os
import subprocess
import sys
import time

VIEWPORTS = [320, 375, 390, 430, 768, 1024, 1440]
PORT = 8899
BENIGN = ('/_vercel/', 'fonts.googleapis.com', 'fonts.gstatic.com', 'va.vercel-scripts.com')
REQUIRED_ANCHORS = ['home', 'front', 'read', 'wall', 'buy', 'contribute', 'glossary', 'gear']


def benign(url):
    return any(part in url for part in BENIGN)


PROBE = r"""() => {
  const de = document.documentElement;
  const body = document.body;
  const cta = document.querySelector('.sticky-cta');
  return {
    overflow: Math.max(0, de.scrollWidth - de.clientWidth),
    bodyPad: parseFloat(getComputedStyle(body).paddingBottom) || 0,
    cta: cta ? {
      h: Math.round(cta.getBoundingClientRect().height),
      bottom: Math.round(innerHeight - cta.getBoundingClientRect().bottom),
    } : null,
    missingAnchors: ANCHORS.filter(id => !document.getElementById(id)),
  };
}"""

STORE_PROBE = r"""() => {
  const store = document.querySelector('.supply-store');
  const scroll = document.querySelector('.supply-store__scroll');
  if (!store || !scroll) return { missing: true };
  return {
    missing: false,
    overflow: Math.max(0, scroll.scrollWidth - scroll.clientWidth),
    cards: document.querySelectorAll('.supply-card').length,
    inventory: document.body.textContent.includes('CURRENT INVENTORY: 0'),
    outOfStock: document.body.textContent.includes('OUT OF STOCK'),
  };
}"""


def run(shots_dir=None):
    from playwright.sync_api import sync_playwright

    dist = os.path.join(os.path.dirname(__file__), '..', 'dist')
    if not os.path.isdir(dist):
        sys.exit('dist/ not found — run `npm run build` first.')

    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT)], cwd=dist,
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2.0)
    failures = []

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            print(f"{'width':>6} {'overflow':>9} {'404s':>5} {'errors':>7} {'body pad':>9} {'store':>9}")
            print('-' * 56)

            for width in VIEWPORTS:
                page = browser.new_page(viewport={'width': width, 'height': 900})
                bad_http, console_errs = [], []
                page.on('response', lambda r: bad_http.append(r.url) if r.status >= 400 and not benign(r.url) else None)

                def on_console(msg):
                    if msg.type != 'error':
                        return
                    loc = (msg.location or {}).get('url', '') or ''
                    if benign(loc) or benign(msg.text):
                        return
                    console_errs.append(f'{msg.text} <- {loc[:80]}')

                page.on('console', on_console)
                base = f'http://localhost:{PORT}/'
                page.goto(base, wait_until='networkidle')
                page.evaluate("() => window.scrollTo(0, document.body.scrollHeight)")
                page.wait_for_timeout(400)
                page.evaluate("() => window.scrollTo(0, 0)")
                page.wait_for_timeout(250)

                probe = PROBE.replace('ANCHORS', repr(REQUIRED_ANCHORS))
                result = page.evaluate(probe)
                if result['overflow'] > 0:
                    failures.append(f'{width}px: main page horizontal overflow +{result["overflow"]}px')
                if result['bodyPad'] > 2:
                    failures.append(f'{width}px: progressive CTA mutated body padding to {result["bodyPad"]}px')
                if result['missingAnchors']:
                    failures.append(f'{width}px: missing anchors {result["missingAnchors"]}')

                page.goto(base + '#gear-store', wait_until='networkidle')
                page.wait_for_selector('.supply-store', timeout=2500)
                page.wait_for_timeout(200)
                store = page.evaluate(STORE_PROBE)
                if store['missing']:
                    failures.append(f'{width}px: Field Supply did not open from #gear-store')
                else:
                    if store['overflow'] > 0:
                        failures.append(f'{width}px: Field Supply horizontal overflow +{store["overflow"]}px')
                    if store['cards'] < 7:
                        failures.append(f'{width}px: expected >=7 Field Supply products, found {store["cards"]}')
                    if not store['inventory'] or not store['outOfStock']:
                        failures.append(f'{width}px: Field Supply scarcity state missing')

                if bad_http:
                    failures.append(f'{width}px: {len(bad_http)} failed request(s): {bad_http[:2]}')
                if console_errs:
                    failures.append(f'{width}px: console error: {console_errs[0][:80]}')

                print(f"{width:>6} {result['overflow']:>9} {len(bad_http):>5} {len(console_errs):>7} "
                      f"{result['bodyPad']:>9.0f} {(str(store.get('overflow', '—'))+'px'):>9}")

                if shots_dir:
                    os.makedirs(shots_dir, exist_ok=True)
                    page.screenshot(path=os.path.join(shots_dir, f'field-supply-{width}.png'), full_page=True)
                page.close()

            browser.close()
    finally:
        srv.terminate()

    print()
    if failures:
        print(f'{len(failures)} FAILURE(S):')
        for failure in failures:
            print('  -', failure)
        return 1
    print('All checks passed.')
    return 0


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--shots', metavar='DIR')
    args = parser.parse_args()
    sys.exit(run(args.shots))
