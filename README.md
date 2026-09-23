# Bluebird Wellness

Homepage for Bluebird Wellness, an IV drip clinic at Bluebird Dentists near Westfield, London, offering treatments in clinic and as a mobile call-out service.

Plain HTML, CSS and JavaScript. No build step, so it can be hosted as-is on GitHub Pages.

- `index.html`: page structure
- `styles.css`: design tokens and styles (see `DESIGN.md`)
- `script.js`: treatment content and prices (the `TREATMENTS` list at the top), stage timing (`STAGE`), rendering, scenes and scroll motion
- `images/`: treatment images, the layer images for the orange and the plant (each on the same canvas as its original), the hair mask, and the deadlift frame sequence in `images/deadlift/`

GSAP, ScrollTrigger, Lenis and Three.js (for the hair sway) load from jsDelivr. If they fail to load, or the visitor prefers reduced motion, the featured treatments show as calm stacked blocks with the finished images.

## Editing treatments

Open `script.js` and edit the `TREATMENTS` list. Its order is the order of both the pinned stage and the "All treatments" grid. Each entry has a name, a one-line card summary, a provisional `priceFrom`, an image (or a placeholder shape), a booking link and a `showcase` block for the stage. The comment above the list explains every field.

When `images/hydration.webp` is ready, set Hydration's `image` and `imageSize`; the stage and card will use it in place of the placeholder shape.

To fine-tune the scroll film (pin length, how long each treatment takes, when text hands over), edit the `STAGE` object just below the list.

## Before going live

- Replace every `#` booking and contact link with real URLs.
- Have a clinician confirm the ingredients listed for each drip.
- Have the copy checked against ASA/CAP rules before publishing.
- Confirm the provisional prices.
- Add `images/hydration.webp` (Hydration still uses a placeholder shape).
