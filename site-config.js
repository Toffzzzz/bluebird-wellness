/* ==========================================================================
   Bluebird Wellness: the booking link and contact details, in one place.

   Fill these in, then run  node scripts/build-menu.mjs  (it writes them into
   every page's links) and commit what it writes. The home page's treatments
   (script.js) read them here too.

   While a value is empty, its links are hidden (never a link that does
   nothing). While bookingUrl is empty, every "Book" and "Book now" button
   opens the booking preview (booking.js: a mock booking calendar, clearly
   marked as a preview, that sends nothing). Once bookingUrl is set, they go
   to the real booking page and the preview switches itself off.

   The round contact button in the corner of every page (chat.js) opens a
   small menu: "WhatsApp us" opens a chat with the whatsapp number (until it
   is set, it says the number is coming soon), and "Speak to a doctor" opens
   the chat assistant, a preview that asks what they're looking for and
   their details, and sends nothing.
   ========================================================================== */

window.SITE = {
  // The online booking page, e.g. 'https://…'. Every Book / Book now button.
  bookingUrl: '',
  // The clinic's phone number as dialled, e.g. '+44 20 7946 0000'. "Call us".
  phone: '',
  // e.g. 'hello@example.com'. "Email us" and "Ask a question".
  email: '',
  // The WhatsApp number in international form, digits only, e.g. '447700900000'.
  // "WhatsApp" in the contact section, and "WhatsApp us" in the contact button's menu.
  whatsapp: '',
  // Optional: an icon for "WhatsApp us", e.g. 'images/whatsapp-icon.svg'
  // (the official one from WhatsApp's brand resources). Empty: a speech bubble.
  whatsappIcon: '',
  // The chat assistant ("Speak to a doctor", a preview that sends nothing).
  // false hides it everywhere (no need to re-run the generator for this one).
  chatAssistant: true,
  // A Google Maps link to the clinic, e.g. 'https://maps.app.goo.gl/…'. "Get directions".
  mapsUrl: '',

  // The site's pictures: 'lines' (the line drawings: drawn down the home
  // page as you scroll, and on the cards and treatment pages) or 'photos'
  // (the animated videos and photographic pictures). Run the generator after
  // changing it.
  pictures: 'lines',

  // The treatments the home page's line draws as you scroll (or, with
  // 'photos', the ones shown as videos), in this order. Use the ids from
  // TREATMENTS in script.js: hydration, energy, myers, iron, muscle-recovery,
  // nad, detox, immunity, recovery, vitamin-d, longevity, skin, hair,
  // signature. Every drip still has its card under "All treatments" and its
  // own page. Leave the list empty ([]) to show all of them. Run the
  // generator after changing it (it checks the ids).
  featured: ['iron', 'skin', 'hair', 'hydration', 'muscle-recovery', 'signature'],

  // The site's address, ending in /. Used for link previews (when the site is
  // shared on WhatsApp, iMessage, social media), the 404 page and, once
  // launched, the sitemap for search engines.
  siteUrl: 'https://toffzzzz.github.io/bluebird-wellness/',

  // false while the site is a preview: every page asks search engines not to
  // list it. Set to true at launch (after the compliance review, with the
  // business details filled in), then run the generator: it lifts that and
  // writes robots.txt and sitemap.xml.
  launched: false,

  // false (normal): anything still unfinished is hidden. true: show the gaps highlighted, to see what's missing.
  // Hidden while false: the About section's missing parts (each shows by itself
  // once filled in below), and every policy page with a gap left in it (privacy/,
  // terms/, …: its links disappear and its address shows "This page is being
  // finalised"; it comes back, with its links, once its gaps are filled in).
  // Run the generator after changing it.
  showUnfinished: false,

  /* ---------- The business and its policies ----------
     Shown in every page's footer and in the policy pages (privacy/, terms/,
     cancellations/, cookies/, accessibility/, complaints/, faq/). The law says
     a business website must show who runs it. Until a value is filled in, its
     policy pages stay hidden (or, with showUnfinished: true, show a
     highlighted gap where it goes). Run the generator after changing these. */

  // The business's full legal name, e.g. 'Bluebird Wellness Ltd'.
  legalName: '',
  // Companies House number, if it is a limited company.
  companyNumber: '',
  // Where the company is registered (shown with the company number).
  registeredIn: 'England and Wales',
  // Registered office address (for a limited company), or the business address.
  registeredOffice: '',
  // The clinic's full address, e.g. 'Bluebird Dentists, 1 Example Road, London W12 0AA'.
  clinicAddress: '',
  // VAT number, if VAT-registered.
  vatNumber: '',
  // ICO data protection registration number (every business handling personal data pays the ICO's fee).
  icoNumber: '',
  // Care Quality Commission provider or location ID, if registered with the CQC.
  cqcNumber: '',
  // The online booking system's provider, e.g. 'Semble' (named in the privacy policy).
  bookingProvider: '',
  // An extra charge for mobile call-outs, e.g. '£50'. Shown wherever call-outs are offered. Empty: none shown.
  callOutFee: '',
  // How much notice to cancel or move an appointment, e.g. '24 hours'.
  cancellationNotice: '',
  // What a late cancellation or missed appointment costs, e.g. '50% of the treatment price'.
  cancellationFee: '',
  // The minimum age for treatment (booking and the chat ask people to confirm it).
  minimumAge: '18',
  // The date the policies were last changed, as shown on them.
  policiesUpdated: '6 October 2026',
  // true: each policy page says it is a draft awaiting the clinic's details and a compliance review.
  legalDraft: true,

  /* ---------- About us: the clinic's words, the doctors, the photos ----------
     Written into the home page by the generator: run it after changing these. */

  // About us: the clinic's own paragraphs, each a string. Empty: only the first (finished) paragraph shows.
  aboutParagraphs: [],

  // The doctors. role, intro and gmc each show once filled in. The photo shows once its file is in images/team/.
  // gmc: the doctor's GMC (General Medical Council) number, linked to their
  // entry on the medical register so patients can check it.
  // Photos: portrait, 4:5, 800 × 1000 px, JPEG, under 250 KB (see README.md).
  doctors: [
    { name: 'Dr Nema', role: '', intro: '', gmc: '', photo: 'images/team/dr-nema.jpg', photoAlt: 'Dr Nema' },
    { name: 'Dr Mahdi', role: '', intro: '', gmc: '', photo: 'images/team/dr-mahdi.jpg', photoAlt: 'Dr Mahdi' },
  ],

  // Photos of the clinic: each shows once its file is in images/clinic/. None there yet: the gallery is hidden.
  // Landscape, 4:3, 1600 × 1200 px, JPEG, under 400 KB each. Real photos only.
  clinicPhotos: [
    { file: 'images/clinic/treatment-room.jpg', alt: 'A treatment room at Bluebird Wellness' },
    { file: 'images/clinic/treatment-chair.jpg', alt: 'The treatment chair' },
    { file: 'images/clinic/drip-preparation.jpg', alt: 'A drip being prepared' },
    { file: 'images/clinic/entrance.jpg', alt: 'The entrance to Bluebird Dentists' },
    { file: 'images/clinic/reception.jpg', alt: 'Reception' },
  ],

  // The Care Quality Commission. Once the clinic is rated, the law requires
  // the rating on the website: fill in the rating (e.g. 'Good'), the date of
  // the report (e.g. '3 March 2027') and the link to the report on cqc.org.uk.
  // About us shows the CQC line once the rating is filled in.
  cqcRating: '',
  cqcRatingDate: '',
  cqcReportUrl: '',

  // false until the clinic's doctors have reviewed the studies (studies/):
  // each study shows a "Draft: awaiting review" note until then.
  studiesReviewed: false,
};
