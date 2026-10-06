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

   The WhatsApp button in the corner of every page opens a chat with the
   whatsapp number; until it is set, it says the number is coming soon.
   "Speak to a doctor" (chat.js) is a chat assistant preview: it asks what
   they're looking for and their details, and sends nothing.
   ========================================================================== */

window.SITE = {
  // The online booking page, e.g. 'https://…'. Every Book / Book now button.
  bookingUrl: '',
  // The clinic's phone number as dialled, e.g. '+44 20 7946 0000'. "Call us".
  phone: '',
  // e.g. 'hello@example.com'. "Email us" and "Ask a question".
  email: '',
  // The WhatsApp number in international form, digits only, e.g. '447700900000'.
  // "WhatsApp" in the contact section, and the WhatsApp button on every page.
  whatsapp: '',
  // Optional: an icon for the WhatsApp button, e.g. 'images/whatsapp-icon.svg'
  // (the official one from WhatsApp's brand resources). Empty: a chat bubble.
  whatsappIcon: '',
  // The chat assistant ("Speak to a doctor", a preview that sends nothing).
  // false hides it everywhere (no need to re-run the generator for this one).
  chatAssistant: true,
  // A Google Maps link to the clinic, e.g. 'https://maps.app.goo.gl/…'. "Get directions".
  mapsUrl: '',

  // The site's pictures: 'lines' (the blue line drawings: drawn down the home
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
  featured: ['iron', 'skin', 'hydration', 'muscle-recovery', 'signature'],

  /* ---------- The business and its policies ----------
     Shown in every page's footer and in the policy pages (privacy/, terms/,
     cancellations/, cookies/, accessibility/). The law says a business
     website must show who runs it. Until a value is filled in, the policy
     pages show a highlighted gap where it goes. Run the generator after
     changing these. */

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
};
