# Bluebird Wellness

Website for Bluebird Wellness, an IV drip clinic at Bluebird Dentists near Westfield, London, offering treatments in clinic and as a mobile call-out service.

Plain HTML, CSS and JavaScript. Nothing needs building to serve it, so it can be hosted as-is on GitHub Pages (all links are relative, so it works from a subfolder such as `/bluebird-wellness/`).

- `index.html`: home page structure. Its header (with the phones' menu) and footer are copied onto every generated page by the generator
- `site-config.js`: the booking link and contact details (see "Booking and contact details" below)
- `booking.js`: on every page: the booking preview, a mock booking calendar that Book opens until there's a real booking page (see "The booking preview, the chat assistant and WhatsApp" below)
- `chat.js`: on every page: the chat assistant ("Speak to a doctor") and the WhatsApp button, together in the bottom right corner (same section below)
- `site.js`: shared by every page: the header's drop-down menus (Treatments, Studies), the phones' Menu button and full-screen menu, and the focus-trapping dialog the home page's treatment list uses too
- `styles.css`: design tokens and styles for every page (see `DESIGN.md`)
- `script.js`: the home page: the featured treatments (the `TREATMENTS` list at the top), rendering, the treatments' line drawings (or videos) and the side list of their names, in-page links and the gentle reveals
- `data/line-art.js`: the treatments' line drawings, made by `scripts/line-art/make-line-art.py`
- `data/drips.json`: the clinic's menu, the single source of every treatment name, price, description, ingredient, table and disclaimer
- `scripts/render-videos/`: re-renders the featured treatments' videos from the scroll animations (see "The featured treatments" below)
- `scripts/render-assets.mjs`: renders pictures from the old stage's 3D code (the NAD+ finished picture); it runs on the `stage-animations` commit (see below)
- `scripts/build-menu.mjs`: the generator that turns the menu into `data/menu.js`, the treatment pages and the ingredient glossary, writes the Book and contact links and the logo into every page, and holds `MEDICINES` (the lines never shown as something a Pro version adds)
- `content/legal/`: the text of the policy pages (privacy, terms, cancellations and refunds, cookies, accessibility, complaints) and of the questions page; the generator turns them into `privacy/`, `terms/`, `cancellations/`, `cookies/`, `accessibility/`, `complaints/` and `faq/`, filling in the business's details from `site-config.js`
- `content/studies/`: the studies, one file each (see "Studies" below); the generator turns them into `studies/` and `studies/<name>/`, and writes the first few onto the home page
- `fonts/`: the Inter font, served from the site itself, with its licence (`LICENSE.txt`)
- `COMPLIANCE.md`: the legal and compliance checklist (what's done, what the clinic must provide, and the review of treatment claims); `CREDITS.md`: where the font, pictures and icons come from
- `data/menu.js`, `data/book-list.js`, `treatments/<slug>/index.html`, `ingredients/index.html`, the policy pages, `faq/`, `studies/`, `404.html`, `robots.txt` (and `sitemap.xml` once launched), `images/icons/treatments.svg` (the menu's mini drawings), `data/menu-check.txt`: generated, don't edit by hand. The generator also writes the menus, the studies cards, the doctors' GMC numbers, the CQC line and the link-preview tags into `index.html`, between its marked comments
- `images/share.png`: the picture shown when the site is shared (WhatsApp, iMessage, social media)
- `treatment.js`: the small script the treatment pages and the glossary share (header border, scroll reveal, "Expand all", the glossary's search and "Back to top", opening an entry linked to by its #anchor, the phones' Book bar on a treatment page)
- `images/logo/`: the logo (`bluebird-mark.svg`, drawn in `currentColor`: the generator writes it inline into the header and footer, in Bluebird Blue) and the favicons
- `images/treatment-videos/`: each featured treatment's videos (`<id>-scrub.mp4` for laptops, where the scroll drives it; `<id>-1080.mp4` and `<id>-720.mp4` for phones, where it plays by itself) and its first and last frames (`<id>-start.webp`, `<id>-end.webp`)
- `images/`: treatment images, the layer images the old stage's scenes used (the videos were rendered from them), the hair mask, the deadlift frame sequence in `images/deadlift/` (each frame also as `-half.webp`, used on phones), the Myers Cocktail bottles and flask in `images/myers/`, the Skin & Beauty shell, pearl and glint in `images/skin/`, the Recovery mirror ball, sun and glints in `images/recovery/`, the Signature card, pen, pen path and ink frames in `images/signature/` (frames also as `-half.webp`), the phones' pre-rendered NAD+ turn in `images/nad-spin/` and hair sway in `images/hair-sway/` (each frame also as `-half.webp`), 800px copies of the largest stage pictures (`<name>-sm.webp`, used on phones), and finished pictures in `images/treatments/` (`<slug>.webp`, used for that drip's page and card whenever it exists)

The home page loads no libraries: scrolling is always the browser's own, the treatments' animations are videos (moved by the scroll on laptops, playing by themselves on phones), and the reveals are CSS transitions. With reduced motion, the featured treatments show their finished pictures (each one's button plays its video on request).

## Updating the menu

1. Edit `data/drips.json`. Every string there is shown on the site exactly as written ("\n\n" starts a new paragraph).
2. Run `node scripts/build-menu.mjs`. It rewrites `data/menu.js`, every page in `treatments/` and `ingredients/index.html`, then checks each page word for word against the JSON and prints a pass/fail line per page (also saved to `data/menu-check.txt`). It stops with a message if anything fails or an image is missing. The report also lists how the ingredients matched up (see below) and what each "Upgrade to Pro" card lists.
3. Commit the JSON and everything the script wrote.

Run the script again after changing `site-config.js`, the logo, the header, menu or footer in `index.html`, or a treatment's `image`, `alt`, `tint` or `badge` in `TREATMENTS`: the treatment pages and the "All treatments" cards use them too. `node scripts/build-menu.mjs --check` checks the files as they are without writing anything.

Any drip's page and card use `images/treatments/<slug>.webp` whenever that file exists (otherwise its stage picture, or its standard version's). A new drip that isn't on the stage needs an entry in `NEW_PICTURES` in the generator: it shows a placeholder until `images/treatments/<slug>.webp` exists (with the menu's image brief in an HTML comment beside it).

## Ingredients and the glossary

On each drip's page, its `ingredients` are one list, in the menu's order. A line opens to its description from `ingredientDescriptions` when the two match: they are matched by the part of each name before the first "(" or ",", ignoring case and an "L-" prefix ("Vitamin B1 (25mg)" and "Vitamin B1 (Thiamine)"). The lines after "Electrolyte-Rich Solution" that have no description are indented beneath it; a line in brackets is shown as small print under the list; a description that matches no line is still shown, at the end of the list, and named in the report. The same matching links each description to its entry in the glossary (`glossary` in the JSON), and gives each glossary entry its "Used in" links.

A drip with a `proVariantSlug` shows an "Upgrade to Pro" card: its Pro version's name, price and the lines the Pro version has that it doesn't, leaving out any line that starts with one of `MEDICINES` in the generator.

## The featured treatments

`featured` in `site-config.js` chooses which treatments the home page features, and in what order: now Iron, Beauty & Glow, Hydration, Muscle & Fitness and Signature (`['iron', 'skin', 'hydration', 'muscle-recovery', 'signature']`). Every drip still has its card under "All treatments" and its own page. An empty list (`[]`) features all of them; the generator stops with a message if an id isn't in `TREATMENTS`.

`TREATMENTS` in `script.js` holds every treatment's pictures and tints; each entry's `menuSlug` links it to its drip, whose name and price it shows. The comment above the list explains every field.

They can be shown two ways, chosen by `pictures` in `site-config.js` (run the generator after changing it):

- `'lines'` (the live version): the line drawings, below. The cards under "All treatments" and each treatment's page (Learn more) show the same drawings, each drawing itself in from the top down as it comes into view (`SiteDraw` in `site.js`); a Pro drip shows its standard version's drawing;
- `'photos'`: each treatment's pre-rendered animation, described after them, and the photographic pictures on the cards and treatment pages.

A side list of the treatments' names shows down the right side while they're on screen either way (as dots below 1360px wide, so it never crowds the text): it shows where you are and jumps to any treatment. A link to somewhere far down the page jumps straight there rather than scrolling past everything.

### The line drawings

One line in Bluebird Blue runs down the middle of the page, starting from the hero's "Scroll to explore" line, and draws as you scroll, on laptops and phones alike. The "pen" is a little below the middle of the screen (two thirds of the way down, `LINE.pen`), so each drawing is finished while it's still low on the screen and stays in view for longer: everything above it is drawn. The line comes down to the top of each treatment's drawing, stops while the drawing is drawn from the top down, then carries on from the bottom of the drawing to the next one. It only ever draws forwards: once drawn, a drawing stays drawn when you scroll back up. Arriving by a jump (the side list, a link), the drawing draws itself. With reduced motion everything is shown already drawn.

- On laptops each treatment's name, price and buttons sit beside its drawing, left and right in turn; on phones they're a card under the drawing, with the line running into the card and out of the bottom.
- The drawings are in `data/line-art.js`, made by `scripts/line-art/make-line-art.py` (run `python3 scripts/line-art/make-line-art.py` after changing it, and commit both). The Signature drawing uses a version of the logo with thinner strokes, `images/logo/bluebird-mark-thin.svg`, made by `scripts/line-art/thin-logo.py` (its `THICKNESS` sets how thin; it needs scikit-image). The site's own logo in the header and footer is unchanged. Each is clean, even line art in a 400 x 400 box; the Signature drawing reveals the logo itself. The comments at the top of both files explain the format.
- Four drawings (Energy, Muscle & Fitness, Beauty & Glow and Hair & Scalp) are traced from line art drawn in ChatGPT, kept as small black-and-white PNGs in `scripts/line-art/sources/`. `scripts/line-art/trace-drawings.py` traces them into `scripts/line-art/traced.json`, leaving out the small details listed in its `DROP` lists (creases, muscle lines, laces, eyelashes), and `make-line-art.py` reads that file. To change one, replace its picture (black lines on white, square), run `python3 scripts/line-art/trace-drawings.py --preview` (it needs scikit-image), check the numbered strokes in `sources/<name>-strokes.png`, adjust its `DROP` list, then run `make-line-art.py` and the generator. Don't commit the `-strokes.png` previews.
- Laptops also show a short summary on the other side of each drawing from its name and buttons: the opening sentences of the drip's description, word for word (`summaryHTML` in `script.js`; `SUMMARY_LENGTH` sets roughly how long). Phones keep the card under the drawing, without the summary.
- How closely the drawing follows the scroll, the line's thickness and how long a drawing takes to draw itself after a jump are `LINE` in `script.js`.

### The videos

One section per treatment, scrolled natively (no snapping: the page never moves by itself), each with a short video of its animation.

- Laptops and desktops (a mouse or trackpad, 820px and wider): scrolling drives the animation while the page keeps moving (nothing is pinned): it starts once most of the treatment's section is on screen, and the scroll sets how far it has got. The video plays towards that point rather than jumping frame to frame (smoother), faster the further behind it is and gliding to a stop when it arrives, up to twice its natural speed: scroll quickly and it catches up quickly but smoothly; stop and it settles within a moment. It only ever moves forwards: scrolling back up leaves it where it got to, and once finished (or once it has left the screen after starting) it stays finished. Arriving by a jump (the side list, a link), it plays on by itself instead. Where it starts and ends, the top speed and how closely it follows are `SCRUB` in `script.js`. These use `<id>-scrub.mp4`.
- Phones and tablets: a video plays by itself once half of it is in view, then stays on its finished picture for good (coming back to it shows the finished picture). The round button in its corner pauses, plays or replays it. These use `<id>-1080.mp4` / `<id>-720.mp4`.

The videos are recordings of the scroll animations the site used to run (the pinned stage). That code lives on in the commit tagged `stage-animations`. If a treatment's animation needs to change, change it there (in a branch made from that tag), move the tag to your new commit, and re-render that treatment's video:

    node scripts/render-videos/render-videos.mjs myers

(it needs Playwright, ffmpeg and Python with numpy and Pillow; see the top of the script). Without a video, a treatment shows its picture instead, so a new treatment works straight away. `scripts/render-assets.mjs` also uses the old stage code: to re-render the NAD+ finished picture, run it in a checkout of the `stage-animations` commit (`git worktree add ../bluebird-stage stage-animations`) and copy `images/treatments/nad-plus-infusion.webp` back.

## Where the home page starts

Opening the site (from a link, a bookmark or by typing it) or reloading it always starts at the top of the home page, on laptops and phones: never where the browser last was, and never at a #section left in the address. In-page links (All treatments, the side list of names…) move the page without adding #sections to the address. Two exceptions: a link from one of the site's own pages to a section (e.g. a treatment page's "Back to all treatments") goes to that section, and going Back to the home page returns to where you were on it. This is `initStart` in `script.js`.

## Booking and contact details

They live in one place, `site-config.js` (used by the generator, which writes them into every page, and by the home page's treatments):

| Field | What it is | Used by |
|---|---|---|
| `bookingUrl` | the online booking page (`https://…`) | every "Book" and "Book now" button |
| `phone` | the clinic's number as dialled, e.g. `+44 20 7946 0000` | "Call us" (`tel:`) |
| `email` | the clinic's email address | "Email us" and "Ask a question" (`mailto:`) |
| `whatsapp` | the WhatsApp number in international form, digits only, e.g. `447700900000` | "WhatsApp" (`https://wa.me/…`) and the WhatsApp button on every page |
| `whatsappIcon` | optional: an icon for the WhatsApp button, e.g. `images/whatsapp-icon.svg` (the official one from WhatsApp's brand resources) | the WhatsApp button (empty: a chat bubble) |
| `pictures` | `'lines'` or `'photos'` | the treatments' pictures everywhere: the line drawings, or the videos and photos (see "The featured treatments") |
| `featured` | a list of treatment ids, e.g. `['iron', 'skin', 'hydration', 'muscle-recovery', 'signature']` | which treatments the home page's line draws, in that order (`[]`: all of them) |
| `chatAssistant` | `true` or `false` | the chat assistant, "Speak to a doctor" (`false` hides it everywhere) |
| `legalName`, `companyNumber`, `registeredIn`, `registeredOffice`, `clinicAddress`, `vatNumber`, `icoNumber`, `cqcNumber` | the business's details | every page's footer, and the policy pages |
| `bookingProvider`, `callOutFee`, `cancellationNotice`, `cancellationFee`, `minimumAge`, `policiesUpdated`, `legalDraft` | the policies' details | the policy pages; `callOutFee` also shows in the booking calendar and the booking section; `minimumAge` in booking and the chat; `legalDraft: false` removes the "Draft" note |
| `mapsUrl` | a Google Maps link to the clinic | "Get directions" |
| `siteUrl` | the site's address, ending in `/` | link previews, `404.html`, and the sitemap once launched |
| `launched` | `false` until launch, then `true` | `false`: every page asks search engines not to list it; `true`: lifted, with `robots.txt` and `sitemap.xml` |
| `gmcDrNema`, `gmcDrMahdi` | each doctor's GMC number | About us (linked to the medical register) |
| `cqcRating`, `cqcRatingDate`, `cqcReportUrl` | the CQC rating, the report's date and its link, once rated | About us (the law requires the rating on the website) |
| `studiesReviewed` | `true` once the doctors have reviewed the studies | removes the "Draft" note from each study |

While a value is empty its links are hidden, so nothing ever links to nowhere. While `bookingUrl` is empty, every Book button opens the booking preview (below). After filling them in, run `node scripts/build-menu.mjs` and commit what it writes.

## The booking preview, the chat assistant and WhatsApp

**Doctor-led, up front.** The service being doctor-led is the main selling point, so it's the home page's headline ("Doctor-led IV drips."), with "Every drip starts with a consultation with one of our doctors" under it, a "Speak to a doctor" button beside Book now, and three ticks: led by our doctors (Dr Nema and Dr Mahdi), calm, clinical care, and in clinic or a call-out day or night.

**The booking preview** (`booking.js`). Until `bookingUrl` is set, every Book and Book now button opens a mock booking calendar, to show how online booking will work:
1. the treatment, already chosen when Book is on a treatment (its section on the home page, or its own page), with every drip and booster on the menu to choose from (`data/book-list.js`, written by the generator from `data/drips.json`);
2. in clinic (9am to 5pm) or a mobile call-out (any time, day or night);
3. the doctor: Dr Nema or Dr Mahdi;
4. a day (up to 90 days ahead) and a time. Appointments are on the hour: in clinic 09:00 to 16:00, call-outs 00:00 to 23:00. About a third of the times show as taken, made up but the same each time;
5. name, phone, email (and the address, for a call-out), then "Appointment requested".

It is marked "Preview" and says that no appointment has been made and nothing has been sent; it sends and stores nothing. The doctors, hours and how far ahead it goes are `BOOKING` at the top of `booking.js`. "Book a call-out" opens it with a call-out already chosen. Once `bookingUrl` is set (and the generator re-run), every Book button goes to the real booking page and the preview switches itself off.

**The chat assistant** (`chat.js`), "Speak to a doctor": a short scripted chat (no AI, nothing leaves the page). It says the service is doctor-led and that the chat isn't for emergencies (999, or 111 for urgent advice), then asks, one at a time: what they're looking for (with suggestions to tap), a little about what's been going on and for how long, any medical conditions, allergies or medicines, then their name, phone (checked), email (checked) and a good time to call. It sums up their answers, asks "Shall one of our doctors call you on …?", and ends: "One of our doctors will call you on … for a telephone consultation within the next 24 hours." Like the booking preview it's marked "Preview" and says nothing has been sent. The questions are `STEPS` at the top of `chat.js`. Making it live needs a secure way for the answers (health details) to reach the clinic; until then `chatAssistant: false` in `site-config.js` hides it.

**The corner buttons.** WhatsApp (green) above "Speak to a doctor" (blue), in the bottom right of every page: pills with their labels on laptops, round buttons on phones (on the home page, phones show them once you scroll past the top, which has its own buttons). WhatsApp: with `whatsapp` set, it opens a chat with that number with a first line already written; until then it says the number is coming soon. On a treatment page it moves up above the phones' Book bar, and on the glossary "Back to top" moves to the left. The icon is a chat bubble until `whatsappIcon` points at an image (e.g. WhatsApp's official icon, from its brand resources).

## The menus, About us and the studies

**Menus.** The header's Treatments menu lists every drip on the menu with its mini drawing (the line drawings, as one icon file, `images/icons/treatments.svg`), name and price, then links to All treatments and the glossary. The Studies menu lists every study. On laptops a click (or a mouse hovering) opens them, and Escape or a click elsewhere closes them; on phones they open inside the Menu. The generator writes both lists into `index.html` (between `<!-- menu:treatments -->` and `<!-- menu:studies -->`) and copies the header onto every page, so run it after changing the menu or the studies.

**About us.** The section in `index.html` (`#about`) holds placeholder text, marked as such on the page, until the clinic writes its own: replace the paragraphs in square brackets and the doctors' roles and introductions. The doctors' GMC numbers (`gmcDrNema`, `gmcDrMahdi`) and the Care Quality Commission line (`cqcNumber`, then `cqcRating`, `cqcRatingDate` and `cqcReportUrl` once rated) come from `site-config.js`.

**Studies.** Each study is a file in `content/studies/<name>.html`: a comment with its `title`, a short `summary` (for the cards), its `order` and the date its sources were checked, then the text, with citations (`<sup class="cite"><a href="#source-1">1</a></sup>`) pointing at the numbered sources at the end (`<ol class="sources">`, each `<li id="source-1">`). The generator turns each into `studies/<name>/`, lists them all on `studies/`, and shows the first three on the home page; its check fails if a citation points at a missing source or a source is never cited. The six studies (iron, vitamin D, vitamin B12, folate, magnesium, dehydration) were researched from NHS, NICE, NDNS and other UK sources and independently fact-checked, but the clinic's doctors must review them before launch (`studiesReviewed: true` then removes the "Draft" note). They're general information: they don't mention the clinic's treatments, and they sit at the bottom of the home page, away from the drips and Book buttons, on purpose (see `COMPLIANCE.md`).

**Questions and complaints.** `faq/` answers common questions and `complaints/` explains how to complain and where to go next. Both are written from `content/legal/` like the policies, with highlighted gaps for what the clinic still has to decide.

**Link previews and search.** Every page has a link preview (title, description and `images/share.png`, from `siteUrl`), and the home page describes the clinic for search engines. Until `launched` is `true`, every page asks search engines not to list it, and `robots.txt` keeps them out; at launch, set `launched: true` and run the generator, which lifts that and writes `sitemap.xml`. `404.html` is the page for a mistyped address, its links working from any folder.

## Before going live

The full checklist is in `COMPLIANCE.md`. In short:

- Once the menu wording has had its compliance review, set `launched: true` in `site-config.js` and run the generator (it removes the `noindex` robots tag from every page and writes `robots.txt` and `sitemap.xml`). Check `siteUrl` first, if the site moves to its own domain.
- Replace the placeholder text in About us, fill in the doctors' GMC numbers and the CQC details, and have the doctors review the studies (`studiesReviewed: true`).
- Fill in `site-config.js` (booking link, phone, email, WhatsApp, maps link) and run the generator. Setting the booking link switches off the booking preview.
