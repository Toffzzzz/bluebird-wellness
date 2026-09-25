# Bluebird Wellness

Website for Bluebird Wellness, an IV drip clinic at Bluebird Dentists near Westfield, London, offering treatments in clinic and as a mobile call-out service.

Plain HTML, CSS and JavaScript. Nothing needs building to serve it, so it can be hosted as-is on GitHub Pages (all links are relative, so it works from a subfolder such as `/bluebird-wellness/`).

- `index.html`: home page structure
- `styles.css`: design tokens and styles for every page (see `DESIGN.md`)
- `script.js`: the home page: the stage's visuals (the `TREATMENTS` list at the top), stage timing (`STAGE`), rendering, scenes and scroll motion
- `data/drips.json`: the clinic's menu, the single source of every treatment name, price, description, ingredient, table and disclaimer
- `scripts/build-menu.mjs`: the generator that turns the menu into `data/menu.js` and the treatment pages, and holds `BOOK_URL`
- `data/menu.js`, `treatments/<slug>/index.html`, `data/menu-check.txt`: generated, don't edit by hand
- `treatment.js`: the small script the treatment pages share (header border, scroll reveal, "Expand all")
- `images/`: treatment images, the layer images for the stage scenes, the hair mask, the deadlift frame sequence in `images/deadlift/`, the Myers Cocktail bottles and flask in `images/myers/`, the Skin & Beauty shell, pearl and glint in `images/skin/`, the Recovery mirror ball, sun and glints in `images/recovery/`, the Signature card, pen, pen path and ink frames in `images/signature/`, and finished pictures in `images/treatments/` (`<slug>.webp`, used for that drip's page and card whenever it exists)

GSAP, ScrollTrigger, Lenis and Three.js (for the hair sway and the NAD+ molecule) load from jsDelivr. If they fail to load, or the visitor prefers reduced motion, the featured treatments show as calm stacked blocks with the finished images.

## Updating the menu

1. Edit `data/drips.json`. Every string there is shown on the site exactly as written ("\n\n" starts a new paragraph).
2. Run `node scripts/build-menu.mjs`. It rewrites `data/menu.js` and every page in `treatments/`, then checks each page word for word against the JSON and prints a pass/fail line per page (also saved to `data/menu-check.txt`). It stops with a message if anything fails or an image is missing.
3. Commit the JSON and everything the script wrote.

Run the script again after changing the booking link (`BOOK_URL` at the top of `scripts/build-menu.mjs`, used by every Book button on every page) or a treatment's `image`, `alt`, `tint` or `badge` in `TREATMENTS`: the treatment pages and the "All treatments" cards use them too. `node scripts/build-menu.mjs --check` checks the files as they are without writing anything.

Any drip's page and card use `images/treatments/<slug>.webp` whenever that file exists (otherwise its stage picture, or its standard version's). A new drip that isn't on the stage needs an entry in `NEW_PICTURES` in the generator: it shows a placeholder until `images/treatments/<slug>.webp` exists (with the menu's image brief in an HTML comment beside it).

## The stage

`TREATMENTS` in `script.js` sets the stage's order, scenes, images and tints; each entry's `menuSlug` links it to its drip, whose name and price it shows. The comment above the list explains every field. To fine-tune the scroll film (pin length, how long each treatment takes, when text hands over), edit the `STAGE` object just below it.

## Before going live

- Remove the `noindex` robots meta tag from every page once the menu wording has had its compliance review (it's in `index.html` and in the generator's page template).
- Set `BOOK_URL` and replace the `#` contact links with real URLs.
