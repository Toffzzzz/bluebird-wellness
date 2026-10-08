# Bluebird Wellness: compliance checklist

What has been done on the website for each of the 20 common legal checks, what doesn't apply and why, and what the clinic still has to provide or decide. Hand this to the practice manager and whoever does the compliance review.

This is a practical checklist, not legal advice. The clinic should have the policy pages, the treatment wording and the regulatory points below checked by a qualified adviser before the site is opened to search engines (the `noindex` tag) and promoted.

Last reviewed: 6 October 2026.

## The 20 checks at a glance

| # | Check | Status |
|---|---|---|
| 1 | Privacy policy | **Done**, at `privacy/`. Waiting for the clinic's details (highlighted on the page) |
| 2 | Terms of service | **Done**, at `terms/`. Waiting for the clinic's details and payment terms |
| 3 | Refund policy | **Done**, at `cancellations/` (cancellations and refunds, including the legal 14-day right to cancel). Waiting for the notice period and charges |
| 4 | Cookie policy | **Done**, at `cookies/`. The site uses no cookies, and the page says exactly that |
| 5 | Cookie consent banner | **Not needed.** UK law (PECR) requires consent only for cookies or device storage that aren't strictly necessary. This site sets none and stores nothing (the checks confirm it). If analytics or advertising tags are ever added, a banner must be added first |
| 6 | Check form consents | **Done.** Booking asks the visitor to agree to the privacy policy and confirm their age (neither box pre-ticked). The chat asks for explicit consent before it would pass on health details. Both link to the privacy policy |
| 7 | No unnecessary data | **Done.** Booking asks only for what the appointment needs (the address only for a call-out; notes optional). The chat's email question is optional because the doctor phones. No date of birth: a tick box confirms the age instead |
| 8 | Audit third-party SDKs | **Done.** The site loads nothing from other companies: the Inter font is now served from the site itself (it used to come from Google Fonts, which passed visitors' IP addresses to Google). There is no analytics, advertising, chat or tracking code. WhatsApp and the booking link only open when clicked |
| 9 | Remove dark patterns | **Audited: none found.** No pre-ticked boxes, countdowns, fake scarcity, confirm-shaming or hidden opt-outs. The "taken" times in the booking calendar are made up, but only in the clearly labelled preview; the real booking system will show real availability |
| 10 | Remove hidden fees | **Done, needs the clinic's figures.** "From" prices are explained in the terms. A `callOutFee` setting shows any call-out charge in the booking calendar, the booking section and the terms. Cancellation charges are on the cancellations page. The clinic must confirm whether call-outs cost extra |
| 11 | Remove fake reviews | **Audited: none.** The site has no reviews, testimonials or star ratings. Any added later must be genuine, from real patients, with their permission |
| 12 | Remove unsupported claims | **Needs the clinic's decision: see "Treatment claims and medicines" below.** This is the biggest risk for an IV clinic. The menu wording comes word for word from the clinic's menu (`data/drips.json`), so it hasn't been changed without approval |
| 13 | Accessibility: alt text | **Done.** Every picture and line drawing has a text description; decorative ones are hidden from screen readers. Checked automatically on every page |
| 14 | Fix colour contrast | **Done.** All text meets WCAG AA contrast (4.5:1, or 3:1 for large text). Checked automatically on every page, in the booking calendar and in the chat |
| 15 | Keyboard navigation | **Done.** Everything can be reached with Tab, with a visible focus ring. The booking calendar and chat keep focus inside them and close with Escape. The "Skip to content" link works from anywhere |
| 16 | Add business details | **Done, needs the details.** The footer of every page and the policy pages show the legal name, company number, registered office, VAT, ICO and CQC numbers from `site-config.js`. They stay hidden or highlighted until filled in |
| 17 | Age consent for kids' data | **Done.** Treatments are for adults (`minimumAge: '18'` in `site-config.js`; please confirm). Booking asks visitors to confirm their age. The chat asks first, before any health questions, and stops and keeps nothing for anyone under 18 |
| 18 | Unsubscribe link in emails | **Not applicable yet.** The website sends no emails. Once the booking system sends marketing emails, each one needs an unsubscribe link and marketing needs opt-in consent (appointment confirmations and reminders don't) |
| 19 | License fonts and images | **Done.** Inter is under the SIL Open Font License; its licence is in `fonts/LICENSE.txt`. Where every picture comes from is in `CREDITS.md` |
| 20 | Data deletion request | **Done.** The privacy policy explains how to ask for information to be deleted (and the other rights), and what has to be kept, such as clinical records |

## Beyond the 20: what a doctor-led clinic's site also needs

| Item | Status |
|---|---|
| Complaints procedure | **Done, needs the clinic's decisions.** `complaints/` explains how to complain, what happens next, and where to go if still unhappy: ISCAS if the clinic subscribes (most private providers' independent adjudication), the CQC (which wants to hear about care but doesn't investigate individual private complaints), the GMC for a doctor's fitness to practise, and the ICO for data. CQC-registered providers must run a complaints system. The time limits and who investigates are highlighted for the clinic to fill in |
| The doctors' registration | **Done, needs the numbers.** About us names Dr Nema and Dr Mahdi with their GMC numbers (`gmcDrNema`, `gmcDrMahdi`), linked to the medical register, so patients can check them. GMC guidance expects information about doctors' services to be factual and verifiable |
| CQC rating on the website | **Done, needs the details.** Once the CQC rates the clinic, the law (Regulation 20A) requires the latest rating on the website. About us shows it from `cqcRating`, `cqcRatingDate` and `cqcReportUrl`, or the registration (`cqcNumber`) until then. CQC also offers a ready-made widget; it loads from the CQC's site, so it would be the one exception to "nothing loads from other sites" |
| Not for emergencies | **Done.** The contact section, the chat, the questions page and every study say to call NHS 111 or 999 |
| Health information (the studies) | **Done, needs the doctors' review.** Six studies (`studies/`) summarise what NHS, NICE, NDNS and published research say about deficiencies, every figure cited and independently fact-checked against its source. Each is marked "Draft" until `studiesReviewed: true`. Following ASA guidance on IV drips, they say nothing about the clinic's treatments, contain no Book buttons or links to drips, and sit at the bottom of the home page, apart from the menu: evidence about deficiency doesn't support claims for drips, and a statistic beside a drip can read as an implied claim. Don't use their figures in adverts for drips |
| Questions page | **Done, needs the clinic's answers** (`faq/`): consultations, blood tests, where, how long, age, risks, aftercare, payment, emergencies. The gaps are highlighted |
| Link previews and search | **Done.** Each page has a title, description and preview picture (`images/share.png`) for when it's shared, and the home page describes the clinic for search engines. The picture shows no medicine. Search engines are kept out until `launched: true` |
| A page for mistyped addresses | **Done** (`404.html`) |

**One to fix in the menu wording:** Iron's summary beside its drawing on the home page is the opening of its menu description ("…close to 50% of women have iron levels low enough to confirm iron deficiency"), and it sits next to the Book button. That's the pattern the ASA warns about (a deficiency statistic beside a drip). Consider changing the opening of Iron's description in `data/drips.json`, or leaving Iron off the scrolling line until the wording is reviewed.

**And one to review:** Hair & Scalp is now on the scrolling line too, and its summary beside the Book button is the opening of its menu description ("…vitamins, minerals and amino acids involved in the growth and maintenance of healthy hair"). The ASA's rules for IV drips warn against implying a drip grows hair. The wording describes what the ingredients are involved in rather than promising growth, but have the doctors (or a CAP advice request) confirm it, or change the opening of its description in `data/drips.json`.

## What the clinic needs to provide

Fill these in in `site-config.js`, then run `node scripts/build-menu.mjs`. The policy pages show a highlighted gap for each one until then.

- `legalName`: the business's full legal name.
- `companyNumber`, `registeredOffice`: if it's a limited company. `registeredIn` is set to England and Wales; change it if that's wrong.
- `clinicAddress`: the clinic's full address.
- `vatNumber`: if VAT-registered.
- `icoNumber`: the ICO registration. Every business handling personal data must pay the ICO data protection fee, and health data makes this essential.
- `cqcNumber`: the Care Quality Commission registration, if the clinic is registered. Check with the CQC whether the IV service needs registering (providing treatment by doctors is often a regulated activity in England).
- `bookingProvider`: the booking system's provider, once chosen.
- `callOutFee`, `cancellationNotice`, `cancellationFee`: the call-out charge (or "none"), the notice needed to cancel and the late-cancellation charge.
- `phone`, `email`: needed for the policy pages as well as the contact links.
- `minimumAge`: confirm 18.
- `gmcDrNema`, `gmcDrMahdi`: each doctor's GMC number.
- `cqcRating`, `cqcRatingDate`, `cqcReportUrl`: once the CQC has rated the clinic.
- The About us text (in `index.html`), the answers on the questions page and the complaints procedure's details.

The policy pages also have gaps the clinic has to decide in words (search the page for the highlighted text): how long enquiries are kept, how and when payment is taken, the complaints procedure, whether cancelling with enough notice is free, and what's charged if the doctor decides a treatment isn't suitable. These are in `content/legal/`.

When everything is filled in and reviewed, set `legalDraft: false` to remove the "Draft" note from the policy pages.

## Treatment claims and medicines

### The rules, in short

The Advertising Standards Authority (ASA) and its Committee of Advertising Practice (CAP) apply the advertising code to websites. For IV drips their published guidance says:

- **Prescription-only medicines (POMs) must not be advertised to the public**, directly or indirectly. The ASA has ruled specifically against advertising vitamin B12 injections to the public, and has issued enforcement notices on POMs and vitamin shots. ([ASA: Advertising vitamin drips](https://www.asa.org.uk/news/advertising-vitamin-drips-injecting-regulatory-knowledge-with-a-quick-jab.html); [ASA: enforcing the rules for POMs and vitamin shots](https://asa.org.uk/news/enforcing-the-rules-for-prescription-only-medicines-and-vitamin-shots.html))
- **Medicinal claims** (to treat, prevent or relieve a condition or its symptoms) aren't allowed unless that product is licensed as a medicine for that purpose.
- **Any claimed benefit needs robust evidence**, for the IV product itself and the IV route, not just for the nutrient in general. CAP singles out claims about energy, mood and immunity as likely to be problematic. ([CAP advice: Healthcare: Intravenous nutritional therapy](https://www.asa.org.uk/advice-online/healthcare-intravenous-nutritional-therapy.html))
- The nutrient "health claims" used in much of the menu ("contributes to the normal function of the immune system") are the authorised wording for **foods and food supplements**. CAP's guidance says these restrictions don't automatically apply to IV therapy, which means the wording doesn't give the same protection; the claims still need evidence for IV use.

CAP's Copy Advice team gives free advice on specific wording and is worth using before launch.

### What this means for the current menu

Line by line, the clinic should review these (the wording is in `data/drips.json`; the generator copies it everywhere word for word):

**Highest risk: naming or promoting prescription-only medicines**
- *Iron Infusion*: names **Monofer (ferric derisomaltose)**, a brand-name POM. Advertising it to the public is very likely a breach. Consider describing the service ("iron infusions, after a consultation and blood test") without naming the medicine.
- *Vitamin B12 injection* and *Vitamin D injection* (standalone, £45 each): B12 injections are POMs and the ASA has ruled against advertising them. Check the status of the vitamin D injection. Consider offering these only after consultation, without promoting them by name and price.
- *Recovery / Recovery Pro*: mention **IV anti-inflammatory painkillers** and **IV anti-sickness medication**. These are POMs, even described generically. Consider removing them from the public page; the doctor can still offer them at consultation.

**High risk: medicinal claims for unlicensed products**
- *Recovery*: "designed for the morning after a late night", nausea and headache relief: treating hangover symptoms is a medicinal claim.
- *Iron*: "a way to fully restore your iron levels", symptom lists (breathlessness, palpitations…): treating a deficiency is a medicinal claim (acceptable only for the licensed medicine, which itself can't be advertised).
- *NAD+ / Longevity*: "repair damaged DNA", "anti-ageing formulation", signs of ageing, mental clarity.
- *Beauty & Glow*: glutathione "shifting the skin towards a brighter tone": skin-lightening claims attract particular scrutiny.
- *Detox*: "supports the body's own detoxification processes": detox claims are a long-standing ASA concern.
- *Immunity / Immunity Pro*: "designed to support you" through colder months, "most comprehensive immune formulation".
- *Energy*, *Myers Cocktail*: "a good all-round choice for general wellbeing and energy", reducing tiredness.
- *Hair & Scalp*: hair growth.
- *Muscle & Fitness*: recovery and performance.

**Needs evidence on file**
- *Iron*: "close to 50% of women have iron levels low enough to confirm iron deficiency": check that footnote 1 says exactly this.
- *Hydration*: "rehydrates the body efficiently", "fluid reaches your circulation straight away".

**Safer directions** (for the adviser to confirm): describe what the treatment is and what's in it rather than what it does; avoid naming POMs; keep "all treatments are subject to a medical consultation"; let the doctor discuss benefits and medicines in the consultation, where they belong.

### The website's own wording (not from the menu)

- "Doctor-led IV drips", "Every drip starts with a consultation with one of our doctors", "Led by our doctors, Dr Nema and Dr Mahdi": these must be literally true. The menu's disclaimer says treatments are prescribed by "a registered clinician", which is broader than "a doctor": make the two consistent. Check that both doctors are happy to be named, and follow the GMC's guidance on doctors and advertising.
- The chat's suggestions ("Low energy or tiredness", "Hangover or dehydration", "Immunity support"…) are what a visitor might be looking for, not claims, but the adviser should see them. They're in `STEPS` in `chat.js`.
- Treatment names such as "Immunity", "Detox", "Energy" and "Longevity" are themselves claims in the ASA's eyes; the adviser may suggest neutral names.

## Before going live

1. Fill in the business details and decisions above; run the generator; set `legalDraft: false`.
2. Have the policy pages and the treatment wording reviewed (see above). Consider CAP Copy Advice.
3. Register with the ICO (if not already), and check CQC registration.
4. Choose how the chat and booking will really send (see the README); update the privacy policy's "booking system" and the chat's privacy wording to match; remove the "Preview" labels.
5. Have the doctors review the studies; set `studiesReviewed: true`.
6. Then set `launched: true` in `site-config.js` and run the generator: it removes the `noindex` tag from every page and writes `robots.txt` and `sitemap.xml`.
