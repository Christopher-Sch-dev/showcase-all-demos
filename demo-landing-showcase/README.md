# Conversion landing page for a dental clinic — Sonrisa Vital

A high-performance landing page built for **Sonrisa Vital**, a dental clinic in downtown Santiago. I built it with **Astro** (100% static site) to demonstrate how I translate a real business — "book your appointment with no waiting" — into a web page that converts visitors into patients.

> **Live demo:** [https://demo-landing-jade-three.vercel.app](https://demo-landing-jade-three.vercel.app)

---

## What it is

A single-page conversion landing for a dental clinic. The goal isn't to "look pretty": it's that someone arriving from Google or social media **books an appointment in under a minute**.

The structure follows a clear conversion journey:

- **Hero** with a clear value proposition and main CTA ("Book my appointment" + "WhatsApp emergencies").
- **Services** with explicit prices (less friction, more trust).
- **Team** with a carousel of specialists (authority).
- **FAQ** that addresses typical objections (isapres, Fonasa, financing, emergencies).
- **Booking form** with just the right data so the team can contact the patient.
- **Complete SEO**: title, meta description, Open Graph, canonical, `lang="es"`, favicon.

## Stack and why

| Tool | Role | Why I chose it |
|---|---|---|
| **Astro 7** | Site framework | Generates pure static HTML → instant load, better SEO and core-web-vitals. Zero framework JavaScript on the critical path. |
| **Inline HTML + CSS** | Design and interaction | A single page, no UI dependencies. Faster to maintain, faster to load. |
| **TypeScript** | Typing | Solid, maintainable base, compatible with the testing tools. |
| **Vitest** | Render tests | I verify the HTML that is actually served (SEO, CTAs, form) — not just unit code that tests nothing about the product. |
| **Stryker** | Mutation testing | Configured to ensure the tests actually catch bugs (in this repo the logic is static, so the test suite protects the rendered output). |

**Why Astro:** this project doesn't need an SPA. A conversion site wants to be as fast and as indexable as possible. Astro gives me static HTML by default and the option to add interactivity where it's needed (carousel, form, scroll-reveal).

## How to run it locally

Requirement: Node.js 18+ and npm.

```bash
# 1. Install dependencies
npm install

# 2. Development server (→ http://localhost:4321)
npm run dev

# 3. Production build (→ dist/ folder)
npm run build

# 4. Preview the build locally
npm run preview

# 5. Run the test suite (verifies the rendered HTML in dist/)
npm test
```

> The tests read the output of `dist/`, so **run `npm run build` before `npm test`** or they'll validate the previous HTML.

## Project structure

```
demo-landing-showcase/
├── src/
│   └── pages/
│       └── index.astro      # The whole landing (HTML + CSS + JS, ~1200 lines)
├── public/
│   └── images/              # Illustrations (mascot, etc.)
├── tests/
│   └── landing.test.ts      # 10 render tests (SEO, CTAs, form, lang, no placeholders)
├── astro.config.mjs         # Astro config (output static, site)
├── vitest.config.ts         # Vitest config
├── stryker.config.json      # Mutation testing config
└── package.json
```

**Honest note:** the form is connected to a demo webhook (it doesn't capture real leads yet). In the code it's ready to connect to a real automation (N8N → CRM → WhatsApp) when the business decides to. The focus of this repo is the conversion *frontend*.

## What it demonstrates

- **UI craft:** coherent palette (navy/ocean), unique typography (Poppins), cards with soft shadows and generous borders, subtle scroll-reveal animations and a "spotlight" carousel, respect for `prefers-reduced-motion`.
- **Conversion-oriented design:** clear hierarchy, visible CTAs, explicit prices, FAQ that answers objections, short form with `aria-live` for feedback.
- **Accessibility and SEO:** semantic landmarks, `lang="es"`, `aria-label` on interactive elements, complete meta tags, canonical.
- **Real testing:** a suite that validates the served HTML — that the SEO title, meta descriptions, Open Graph, CTAs and form are present and that there are no unfilled placeholders.
- **Responsive:** from mobile to desktop with adaptive grids.

---

Made by **Christopher** — building real web products, from idea to deploy.

---

## Decisions and tradeoffs

- **Astro instead of an SPA**: a conversion landing needs instant load and good SEO. Astro delivers pure static HTML and adds interactivity only where needed.
- **Inline HTML + CSS in a single file**: no UI or framework dependencies on the critical path. Easier to maintain and faster to load.
- **Tests on the rendered HTML**: I validate what is actually served (SEO, CTAs, form), not just unit functions.

## What I learned

- How to translate a real business into an effective conversion journey (hero → services → social proof → form).
- How to structure complete SEO (Open Graph, canonical, lang, meta) so a landing is indexable.
- How to use Vitest + Stryker to verify that a static page really delivers what it promises.

## Privacy

Public, read-only copy of the demo. It doesn't include secrets, credentials, real environment variables or internal infrastructure URLs. The original version is a private repository.

---

**Other languages:** [Español](./README.es.md)
