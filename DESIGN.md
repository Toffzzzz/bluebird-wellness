# Bluebird Wellness — Style Reference
> Calm clinical light. Build screens as a sequence of bright, spacious cream galleries where large, confident Inter headlines frame a single floating treatment object, generous white space, and one violet, in shades.

**Theme:** light

Bluebird Wellness is an IV drip clinic based at Bluebird Dentists near Westfield, London, offering treatments in clinic and as a mobile call-out service. The site must feel **safe, clean, calm and premium** — the reassurance of a good clinic with the polish of a high-end product launch. Each treatment is staged as an isolated, softly shadowed object (a runner, a halved orange, a red blood cell, flowing hair, a young plant) floating on warm cream, with oversized navy display type and colour withheld until it signals an action. Structure and rhythm are borrowed from premium product-launch pages — long cinematic sections, big type, rounded tiles — but the palette is light and warm, never dark or techy.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Violet 50 (page) | `#F6F3FE` | `--color-cream` | Default page background; the treatment pages; the first band |
| Porcelain | `#FAF9FE` | `--color-porcelain` | Alternate light surfaces, panels, a Pro row's well |
| White | `#FFFFFF` | `--color-white` | Cards, information tiles, the header, button text on violet |
| Violet 100 | `#EDE7FD` | `--color-sand`, `--color-sky`, `--color-pro-tint`, `--color-pop` | Badges, image wells, the booking panel, the hero's Book now button (Violet 950 text, 13.8:1) |
| Violet 200 | `#DDD1FB` | `--color-mist`, `--color-lavender` | 1px dividers, card and input borders; text on the dark violet (7.3:1 on Violet 800) |
| Violet 300 | `#C3AEF7` | `--color-violet-soft` | The hero's ticks and its "Scroll to explore" line |
| Violet 600 (main) | `#6A3BD3` | `--color-bluebird`, `--color-violet-bright` | The main violet: filled buttons (White text, 6.6:1), links, focus rings, the line drawings, the logo, the favicon |
| Violet 700 | `#5A2DB8` | `--color-bluebird-deep` | Hover and pressed state for buttons and links |
| Violet 800 | `#4A2696` | `--color-pro`, `--color-violet`, `--color-violet-band`, `--color-ink-soft` | Everything Pro (White on it 10.5:1; on Violet 100, 8.7:1); "How it works"; the middle of the hero's gradient; body text on the bands |
| Violet 950 | `#24124D` | `--color-ink`, `--color-violet-night` | Headlines and body copy (15.1:1 on the page); the footer; the top of the hero's gradient |
| Violet Grey | `#514A66` | `--color-slate` | Muted body copy, captions, secondary labels (7.6:1 on the page) |
| Bands | `#F6F3FE`, `#EDE7FD`, `#E5DCFC`, `#DDD1FB`, `#D3C3F9` | `--band-1` … `--band-5` | In turn, a shade deeper each time: behind each featured treatment, the cards' pictures, the menu's mini drawings, the study cards |

**One colour: Violet (October 2026).** Every colour on the page is a shade of one violet, from almost white to almost black: a deep violet hero (950 → 800 → 600) with a pale Book now button, the featured treatments on bands a shade deeper each time, the cards' pictures on the same shades, a deep violet "How it works", a pale violet booking panel, Pro in the deepest violet, and the line drawings, logo, favicon, links and buttons in the main violet. The only other colours: WhatsApp's own green on its button, the red of an error message, and the yellow that marks a gap for the clinic to fill. (The token names are kept from earlier schemes, so "bluebird" is now the main violet and "cream" the palest.)

All text/background pairs above meet WCAG AA contrast (Violet 950 on the page 15.1:1, Violet Grey on the page 7.6:1, White on Violet 600 6.6:1, Violet 600 on the page 6.0:1, Violet 800 on the deepest band 6.4:1).

## Tokens — Typography

### Inter — Display headlines, section headings and all interface text · `--font-sans`
- **Source:** Google Fonts (free for commercial use). Load weights 400, 500 and 600.
- **Weights:** 400 (body), 500 (labels, buttons), 600 (headlines)
- **Letter spacing:** tighten large headlines (-0.03em at hero size, -0.02em at section size); body text at -0.01em; small uppercase eyebrows at +0.08em
- **Font features:** `"ss01", "cv11"` optional for a cleaner single-storey look
- **Role:** One family throughout for a calm, coherent, clinical voice. Hierarchy comes from size, weight and space — not from mixing typefaces.

