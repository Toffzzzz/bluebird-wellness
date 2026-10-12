# Credits and licences

Where everything on the website comes from, and the terms it's used under.

## Font

- **Source Sans 3**, by Paul D. Hunt for Adobe. Licensed under the SIL Open Font License 1.1, with Reserved Font Name 'Source'; the licence is in `fonts/SourceSans3-LICENSE.md`, which must stay alongside the font file. `fonts/SourceSans3VF-Upright.ttf.woff2` is the official, unmodified variable web font from Adobe's release (https://github.com/adobe-fonts/source-sans), served from the website itself. (Because of the Reserved Font Name, it must not be subset or otherwise modified under its own name.)

## Logo

- The bird logo (`images/logo/`) is Bluebird Wellness's own, drawn for the business.

## Pictures and animations

- The treatment pictures and the layer images the animations are made from (`images/`, including `images/treatments/`) were generated with OpenAI's ChatGPT image generation from prompts written for this website. Under OpenAI's terms of use, OpenAI assigns its rights in the output to the user who generated it. They show no real people or brands.
- The treatment videos in `images/treatment-videos/` were rendered from those pictures by the site's own code (`scripts/render-videos/`).
- The photos in `images/team/`, `images/clinic/`, `images/how/`, `images/steps/` and `images/book/` (including the home page's opening photo, `images/clinic/treatment-room.jpg`) are placeholders, generated with OpenAI's ChatGPT image generation from prompts written for this website (cropped, given a light film grade and compressed for the site). Under OpenAI's terms of use, OpenAI assigns its rights in the output to the user who generated it. They show invented people, not the clinic's doctors or patients, nor the clinic itself, and each is marked "Placeholder" on the site. They must be replaced by real photos before launch (see `COMPLIANCE.md`).

## Line drawings

- The treatments' line drawings (`data/line-art.js`) were drawn for this website, as code, by `scripts/line-art/make-line-art.py`. The Signature drawing uses the Bluebird logo, with its strokes made thinner by `scripts/line-art/thin-logo.py`.
- Their watercolour washes (`images/washes/`) were painted for this website, as code, by `scripts/line-art/paint-washes.mjs`.
- Eight of them (Hydration's coconut, Energy's runner, Muscle & Fitness's deadlift, Detox's glass of water, Immunity's oranges, Recovery's sunrise, Beauty & Glow's face and Hair & Scalp's woman with wavy hair) were traced by `scripts/line-art/trace-drawings.py` from line art generated with OpenAI's ChatGPT image generation from prompts written for this website (kept in `scripts/line-art/sources/`), with small details such as creases left out. Under OpenAI's terms of use, OpenAI assigns its rights in the output to the user who generated it. They show no real people or brands.

## Icons

- The small icons (arrows, play and pause, the chat bubble, the calendar and clinic symbols, the check marks) were drawn for this website as inline SVG.
- The WhatsApp button uses a generic chat bubble, not WhatsApp's logo. If WhatsApp's official icon is added (`whatsappIcon` in `site-config.js`), use it as WhatsApp's brand guidelines allow and note it here.

## Code

- No third-party code or libraries are loaded by the website.
