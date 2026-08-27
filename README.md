# Landing background photos

Drop your 3 photos here, named exactly:
- `landing-1.jpg` — shown under TIRU
- `landing-2.jpg` — shown under AI ENGINEER
- `landing-3.jpg` — shown under BUILDING AI. SHIPPING PRODUCTS.

## Shooting tips (so the CSS grade does its job)

The overlay in `style.css` (`.bg-grade`) crushes shadows to near-black and
multiplies in a crimson tint — it's doing a lot of the "cinematic" work, so
the source photo doesn't need to be perfect. It works best with:

- **Dark or plain background** — a shadowed wall, night exterior, or
  underlit room. Busy/bright backgrounds fight the vignette.
- **Side or back lighting** — light from one side or slightly behind you
  (window light, a lamp out of frame) reads as "moody" once graded. Flat
  front-on phone-flash lighting reads flat even after grading.
- **Vertical-ish framing with headroom** — the frame is full-bleed behind
  centered text, so keep the interesting part (you) roughly centered,
  upper-to-mid frame. Extreme close-ups get cropped oddly on ultra-wide
  desktop viewports.
- **Consistent tone across all 3** — same rough lighting setup/location
  for all three shots so the crossfade doesn't jump in brightness.

## Technical

- Minimum ~1600px on the long edge (crisper on large desktop screens)
- `.jpg` or `.png`, reasonably compressed — these are full-bleed hero
  backgrounds, so file size affects load time
- If you'd rather use different filenames/extensions, update the
  `background-image: url(...)` paths in `index.html` (search for
  `bg-layer bg-1/2/3`)
