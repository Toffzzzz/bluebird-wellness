/* ==========================================================================
   Bluebird Wellness: the booking link and contact details, in one place.

   Fill these in, then run  node scripts/build-menu.mjs  (it writes them into
   every page's links) and commit what it writes. The home page's treatments
   (script.js) read them here too.

   While a value is empty, its links are hidden (never a link that does
   nothing). While bookingUrl is empty, every "Book" and "Book now" button
   goes to the booking and contact section at the bottom of the home page
   (#book) instead, and the ones inside that section are hidden.
   ========================================================================== */

window.SITE = {
  // The online booking page, e.g. 'https://…'. Every Book / Book now button.
  bookingUrl: '',
  // The clinic's phone number as dialled, e.g. '+44 20 7946 0000'. "Call us".
  phone: '',
  // e.g. 'hello@example.com'. "Email us" and "Ask a question".
  email: '',
  // The WhatsApp number in international form, digits only, e.g. '447700900000'. "WhatsApp".
  whatsapp: '',
  // A Google Maps link to the clinic, e.g. 'https://maps.app.goo.gl/…'. "Get directions".
  mapsUrl: '',
};
