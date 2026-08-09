# AFL Website Cumulative Batch — 2026-08-09

## 1. New landing / experience hub

The site now opens with **Enter the world before the book begins.** rather than asking the map to explain the whole product. Five compact paths summarize the value immediately:

- The Front
- Elena's Bench
- Read
- Fact + Future
- Contribute

A smaller Field Supply entry remains available without making commerce a sixth equal hero card.

## 2. The Front geography

Elena's map is presentation-cropped around the operating theater while retaining the existing geographic coordinate system and interactive data. The visible frame prioritizes eastern Poland, Ukraine, the Baltics, Moldova, and Romania. Andrew's wider contract-ledger perspective remains continental.

The contextual field-art eyebrow changes from **Article 5** to **The Front**; its body copy is unchanged.

## 3. Mobile / iPhone hardening

- Sample gate can shrink correctly at 320–430px.
- Email input cannot force the form wider than the viewport.
- Long sample CTA wraps instead of clipping.
- Targeted min-width guards reduce hidden horizontal overflow.
- Elena's Bench finish choices become 2×2 on phones.
- Result stats match the four rendered values.
- Extra 320px workshop/control hardening added.
- Map layer controls receive denser mobile spacing.

## 4. Journey fluidity

- Removed dynamic sticky-CTA body padding, eliminating one source of document-height shift.
- Sticky CTA now progresses: Read the opening -> Make your drone -> Explore the book.
- Sticky CTA hides when its destination is already visible and disappears in the lower site.
- Finishing the sample no longer jumps backward to the top of Read.
- Full-screen Bench and Field Supply preserve and restore the exact page scroll position.
- Internal destinations share one nav-aware scroll margin.
- Prelaunch Buy no longer sends a reader who already unlocked the sample back to the sample gate.

## 5. Contribute rewrite

New lead:

**This world is not invented.**

The section now offers two clear routes before the organization cards:

- **Curious how close that future is?** -> spoiler-free glossary / Fact + Future
- **The people doing this work are real, too.** -> real-world organizations / Ways to Help

Existing organization links and the non-affiliation disclaimer are preserved.

## 6. AFL Field Supply

A new realistic ecommerce-style experience opens directly from the **GEAR** nav tab and is also teased near the bottom of the site.

Current catalog:

1. Whisper Pin
2. Conversational Drone
3. Talon Field Shoes
4. Fiber Relay Spool
5. Fabrication Resin
6. Field Printer Kit
7. AFL Issue Tee

Store behavior:

- CURRENT INVENTORY: 0
- Every item: OUT OF STOCK
- Every item: CONCEPT / IN DEVELOPMENT
- Browse by category
- Search catalog
- Detailed product specifications
- Product-specific allocation waitlist
- No checkout or preorder
- Clear disclosure that “out of stock” is the Field Supply presentation, not a claim of prior production
- Future revenue-support language remains intentionally non-specific until a beneficiary and percentage are formally selected

The waitlists reuse the existing `/api/volunteer` funnel storage with product-specific list keys such as `field-supply:whisper-pin`.

## 7. QA harness update

`scripts/qa-responsive.py` now treats the sticky CTA as a non-layout-changing overlay and adds Field Supply checks at 320, 375, 390, 430, 768, 1024, and 1440px.
