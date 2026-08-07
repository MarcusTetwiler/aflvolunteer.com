# Build Wall outreach

The wall doubles as a lead engine: someone who builds drones in their garage is
the target reader for this book. A posted build photo is a qualified lead.

**The one rule: ask before you post.** Never publish first and ask after. The
message asking permission is itself written proof you knew whose image it was,
so publish-then-ask converts a friendly request into evidence of infringement.
It also flips the dynamic — asking first is an offer, asking after is a fait
accompli, and people can feel the difference.

---

## Workflow

1. **Find a build.** Note one specific detail you actually noticed. Generic
   praise reads as a mass DM and gets ignored.
2. **DM before touching the repo.** Templates below.
3. **On a yes:** screenshot the reply, save to `permissions/<id>.png`.
4. **Ask how they want to be credited.** Handle, real name, or studio name —
   don't assume. Some builders don't want their legal name attached.
5. **Add the entry** to `src/data/buildWall.js` with the permission record.
6. **Save the image** to `public/images/wall/<id>.jpg`.
7. **Tell them it's live.** Send the link. This is the moment they visit the
   site, and the moment they're most likely to share it themselves.

`PUBLISHABLE_BUILDS` refuses to render anything without
`permission.granted === true`, so a half-finished entry can't leak onto the
site. That flag is only honest if the screenshot exists.

---

## First contact

> Your [specific thing — the printed frame, the salvaged cell pack, the
> wiring run] caught my eye.
>
> I've written a novel that opens on a teenager building a drone at her kitchen
> table out of resin and regrind, and I'm putting together a wall of real
> homemade builds alongside it. Would you let me feature this one? Full credit
> however you want to be named, and a link back to you. You keep every right you
> have now — I'm not asking to own anything.
>
> The book's here if you want to see what you'd be next to: [link]
>
> Either way, good build.

Keep it that short. No pitch stacking, no follow-up ask in the same message.

## If they ask what's in it for them

> Honestly: a link and some traffic. The site's new, so I won't oversell it.
> Your name links back to your profile, and the wall sits next to the free
> sample chapters, so anyone reading the opening sees it. If that's not worth
> it, no hard feelings.

Undersell it. Overpromising traffic to someone who can check their own
analytics is a fast way to lose credibility.

## If they say no

> Totally fair — thanks for considering it. Good luck with the build.

Then don't ask again, and don't use the image. Note the decline so you don't
re-contact them in six months.

## If they ask about the book

That's the lead converting. Send the sample link, not the Amazon link — the
sample is free and the Amazon listing may not be live yet.

---

## What not to do

- **Don't scrape.** Manual, one at a time, with a real detail noticed. The
  moment this looks automated it stops working.
- **Don't repost combat footage.** The wall is builds and benches. The novel is
  about what happens when killing gets rendered as a scored game; a marketing
  channel that intercuts racing reels with kill footage performs that collapse
  instead of examining it.
- **Don't feature minors.** Plenty of teenagers build drones. Don't publish
  their photos, and don't DM them asking. If age is unclear, skip it.
- **Don't imply endorsement.** Featured builders like drones; they haven't
  vouched for your novel. Keep the credit line factual.
- **Don't let the ask be the first thing.** If you've never interacted with
  someone, a cold ask is fine, but lead with the observation, not the request.

---

## Taking things down

If a featured builder asks for removal, remove it the same day, no discussion.
Set `permission.granted` to `false` and delete the image file. The entry stays
in the data file as a record that they were asked and later withdrew, so nobody
re-adds it by accident.
