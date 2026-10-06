/* ==========================================================================
   Bluebird Wellness: the chat assistant and the WhatsApp button (every page)

   1. Chat assistant ("Speak to a doctor"). A short, friendly chat that asks:
        - what they're looking for, and a little about what's been going on,
        - any medical conditions, allergies or medicines,
        - their name, phone, email and a good time to call,
      then confirms, and says one of the doctors will phone them for a
      telephone consultation within the next 24 hours. It says at the start
      that it isn't for emergencies (999, or 111 for urgent advice).
      It is a preview: it is marked as one, and nothing is sent or stored
      anywhere. Making it live needs a secure way for the answers to reach
      the clinic. site-config.js: chatAssistant: false hides it.
   2. WhatsApp. A green "WhatsApp" button in the bottom corner of every page
      opens a chat with the clinic (site-config.js: whatsapp). Until the
      number is filled in, it says the number is coming soon. Its icon is a
      chat bubble until site-config.js: whatsappIcon points at an image.

   Both sit together in the bottom right corner (.contact-dock): WhatsApp
   above, "Speak to a doctor" below. Anything marked data-chat-open (the home
   page's "Speak to a doctor" button) opens the chat too.
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

  const dock = document.createElement('div');
  dock.className = 'contact-dock';

  /* ---------- 1. The chat assistant ---------- */

  const answers = {};
  const firstName = () => (answers.name || '').trim().split(/\s+/)[0] || '';

  // The questions, in order. quick: tap-to-answer suggestions (typing works too).
  const STEPS = [
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
      key: 'email', label: 'Email',
      say: () => ['And your email address?'],
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
    offer({ quick: s.quick, input: s });
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
      const rows = STEPS.map((s) => `<dt>${esc(s.label)}</dt><dd>${esc(answers[s.key])}</dd>`).join('');
      addMessage('bot', `<p>Here's what I'll pass on:</p><dl class="chat__summary">${rows}</dl>`);
    });
    say([`Shall one of our doctors call you on ${answers.phone}?`]);
    offer({ quick: ['Yes, please call me', 'Start again'] });
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
      if (text === 'Start again') { chat.log.innerHTML = ''; start(); } else finish();
      return;
    }
    if (step === 'done') {
      if (text === 'Start a new chat') { chat.log.innerHTML = ''; start(); } else window.SiteDialog.close();
      return;
    }
    const s = STEPS[step];
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

  /* ---------- 2. WhatsApp ---------- */

  const number = String(SITE.whatsapp || '').replace(/\D/g, '');
  const icon = SITE.whatsappIcon
    ? `<img class="contact-dock__icon" src="${esc(new URL(SITE.whatsappIcon, ROOT).href)}" alt="" width="24" height="24">`
    : ICON.bubble.replace('<svg ', '<svg class="contact-dock__icon" ');
  const wa = document.createElement('a');
  wa.className = 'contact-dock__button contact-dock__button--wa';
  wa.innerHTML = `${icon}<span class="contact-dock__label">WhatsApp</span>`;
  wa.setAttribute('aria-label', 'Contact us on WhatsApp');
  if (number) {
    wa.href = `https://wa.me/${number}?text=${encodeURIComponent('Hello Bluebird Wellness, I have a question about a treatment.')}`;
    wa.target = '_blank';
    wa.rel = 'noopener';
  } else {
    // No number yet: a note says so (never a link that does nothing).
    wa.href = '#';
    wa.insertAdjacentHTML('beforeend', '<span class="contact-dock__note" role="status"></span>');
    const note = wa.querySelector('.contact-dock__note');
    let timer = 0;
    wa.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      note.textContent = 'Our WhatsApp number is coming soon';
      wa.classList.add('is-noting');
      clearTimeout(timer);
      timer = setTimeout(() => { wa.classList.remove('is-noting'); note.textContent = ''; }, 2600);
    });
  }
  dock.appendChild(wa);

  if (CHAT_ON) {
    const launch = document.createElement('button');
    launch.type = 'button';
    launch.className = 'contact-dock__button contact-dock__button--chat';
    launch.setAttribute('data-chat-open', '');
    launch.setAttribute('aria-label', 'Speak to a doctor: chat with us');
    launch.innerHTML = `${ICON.doctor.replace('<svg ', '<svg class="contact-dock__icon" ')}<span class="contact-dock__label">Speak to a doctor</span>`;
    dock.appendChild(launch);
  }

  document.body.appendChild(dock);
  document.documentElement.classList.add('has-dock');

  // Phones, on the home page: tucked away while the hero (with its own Book
  // and "Speak to a doctor" buttons) fills the screen; in once you scroll.
  const hero = document.querySelector('.hero');
  if (hero) {
    const phone = window.matchMedia('(max-width: 819.98px)');
    const tuck = () => dock.classList.toggle('is-tucked', phone.matches && window.scrollY < window.innerHeight * 0.35);
    window.addEventListener('scroll', tuck, { passive: true });
    phone.addEventListener('change', tuck);
    tuck();
  }
})();
