# Bluebird Wellness

Homepage for Bluebird Wellness, an IV drip clinic at Bluebird Dentists near Westfield, London, offering treatments in clinic and as a mobile call-out service.

Plain HTML, CSS and JavaScript. No build step, so it can be hosted as-is on GitHub Pages.

- `index.html`: page structure
- `styles.css`: design tokens and styles (see `DESIGN.md`)
- `script.js`: treatment content (the `TREATMENTS` list at the top), rendering and scroll motion
- `images/`: transparent treatment cut-outs

GSAP, ScrollTrigger and Lenis load from jsDelivr. If they fail to load, or the visitor prefers reduced motion, the page shows in its finished, static state.

## Editing treatments

Open `script.js` and edit the `TREATMENTS` list. Each entry has a name, a one-line card summary, an image (or a placeholder shape), a booking link and, optionally, a `showcase` block for a full-screen scroll section. The comment above the list explains every field.

## Before going live

- Replace every `#` booking and contact link with real URLs.
- Have a clinician confirm the ingredients listed for each drip.
- Have the copy checked against ASA/CAP rules before publishing.
- Add images for the treatments that currently use placeholder shapes.
