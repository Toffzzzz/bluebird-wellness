# Bluebird Wellness

Homepage for Bluebird Wellness, an IV drip clinic at Bluebird Dentists near Westfield, London, offering treatments in clinic and as a mobile call-out service.

Plain HTML, CSS and JavaScript. No build step, so it can be hosted as-is on GitHub Pages.

- `index.html`: page structure
- `styles.css`: design tokens and styles (see `DESIGN.md`)
- `script.js`: treatment content (the `TREATMENTS` list at the top), stage timing (`STAGE`), rendering and scroll motion
- `images/`: transparent treatment cut-outs, plus the layer images for the orange and the plant (each on the same canvas as its original)

GSAP, ScrollTrigger, Lenis and Three.js (for the 3D red blood cell) load from jsDelivr. If they fail to load, or the visitor prefers reduced motion, the featured treatments show as calm stacked blocks with the finished images.

## Editing treatments

Open `script.js` and edit the `TREATMENTS` list. Each entry has a name, a one-line card summary, an image (or a placeholder shape), a booking link and, optionally, a `showcase` block that adds it to the pinned scroll stage. The comment above the list explains every field.

To fine-tune the scroll film (pin length, how long each treatment takes, when text hands over), edit the `STAGE` object just below the list.

## Before going live

- Replace every `#` booking and contact link with real URLs.
- Have a clinician confirm the ingredients listed for each drip.
- Have the copy checked against ASA/CAP rules before publishing.
- Add images for the treatments that currently use placeholder shapes.