### Type Scale

Use `clamp()` so type scales smoothly from mobile to desktop.

| Role | Weight | Size | Line Height | Letter Spacing | Token |
|------|--------|------|-------------|----------------|-------|
| eyebrow (small uppercase label) | 500 | 12px | 1.3 | +0.08em | `--text-eyebrow` |
| nav / button-label | 500 | 15px | 1.2 | -0.01em | `--text-label` |
| caption | 400 | 14px | 1.45 | -0.005em | `--text-caption` |
| body | 400 | 17px | 1.55 | -0.01em | `--text-body` |
| body-large | 400 | clamp(18px, 1.6vw, 21px) | 1.5 | -0.01em | `--text-body-lg` |
| card-title | 600 | 21px | 1.2 | -0.015em | `--text-card-title` |
| section-heading | 600 | clamp(32px, 4.5vw, 48px) | 1.08 | -0.02em | `--text-section` |
| treatment-display | 600 | clamp(44px, 7vw, 88px) | 1.0 | -0.03em | `--text-treatment` |
| hero-display | 600 | clamp(44px, 7.5vw, 96px) | 1.0 | -0.03em | `--text-hero` |

## Tokens — Spacing & Shapes

**Density:** spacious. White space is part of the calm; when in doubt, add more.

### Spacing Scale

| Name | Value | Token |
|------|-------|-------|
| 4 | 4px | `--space-4` |
| 8 | 8px | `--space-8` |
| 12 | 12px | `--space-12` |
| 16 | 16px | `--space-16` |
| 24 | 24px | `--space-24` |
| 32 | 32px | `--space-32` |
| 48 | 48px | `--space-48` |
| 64 | 64px | `--space-64` |
| 96 | 96px | `--space-96` |
| 144 | 144px | `--space-144` |

### Border Radius

| Element | Value |
|---------|-------|
| cards / media tiles | 28px |
| small tiles, inputs (multi-line) | 16px |
| buttons, pills, single-line inputs | 9999px |
| badges | 9999px |

### Layout

- **Max content width:** 1200px, centred
- **Side gutters:** 24px on mobile, 48px on tablet, 64px+ on desktop
- **Section padding:** clamp(96px, 12vw, 160px) top and bottom for standard sections
- **Card padding:** 24px (mobile) to 32px (desktop)
- **Grid gap:** 24px

## Components

### Hero
**Role:** The first screen, and the main selling point: doctor-led

Centred on the violet gradient (Violet 950 → 800 → 600): a Violet 200 eyebrow ("IV drip clinic · London"), the headline "Doctor-led IV drips." in White (Inter 600, hero size, a non-breaking hyphen so it never splits), a Violet 200 lead line, Book now (Violet 100 with Violet 950 text) and Speak to a doctor (White outline), three Violet 300 ticks with White 14px labels, and the medical-consultation note. "Scroll to explore" ends in a Violet 300 line.

### Site Header
**Role:** Sitewide navigation, 64px tall

Solid White background (no translucency or backdrop blur: a blur has to be redrawn on every frame while the page scrolls beneath it). "Bluebird Wellness" wordmark on the left in Inter 600, 18px, Violet 950. Nav: Treatments and Studies (each opening a menu, with a chevron), About, How it works, Contact, in Inter 500, 15px, Violet Grey, turning Violet 950 on hover. A compact Violet 600 "Book now" (White text) on the right. A 1px Violet 200 bottom border appears only once the page has scrolled.

The drop-down menus: a White panel with 20px corners and a soft violet shadow under the header. Treatments lists every drip in two columns, each with its mini line drawing on a colour-band tile (40px), its name (Inter 500, 14px) and price (13px, Ink Soft), then "All treatments" and "Ingredient glossary" in Violet; Studies lists each study. On phones they open inside the Menu, under "Treatments" and "Studies".

### Primary Pill Button
**Role:** Main call to action ("Book now", "Book")

Violet 600 `#6A3BD3` fill, White text, Inter 500 15px, 9999px radius, padding 14px 28px (compact version: 10px 20px). Hover: Violet 700 `#5A2DB8` and a 1px upward lift. Visible focus ring: 3px Violet 100 outline plus 2px Violet 600 offset.

### Secondary Pill Button
**Role:** Lower-priority actions ("Learn more", "See all treatments")

Transparent fill, Violet 950 text, 1px Violet 950 border at 20% opacity, 9999px radius, same padding as primary. Hover: Violet 100 fill.

