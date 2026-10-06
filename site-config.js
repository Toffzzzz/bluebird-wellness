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
};
