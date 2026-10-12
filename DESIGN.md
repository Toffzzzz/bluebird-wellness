# Bluebird Wellness — Style Reference
> A calm boutique studio. Build screens as quiet, spacious off-white pages where light serif headlines frame a single line drawing, with generous space, one deep bluebird blue for everything that acts, and green kept for Pro alone.

**Theme:** light

Bluebird Wellness is an IV drip clinic based at Bluebird Dentists near Westfield, London, offering treatments in clinic and as a mobile call-out service. The site must feel **safe, clean, calm and premium**: the reassurance of a good clinic with the restraint of a boutique studio. Each treatment is a single line drawing in the brand blue on the warm off-white page, joined to the next by one straight line down the middle; headings are a light serif, everything else a clean sans; colour is withheld until it signals an action.

## Tokens — Colours

Every colour is a CSS variable in the `:root` block at the top of `styles.css` (the token names are kept from earlier schemes, so they read the same all over the stylesheet).

| Name | Value | Token | Role |
|------|-------|-------|------|
| Bluebird (brand) | `#1F3A5F` | `--color-bluebird` | A deep, muted blue like the logo: buttons, links, the line, the drawings, the logo, the favicon, focus rings |
| Bluebird deep | `#172C48` | `--color-bluebird-deep` | Hover and pressed |
| Page | `#F7F5F0` | `--color-cream` | The page, everywhere: the hero, every treatment section, the treatment pages, the browser's bar (`theme-color`) |
| Porcelain | `#FBFAF7` | `--color-porcelain` | The studies section, panels, dialogs; the footer's text |
| White | `#FFFFFF` | `--color-white` | The header, "All treatments", tiles, cards on phones' treatment sections, the contact menu |
| Ink | `#121A2A` | `--color-ink` | Headings and body text (16:1 on the page); the footer, the one dark area |
| Ink soft | `#2B3445` | `--color-ink-soft` | Body text in About us, notes |
| Slate | `#555D6B` | `--color-slate` | Quieter text: leads, summaries, prices on cards (6.1:1 on the page) |
| Mist | `#DDD8CE` | `--color-mist` | Hairlines and input borders only |
| Sand | `#EFEBE3` | `--color-sand` | The one soft background behind every drawing: the cards' tiles and the menus' mini drawings |
| Sand deep | `#E8E3D9` | `--color-sand-deep` | A card's tile on hover |
| Sky | `#E8EDF3` | `--color-sky` | The one soft brand tint, for a few highlighted areas: "How it works", the booking panel (and focus halos, a highlighted source on a study) |
| Pro green | `#2D6A4F` | `--color-pro` | Pro only: the PRO badge (white on it, 6.4:1), "Upgrade to Pro" (5.9:1 on the page), the Pro pages' drawing and link back |
| Pro tint | `#E6F0EA` | `--color-pro-tint` | Behind "Upgrade to Pro" |
| Pro line | `rgba(45, 106, 79, 0.35)` | `--color-pro-line` | The hairline round "Upgrade to Pro" and its panel |
| Error | `#B42318` | `--color-error` | An error message |
| Gap | `#FCEFC7` | `--color-gap` | A gap still to fill: shown only with `showUnfinished: true` |

Contrast (WCAG AA throughout): brand on the page 10.5:1, white on the brand 11.5:1, ink on the page 16:1, slate on the page 6.1:1, Pro green on the page 5.9:1, white on Pro green 6.4:1. No violet, no lavender, no gradient anywhere. Green is never used for anything that isn't Pro.

## Tokens — Typography

### Newsreader — headings · `--font-serif`
- **Source:** the `@fontsource-variable/newsreader` package (SIL Open Font License, `fonts/Newsreader-OFL.txt`), the Latin, upright, weight-axis variable font, served from the site itself (`fonts/Newsreader-Variable.woff2`, preloaded).
- **Used for:** the hero headline, the treatment names (home page sections, cards, the treatment pages' titles), every section title (`h2.section-title`), the policy, study, glossary and 404 page titles, and the smaller headings (card, tile and step titles, doctors' names, study cards, dialogs).
- **Weights:** 300 (light) for large headings, 400 for smaller ones (card titles, h3s). Never bold.
- **Letter spacing:** -0.01em.