### Treatment Line Drawings (the live version)
**Role:** One section per featured treatment, joined by one line

Each section on its own band, a shade of violet deeper each time. A single Violet 600 `#6A3BD3` line, 3.2px, round ends and joins, runs straight down the middle of the page and draws as the page scrolls (the pen is two thirds of the way down the screen, so each drawing finishes low and stays in view). The cards under "All treatments" and the treatment pages show the same drawings in the same violet, drawing themselves in from the top down as they come into view. It stops at the top of each treatment's drawing, the drawing is drawn from the top down, and the line carries on from its bottom. Drawings are clean line art (no hand-drawn wobble), all the same weight (four, the people, are traced from ChatGPT line art with small details left out), about 440px on laptops and 340px on phones; the Signature drawing is the logo itself, with its strokes made thinner (`images/logo/bluebird-mark-thin.svg`) so it sits with the lines, revealed from the top down. On laptops the text (eyebrow, name at 36–60px, Book, Learn more, price) sits beside the drawing, alternately left (right-aligned towards the line) and right, and a short summary in Violet 800 (the opening sentences of the drip's description, 17px) sits on the other side of the drawing; on phones it's a Porcelain card with a Violet 200 border under the drawing, the line running into its top and out of its bottom. The hero's "Scroll to explore" line is drawn in Violet 300, as the start of the line.

### Treatment Showcase Section (the video version)
**Role:** One section per featured treatment, with a short video of its animation

On its treatment's tint. Split layout on desktop: the text column on the left, the video on the right. On laptops the scroll drives the video as the section moves up the screen (nothing is pinned); on phones the video sits above the text and plays by itself when half of it is in view, with a round pause / play / replay button in its corner. A side list of the treatments' names shows down the right while the sections are on screen (dots below 1360px), the current one in Violet with a short dash beside it. Text column: eyebrow ("IV therapy" in Violet Grey, uppercase), treatment name in treatment-display size, 1–2 sentence description in body-large Violet Grey, then a Primary Pill Button. On mobile, stack image above text and reduce image size so the headline stays visible.

### Treatment Card
**Role:** One treatment in the "All treatments" grid

White `#FFFFFF` background, 28px radius, 1px Violet 200 border, 24–32px padding. A square image area at top (Violet 100 `#EDE7FD` background with 20px radius; transparent treatment image centred inside with soft shadow, or a soft coloured placeholder shape). Card title in card-title style, one-line description in caption Violet Grey, and a compact Primary Pill Button. Hover: lift 4px, shadow-card, image scales to 1.04. Grid: 1 column mobile, 2 tablet, 3–4 desktop.

### Information Tile
**Role:** "How it works", in-clinic vs mobile call-out options, contact details

White background, 28px radius, 1px Violet 200 border, 32px padding. Small Violet 100 circular badge with a simple monochrome line icon in Violet 600, then a card-title heading and body copy.

### Availability Badge
**Role:** Small status labels ("Mobile call-out available", "Consultation required")

Pill shape, 6px 12px padding, Inter 500 13px. Default: Violet 100 background with Violet 600 text. Availability variant: Violet 700 text on Violet 100.

### Text Input
**Role:** Booking and contact forms

White fill, 1px Violet 200 border, 9999px radius for single-line inputs (16px for text areas), 14px 20px padding, Violet 950 text, Violet Grey placeholder. Focus: Violet 600 border plus a 3px Violet 100 ring.

### Booking Sheet
**Role:** The booking preview (`booking.js`)

A Porcelain card (28px radius, max 720px wide) over a 42% Violet 950 backdrop on laptops; the whole screen on phones. A small Violet 100 "PREVIEW" pill above the title, three numbered steps (current: Violet 600; done: Violet 100 tick), then choice tiles (White, 16px radius, 1px border; chosen: Violet 100 with a Violet 600 border), a White month calendar (chosen day: a Violet 600 circle; today: a dot), pill time slots (taken: struck through and faded), Text Inputs, and a footer with Back (Secondary) and Continue (Primary, Violet 200 while not ready). The confirmation has a Pro Green tick on Pro Tint and a Violet 100 note that it is a preview.

### Corner Buttons (WhatsApp and Speak to a doctor)
**Role:** Contact, every page

