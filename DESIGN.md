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
- **Letter spacing:** -0.01em (not Inter's tight tracking).

### Inter — body text, labels and buttons · `--font-sans`
- **Source:** served from the site itself (`fonts/`, SIL Open Font License). Weights 400, 500 and 600.
- **Weights:** 400 (body), 500 (labels, buttons, links), 600 (the wordmark, small labels).
- **Letter spacing:** -0.01em for body text; small uppercase eyebrows +0.08em.

### Type Scale

| Role | Font | Weight | Size | Token |
|------|------|--------|------|-------|
| eyebrow (small uppercase label) | Inter | 500 | 12px | `--text-eyebrow` |
| nav / button label | Inter | 500 | 15px | `--text-label` |
| caption | Inter | 400 | 14px | `--text-caption` |
| body | Inter | 400 | 17px | `--text-body` |
| body-large | Inter | 400 | clamp(18px, 1.6vw, 21px) | `--text-body-lg` |
| card title | Newsreader | 400 | 22px | |
| section heading | Newsreader | 300 | clamp(32px, 4.5vw, 48px) | `--text-section` |
| treatment name (home, laptops) | Newsreader | 300 | clamp(48px, 5.2vw, 76px) from 1024px | |
| page title | Newsreader | 300 | clamp(42px, 5.6vw, 76px) | |
| hero headline | Newsreader | 300 | clamp(44px, 7.5vw, 96px) | `--text-hero` |

## Tokens — Spacing & Shapes

**Density:** spacious. White space is part of the calm; when in doubt, add more.

Spacing steps: 4, 8, 12, 16, 24, 32, 48, 64, 96, 144px (`--space-*`). Sections: `--section-padding`, clamp(96px, 13vw, 200px) top and bottom; section headings sit 96px above their content on laptops (64px on phones). Max content width 1200px; side gutters 24px on phones, 48px on tablets, 64px on laptops.

### One corner radius

`--radius: 12px` for everything rounded: buttons, the cards' drawing tiles, panels, menus, the booking preview, the chat, inputs, badges and chips. Only true circles stay round: the contact button, the side list's dots and small round icons (avatars, the tiles' icons, close and send buttons). No pills.

## Components

### Hero
**Role:** the first screen, and the main selling point: doctor-led

The page's own off-white, no gradient, centred and spacious (on laptops it fills the first screen): the eyebrow "IV drip clinic · London" (slate), the headline "Doctor-led IV drips." in the serif, light (a non-breaking hyphen so it never splits), one sentence in slate ("Every drip starts with a consultation with one of our doctors."), "Book now" (solid brand) and "Speak to a doctor" (the one outline button, in brand blue; it opens the chat), the three points (13px, slate, thin brand-blue ticks) and the medical-consultation note. At the bottom, on the page's centre line, the bird (96px tall on laptops, 72px on phones) draws itself, and its line grows down from the tip of its tail to the bottom of the hero, joining the central line exactly (same x, no gap, 3.2px, the brand blue). The bird's drawing and where the tip of its tail is come from `images/logo/bluebird-mark.svg`, written in by the generator.

### Site Header
**Role:** sitewide navigation, 64px tall

Solid white. The bird and "Bluebird Wellness" (Inter 600, 18px, ink) on the left; Treatments and Studies (each opening a menu), Ingredients, About, How it works and Contact in Inter 500, 15px, slate (ink on hover); a compact solid "Book now" on the right. A mist hairline appears once the page has scrolled. On tablets (820 to 1023px) the wordmark is hidden.

The drop-down menus: a white panel (12px corners, a mist hairline, a soft shadow). Treatments lists every standard drip in two columns, each with its mini drawing on a sand tile, its name and price; Studies lists each study.

### Buttons and links
- **Solid button** (the main actions, "Book", "Book now"): brand blue, white text, Inter 500 15px, 12px corners, 14px 28px padding (compact: 10px 20px). Hover: bluebird deep and a 1px lift. The only filled button style.
- **Outline button** (only the hero's "Speak to a doctor"): transparent, brand-blue text and 1px border; hover: the sky tint.
- **Text links with an arrow** (every secondary action): "Learn more →" on the treatment sections and cards (keeping their full names for screen readers, e.g. "Learn more about Iron Infusion"), "See all studies →", "Ask a question →", "Read the summary →", "Upgrade to Pro"'s "Learn more →" (in green). Inter 500, brand blue, at least 44px tall; the arrow nudges right on hover. "Expand all" and the booking preview's Back are the same, without the arrow.
- **Focus:** a 2px brand-blue outline, offset 3px, with a 3px sky halo.

### Treatment line drawings (the home page)
**Role:** one section per featured treatment, joined by one line

All six on the page colour. One brand-blue line, 3.2px, round ends, runs straight down the middle of the page and draws as you scroll on laptops (the pen two thirds of the way down the screen); on phones each drawing plays by itself when reached. It flows into the top of each drawing, the drawing is drawn from the top down, and the line carries on from its bottom. Drawings never run backwards or replay while you're on the page, and start afresh when you come back to it. On laptops each section reads like a magazine page: the eyebrow, the name large in the serif, Book, Learn more → and the price on one side of the drawing, and on the other a narrow summary (about 30 characters a line, 17–18px, slate), swapping sides each time and never touching the drawing or the side list. On phones the text is a white card under the drawing (mist hairline, 12px corners), the line running into its top and out of its bottom.

The side list of names down the right (dots below 1360px): small (12px), regular weight, slate and a little faded; the current one in brand blue with a short dash. The dots are quiet (slate at 35%), the current one brand blue.

### Treatment card
**Role:** one standard drip in the "All treatments" grid

No box: no border, background or shadow. The drawing sits on a square sand tile (12px corners, no border), filling about 92% of it, the same for every card; the name (Newsreader 22px), the price (slate) and "Learn more →" underneath. Hover (laptops): the tile darkens very slightly (sand deep) and the drawing scales up a touch. Grid: 1 column on small screens, 2, 3, then 4 across. On phones a compact list, one row per drip: the drawing on a 64px sand tile, name, price, a chevron, with a hairline between rows. A Pro version has no card of its own: its standard version's card says "Upgrade to Pro".

### Pro
Green, for Pro only, so Pro drips are obvious at a glance: the PRO badge beside a Pro drip's name (white on green); every "Upgrade to Pro" link (green text and arrow on the Pro tint, with the green hairline); on the Pro pages (Immunity Pro, Recovery Pro, Hair & Scalp Pro) the drawing in green and the link back to the standard version in green. The Book buttons stay brand blue.

### Information tile
**Role:** "How it works" (on the sky tint)

White, 12px corners, 32px padding; a small sky circle with a line icon in brand blue, a serif title and slate body copy. The steps below sit on brand-blue hairlines.

### About us
The first paragraph, then the clinic's own (`aboutParagraphs`); each doctor on a mist hairline with their name in the serif, and their role, GMC number (linked) and introduction once filled in; their photo, once it's in `images/team/`, as a 4:5 portrait with 12px corners. The CQC line once rated. "Inside the clinic": the clinic's photos (4:3, 12px corners), 3 across on laptops, one column on phones, hidden while there are none. Nothing unfinished ever shows (with `showUnfinished: true`, each gap is highlighted in the gap yellow).

### The contact button
**Role:** WhatsApp and the chat assistant, every page

One 52px round button, brand blue with a white speech bubble, in the bottom right corner (16px from the edges on phones, 24px on laptops, plus the safe area), named "Contact us". It opens a small white menu just above it (12px corners, a mist hairline, a soft shadow): "WhatsApp us" and "Speak to a doctor", each at least 48px tall with a brand-blue icon; without a WhatsApp number, the menu says it's coming soon. It steps aside (fades out, not focusable) over the hero, over the footer, while a menu or dialog is open, and whenever it would cover anything; it sits above a treatment page's Book bar on phones.

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
- **Text entrances:** fade up 20–24px over 0.7–0.8s, ease-out, once, as each block arrives (CSS transitions started by an IntersectionObserver; the hero's are a CSS animation).
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
- Use one corner radius, 12px; only true circles are round.
- Use the serif, light, for headings; never bold.
- Keep all copy calm, factual and reassuring.

### Don't
- Don't use violet, lavender, gradients, neon or glows.
- Don't use green for anything that isn't Pro.
- Don't put boxes inside boxes (the cards have no border, background or shadow).
- Don't use pills or any second filled button style: secondary actions are text links with an arrow.
- Don't show anything unfinished: no square-bracket placeholders, no yellow (except with `showUnfinished: true`).
- Don't use stock "smiling at camera" photography, before/after imagery or AI pictures of the clinic or the doctors.
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
  --font-sans: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-serif: 'Newsreader', Georgia, 'Times New Roman', serif;

  --text-eyebrow: 12px;
  --text-label: 15px;
  --text-caption: 14px;
  --text-body: 17px;
  --text-body-lg: clamp(18px, 1.6vw, 21px);
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