### Source Sans 3 — body text, labels and buttons · `--font-sans`
- **Source:** Adobe's official variable font file, as released (`fonts/SourceSans3VF-Upright.ttf.woff2`, SIL Open Font License, `fonts/SourceSans3-LICENSE.md`), served from the site itself and preloaded. A humanist sans, calm and very readable, chosen over Inter (which most generated websites use).
- **Weights:** 400 (body), 500 (labels, buttons, links), 600 (the wordmark, small labels).
- **Letter spacing:** -0.01em for body text. No all-caps labels anywhere (the PRO badge aside).

### Type Scale

| Role | Font | Weight | Size | Token |
|------|------|--------|------|-------|
| small label (sentence case: "Upgrade to Pro", "Study 1 of 6") | Source Sans 3 | 600 | 15px | `--text-caption` |
| nav / button label | Source Sans 3 | 500 | 16px | `--text-label` |
| caption | Source Sans 3 | 400 | 15px | `--text-caption` |
| body | Source Sans 3 | 400 | 18px | `--text-body` |
| body-large | Source Sans 3 | 400 | clamp(19px, 1.7vw, 22px) | `--text-body-lg` |
| card title | Newsreader | 400 | 22px | |
| section heading | Newsreader | 300 | clamp(32px, 4.5vw, 48px) | `--text-section` |
| treatment name (home, laptops) | Newsreader | 300 | clamp(48px, 5.2vw, 76px) from 1024px | |
| page title | Newsreader | 300 | clamp(42px, 5.6vw, 76px) | |
| hero headline | Newsreader | 300 | clamp(44px, 7.5vw, 96px) | `--text-hero` |

## Tokens — Spacing & Shapes

**Density:** spacious. White space is part of the calm; when in doubt, add more.

Spacing steps: 4, 8, 12, 16, 24, 32, 48, 64, 96, 144px (`--space-*`). Sections: `--section-padding`, clamp(96px, 13vw, 200px) top and bottom; section headings sit 96px above their content on laptops (64px on phones). Max content width 1200px; side gutters 24px on phones, 48px on tablets, 64px on laptops.

### One corner radius

`--radius: 12px` for everything rounded: buttons, the cards' drawing tiles, panels, menus, the booking preview, the chat, inputs, badges and chips. Photos have `--radius-photo: 4px`, like prints. Only true circles stay round: the contact button, the side list's dots and small round icons (avatars, the tiles' icons, close and send buttons). No pills.

## Components

### Hero
**Role:** the first screen, and the main selling point: doctor-led

The page's own off-white, no gradient, centred (on the line's axis) and spacious (on laptops it fills the first screen), with no label above it: the headline "London’s doctor-led IV service, wherever you are." in the serif, light, 34–84px (a non-breaking hyphen in "doctor-led" and a non-breaking space in "IV service", so they never split: two lines on laptops, three on phones), one sentence in slate ("Every drip starts with a consultation with one of our doctors."), "Book now" (solid brand) and "Speak to a doctor" (the one outline button, in brand blue; it opens the chat), on phones a "See all treatments ↓" text link under them (straight down to the cards), and the medical-consultation note. No row of ticked selling points. At the bottom, on the page's centre line, the bird (96px tall on laptops, 72px on phones) draws itself, and its line grows down from the tip of its tail to the bottom of the hero, joining the central line exactly (same x, no gap, 3.2px, the brand blue). The bird's drawing and where the tip of its tail is come from `images/logo/bluebird-mark.svg`, written in by the generator.

### Site Header
**Role:** sitewide navigation, 64px tall