Fixed bottom right, stacked 12px apart: WhatsApp, a green `#13803F` pill (darker than WhatsApp's own green so the white label reads at 5:1), above "Speak to a doctor", a Violet 600 pill, each with a white icon and its label on laptops; 52px circles with the icon alone on phones (on the home page, they fade in once you scroll past the hero). They lift above a treatment page's Book bar; the glossary's "Back to top" moves to the left.

### Chat Assistant
**Role:** "Speak to a doctor" (`chat.js`)

A 400px Porcelain panel (28px radius) in the bottom right corner on laptops; the whole screen on phones. Header: a Violet 600 avatar with a speech bubble and medical cross, "Speak to a doctor", "Doctor-led care" and a Violet 100 "PREVIEW" pill. Messages: the assistant's in White bubbles with a Violet 200 border, theirs in Violet 600; notes (emergencies, preview) in Violet 100. Suggestions are White pills with a Violet 600 border, right-aligned above a pill text box and a round Violet 600 send button. Three dots while it "types" (with reduced motion, no dots and no pause).

### Policy Page
**Role:** Privacy, terms, cancellations and refunds, cookies, accessibility

A single 46rem column on Violet 50: the page title (as a treatment page's), "Last updated" in Violet Grey, a Violet 100 "Draft" note until the clinic's details are in, a Porcelain "On this page" box of links, then the text at 17px/1.6 with 24px semibold section headings. The business's details sit in a Porcelain list. Anything still to be filled in is highlighted in pale yellow `#FCEFC7`.

### Footer
**Role:** Closing band

Violet 950 `#24124D` background with Porcelain text, links in Porcelain at 70% opacity, and the line "All treatments are subject to a medical consultation., then a row of links to the five policy pages and the business's legal details (name, company number, registered office, ICO and CQC numbers) in 14px.

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
- **Reduced motion:** when `prefers-reduced-motion: reduce` is set, nothing moves by itself: every treatment shows its finished picture, and its button plays the video on request.

## Do's and Don'ts

### Do
- Use Violet 50 `#F6F3FE` as the default background.
- Use Violet 950 `#24124D` for all headlines and body text; Violet Grey `#514A66` for secondary text.
- Use Violet 600 `#6A3BD3` for actions, links, the line drawings and small highlights, and only shades of the same violet for everything else (see the colour table).
- Give floating treatment images a soft, natural shadow so they sit on the page: `filter: drop-shadow(0 30px 40px rgba(36, 18, 77, 0.12))`.
- Use 28px radius on cards and tiles and fully rounded pill buttons.
- Keep generous white space around every treatment image.
- Keep all copy calm, factual and reassuring.

### Don't
- Do not use black backgrounds; the dark surfaces (the hero, "How it works", the footer) are deep violet.
- Do not use pure white `#FFFFFF` as the page background; it reads as sterile. White is for cards only.
- Do not use neon, glows or heavy textures; the hero's violet gradient is the only gradient.
- Do not use any colour that isn't a shade of the violet, except WhatsApp's green on its own button, red for an error and yellow to mark a gap for the clinic to fill.
- Do not use square-cornered buttons.
- Do not use stock "smiling at camera" photography or before/after imagery.
- Do not state or imply that treatments cure, treat, prevent, detox, boost immunity, reverse ageing or grow hair (UK ASA/CAP rules for IV therapy).

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Violet 50 | `#F6F3FE` | Default page background, treatment pages |
| 1 | Porcelain | `#FAF9FE` | Alternate light surfaces and panels |
| 2 | Violet 100 to the deepest band | `#EDE7FD` … `#D3C3F9` | The featured treatments' bands, image wells in cards, the booking panel |
| 3 | White Tile | `#FFFFFF` | Cards, information tiles, inputs, the header |
| 4 | Deep violet | `#4A2696`, `#24124D` | The hero, "How it works", the footer |

## Elevation

Depth is soft and natural, like objects resting in daylight.

| Name | Value | Use |
|------|-------|-----|
| shadow-card | `0 1px 2px rgba(21,34,56,0.04), 0 8px 24px rgba(21,34,56,0.06)` | Cards on hover, raised tiles |
| shadow-float | `drop-shadow(0 30px 40px rgba(21,34,56,0.12))` | Transparent floating treatment images |

Cards rest flat with a 1px Violet 200 border by default and gain shadow-card only on hover.

## Imagery

Imagery is object-first and bright: each treatment is represented by a single isolated subject — a runner mid-stride, a halved orange with suspended juice, a glossy red blood cell, flowing glossy hair seen from behind, a young green shoot with water droplets — supplied as transparent cut-outs that float on the cream canvas with a soft shadow. Lighting is soft, diffused daylight. Faces are never the focus. Images are the only source of rich colour on the page; the interface stays neutral so they glow against it. No decorative illustrations; icons are simple monochrome line icons in Violet 950 or Violet 600.

## Layout

The page is a vertically sequenced treatment story in blocks of one violet, light and deep. A solid 64px White header (with the Treatments and Studies menus) sits above a centred violet hero that leads with the service being doctor-led (eyebrow, very large headline, one supporting line, Book now and Speak to a doctor, three ticks). The featured treatments follow, one per band, each a shade deeper, joined by one Violet 600 line, with a side list of their names. Next, an "All treatments" grid of White cards on White, their pictures on the same shades. Then "How it works" on a deep violet band, About us (placeholder text until the clinic writes its own, and the two doctors with their GMC numbers), a booking/contact section with a pale violet panel, the studies (three cards and a link to them all), and the Violet 950 footer.

## Agent Prompt Guide

Quick Color Reference:
One violet in shades:
- Violet 50: #F6F3FE — page background
- Porcelain: #FAF9FE — panels
- White: #FFFFFF — cards, tiles, the header, button text on violet
- Violet 100: #EDE7FD — badges, image wells, the hero's Book now
- Violet 200: #DDD1FB — borders and dividers; text on the deep violet
- Violet 300: #C3AEF7 — the hero's ticks and scroll line
- Violet 600: #6A3BD3 — the main violet: buttons, links, focus, line drawings, logo
- Violet 700: #5A2DB8 — hover/pressed
- Violet 800: #4A2696 — everything Pro; "How it works"; text on the bands
- Violet 950: #24124D — all primary text; the footer
- Violet Grey: #514A66 — muted text
- Bands, in turn: #F6F3FE, #EDE7FD, #E5DCFC, #DDD1FB, #D3C3F9

Create a centred hero on a Violet 950 → 800 → 600 gradient with a small Violet 200 uppercase eyebrow, an Inter 600 hero-display headline in White with -0.03em tracking, one body-large Violet 200 line, and a Violet 100 pill "Book now" button with Violet 950 text.
Create a treatment showcase section on the treatment's tint: a short video of the treatment object (playing once it's half in view, with a round pause/play/replay button) on one side; an eyebrow, a treatment-display heading, two calm factual sentences in Violet Grey, and a Violet 600 pill button.
Create an "All treatments" grid of White 28px-radius cards with 1px Violet 200 borders, each with a Violet 100 image well, card title, one-line Violet Grey description and compact Violet 600 "Book" pill; lift 4px with shadow-card on hover.
Create a "How it works" section on a Violet 800 #4A2696 band with two White information tiles, each with a Violet 100 circular icon badge, a card-title heading and body copy.

## Quick Start

### CSS Custom Properties

```css
:root {
  /* Colors: one violet, in shades */
  --color-cream: #F6F3FE;
  --color-porcelain: #FAF9FE;
  --color-white: #FFFFFF;
  --color-sand: #EDE7FD;
  --color-ink: #24124D;
  --color-slate: #514A66;
  --color-mist: #DDD1FB;
  --color-bluebird: #6A3BD3;
  --color-bluebird-deep: #5A2DB8;
  --color-sky: #EDE7FD;
  --color-pro: #4A2696;
  --color-pro-tint: #EDE7FD;
  --color-violet-night: #24124D;
  --color-violet: #4A2696;
  --color-violet-bright: #6A3BD3;
  --color-violet-band: #4A2696;
  --color-lavender: #DDD1FB;
  --color-violet-soft: #C3AEF7;
  --color-pop: #EDE7FD;
  --color-ink-soft: #4A2696;
  --band-1: #F6F3FE;
  --band-2: #EDE7FD;
  --band-3: #E5DCFC;
  --band-4: #DDD1FB;
  --band-5: #D3C3F9;

  /* Typography */
  --font-sans: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

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
  --section-padding: clamp(96px, 12vw, 160px);
  --content-max: 1200px;

  /* Radius */
  --radius-card: 28px;
  --radius-tile: 16px;
  --radius-pill: 9999px;

  /* Elevation */
  --shadow-card: 0 1px 2px rgba(36, 18, 77, 0.04), 0 8px 24px rgba(36, 18, 77, 0.06);
  --shadow-float: drop-shadow(0 30px 40px rgba(36, 18, 77, 0.12));

  /* Motion */
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --duration-fast: 200ms;
  --duration-base: 400ms;
  --duration-slow: 800ms;
}
```
