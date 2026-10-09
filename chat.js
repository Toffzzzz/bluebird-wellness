/* ==========================================================================
   Bluebird Wellness: the chat assistant and the contact button (every page)

   1. Chat assistant ("Speak to a doctor"). A short, friendly chat that asks:
        - that they're 18 or over (site-config.js: minimumAge; if not, it stops
          there and keeps nothing),
        - what they're looking for, and a little about what's been going on,
        - any medical conditions, allergies or medicines,
        - their name, phone, email (optional: the doctor phones) and a good
          time to call,
      then sums up, asks for explicit consent to use the health details
      (linking to the privacy policy once it's finished: data/pages.js),
      and says one of the doctors will phone them for a
      telephone consultation within the next 24 hours. It says at the start
      that it isn't for emergencies (999, or 111 for urgent advice).
      It is a preview: it is marked as one, and nothing is sent or stored
      anywhere. Making it live needs a secure way for the answers to reach
      the clinic. site-config.js: chatAssistant: false hides it.
   2. The contact button. One small round button in the bottom right corner
      of every page ("Contact us") opens a small menu just above it:
        - "WhatsApp us" opens a chat with the clinic (site-config.js:
          whatsapp); until the number is filled in, the menu says it's coming
          soon (never a link that does nothing). Its icon is a speech bubble
          until site-config.js: whatsappIcon points at an image;
        - "Speak to a doctor" opens the chat assistant (unless
          chatAssistant is false).
      Escape, a click or tap elsewhere, or choosing an item closes it
      (Escape puts the focus back on the button). The button steps aside
      (fades out, and can't be tapped or focused) over the home page's hero,
      over the footer, while the phones' menu, the booking preview or the
      chat is open, and whenever it would cover anything on the page
      (checked after every scroll and resize); it comes back when the space
      is clear. On a treatment page on phones it sits above the Book bar.
   Anything marked data-chat-open (the home page's "Speak to a doctor"
   button) opens the chat too.
   ========================================================================== */

