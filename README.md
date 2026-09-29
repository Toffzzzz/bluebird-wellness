# Bluebird Wellness

Website for Bluebird Wellness, an IV drip clinic at Bluebird Dentists near Westfield, London, offering treatments in clinic and as a mobile call-out service.

Plain HTML, CSS and JavaScript. Nothing needs building to serve it, so it can be hosted as-is on GitHub Pages (all links are relative, so it works from a subfolder such as `/bluebird-wellness/`).

- `index.html`: home page structure. Its header (with the phones' menu) and footer are copied onto every generated page by the generator
- `site-config.js`: the booking link and contact details (see "Booking and contact details" below)
- `site.js`: shared by every page: the phones' Menu button and full-screen menu, and the focus-trapping dialog the home page's treatment list uses too
- `styles.css`: design tokens and styles for every page (see `DESIGN.md`)
- `script.js`: the home page: the stage's visuals (the `TREATMENTS` list at the top), stage timing (`STAGE`), the phones' full-screen treatments (`REELS`), rendering, scenes and scroll motion
- `data/drips.json`: the clinic's menu, the single source of every treatment name, price, description, ingredient, table and disclaimer
- `scripts/render-assets.mjs`: renders pictures from the site's own 3D code (the NAD+ finished picture, the phones' NAD+ turn and hair sway) and the 800px copies (see "The stage" below)
- `scripts/build-menu.mjs`: the generator that turns the menu into `data/menu.js`, the treatment pages and the ingredient glossary, writes the Book and contact links and the logo into every page, and holds `MEDICINES` (the lines never shown as something a Pro version adds)
- `data/menu.js`, `treatments/<slug>/index.html`, `ingredients/index.html`, `data/menu-check.txt`: generated, don't edit by hand
- `treatment.js`: the small script the treatment pages and the glossary share (header border, scroll reveal, "Expand all", the glossary's search and "Back to top", opening an entry linked to by its #anchor, the phones' Book bar on a treatment page)
- `images/logo/`: the logo (`bluebird-mark.svg`, drawn in `currentColor`: the generator writes it inline into the header and footer, in Bluebird Blue) and the favicons
- `images/`: treatment images, the layer images for the stage scenes, the hair mask, the deadlift frame sequence in `images/deadlift/` (each frame also as `-half.webp`, used on phones), the Myers Cocktail bottles and flask in `images/myers/`, the Skin & Beauty shell, pearl and glint in `images/skin/`, the Recovery mirror ball, sun and glints in `images/recovery/`, the Signature card, pen, pen path and ink frames in `images/signature/` (frames also as `-half.webp`), the phones' pre-rendered NAD+ turn in `images/nad-spin/` and hair sway in `images/hair-sway/` (each frame also as `-half.webp`), 800px copies of the largest stage pictures (`<name>-sm.webp`, used on phones), and finished pictures in `images/treatments/` (`<slug>.webp`, used for that drip's page and card whenever it exists)

GSAP, ScrollTrigger, Lenis and Three.js (for the hair sway and the NAD+ molecule) load from jsDelivr. If they fail to load, or the visitor prefers reduced motion, the featured treatments show as calm stacked blocks with the finished images.

## Updating the menu

1. Edit `data/drips.json`. Every string there is shown on the site exactly as written ("\n\n" starts a new paragraph).
2. Run `node scripts/build-menu.mjs`. It rewrites `data/menu.js`, every page in `treatments/` and `ingredients/index.html`, then checks each page word for word against the JSON and prints a pass/fail line per page (also saved to `data/menu-check.txt`). It stops with a message if anything fails or an image is missing. The report also lists how the ingredients matched up (see below) and what each "Upgrade to Pro" card lists.
3. Commit the JSON and everything the script wrote.

Run the script again after changing `site-config.js`, the logo, the header, menu or footer in `index.html`, or a treatment's `image`, `alt`, `tint` or `badge` in `TREATMENTS`: the treatment pages and the "All treatments" cards use them too. `node scripts/build-menu.mjs --check` checks the files as they are without writing anything.

Any drip's page and card use `images/treatments/<slug>.webp` whenever that file exists (otherwise its stage picture, or its standard version's). A new drip that isn't on the stage needs an entry in `NEW_PICTURES` in the generator: it shows a placeholder until `images/treatments/<slug>.webp` exists (with the menu's image brief in an HTML comment beside it).

## Ingredients and the glossary

On each drip's page, its `ingredients` are one list, in the menu's order. A line opens to its description from `ingredientDescriptions` when the two match: they are matched by the part of each name before the first "(" or ",", ignoring case and an "L-" prefix ("Vitamin B1 (25mg)" and "Vitamin B1 (Thiamine)"). The lines after "Electrolyte-Rich Solution" that have no description are indented beneath it; a line in brackets is shown as small print under the list; a description that matches no line is still shown, at the end of the list, and named in the report. The same matching links each description to its entry in the glossary (`glossary` in the JSON), and gives each glossary entry its "Used in" links.

A drip with a `proVariantSlug` shows an "Upgrade to Pro" card: its Pro version's name, price and the lines the Pro version has that it doesn't, leaving out any line that starts with one of `MEDICINES` in the generator.

## The stage

`TREATMENTS` in `script.js` sets the stage's order, scenes, images and tints; each entry's `menuSlug` links it to its drip, whose name and price it shows. The comment above the list explains every field. To fine-tune the scroll film (pin length, how long each treatment takes, when text hands over, how much the scrub smooths), edit the `STAGE` object just below it.

On phones (narrower than 820px, or a phone held sideways) there is no pinned stage: each treatment is a full-screen section, one after another in the page, like reels. The page snaps so that one flick brings the next treatment to fill the screen; its scene (the same scene code) follows the scroll as it slides up, then plays on to its rest by itself (`REELS.seconds`, or the treatment's `mobileSeconds`). A pill at the bottom shows the current treatment and opens a list of all of them; "Skip to the full menu" above the first one goes to the treatments list. Above and below the treatments the page scrolls freely. Phones scroll natively (no Lenis). No WebGL runs on phones: NAD+ and Hair & Scalp play pre-rendered frames instead.

After changing the NAD+ molecule, the hair shader or mask, or one of the pictures in `PHONE_COPIES`, run `node scripts/render-assets.mjs` (it needs Playwright, see the top of the script) and commit what it writes. It also renders the NAD+ finished picture (`images/treatments/nad-plus-infusion.webp`) from the stage's own 3D scene.

## Booking and contact details

They live in one place, `site-config.js` (used by the generator, which writes them into every page, and by the home page's treatments):

| Field | What it is | Used by |
|---|---|---|
| `bookingUrl` | the online booking page (`https://…`) | every "Book" and "Book now" button |
| `phone` | the clinic's number as dialled, e.g. `+44 20 7946 0000` | "Call us" (`tel:`) |
| `email` | the clinic's email address | "Email us" and "Ask a question" (`mailto:`) |
| `whatsapp` | the WhatsApp number in international form, digits only, e.g. `447700900000` | "WhatsApp" (`https://wa.me/…`) |
| `mapsUrl` | a Google Maps link to the clinic | "Get directions" |

While a value is empty its links are hidden, so nothing ever links to nowhere. While `bookingUrl` is empty, every Book button goes to the booking and contact section at the bottom of the home page, and the ones inside that section are hidden. After filling them in, run `node scripts/build-menu.mjs` and commit what it writes.

## Before going live

- Remove the `noindex` robots meta tag from every page once the menu wording has had its compliance review (it's in `index.html` and in the generator's page template).
- Fill in `site-config.js` (booking link, phone, email, WhatsApp, maps link) and run the generator.
