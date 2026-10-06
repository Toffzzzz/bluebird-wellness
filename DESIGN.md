# Bluebird Wellness — Style Reference
> Calm clinical light. Build screens as a sequence of bright, spacious cream galleries where large, confident Inter headlines frame a single floating treatment object, generous white space, and one carefully rationed bluebird blue.

**Theme:** light

Bluebird Wellness is an IV drip clinic based at Bluebird Dentists near Westfield, London, offering treatments in clinic and as a mobile call-out service. The site must feel **safe, clean, calm and premium** — the reassurance of a good clinic with the polish of a high-end product launch. Each treatment is staged as an isolated, softly shadowed object (a runner, a halved orange, a red blood cell, flowing hair, a young plant) floating on warm cream, with oversized navy display type and colour withheld until it signals an action. Structure and rhythm are borrowed from premium product-launch pages — long cinematic sections, big type, rounded tiles — but the palette is light and warm, never dark or techy.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Cream Canvas | `#F7F4EF` | `--color-cream` | Default page background; the canvas every treatment object floats on |
| Porcelain | `#FBFAF7` | `--color-porcelain` | Alternate light section bands, header background when scrolled |
| White | `#FFFFFF` | `--color-white` | Cards, information tiles, button text on blue |
| Sand | `#EFE9E0` | `--color-sand` | Subtle contrast bands (e.g. "How it works"), card hover fill, image placeholders |
| Ink Navy | `#152238` | `--color-ink` | Primary headlines and body copy on all light surfaces; footer background |
| Slate | `#5B6472` | `--color-slate` | Muted body copy, captions, secondary labels |
| Mist | `#D9D4CB` | `--color-mist` | 1px dividers, card and input borders |
| Bluebird Blue | `#2458C6` | `--color-bluebird` | The single accent: filled primary buttons, links, focus rings, small highlights |
| Deep Bluebird | `#1C47A3` | `--color-bluebird-deep` | Hover and pressed state for Bluebird Blue buttons and links |
| Sky Tint | `#E8EFFB` | `--color-sky` | Soft blue badge backgrounds, selected chips, gentle highlight washes |
| Sage | `#4E6B58` | `--color-sage` | Rare, quiet secondary accent for availability labels such as "Mobile service available" |
| Pro Green | `#17633F` | `--color-pro` | Everything Pro: the "PRO" badge (White on Pro Green, 7.3:1), the "PRO" tag on a Pro card's picture, a Pro card's edge, and "Upgrade to Pro" links (Pro Green on Pro Tint `#E8F4EC`, 6.4:1) |

All text/background pairs above meet WCAG AA contrast (Ink on Cream 14.5:1, Slate on Cream 5.5:1, White on Bluebird Blue 6.4:1, Bluebird Blue on Cream 5.8:1).

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

Centred on Cream Canvas: a Slate eyebrow ("IV drip clinic · London"), the headline "Doctor-led IV drips." (Inter 600, hero size, a non-breaking hyphen so it never splits), a Slate lead line, Book now (Primary) and Speak to a doctor (Secondary), three ticks in Pro Green with Ink Navy 14px labels, and the medical-consultation note.

### Site Header
**Role:** Sitewide navigation, 64px tall

Solid Porcelain `#FBFAF7` background (no translucency or backdrop blur: a blur has to be redrawn on every frame while the page scrolls beneath it). "Bluebird Wellness" wordmark on the left in Inter 600, 18px, Ink Navy. Nav links in Inter 500, 15px, Slate, turning Ink Navy on hover. A compact Primary Pill Button ("Book now") on the right. A 1px Mist bottom border appears only once the page has scrolled.

### Primary Pill Button
**Role:** Main call to action ("Book now", "Book")

Bluebird Blue `#2458C6` fill, White text, Inter 500 15px, 9999px radius, padding 14px 28px (compact version: 10px 20px). Hover: Deep Bluebird `#1C47A3` and a 1px upward lift. Visible focus ring: 3px Sky Tint outline plus 2px Bluebird Blue offset.

### Secondary Pill Button
**Role:** Lower-priority actions ("Learn more", "See all treatments")

Transparent fill, Ink Navy text, 1px Ink Navy border at 20% opacity, 9999px radius, same padding as primary. Hover: Sand fill.

### Treatment Showcase Section
**Role:** One section per featured treatment, with a short video of its animation

On its treatment's tint. Split layout on desktop: the text column on the left, the video on the right. On laptops the scroll drives the video as the section moves up the screen (nothing is pinned); on phones the video sits above the text and plays by itself when half of it is in view, with a round pause / play / replay button in its corner. A slim bar of the treatments' names sticks under the header while the sections are on screen, with a dark Next pill on its right. Text column: eyebrow ("IV therapy" in Slate, uppercase), treatment name in treatment-display size, 1–2 sentence description in body-large Slate, then a Primary Pill Button. On mobile, stack image above text and reduce image size so the headline stays visible.

