# Bluebird Wellness

Website for Bluebird Wellness, an IV drip clinic at Bluebird Dentists near Westfield, London, offering treatments in clinic and as a mobile call-out service.

Plain HTML, CSS and JavaScript. Nothing needs building to serve it, so it can be hosted as-is on GitHub Pages (all links are relative, so it works from a subfolder such as `/bluebird-wellness/`).

- `index.html`: home page structure
- `styles.css`: design tokens and styles for every page (see `DESIGN.md`)
- `script.js`: the home page: the stage's visuals (the `TREATMENTS` list at the top), stage timing (`STAGE`), the phones' carousel (`CAROUSEL`), rendering, scenes and scroll motion
- `data/drips.json`: the clinic's menu, the single source of every treatment name, price, description, ingredient, table and disclaimer
- `scripts/build-menu.mjs`: the generator that turns the menu into `data/menu.js`, the treatment pages and the ingredient glossary, and holds `BOOK_URL` (and `MEDICINES`, the lines never shown as something a Pro version adds)
- `data/menu.js`, `treatments/<slug>/index.html`, `ingredients/index.html`, `data/menu-check.txt`: generated, don't edit by hand
- `treatment.js`: the small script the treatment pages and the glossary share (header border, scroll reveal, "Expand all", the glossary's search, opening an entry linked to by its #anchor)
- `images/`: treatment images, the layer images for the stage scenes, the hair mask, the deadlift frame sequence in `images/deadlift/` (each frame also as `-half.webp`, used on phones), the Myers Cocktail bottles and flask in `images/myers/`, the Skin & Beauty shell, pearl and glint in `images/skin/`, the Recovery mirror ball, sun and glints in `images/recovery/`, the Signature card, pen, pen path and ink frames in `images/signature/` (frames also as `-half.webp`), and finished pictures in `images/treatments/` (`<slug>.webp`, used for that drip's page and card whenever it exists)

GSAP, ScrollTrigger, Lenis and Three.js (for the hair sway and the NAD+ molecule) load from jsDelivr. If they fail to load, or the visitor prefers reduced motion, the featured treatments show as calm stacked blocks with the finished images.

## Updating the menu

1. Edit `data/drips.json`. Every string there is shown on the site exactly as written ("\n\n" starts a new paragraph).
2. Run `node scripts/build-menu.mjs`. It rewrites `data/menu.js`, every page in `treatments/` and `ingredients/index.html`, then checks each page word for word against the JSON and prints a pass/fail line per page (also saved to `data/menu-check.txt`). It stops with a message if anything fails or an image is missing. The report also lists how the ingredients matched up (see below) and what each "Upgrade to Pro" card lists.
3. Commit the JSON and everything the script wrote.

Run the script again after changing the booking link (`BOOK_URL` at the top of `scripts/build-menu.mjs`, used by every Book button on every page) or a treatment's `image`, `alt`, `tint` or `badge` in `TREATMENTS`: the treatment pages and the "All treatments" cards use them too. `node scripts/build-menu.mjs --check` checks the files as they are without writing anything.

Any drip's page and card use `images/treatments/<slug>.webp` whenever that file exists (otherwise its stage picture, or its standard version's). A new drip that isn't on the stage needs an entry in `NEW_PICTURES` in the generator: it shows a placeholder until `images/treatments/<slug>.webp` exists (with the menu's image brief in an HTML comment beside it).

## Ingredients and the glossary

On each drip's page, its `ingredients` are one list, in the menu's order. A line opens to its description from `ingredientDescriptions` when the two match: they are matched by the part of each name before the first "(" or ",", ignoring case and an "L-" prefix ("Vitamin B1 (25mg)" and "Vitamin B1 (Thiamine)"). The lines after "Electrolyte-Rich Solution" that have no description are indented beneath it; a line in brackets is shown as small print under the list; a description that matches no line is still shown, at the end of the list, and named in the report. The same matching links each description to its entry in the glossary (`glossary` in the JSON), and gives each glossary entry its "Used in" links.

A drip with a `proVariantSlug` shows an "Upgrade to Pro" card: its Pro version's name, price and the lines the Pro version has that it doesn't, leaving out any line that starts with one of `MEDICINES` in the generator.

## The stage

`TREATMENTS` in `script.js` sets the stage's order, scenes, images and tints; each entry's `menuSlug` links it to its drip, whose name and price it shows. The comment above the list explains every field. To fine-tune the scroll film (pin length, how long each treatment takes, when text hands over, how much the scrub smooths), edit the `STAGE` object just below it.

On phones (narrower than 820px, or a phone held sideways) the same treatments are a row of panels to swipe through instead, each playing its scene once it settles in view (`CAROUSEL` sets the default time, the breakpoint and when a panel counts as the current one; a treatment's `mobileSeconds` overrides the time). Only the current panel and its neighbours load their pictures and run.

## Before going live

- Remove the `noindex` robots meta tag from every page once the menu wording has had its compliance review (it's in `index.html` and in the generator's page template).
- Set `BOOK_URL` and replace the `#` contact links with real URLs.
