# Credits and licences

Where everything on the website comes from, and the terms it's used under.

## Font

- **Inter**, by Rasmus Andersson and the Inter Project Authors, version 4.0. Licensed under the SIL Open Font License 1.1; the licence is in `fonts/LICENSE.txt`, which must stay alongside the font files. The files in `fonts/` are the official, unmodified `Inter-Regular`, `Inter-Medium` and `Inter-SemiBold` web fonts from the Inter release (https://github.com/rsms/inter). They're served from the website itself.

## Logo

- The bird logo (`images/logo/`) is Bluebird Wellness's own, drawn for the business.

## Pictures and animations

- The treatment pictures and the layer images the animations are made from (`images/`, including `images/treatments/`) were generated with OpenAI's ChatGPT image generation from prompts written for this website. Under OpenAI's terms of use, OpenAI assigns its rights in the output to the user who generated it. They show no real people or brands.
- The treatment videos in `images/treatment-videos/` were rendered from those pictures by the site's own code (`scripts/render-videos/`).

## Line drawings

- The treatments' line drawings (`data/line-art.js`) were drawn for this website, as code, by `scripts/line-art/make-line-art.py`. The Signature drawing uses the Bluebird logo, with its strokes made thinner by `scripts/line-art/thin-logo.py`.
- Eight of them (Hydration's coconut, Energy's runner, Muscle & Fitness's deadlift, Detox's glass of water, Immunity's oranges, Recovery's sunrise, Beauty & Glow's face and Hair & Scalp's woman with wavy hair) were traced by `scripts/line-art/trace-drawings.py` from line art generated with OpenAI's ChatGPT image generation from prompts written for this website (kept in `scripts/line-art/sources/`), with small details such as creases left out. Under OpenAI's terms of use, OpenAI assigns its rights in the output to the user who generated it. They show no real people or brands.

## Icons

- The small icons (arrows, play and pause, the chat bubble, the calendar and clinic symbols, the check marks) were drawn for this website as inline SVG.
- The WhatsApp button uses a generic chat bubble, not WhatsApp's logo. If WhatsApp's official icon is added (`whatsappIcon` in `site-config.js`), use it as WhatsApp's brand guidelines allow and note it here.

## Code

- No third-party code or libraries are loaded by the website.