### Treatment Card
**Role:** One treatment in the "All treatments" grid

White `#FFFFFF` background, 28px radius, 1px Mist border, 24–32px padding. A square image area at top (Sand `#EFE9E0` background with 20px radius; transparent treatment image centred inside with soft shadow, or a soft coloured placeholder shape). Card title in card-title style, one-line description in caption Slate, and a compact Primary Pill Button. Hover: lift 4px, shadow-card, image scales to 1.04. Grid: 1 column mobile, 2 tablet, 3–4 desktop.

### Information Tile
**Role:** "How it works", in-clinic vs mobile call-out options, contact details

White background, 28px radius, 1px Mist border, 32px padding. Small Sky Tint circular badge with a simple monochrome line icon in Bluebird Blue, then a card-title heading and body copy.

### Availability Badge
**Role:** Small status labels ("Mobile call-out available", "Consultation required")

Pill shape, 6px 12px padding, Inter 500 13px. Default: Sky Tint background with Bluebird Blue text. Availability variant: Sage text on a 10% Sage tint.

### Text Input
**Role:** Booking and contact forms

White fill, 1px Mist border, 9999px radius for single-line inputs (16px for text areas), 14px 20px padding, Ink Navy text, Slate placeholder. Focus: Bluebird Blue border plus a 3px Sky Tint ring.

### Booking Sheet
**Role:** The booking preview (`booking.js`)

A Porcelain card (28px radius, max 720px wide) over a 42% Ink Navy backdrop on laptops; the whole screen on phones. A small Sand "PREVIEW" pill above the title, three numbered steps (current: Bluebird Blue; done: Sky Tint tick), then choice tiles (White, 16px radius, 1px border; chosen: Sky Tint with a Bluebird Blue border), a White month calendar (chosen day: a Bluebird Blue circle; today: a dot), pill time slots (taken: struck through and faded), Text Inputs, and a footer with Back (Secondary) and Continue (Primary, Mist while not ready). The confirmation has a Pro Green tick on Pro Tint and a Sand note that it is a preview.

### Corner Buttons (WhatsApp and Speak to a doctor)
**Role:** Contact, every page

