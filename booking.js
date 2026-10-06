/* ==========================================================================
   Bluebird Wellness: the booking preview (every page)

   Until the clinic has a real online booking system (site-config.js:
   bookingUrl), every Book / Book now button opens this mock booking calendar
   instead, to show how booking will work:
     - the treatment (already chosen when you click Book on a treatment),
     - in clinic (9am–5pm) or a mobile call-out (any time, day or night),
     - the doctor: Dr Nema or Dr Mahdi,
     - a day on the calendar and a time (some times show as taken, as they
       would in a real diary),
     - your details, then a confirmation.
   It is clearly marked as a preview, and nothing is sent or stored anywhere.
   Once bookingUrl is set (and the generator re-run), the Book buttons go to
   the real booking page and this preview switches itself off.

   The treatments come from data/book-list.js, which the generator
   (scripts/build-menu.mjs) writes from data/drips.json, word for word.
   ========================================================================== */

(() => {
  const SITE = window.SITE || {};
  const LIST = window.BOOK_LIST || { drips: [], standalone: [] };

  const BOOKING = {
    doctors: ['Dr Nema', 'Dr Mahdi'],
    clinicHours: [9, 17],   // in clinic: appointments start on the hour from 9:00, the last at 16:00 (ends by 17:00)
    callOutHours: [0, 24],  // mobile call-out: any hour, day or night
    daysAhead: 90,          // how far ahead the calendar goes
    taken: 0.3,             // share of times shown as already taken (made up, but the same each time)
  };

  const esc = (value) =>
    String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const sameDay = (a, b) => a && b && iso(a) === iso(b);
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayName = (d) => DAYS[(d.getDay() + 6) % 7];
  const longDate = (d) => `${dayName(d)} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  const time = (h) => `${pad(h)}:00`;

  // A made-up but steady diary: the same times are "taken" every time you look.
  const isTaken = (day, doctor, hour) => {
    let h = 2166136261;
    for (const c of `${iso(day)}|${doctor}|${hour}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    return ((h >>> 0) % 1000) / 1000 < BOOKING.taken;
  };

  const ICON = {
    close: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M5 5l10 10M15 5 5 15"/></svg>',
    prev: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3 5 8l5 5"/></svg>',
    next: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg>',
    clinic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21V8l8-5 8 5v13"/><path d="M9 21v-6h6v6"/><path d="M12 7.5v4M10 9.5h4"/><path d="M2.5 21h19"/></svg>',
    callOut: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  };

  // A Book link opens the preview while it points at the home page's booking
  // section (no real booking page yet).
  const isPreviewLink = (a) => {
    if (SITE.bookingUrl) return false;
    try {
      const url = new URL(a.getAttribute('href') || '#book', location.href);
      return url.hash === '#book' && url.origin === location.origin;
    } catch (e) { return false; }
  };

  const state = {};
  let dialog = null;

  const treatmentOptions = () => {
    const group = (label, items) => (items.length ? `<optgroup label="${esc(label)}">${items.map((t) =>
      `<option value="${esc(t.name)}">${esc(t.name)} · ${esc(t.price)}</option>`).join('')}</optgroup>` : '');
    return `<option value="">Choose a treatment</option>${group('IV drips', LIST.drips)}${group('Boosters', LIST.standalone)}`;
  };

  function build() {
    const el = document.createElement('div');
    el.className = 'booking';
    el.id = 'booking';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'booking-title');
    el.hidden = true;
    el.innerHTML = `
      <div class="booking__panel">
        <div class="booking__head">
          <div>
            <p class="booking__preview">Preview</p>
            <h2 class="booking__title" id="booking-title">Book an appointment</h2>
          </div>
          <button type="button" class="booking__close" data-close aria-label="Close">${ICON.close}</button>
        </div>
        <ol class="booking__steps" aria-label="Steps">
          <li data-step-dot="1">Appointment</li>
          <li data-step-dot="2">Your details</li>
          <li data-step-dot="3">Confirmed</li>
        </ol>
        <div class="booking__body">
          <div class="booking__step" data-step="1">
            <div class="booking__field">
              <label class="booking__label" for="booking-treatment">Treatment</label>
              <select class="booking__select" id="booking-treatment">${treatmentOptions()}</select>
            </div>
            <fieldset class="booking__field">
              <legend class="booking__label">Where</legend>
              <div class="booking__choices booking__choices--two">
                <button type="button" class="booking__choice" data-where="clinic" aria-pressed="false">
                  <span class="booking__choice-icon">${ICON.clinic}</span>
                  <span><span class="booking__choice-title">In clinic</span><span class="booking__choice-note">Bluebird Dentists, near Westfield · 9am to 5pm</span></span>
                </button>
                <button type="button" class="booking__choice" data-where="callout" aria-pressed="false">
                  <span class="booking__choice-icon">${ICON.callOut}</span>
                  <span><span class="booking__choice-title">Mobile call-out</span><span class="booking__choice-note">Your home, hotel or office · any time, day or night</span></span>
                </button>
              </div>
            </fieldset>
            <fieldset class="booking__field">
              <legend class="booking__label">Doctor</legend>
              <div class="booking__choices booking__choices--two">${BOOKING.doctors.map((d) => `
                <button type="button" class="booking__choice booking__choice--doctor" data-doctor="${esc(d)}" aria-pressed="false">
                  <span class="booking__avatar" aria-hidden="true">${esc(d.replace(/^Dr\s+/, '').charAt(0))}</span>
                  <span class="booking__choice-title">${esc(d)}</span>
                </button>`).join('')}
              </div>
            </fieldset>
            <fieldset class="booking__field">
              <legend class="booking__label">Day</legend>
              <div class="booking__calendar" data-calendar></div>
            </fieldset>
            <fieldset class="booking__field">
              <legend class="booking__label">Time</legend>
              <div class="booking__times" data-times></div>
            </fieldset>
          </div>

          <form class="booking__step" data-step="2" novalidate hidden>
            <p class="booking__summary" data-summary></p>
            <div class="booking__grid">
              <div class="booking__field">
                <label class="booking__label" for="booking-name">Full name</label>
                <input class="booking__input" id="booking-name" name="name" autocomplete="name" required>
              </div>
              <div class="booking__field">
                <label class="booking__label" for="booking-phone">Phone</label>
                <input class="booking__input" id="booking-phone" name="phone" type="tel" autocomplete="tel" required>
              </div>
              <div class="booking__field booking__field--wide">
                <label class="booking__label" for="booking-email">Email</label>
                <input class="booking__input" id="booking-email" name="email" type="email" autocomplete="email" required>
              </div>
              <div class="booking__field booking__field--wide" data-address hidden>
                <label class="booking__label" for="booking-address">Address for the call-out</label>
                <input class="booking__input" id="booking-address" name="address" autocomplete="street-address">
              </div>
              <div class="booking__field booking__field--wide">
                <label class="booking__label" for="booking-notes">Anything we should know? <span class="booking__optional">(optional)</span></label>
                <textarea class="booking__input booking__textarea" id="booking-notes" name="notes" rows="3"></textarea>
              </div>
            </div>
            <p class="booking__note">All treatments are subject to a medical consultation.</p>
            <p class="booking__error" data-error role="alert" hidden></p>
          </form>

          <div class="booking__step booking__done" data-step="3" hidden>
            <span class="booking__tick">${ICON.check}</span>
            <h3 class="booking__done-title">Appointment requested</h3>
            <p class="booking__done-summary" data-done-summary></p>
            <p class="booking__preview-note">This is a preview of the booking system. No appointment has been made and nothing has been sent.</p>
          </div>
        </div>
        <div class="booking__foot">
          <button type="button" class="btn btn--secondary" data-back hidden>Back</button>
          <button type="button" class="btn btn--primary" data-next disabled>Continue</button>
        </div>
      </div>`;
    document.body.appendChild(el);

    const q = (s) => el.querySelector(s);
    const parts = {
      treatment: q('#booking-treatment'),
      calendar: q('[data-calendar]'),
      times: q('[data-times]'),
      summary: q('[data-summary]'),
      address: q('[data-address]'),
      error: q('[data-error]'),
      doneSummary: q('[data-done-summary]'),
      back: q('[data-back]'),
      next: q('[data-next]'),
      body: q('.booking__body'),
    };

    parts.treatment.addEventListener('change', () => { state.treatment = parts.treatment.value; update(); });
    el.addEventListener('click', (event) => {
      const where = event.target.closest('[data-where]');
      const doctor = event.target.closest('[data-doctor]');
      const day = event.target.closest('[data-day]');
      const month = event.target.closest('[data-month]');
      const hour = event.target.closest('[data-hour]');
      if (where) { state.where = where.dataset.where; state.hour = null; update(); }
      else if (doctor) { state.doctor = doctor.dataset.doctor; state.hour = null; update(); }
      else if (day && !day.disabled) { state.day = new Date(`${day.dataset.day}T00:00`); state.hour = null; update(); }
      else if (month) { state.month += Number(month.dataset.month); update(); }
      else if (hour && !hour.disabled) { state.hour = Number(hour.dataset.hour); update(); }
    });
    // Enter in the details form: the same as Request appointment (nothing is sent anywhere).
    const details = q('form[data-step="2"]');
    details.addEventListener('submit', (event) => { event.preventDefault(); parts.next.click(); });
    details.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && event.target.matches('input')) { event.preventDefault(); parts.next.click(); }
    });
    parts.back.addEventListener('click', () => { state.step = Math.max(1, state.step - 1); update(); parts.body.scrollTop = 0; });
    parts.next.addEventListener('click', () => {
      if (state.step === 1) { state.step = 2; update(); parts.body.scrollTop = 0; q('#booking-name').focus(); return; }
      if (state.step === 2) {
        const form = q('form[data-step="2"]');
        const missing = [...form.querySelectorAll('[required]')].filter((i) => !i.value.trim() || (i.type === 'email' && !/^\S+@\S+\.\S+$/.test(i.value.trim())));
        if (missing.length) {
          parts.error.textContent = 'Please fill in your name, phone and a valid email.';
          parts.error.hidden = false;
          missing[0].focus();
          return;
        }
        parts.error.hidden = true;
        state.step = 3;
        update();
        parts.body.scrollTop = 0;
        parts.next.focus();
        return;
      }
      window.SiteDialog && window.SiteDialog.close();
    });

    function calendarHTML() {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const last = new Date(today); last.setDate(last.getDate() + BOOKING.daysAhead);
      const first = new Date(today.getFullYear(), today.getMonth() + state.month, 1);
      const lead = (first.getDay() + 6) % 7;
      const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
      const cells = [];
      for (let k = 0; k < lead; k++) cells.push('<span class="booking__day booking__day--blank" aria-hidden="true"></span>');
      for (let n = 1; n <= days; n++) {
        const d = new Date(first.getFullYear(), first.getMonth(), n);
        const off = d < today || d > last;
        const chosen = sameDay(d, state.day);
        cells.push(`<button type="button" class="booking__day${sameDay(d, today) ? ' is-today' : ''}${chosen ? ' is-chosen' : ''}" data-day="${iso(d)}" aria-label="${esc(longDate(d))}" aria-pressed="${chosen}"${off ? ' disabled' : ''}>${n}</button>`);
      }
      const canPrev = state.month > 0;
      const canNext = new Date(first.getFullYear(), first.getMonth() + 1, 1) <= last;
      return `
        <div class="booking__month">
          <button type="button" class="booking__arrow" data-month="-1" aria-label="Previous month"${canPrev ? '' : ' disabled'}>${ICON.prev}</button>
          <p class="booking__month-name" aria-live="polite">${MONTHS[first.getMonth()]} ${first.getFullYear()}</p>
          <button type="button" class="booking__arrow" data-month="1" aria-label="Next month"${canNext ? '' : ' disabled'}>${ICON.next}</button>
        </div>
        <div class="booking__weekdays" aria-hidden="true">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((w) => `<span>${w}</span>`).join('')}</div>
        <div class="booking__days">${cells.join('')}</div>`;
    }

    function timesHTML() {
      if (!state.where || !state.doctor || !state.day) {
        return `<p class="booking__hint">${!state.where ? 'Choose in clinic or a call-out' : !state.doctor ? 'Choose a doctor' : 'Choose a day'} to see the times available.</p>`;
      }
      const [from, to] = state.where === 'clinic' ? BOOKING.clinicHours : BOOKING.callOutHours;
      const now = new Date();
      const buttons = [];
      // One-hour appointments, on the hour: in clinic the last starts at 16:00.
      for (let h = from; h < to; h++) {
        const start = new Date(state.day); start.setHours(h, 0, 0, 0);
        const past = start <= now;
        const taken = isTaken(state.day, state.doctor, h);
        const off = past || taken;
        const chosen = state.hour === h;
        buttons.push(`<button type="button" class="booking__time${chosen ? ' is-chosen' : ''}" data-hour="${h}" aria-pressed="${chosen}"${off ? ' disabled' : ''}${off ? ` aria-label="${time(h)}, ${past ? 'past' : 'taken'}"` : ''}>${time(h)}</button>`);
      }
      const hours = state.where === 'clinic' ? 'In clinic, 9am to 5pm' : 'Call-outs, any time of day or night';
      return `<p class="booking__hint">${esc(hours)} · ${esc(state.doctor)} · ${esc(longDate(state.day))}</p><div class="booking__time-grid">${buttons.join('')}</div>`;
    }

    function update() {
      el.querySelectorAll('[data-step]').forEach((s) => { s.hidden = Number(s.dataset.step) !== state.step; });
      el.querySelectorAll('[data-step-dot]').forEach((s) => {
        const n = Number(s.dataset.stepDot);
        s.classList.toggle('is-current', n === state.step);
        s.classList.toggle('is-done', n < state.step);
        if (n === state.step) s.setAttribute('aria-current', 'step'); else s.removeAttribute('aria-current');
      });
      parts.treatment.value = state.treatment || '';
      el.querySelectorAll('[data-where]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.where === state.where)));
      el.querySelectorAll('[data-doctor]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.doctor === state.doctor)));
      parts.calendar.innerHTML = calendarHTML();
      parts.times.innerHTML = timesHTML();
      parts.address.hidden = state.where !== 'callout';
      q('#booking-address').required = state.where === 'callout';
      const ready = state.treatment && state.where && state.doctor && state.day && state.hour !== null && state.hour !== undefined;
      const when = ready ? `${longDate(state.day)} at ${time(state.hour)}` : '';
      const place = state.where === 'clinic' ? 'in clinic' : 'as a mobile call-out';
      if (ready) parts.summary.textContent = `${state.treatment} · ${when} · ${state.doctor} · ${place}`;
      if (state.step === 3) parts.doneSummary.textContent = `${state.treatment} with ${state.doctor}, ${place}, on ${when}.`;
      parts.back.hidden = state.step !== 2;
      parts.next.disabled = state.step === 1 && !ready;
      parts.next.textContent = state.step === 1 ? 'Continue' : state.step === 2 ? 'Request appointment' : 'Done';
    }

    return { el, update };
  }

  function openBooking({ item = '', where = '' } = {}, opener) {
    if (!window.SiteDialog) return false;
    if (!dialog) dialog = build();
    const known = [...LIST.drips, ...LIST.standalone].some((t) => t.name === item);
    Object.assign(state, { step: 1, treatment: known ? item : '', where: where || null, doctor: null, day: null, hour: null, month: 0 });
    dialog.el.querySelectorAll('form input, form textarea').forEach((i) => { i.value = ''; });
    dialog.update();
    window.SiteDialog.open(dialog.el, { returnFocus: opener, initialFocus: dialog.el.querySelector('.booking__close') });
    dialog.el.querySelector('.booking__body').scrollTop = 0;
    return true;
  }

  // Every Book / Book now button. In the capture phase, so it comes before
  // the home page's own in-page link handling.
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[data-book]');
    if (!link || !isPreviewLink(link)) return;
    // A treatment page's Book buttons choose its treatment (data-book-item on the button, or on the page).
    const item = link.dataset.bookItem || document.body.dataset.bookItem || '';
    const opened = openBooking({ item, where: link.dataset.bookWhere || '' }, link);
    if (opened) { event.preventDefault(); event.stopPropagation(); }
  }, true);

  // The booking section's own buttons, hidden while there is no booking page, open the preview.
  if (!SITE.bookingUrl) document.querySelectorAll('a[data-book="here"][hidden]').forEach((a) => { a.hidden = false; });
})();