(() => {
  const SITE = window.SITE || {};
  // The site's root folder, worked out from where this file is (so it also
  // works from the treatment pages and the glossary).
  const ROOT = new URL('.', (document.currentScript && document.currentScript.src) || location.href);
  const CHAT_ON = SITE.chatAssistant !== false;
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const esc = (value) =>
    String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  const ICON = {
    close: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M5 5l10 10M15 5 5 15"/></svg>',
    send: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 16V4M5 9l5-5 5 5"/></svg>',
    // A speech bubble with a medical cross: the chat assistant.
    doctor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-4.5 3.5V17H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M12 7.5v6M9 10.5h6"/></svg>',
    // A round speech bubble: WhatsApp.
    bubble: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-4.2A8 8 0 1 1 20 11.5z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/></svg>',
  };

  // The privacy policy is linked only once it's finished (shown in full: data/pages.js).
  const PRIVACY_SHOWN = !!(window.SITE_PAGES && Array.isArray(window.SITE_PAGES.shown) && window.SITE_PAGES.shown.includes('privacy'));

  /* ---------- 1. The chat assistant ---------- */

  const answers = {};
  const firstName = () => (answers.name || '').trim().split(/\s+/)[0] || '';
  const MIN_AGE = String(SITE.minimumAge || '18');
  const AGE_YES = `Yes, I'm ${MIN_AGE} or over`;
  const AGE_NO = `No, I'm under ${MIN_AGE}`;
  const CONSENT = 'Yes, I agree. Please call me';
  const SKIP = 'Skip';

  // The questions, in order. quick: tap-to-answer suggestions (typing works too).
  // The age comes first, so no health details are asked of anyone too young.
  const STEPS = [
    {
      key: 'age', label: 'Age', summary: false, choiceOnly: true,
      say: () => [`First, are you ${MIN_AGE} or over? Our treatments are for adults only.`],
      quick: [AGE_YES, AGE_NO],
    },
    {
      key: 'need', label: "Looking for",
      say: () => ["What are you looking for today?"],
      quick: ['Low energy or tiredness', 'Recovering from illness', 'Hangover or dehydration', 'Immunity support', 'Skin, hair or beauty', 'Sport and recovery', 'Not sure yet'],
      placeholder: 'Or type it here',
    },
    {
      key: 'story', label: "What's been going on",
      say: () => ["Thanks. Can you tell me a little more about what's been going on, and for how long?"],
      placeholder: 'Type your answer',
    },
    {
      key: 'health', label: 'Conditions, allergies, medicines',
      say: () => ['Do you have any medical conditions or allergies, or take any medicines, that the doctor should know about?'],
      quick: ['None that I know of'],
      placeholder: 'Type your answer',
    },
    {
      key: 'name', label: 'Name',
      say: () => ["Thank you. Now a few details so a doctor can call you. We'll only use them to arrange your consultation.", "What's your full name?"],
      placeholder: 'Full name', autocomplete: 'name',
    },
    {
      key: 'phone', label: 'Phone',
      say: () => [`Thanks, ${firstName()}. What's the best number for the doctor to call you on?`],
      placeholder: 'Phone number', type: 'tel', autocomplete: 'tel',
      check: (v) => (/^[+\d\s().-]+$/.test(v) && v.replace(/\D/g, '').length >= 7) || "That doesn't look like a phone number. Could you check it?",
    },
    {
      key: 'email', label: 'Email', optional: true,
      say: () => ["And your email address, if you'd like us to have it? You can skip this: the doctor will phone you."],
      quick: [SKIP],
      placeholder: 'Email address', type: 'email', autocomplete: 'email',
      check: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "That doesn't look like an email address. Could you check it?",
    },
    {
      key: 'time', label: 'Best time to call',
      say: () => ["When's a good time for the call?"],
      quick: ['Morning', 'Afternoon', 'Evening', 'Any time'],
      placeholder: 'Or type a time',
    },
  ];

  let chat = null;       // the dialog, built the first time it opens
  let step = -1;         // the question being asked (STEPS), or 'confirm' / 'done'
  let busy = false;      // the assistant is "typing"
  let queue = Promise.resolve();

  function build() {
    const el = document.createElement('div');
    el.className = 'chat';
    el.id = 'chat';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'chat-title');
    el.hidden = true;
    el.innerHTML = `
      <div class="chat__panel">
        <div class="chat__head">
          <span class="chat__avatar">${ICON.doctor}</span>
          <div class="chat__heading">
            <h2 class="chat__title" id="chat-title">Speak to a doctor</h2>
            <p class="chat__sub">Doctor-led care <span class="chat__preview">Preview</span></p>
          </div>
          <button type="button" class="chat__close" data-close aria-label="Close">${ICON.close}</button>
        </div>
        <div class="chat__log" role="log" aria-live="polite" tabindex="-1"></div>
        <div class="chat__quick" data-quick></div>
        <form class="chat__form" data-form novalidate>
          <label class="visually-hidden" for="chat-input">Your answer</label>
          <input class="chat__input" id="chat-input" maxlength="500" autocomplete="off" placeholder="Type your answer">
          <button type="submit" class="chat__send" aria-label="Send">${ICON.send}</button>
        </form>
      </div>`;
    document.body.appendChild(el);
    const parts = {
      el,
      panel: el.querySelector('.chat__panel'),
      log: el.querySelector('.chat__log'),
      quick: el.querySelector('[data-quick]'),
      form: el.querySelector('[data-form]'),
      input: el.querySelector('#chat-input'),
    };
    parts.form.addEventListener('submit', (event) => {
      event.preventDefault();
      const text = parts.input.value.trim();
      if (!text || busy) return;
      parts.input.value = '';
      reply(text);
    });
    parts.quick.addEventListener('click', (event) => {
      const chip = event.target.closest('[data-reply]');
      if (chip && !busy) reply(chip.dataset.reply);
    });
    // Phones: keep the chat inside the part of the screen the keyboard leaves.
    if (window.visualViewport) {
      const fit = () => {
        if (el.hidden) return;
        el.style.setProperty('--chat-vh', `${window.visualViewport.height}px`);
        el.style.setProperty('--chat-top', `${window.visualViewport.offsetTop}px`);
        parts.log.scrollTop = parts.log.scrollHeight;
      };
      window.visualViewport.addEventListener('resize', fit);
      window.visualViewport.addEventListener('scroll', fit);
      parts.fit = fit;
    }
    return parts;
  }

  const scrollDown = () => { chat.log.scrollTop = chat.log.scrollHeight; };

  function addMessage(kind, html) {
    const msg = document.createElement('div');
    msg.className = `chat__msg chat__msg--${kind}`;
    msg.innerHTML = html;
    chat.log.appendChild(msg);
    scrollDown();
    return msg;
  }

  // The assistant says each line in turn, with a short "typing" pause before it.
  function say(lines, { note = false } = {}) {
    queue = queue.then(async () => {
      for (const line of lines) {
        busy = true;
        if (!reduceMotion()) {
          // Three dots while it "types" (hidden from screen readers).
          const typing = document.createElement('div');
          typing.className = 'chat__msg chat__msg--bot chat__msg--typing';
          typing.setAttribute('aria-hidden', 'true');
          typing.innerHTML = '<span class="chat__typing"><span></span><span></span><span></span></span>';
          chat.log.appendChild(typing);
          scrollDown();
          await new Promise((r) => setTimeout(r, Math.min(900, 380 + line.length * 6)));
          typing.remove();
        }
        addMessage(note ? 'note' : 'bot', `<p>${esc(line)}</p>`);
      }
      busy = false;
    });
    return queue;
  }

  // What can be done now: tap a suggestion, type, or both.
  function offer({ quick = [], input = null } = {}) {
    queue = queue.then(() => {
      chat.quick.innerHTML = quick.map((q) => `<button type="button" class="chat__chip" data-reply="${esc(q)}">${esc(q)}</button>`).join('');
      chat.quick.hidden = !quick.length;
      chat.form.hidden = !input;
      if (input) {
        chat.input.type = input.type || 'text';
        chat.input.setAttribute('autocomplete', input.autocomplete || 'off');
        chat.input.setAttribute('inputmode', input.type === 'tel' ? 'tel' : input.type === 'email' ? 'email' : 'text');
        chat.input.placeholder = input.placeholder || 'Type your answer';
      }
      focusNext();
    });
  }

  // Laptops: straight into the box. Phones: only when there's nothing to tap
  // (the keyboard would cover the suggestions).
  function focusNext() {
    scrollDown();
    if (chat.el.hidden) return;
    const typing = !chat.form.hidden && (chat.quick.hidden || window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    const target = typing ? chat.input : chat.quick.querySelector('button') || chat.el.querySelector('.chat__close');
    if (target) target.focus({ preventScroll: true });
  }

  function ask() {
    const s = STEPS[step];
    say(s.say());
    offer({ quick: s.quick, input: s.choiceOnly ? null : s });
  }

  function start() {
    Object.keys(answers).forEach((k) => delete answers[k]);
    step = 0;
    say(["Hello, I'm the Bluebird Wellness assistant.", "We're a doctor-led service. Tell me a little about what you're looking for, and one of our doctors will call you to talk it through."]);
    say(["This chat isn't for emergencies. If you need help now, call 999, or 111 for urgent medical advice."], { note: true });
    ask();
  }

  function confirmStep() {
    step = 'confirm';
    queue = queue.then(() => {
      const rows = STEPS.filter((s) => s.summary !== false).map((s) => `<dt>${esc(s.label)}</dt><dd>${esc(answers[s.key] || 'Not given')}</dd>`).join('');
      addMessage('bot', `<p>Here's what I'll pass on:</p><dl class="chat__summary">${rows}</dl>`);
    });
    say([`Shall one of our doctors call you on ${answers.phone}?`]);
    // Explicit consent for the health details, in plain words, before anything would be passed on.
    queue = queue.then(() => {
      addMessage('note', `<p>By choosing "${esc(CONSENT)}", you agree to ${esc(SITE.legalName || 'Bluebird Wellness')} using these details, including the health information you've given, to arrange your consultation. You can withdraw this at any time.${PRIVACY_SHOWN ? ` See our <a href="${esc(new URL('privacy/', ROOT).href)}" target="_blank" rel="noopener">privacy policy</a>.` : ''}</p>`);
    });
    offer({ quick: [CONSENT, 'Start again'] });
  }

  function finish() {
    step = 'done';
    say([
      `Thank you, ${firstName()}. One of our doctors will call you on ${answers.phone} for a telephone consultation within the next 24 hours.`,
      'If you feel worse before then, call 111, or 999 in an emergency.',
    ]);
    say(['This is a preview of the chat assistant. Nothing has been sent.'], { note: true });
    offer({ quick: ['Close', 'Start a new chat'] });
  }

  function reply(text) {
    chat.quick.innerHTML = '';
    chat.quick.hidden = true;
    addMessage('user', `<p>${esc(text)}</p>`);
    if (step === 'confirm') {
      if (text === CONSENT) finish(); else { chat.log.innerHTML = ''; start(); }
      return;
    }
    if (step === 'done') {
      if (text === 'Start a new chat') { chat.log.innerHTML = ''; start(); } else window.SiteDialog.close();
      return;
    }
    const s = STEPS[step];
    // Under the minimum age: nothing more is asked, and nothing is kept.
    if (s.key === 'age') {
      if (text !== AGE_YES) {
        Object.keys(answers).forEach((k) => delete answers[k]);
        step = 'done';
        say([`Sorry, our treatments are only for people aged ${MIN_AGE} and over, so we can't arrange a consultation through this chat.`, 'For health advice, please speak to your GP, a pharmacist, or call 111. In an emergency, call 999.']);
        offer({ quick: ['Close', 'Start a new chat'] });
        return;
      }
      answers.age = text;
      step += 1;
      ask();
      return;
    }
    if (s.optional && text === SKIP) {
      answers[s.key] = '';
      step += 1;
      if (step < STEPS.length) ask(); else confirmStep();
      return;
    }
    const ok = s.check ? s.check(text) : true;
    if (ok !== true) {
      say([ok]);
      offer({ quick: s.quick, input: s });
      return;
    }
    answers[s.key] = text;
    step += 1;
    if (step < STEPS.length) ask(); else confirmStep();
  }

  function openChat(opener) {
    if (!window.SiteDialog) return;
    if (!chat) chat = build();
    window.SiteDialog.open(chat.el, { returnFocus: opener, initialFocus: chat.el.querySelector('.chat__close') });
    if (chat.fit) chat.fit();
    // The first time: the conversation starts. After that it carries on where it was.
    if (step === -1) {
      chat.quick.hidden = true;
      chat.form.hidden = true;
      start();
    } else queue = queue.then(focusNext);
  }

  if (CHAT_ON) {
    document.addEventListener('click', (event) => {
      const opener = event.target.closest('[data-chat-open]');
      if (!opener) return;
      event.preventDefault();
      openChat(opener);
    });
    // The page's own "Speak to a doctor" buttons, hidden until the chat is here.
    document.querySelectorAll('[data-chat-open][hidden]').forEach((b) => { b.hidden = false; });
  }

  /* ---------- 2. The contact button ---------- */

  const number = String(SITE.whatsapp || '').replace(/\D/g, '');
  const icon = (svg) => svg.replace('<svg ', '<svg class="contact-fab__icon" ');
  const waIcon = SITE.whatsappIcon
    ? `<img class="contact-fab__icon" src="${esc(new URL(SITE.whatsappIcon, ROOT).href)}" alt="" width="22" height="22">`
    : icon(ICON.bubble);
  const waItem = number
    ? `<a class="contact-fab__item" data-fab-wa href="https://wa.me/${number}?text=${encodeURIComponent('Hello Bluebird Wellness, I have a question about a treatment.')}" target="_blank" rel="noopener">${waIcon}<span>WhatsApp us</span></a>`
    // No number yet: it says so here (never a link that does nothing).
    : `<button type="button" class="contact-fab__item" data-fab-wa aria-describedby="contact-fab-status">${waIcon}<span>WhatsApp us</span></button><div class="contact-fab__note" id="contact-fab-status" role="status"></div>`;
  const chatItem = CHAT_ON
    ? `<li><button type="button" class="contact-fab__item" data-fab-chat>${icon(ICON.doctor)}<span>Speak to a doctor</span></button></li>`
    : '';
  const fab = document.createElement('div');
  fab.className = 'contact-fab is-away';
  fab.inert = true;
  // The menu follows the button, so Tab goes from the button into it.
  fab.innerHTML = `
    <button type="button" class="contact-fab__button" aria-label="Contact us" aria-expanded="false" aria-controls="contact-fab-menu">${ICON.bubble}</button>
    <div class="contact-fab__menu" id="contact-fab-menu" role="group" aria-label="Contact us" hidden>
      <ul class="contact-fab__list">
        <li>${waItem}</li>
        ${chatItem}
      </ul>
    </div>`;
  // Early in the tab order (just after "Skip to content"), so Tab reaches it
  // wherever it's showing: at the end of the page it would come after the
  // footer, where it steps aside.
  const skip = document.querySelector('.skip-link');
  if (skip) skip.after(fab); else document.body.prepend(fab);
  document.documentElement.classList.add('has-fab');

  const button = fab.querySelector('.contact-fab__button');
  const menu = fab.querySelector('.contact-fab__menu');
  const status = fab.querySelector('#contact-fab-status');
  const setMenu = (open) => {
    menu.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    if (!open && status) status.textContent = '';
    queueCheck();
  };
  button.addEventListener('click', () => setMenu(menu.hidden));
  fab.querySelector('[data-fab-wa]').addEventListener('click', (event) => {
    if (number) { setMenu(false); return; }
    event.preventDefault();
    status.textContent = 'Our WhatsApp number is coming soon';
  });
  if (CHAT_ON) {
    fab.querySelector('[data-fab-chat]').addEventListener('click', () => {
      setMenu(false);
      openChat(button);
    });
  }
  // Escape closes it and puts the focus back on the button; so does a click
  // or tap elsewhere, or tabbing out of it.
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || menu.hidden) return;
    event.preventDefault();
    setMenu(false);
    button.focus();
  });
  document.addEventListener('click', (event) => {
    if (!menu.hidden && !fab.contains(event.target)) setMenu(false);
  });
  fab.addEventListener('focusout', (event) => {
    if (!menu.hidden && event.relatedTarget && !fab.contains(event.relatedTarget)) setMenu(false);
  });

  /* When it shows. It steps aside over the home page's hero and the footer,
     while a menu or dialog is open (html.is-locked), and whenever its box
     (plus 8px) would cover anything: text, links, buttons, fields, pictures,
     line drawings, cards, tiles, prices, badges, any panel with a
     background… but not the page's or a section's own background, or the
     central line. Checked after each scroll and resize (once a frame). */
  const root = document.documentElement;
  const hero = document.querySelector('.hero');
  const footer = document.querySelector('.site-footer');
  const bar = document.querySelector('[data-book-bar]');
  const MARGIN = 8;
  // Always content, wherever they're touched.
  const BOX = 'img, svg, video, canvas, picture, iframe, input, select, textarea, button, .btn, .card, .tile, .badge, .pro-chip, .pro-badge, .price, .study-card, .accordion, .price-table-wrap, .ingredients__list, .toc, .upgrade, .legal-details, .legal-toc, .study-notice, .legal-draft, .tx-nav, .book-bar, .to-top, .menu-item, mark, table, .text-link, .used-in__link, .glossary-cats__link, .drip-jumps a';
  // Text: content where its words are (not the empty end of a line).
  const TEXT = 'p, h1, h2, h3, h4, h5, h6, li, dt, dd, td, th, label, summary, figcaption, blockquote, a, span, strong, em, small, b, i, sup, sub, time, address, caption';
  const meets = (r, box) => r.width > 0 && r.height > 0 && r.right > box.left && r.left < box.right && r.bottom > box.top && r.top < box.bottom;
  const textMeets = (el, box, deep) => {
    const nodes = [];
    if (deep) {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) nodes.push(walker.currentNode);
    } else nodes.push(...[...el.childNodes].filter((n) => n.nodeType === 3));
    const range = document.createRange();
    return nodes.some((n) => {
      if (!n.textContent.trim()) return false;
      range.selectNodeContents(n);
      return [...range.getClientRects()].some((r) => meets(r, box));
    });
  };
  const isContent = (el, box) => {
    if (fab.contains(el) || el === document.body || el === root) return false;
    if (el.closest('.tx-line__svg')) return false; // the central line
    if (el.closest(BOX)) return true;
    const cs = getComputedStyle(el);
    // A panel with its own background (narrower than the screen: not a section's).
    const bg = cs.backgroundColor.match(/[\d.]+/g);
    if (bg && (bg.length < 4 || Number(bg[3]) > 0) && el.getBoundingClientRect().width < window.innerWidth - 2 && !/^(MAIN|SECTION|HEADER|FOOTER|NAV|ARTICLE|BODY)$/.test(el.tagName)) return true;
    return textMeets(el, box, el.matches(TEXT));
  };
  const covers = (box) => {
    const seen = new Set();
    const N = 6;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const x = box.left + ((box.right - box.left) * i) / (N - 1);
        const y = box.top + ((box.bottom - box.top) * j) / (N - 1);
        if (x < 0 || y < 0 || x >= window.innerWidth || y >= window.innerHeight) continue;
        for (const el of document.elementsFromPoint(x, y)) {
          if (seen.has(el)) continue;
          seen.add(el);
          if (isContent(el, box)) return true;
        }
      }
    }
    return false;
  };
  const check = () => {
    // On a treatment page on phones, above the Book bar while it shows.
    const lift = bar && bar.classList.contains('is-shown') && getComputedStyle(bar).display !== 'none' ? bar.offsetHeight : 0;
    fab.style.setProperty('--fab-lift', `${lift}px`);
    let away = false;
    if (menu.hidden) {
      // Where it sits, ignoring its own fade (offsetTop ignores transforms).
      const box = { left: fab.offsetLeft - MARGIN, top: fab.offsetTop - lift - MARGIN, right: fab.offsetLeft + fab.offsetWidth + MARGIN, bottom: fab.offsetTop - lift + fab.offsetHeight + MARGIN };
      away = root.classList.contains('is-locked')
        || (hero && hero.getBoundingClientRect().bottom > 0)
        || (footer && footer.getBoundingClientRect().top < window.innerHeight)
        || covers(box);
    }
    fab.classList.toggle('is-away', away);
    fab.inert = away;
  };
  let queued = false;
  function queueCheck() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; check(); });
  }
  window.addEventListener('scroll', () => {
    // Scrolling closes its menu.
    if (!menu.hidden) setMenu(false);
    queueCheck();
  }, { passive: true });
  window.addEventListener('resize', queueCheck, { passive: true });
  window.addEventListener('load', queueCheck);
  window.addEventListener('pageshow', queueCheck);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueCheck);
  // Things that move without a scroll: an entry opened, a block risen into
  // place, the Book bar sliding in, a dialog opening or closing.
  ['toggle', 'transitionend', 'animationend'].forEach((e) => document.addEventListener(e, queueCheck, true));
  new MutationObserver(queueCheck).observe(root, { attributes: true, attributeFilter: ['class'] });
  if (bar) new MutationObserver(queueCheck).observe(bar, { attributes: true, attributeFilter: ['class'] });
  if ('ResizeObserver' in window) new ResizeObserver(queueCheck).observe(document.body);
  queueCheck();
})();