Fixed bottom right, stacked 12px apart: WhatsApp, a green `#13803F` pill (darker than WhatsApp's own green so the white label reads at 5:1), above "Speak to a doctor", a Bluebird Blue pill, each with a white icon and its label on laptops; 52px circles with the icon alone on phones (on the home page, they fade in once you scroll past the hero). They lift above a treatment page's Book bar; the glossary's "Back to top" moves to the left.

### Chat Assistant
**Role:** "Speak to a doctor" (`chat.js`)

A 400px Porcelain panel (28px radius) in the bottom right corner on laptops; the whole screen on phones. Header: a Bluebird Blue avatar with a speech bubble and medical cross, "Speak to a doctor", "Doctor-led care" and a Sand "PREVIEW" pill. Messages: the assistant's in White bubbles with a Mist border, theirs in Bluebird Blue; notes (emergencies, preview) in Sand. Suggestions are White pills with a Bluebird Blue border, right-aligned above a pill text box and a round Bluebird Blue send button. Three dots while it "types" (with reduced motion, no dots and no pause).

### Footer
**Role:** Closing band

Ink Navy `#152238` background — the only dark surface on the site — with Porcelain text, Slate-on-dark links at 70% opacity, and the line "All treatments are subject to a medical consultation."

## Motion

Motion is **slow, smooth and purposeful** — it should feel like calm breathing, never flashy.

- **Like Apple's product pages:** the page always scrolls natively (no smooth-scroll library, no snapping: it never moves by itself). Each treatment's animation is a short pre-rendered video.
- **Laptops and desktops:** scrolling drives the animation while the page keeps scrolling continuously (nothing is pinned): it starts once the section fills most of the screen and never plays faster than its natural speed. Arriving by a jump, it plays on by itself.
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
- Use Cream Canvas `#F7F4EF` as the default background everywhere except the footer.
- Use Ink Navy `#152238` for all headlines and body text; Slate `#5B6472` for secondary text.
- Reserve Bluebird Blue `#2458C6` for actions, links and small highlights — it should be the only saturated colour in the interface (the treatment images supply all other colour).
- Give floating treatment images a soft, natural shadow so they sit on the page: `filter: drop-shadow(0 30px 40px rgba(21, 34, 56, 0.12))`.
- Use 28px radius on cards and tiles and fully rounded pill buttons.
- Keep generous white space around every treatment image.
- Keep all copy calm, factual and reassuring.

### Don't
- Do not use black or dark backgrounds for main content sections; the footer is the only dark surface.
- Do not use pure white `#FFFFFF` as the page background; it reads as sterile. White is for cards only.
- Do not use gradients, neon, glows or heavy textures.
- Do not use more than one accent colour in the interface; do not introduce reds, oranges or greens as UI colours (those belong to the imagery).
- Do not use square-cornered buttons.
- Do not use stock "smiling at camera" photography or before/after imagery.
- Do not state or imply that treatments cure, treat, prevent, detox, boost immunity, reverse ageing or grow hair (UK ASA/CAP rules for IV therapy).

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Cream Canvas | `#F7F4EF` | Default page background and treatment showcases |
| 1 | Porcelain Band | `#FBFAF7` | Alternate light bands, translucent header |
| 2 | Sand Band | `#EFE9E0` | Gentle contrast sections, image wells in cards |
| 3 | White Tile | `#FFFFFF` | Cards, information tiles, inputs |
| 4 | Ink Footer | `#152238` | Footer only |

## Elevation

Depth is soft and natural, like objects resting in daylight.

| Name | Value | Use |
|------|-------|-----|
| shadow-card | `0 1px 2px rgba(21,34,56,0.04), 0 8px 24px rgba(21,34,56,0.06)` | Cards on hover, raised tiles |
| shadow-float | `drop-shadow(0 30px 40px rgba(21,34,56,0.12))` | Transparent floating treatment images |

Cards rest flat with a 1px Mist border by default and gain shadow-card only on hover.

## Imagery

Imagery is object-first and bright: each treatment is represented by a single isolated subject — a runner mid-stride, a halved orange with suspended juice, a glossy red blood cell, flowing glossy hair seen from behind, a young green shoot with water droplets — supplied as transparent cut-outs that float on the cream canvas with a soft shadow. Lighting is soft, diffused daylight. Faces are never the focus. Images are the only source of rich colour on the page; the interface stays neutral so they glow against it. No decorative illustrations; icons are simple monochrome line icons in Ink Navy or Bluebird Blue.

## Layout

The page is a vertically sequenced treatment story on Cream Canvas. A solid 64px header sits above a calm, centred hero that leads with the service being doctor-led (eyebrow, very large headline, one supporting line, Book now and Speak to a doctor, three ticks). The Treatment Showcase Sections follow, one per featured treatment, each on its tint with a short video of its animation, under a sticky bar of their names. Next, an "All treatments" grid of White cards on a Porcelain or Sand band. Then "How it works" with two Information Tiles side by side (in clinic at Bluebird Dentists near Westfield; mobile call-out to home, hotel or office), a booking/contact section, and the Ink Navy footer. The page stays spacious and image-led throughout.

## Agent Prompt Guide

Quick Color Reference:
- Cream Canvas: #F7F4EF — page background
- Porcelain: #FBFAF7 — alternate bands, the header
- White: #FFFFFF — cards, tiles, button text on blue
- Sand: #EFE9E0 — contrast bands, image wells, hover fills
- Ink Navy: #152238 — all primary text; footer
- Slate: #5B6472 — muted text
- Mist: #D9D4CB — borders and dividers
- Bluebird Blue: #2458C6 — the single accent: buttons, links, focus
- Deep Bluebird: #1C47A3 — hover/pressed
- Sky Tint: #E8EFFB — soft badges and highlights
- Sage: #4E6B58 — rare availability labels
- Pro Green: #17633F — everything Pro (badges, "Upgrade to Pro")

Create a centred hero on Cream Canvas #F7F4EF with a small Slate uppercase eyebrow, an Inter 600 hero-display headline in Ink Navy #152238 with -0.03em tracking, one body-large Slate line, and a Bluebird Blue #2458C6 pill "Book now" button.
Create a treatment showcase section on the treatment's tint: a short video of the treatment object (playing once it's half in view, with a round pause/play/replay button) on one side; an eyebrow, a treatment-display heading, two calm factual sentences in Slate, and a Bluebird Blue pill button.
Create an "All treatments" grid of White 28px-radius cards with 1px Mist borders, each with a Sand image well, card title, one-line Slate description and compact Bluebird Blue "Book" pill; lift 4px with shadow-card on hover.
Create a "How it works" section on a Sand #EFE9E0 band with two White information tiles, each with a Sky Tint circular icon badge, a card-title heading and body copy.

## Quick Start

### CSS Custom Properties

```css
:root {
  /* Colors */
  --color-cream: #F7F4EF;
  --color-porcelain: #FBFAF7;
  --color-white: #FFFFFF;
  --color-sand: #EFE9E0;
  --color-ink: #152238;
  --color-slate: #5B6472;
  --color-mist: #D9D4CB;
  --color-bluebird: #2458C6;
  --color-bluebird-deep: #1C47A3;
  --color-sky: #E8EFFB;
  --color-sage: #4E6B58;

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
  --shadow-card: 0 1px 2px rgba(21, 34, 56, 0.04), 0 8px 24px rgba(21, 34, 56, 0.06);
  --shadow-float: drop-shadow(0 30px 40px rgba(21, 34, 56, 0.12));

  /* Motion */
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --duration-fast: 200ms;
  --duration-base: 400ms;
  --duration-slow: 800ms;
}
```