Solid white. The bird and "Bluebird Wellness" (Source Sans 3 600, 18px, ink) on the left; Treatments and Studies (each opening a menu), Ingredients, About, How it works and Contact in Source Sans 3 500, 16px, slate (ink on hover); a compact solid "Book now" on the right. A mist hairline appears once the page has scrolled. On tablets (820 to 1023px) the wordmark is hidden.

The drop-down menus: a white panel (12px corners, a mist hairline, a soft shadow). Treatments lists every standard drip in two columns, each with its mini drawing on a sand tile, its name and price; Studies lists each study.

### Buttons and links
- **Solid button** (the main actions, "Book", "Book now"): brand blue, white text, Source Sans 3 500 16px, 12px corners, 14px 28px padding (compact: 10px 20px). Hover: bluebird deep and a 1px lift. The only filled button style.
- **Outline button** (only the hero's "Speak to a doctor"): transparent, brand-blue text and 1px border; hover: the sky tint.
- **Text links, underlined** (every secondary action): "Learn more" on the treatment sections and cards (keeping their full names for screen readers, e.g. "Learn more about Iron Infusion"), "See all studies", "Ask a question", "Read the summary", "Upgrade to Pro"'s "Learn more" (in green). Source Sans 3 500, brand blue, at least 44px tall, with a thin underline (brand blue at 35%, 5px below) that turns solid on hover. No arrows after link words: only "See all treatments ↓", a jump down the page, has one. "Expand all" and the booking preview's Back look the same.
- **Focus:** a 2px brand-blue outline, offset 3px, with a 3px sky halo.

### Treatment line drawings (the home page)
**Role:** one section per featured treatment, joined by one line

All six on the page colour. One brand-blue line, 3.2px, round ends, runs straight down the middle of the page and draws as you scroll (the pen two thirds of the way down the screen). It flows into the top of each drawing, the drawing is drawn from the top down, and the line carries on from its bottom. The straight line never breaks: each piece of it only starts once the piece before it is drawn, into, out of and between the drawings, and it always keeps the pace of the scroll (scrolling down before the hero's line has finished growing, the pen draws the rest of it). On Hair & Scalp the line comes into the top of her head and starts again below the ends of her hair, never running through her. Drawings never run backwards or replay while you're on the page, and start afresh when you come back to it. As each drawing nears its end, its own colours splash out behind it in a loose watercolour wash (the same on the cards and the treatment pages), filling its shapes: soft, a little past the lines, darker at the edges where the paint pooled, with uneven pigment, paper grain and a few drops; the line stays crisp on top. On laptops each section reads like a magazine page: the eyebrow, the name large in the serif, Book, Learn more → and the price on one side of the drawing, and on the other a narrow summary (about 30 characters a line, 17–18px, slate), swapping sides each time and never touching the drawing or the side list. On phones the text is a white card under the drawing (mist hairline, 12px corners), the line running into its top and out of its bottom.

The side list of names down the right (dots below 1360px): small (12px), regular weight, slate and a little faded; the current one in brand blue with a short dash. The dots are quiet (slate at 35%), the current one brand blue.

### Treatment card
**Role:** one standard drip in the "All treatments" grid

No box: no border, background or shadow. The drawing sits on a square sand tile (12px corners, no border), filling about 92% of it, the same for every card; the name (Newsreader 22px), the price (slate) and "Learn more" underneath. Hover (laptops): the tile darkens very slightly (sand deep) and the drawing scales up a touch. Grid: 1 column on small screens, 2, 3, then 4 across. On phones a compact list, one row per drip: the drawing on a 64px sand tile, name, price, a chevron, with a hairline between rows. A Pro version has no card of its own: its standard version's card says "Upgrade to Pro".

### Pro
Green, for Pro only, so Pro drips are obvious at a glance: the PRO badge beside a Pro drip's name (white on green); every "Upgrade to Pro" link (green text on the Pro tint, with the green hairline); on the Pro pages (Immunity Pro, Recovery Pro, Hair & Scalp Pro) the drawing in green and the link back to the standard version in green. The Book buttons stay brand blue.

### Information tile
**Role:** "How it works" (on the sky tint)

White, 12px corners, 32px padding; a small sky circle with a line icon in brand blue, a serif title and slate body copy. With its photo (`howPhotos`), the whole tile is the photo (at least 480px tall), in place of the icon: the title (Newsreader 30px) and body in white over an ink shade rising from the bottom (88% at the foot, clear by about three quarters of the way up). On phones (at least 544px tall) the photo fills the upper 62% and fades into solid ink, and the words sit below it, so they never cross a face. White words over a photo must keep 4.5:1 contrast against the shaded photo behind them (the checker measures it). The steps below sit on brand-blue hairlines; with their photos (`stepPhotos`), each step has a square photo (12px corners) above it on laptops, in place of its hairline, and a small square beside it on phones.

### Booking panel
**Role:** "Book your appointment" (on the sky tint)

Centred: serif title, lead, Book now (no label above). With its photo (`bookPhoto`), the photo is the panel (at least 608px tall, 12px corners) on laptops, the words on a solid sky-blue card (12px corners, at most 480px wide, no blur, no shadow) over its right side; on tablets and phones the photo comes first (352px tall) and the same sky card overlaps its bottom edge by 96px. The photo keeps its upper part when cropped (`bookPhotoFocus: 'center 30%'`, so the clinician's face stays in view).

### Photos
Photos have small 4px corners, like prints (`--radius-photo`), so they read as photographs rather than as more rounded cards; the panels and the booking panel they fill keep the 12px corners. Nothing animates on them: they're simply there. Each photo's `focus` sets what a crop keeps (CSS object-position). The placeholders were given a light film grade (a little less saturated, softer blacks, fine grain) so they look less glossy; real photos need none.

### Section headings
Left-aligned, like a printed page: the serif title (at most 16 characters a line) and, on laptops, its lead beside it on the right, their last lines level; on phones the lead sits under the title. No label above them. Only the hero is centred, on the line's axis.

### Studies
No boxes: each study is its serif title, its summary and "Read the summary" under a mist hairline, three across on laptops; hovering darkens the hairline and underlines the title.

### About us
The first paragraph, then the clinic's own (`aboutParagraphs`); each doctor on a mist hairline with their name in the serif, and their role, GMC number (linked) and introduction once filled in; their photo, once it's in `images/team/`, as a 4:5 portrait with 12px corners. The CQC line once rated. "Inside the clinic": the first of the clinic's photos runs across the whole screen (78% of its height, at most 736px), "Inside the clinic" (Newsreader, up to 56px) and one line over it in white on an ink shade rising from the bottom; the rest (4:3, 12px corners) follow, 4 across on laptops, 2 across on tablets and phones. Hidden while there are none. Nothing unfinished ever shows (with `showUnfinished: true`, each gap is highlighted in the gap yellow).

### The contact button
**Role:** WhatsApp and the chat assistant, every page

One 52px round button, brand blue with a white speech bubble, in the bottom right corner (16px from the edges on phones, 24px on laptops, plus the safe area), named "Contact us". It opens a small white menu just above it (12px corners, a mist hairline, a soft shadow): "WhatsApp us" and "Speak to a doctor", each at least 48px tall with a brand-blue icon; without a WhatsApp number, the menu says it's coming soon. It steps aside (fades out, not focusable) over the hero, over the footer, while a menu or dialog is open, and whenever it would cover anything (a photo behind words, the gallery's first or the booking panel's, counts as background, not as something to avoid: it floats over it, away from its words); it sits above a treatment page's Book bar on phones.

### Text input
White, 1px mist border, 12px corners, ink text, slate placeholder. Focus: brand-blue border and a 3px sky ring.

### Booking preview and chat
Porcelain dialogs with 12px corners and a soft ink shadow over a faint ink backdrop (the whole screen on phones). Chosen days, times and choices are brand blue (or the sky tint with a brand-blue border); the "PREVIEW" labels and notes on the page colour; the booking confirmation's tick on the sky tint. The chat's bubbles: theirs brand blue, the assistant's white with a mist hairline, all 12px corners.

### Policy and study pages
A single 46rem column on the page colour: the title in the serif, "Last updated" in slate, the "Draft" note (white with a mist hairline), an "On this page" box, the text at 17px/1.6 with serif section headings. A policy page with a gap left is shown, until it's filled in, only as its title, "This page is being finalised and will be here soon." and a link home. Each study keeps its "Draft: awaiting review by the clinic's doctors" note.

### Footer
The one dark area: ink background, porcelain text (links at 70%, 8:1), the bird in porcelain. Links to the policy pages that are finished, and the business's details once filled in.

## Motion

Motion is **slow, smooth and purposeful** — it should feel like calm breathing, never flashy.

- **Like Apple's product pages:** the page always scrolls natively (no smooth-scroll library, no snapping: it never moves by itself). Each treatment's animation is a short pre-rendered video.
- **Laptops and desktops:** scrolling drives the animation while the page keeps scrolling continuously (nothing is pinned): it starts once most of the section is on screen, and the video plays towards where the scroll puts it, easing in and out, at up to twice its natural speed. Arriving by a jump, it plays on by itself.
- **No edges:** each video is rendered on its section's tint, tagged with the sRGB colour curve so every browser draws it like the page's colours, and softly framed in the tint, so no box or border ever shows.
- **Phones and tablets:** the video plays by itself once it's half in view.
- **Animations never run backwards:** scrolling back up leaves an animation where it got to, and once it has finished it stays on its finished picture (on every screen size).
- **No entrances:** below the hero, headings, cards, tiles, photos and text are simply there (no fade-ins or slide-ups as you scroll, on any page). The line and its drawings, with their watercolours, are the one thing that moves; the hero's words rise in once as the page opens.
- **Only animate opacity and transform/translate** for smooth performance, and never blur anything over moving content.
- **Far jumps don't scroll:** an in-page link to somewhere more than about a screen and a half away goes straight there.
- **One motion idea per section** — never stack several effects on the same object.
- **The hero's bird:** as the page opens, after the hero's words have risen in, the bird's outline draws itself as one continuous 1.5px line (1.6s), the filled bird fades in over it as the outline fades (0.4s), and a 3.2px line grows down from the tip of its tail to the bottom of the hero (0.6s), where the central line carries on. Once, never again while you're on the page.
- **Reduced motion:** when `prefers-reduced-motion: reduce` is set, nothing moves by itself: every drawing (and the hero's bird) is shown finished, and with the videos each treatment shows its finished picture, its button playing the video on request.

## Do's and Don'ts

### Do
- Use the page colour `#F7F5F0` everywhere; white for the header, tiles and the "All treatments" section.
- Use ink `#121A2A` for headings and text, slate `#555D6B` for quieter text.
- Use the brand blue `#1F3A5F` for actions, links, the line, the drawings, the logo and focus rings.
- Put every drawing on a cards or menu tile on the same sand `#EFEBE3`.
- Use 12px corners for buttons, panels, tiles and menus, and 4px for photos; only true circles are round.
- Use the serif, light, for headings; never bold.
- Keep all copy calm, factual and reassuring.

### Don't
- Don't use violet, lavender, gradients, neon or glows.
- Don't use green for anything that isn't Pro.
- Don't put boxes inside boxes (the cards have no border, background or shadow).
- Don't use pills or any second filled button style: secondary actions are underlined text links.
- Don't add the usual template chrome: no all-caps labels above headings, no ticked selling points, no arrows after link words, no words joined with middle dots, no frosted glass, no soft shadows under cards, no fade-in on every block.
- Don't show anything unfinished: no square-bracket placeholders, no yellow (except with `showUnfinished: true`).
- Don't use stock "smiling at camera" photography or before/after imagery. AI pictures of the clinic or the doctors only as placeholders, while the site is a preview (`placeholderPhotos: true` marks each one "Placeholder": a small white label on a translucent ink pill in a corner); never at launch.
- The photos' look: candid, documentary-style, soft natural daylight; warm off-white, light oak, soft grey and deep navy; real skin and proportions, nothing glossy or retouched; medical details accurate and calm (gloves, a neat cannula under a clear dressing, no needles or blood in close-up); no text or logos.
- Don't state or imply that treatments cure, treat, prevent, detox, boost immunity, reverse ageing or grow hair (UK ASA/CAP rules for IV therapy).

## Quick Start

### CSS Custom Properties (from the top of `styles.css`)

```css
:root {
  /* Colors */
  /* The bluebird palette (see "Colour" near the end and DESIGN.md): one deep,
     muted blue like the logo on a warm off-white page, very dark navy text,
     warm neutrals for hairlines and the drawings' tiles, one soft blue tint
     for a few highlighted areas, and green for Pro only. Contrast on the
     page: brand 10.5:1, ink 16:1, slate 6.1:1, Pro green 5.9:1; white on the
     brand 11.5:1, on the green 6.4:1. */
  --color-bluebird: #1F3A5F;                 /* the brand: buttons, links, the line, drawings, logo, focus rings */
  --color-bluebird-deep: #172C48;            /* hover and pressed */
  --color-cream: #F7F5F0;                    /* the page, everywhere */
  --color-porcelain: #FBFAF7;
  --color-white: #FFFFFF;
  --color-ink: #121A2A;                      /* headings and body text */
  --color-ink-soft: #2B3445;
  --color-slate: #555D6B;                    /* quieter text */
  --color-mist: #DDD8CE;                     /* hairlines and input borders only */
  --color-sand: #EFEBE3;                     /* the one soft background behind every drawing (cards, menus) */
  --color-sand-deep: #E8E3D9;                /* a card's tile on hover */
  --color-sky: #E8EDF3;                      /* the one soft brand tint: "How it works", the booking panel */
  --color-pro: #2D6A4F;                      /* Pro only */
  --color-pro-tint: #E6F0EA;
  --color-pro-line: rgba(45, 106, 79, 0.35);
  --color-error: #B42318;                    /* an error message (6.2:1) */
  --color-gap: #FCEFC7;                      /* a gap still to fill: shown only with showUnfinished: true */

  /* Typography */
  --font-sans: 'Source Sans 3', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-serif: 'Newsreader', Georgia, 'Times New Roman', serif;

  --text-eyebrow: 12px;
  --text-label: 16px;
  --text-caption: 15px;
  --text-body: 18px;
  --text-body-lg: clamp(19px, 1.7vw, 22px);
  --text-card-title: 21px;
  --text-section: clamp(32px, 4.5vw, 48px);
  --text-treatment: clamp(44px, 7vw, 88px);
  --text-hero: clamp(44px, 7.5vw, 96px);

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;

  /* Spacing */
  --space-4: 4px;
  --space-8: 8px;
  --space-12: 12px;
  --space-16: 16px;
  --space-24: 24px;
  --space-32: 32px;
  --space-48: 48px;
  --space-64: 64px;
  --space-96: 96px;
  --space-144: 144px;
  --section-padding: clamp(96px, 13vw, 200px);
  --content-max: 1200px;
  --gutter: 24px;
  --header-h: 64px;

  /* Radius: one corner everywhere (buttons, the drawings' tiles, panels,
     menus, dialogs, inputs, badges, chips). Only true circles stay round. */
  --radius: 12px;

  /* Elevation */
  --shadow-float: drop-shadow(0 30px 40px rgba(18, 26, 42, 0.12));
  --shadow-menu: 0 16px 40px rgba(18, 26, 42, 0.12);

  /* Motion */
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --duration-fast: 200ms;
  --duration-base: 400ms;
  --duration-slow: 800ms;

  color-scheme: light;
}
```
