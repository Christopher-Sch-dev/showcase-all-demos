# Lead Qualifier AI — Real Estate & Law

An interactive demo of an **AI lead qualifier** for Real Estate and Law firms: a prospect fills a form, the AI responds in **under 60 seconds**, qualifies the lead with a score and a reason, and books a call on Calendly — all on a single board with live KPIs. It's an MVP demo I built to show how I model a deterministic business workflow (a Lead state machine) with testable logic, a per-niche sales narrative backed by real industry data, and an agentic layer that lets any external AI operate the funnel without breaking it.

**Live demo:** https://demo-lead-qualifier-jobhunteraai.vercel.app

---

## What it is

A Lead Qualifier AI for two niches (Real Estate and Law) with:

- **Prospect form → AI response <60s**: a lead is captured, qualified with a score (0-100) and a reason, and booked — the whole funnel runs in under a minute (speed-to-lead).
- **Deterministic Lead FSM**: `new → qualified → booked`. Illegal transitions are rejected with `changed: false` and a `reason`. The workflow can't be broken.
- **Live KPIs**: total leads, qualified leads, booked leads, average speed-to-lead, response rate under 60s and booking rate — all derived from state, never stored independently.
- **Lead dashboard**: a board that groups leads by status with their score, reason and booking link.
- **Two niches as configuration**: Real Estate (dark luxury) and Law (navy, serious), each with its own sales narrative, design tokens and ROI formula — a niche is a config change, not a code change.
- **Agentic layer (MCP)**: `src/agent/plugin.ts` + `mcp.json` + `plugin.json` + `skills/` expose the three agentic actions (`capture_lead` / `qualify` / `book`) to any external AI via `reduce()`. The reducer validates every transition, so the AI cannot break the logic.
- **CTA to Calendly**: a "book a call" action pointing to a real scheduling link (never `mailto:`).
- **"MODE DEMO" badge**: a clear badge in the nav so it's obvious this is a demo, not a live business system.

The data lives in the browser's `localStorage`. There's no backend: in production the AI qualifier would connect to the firm's CRM and scheduling system. The KPIs are **derived** from the state, never stored as independent data.

## Stack and why

| Layer | Tool | Why |
|------|-------------|---------|
| Framework | **Astro 4** (static) | Generates an ultra-fast static site, without unnecessary serverless. `output: 'static'`. |
| UI | **React 18** (islands) | Interactive components (form, qualify card, dashboard, KPIs) as islands inside the static HTML. |
| Language | **TypeScript 5.7** | Types that protect me from state and forms. |
| Business logic | Pure modules `src/lib/` | All the logic (FSM, KPIs, scoring, storage) lives in testable modules without a browser. |
| Validation | **Zod 3** | Type contract and per-niche config schema. |
| Styles | **Tailwind 3** | Per-niche design tokens from the Zod config. |
| Unit tests | **Vitest 3** | Cover the real logic: FSM, KPIs, scoring, storage, components. |
| E2E | **Playwright** | Real browser flows: landing, funnel and adversarial. |
| BDD | **Cucumber** | `features/islands-landing.feature` documents the full scenario. |
| Mutation testing | **Stryker** | Verifies that the tests really *kill* bugs. |

## How to run it locally

```bash
npm install
npm run dev          # → http://localhost:4321
```

Testing and build commands:

```bash
npm run test         # Vitest: unit tests
npm run test:e2e     # Playwright: E2E tests
npm run test:mutate  # Stryker: mutation testing
npm run build        # Generates dist/ (static site)
npm run preview      # Serves the build locally
```

## Project structure

```
.
├── src/
│   ├── pages/
│   │   ├── index.astro          # Landing (EN, Real Estate)
│   │   └── es/index.astro       # Landing (ES)
│   ├── layouts/
│   │   └── BaseLayout.astro     # Base layout with design tokens + MODE DEMO badge
│   ├── components/
│   │   ├── DemoShell.tsx        # Orchestrator: form + qualify + dashboard + KPIs
│   │   ├── LeadForm.tsx         # Captures a lead and starts the speed-to-lead timer
│   │   ├── QualifyCard.tsx      # Score + reason + Calendly booking CTA
│   │   ├── LeadDashboard.tsx    # Leads grouped by status with KPIs
│   │   ├── KpiBar.tsx           # Live derived KPIs with visible source
│   │   ├── ROICalculator.tsx    # ROI calculator with sourced industry metrics
│   │   ├── ModeBadge.tsx        # "MODE DEMO" badge + reset
│   │   └── ui/                  # Presentational components (StatusBadge, CTACalendly)
│   ├── agent/
│   │   └── plugin.ts            # ★ Agentic layer: capture/qualify/book over reduce()
│   ├── lib/
│   │   ├── state.ts             # ★ Pure reducer + Lead FSM (new→qualified→booked)
│   │   ├── kpi.ts               # KPIs derived from state
│   │   ├── score.ts             # Urgency from score
│   │   ├── ai.ts                # Simulated AI response logic
│   │   ├── storage.ts           # localStorage persistence
│   │   ├── seed.ts              # Realistic sample data
│   │   ├── constants.ts         # Centralized domain constants (Calendly URL, default niche)
│   │   ├── types.ts             # Domain type contract
│   │   └── __tests__/           # Unit tests for the logic
│   ├── config/                  # Per-niche Zod config (Real Estate / Law)
│   └── i18n/                    # Strings per language
├── features/                    # BDD scenarios (Gherkin)
├── e2e/                         # Playwright tests (landing, funnel, adversarial)
├── skills/                      # Agentic skill for the demo
├── mcp.json                     # MCP tools (capture_lead / qualify / book)
├── plugin.json                  # Agent plugin manifest
├── stryker.config.json
├── vitest.config.ts
├── playwright.config.ts
└── astro.config.mjs
```

## What it demonstrates

- **Isolated, testable business logic**: the pure reducer (`state.ts`) is the single source of truth. The UI imports it, never duplicates it. The tests use the same code as the app.
- **Deterministic FSM**: a lead can only move through legal transitions. An illegal transition is rejected with `changed: false` and a `reason`. The workflow can't be broken.
- **Derived KPIs, never stored**: the KPIs are calculated from the state on every render, so there's no inconsistent data.
- **Per-niche config as data**: the whole sales narrative, design tokens and ROI formula live in a Zod-validated config, so a new niche is a config change, not a code change.
- **Agentic layer over a deterministic core**: any external AI operates the funnel through `reduce()` — the reducer validates every transition, so the AI can't break the logic.
- **Sales narrative with honest data**: the ROI calculator and pain-point metrics always cite their source, instead of inventing numbers.
- **Testing in three layers**: unit (Vitest), E2E (Playwright) and mutation (Stryker), plus BDD scenarios (Cucumber).

## Decisions and tradeoffs

- **Pure reducer in `state.ts`**: I extracted all the business logic into a pure module so I could test it with mutation testing. The UI only connects.
- **localStorage instead of a backend**: for a demo without infrastructure, the data lives in the browser. The model is designed to migrate to an API in a single point of change.
- **Derived KPIs instead of stored**: avoids inconsistencies, at the cost of recalculating on every render (irrelevant at this scale).
- **Simulated AI instead of a real LLM call**: the AI response is a deterministic simulator so the demo runs offline and is fully testable. In production it would call a real LLM pipeline.
- **Per-niche config as data**: the whole sales narrative and ROI formula live in a Zod-validated config, so a new niche is a config change, not a code change.
- **Agentic layer as a thin wrapper**: the MCP/plugin layer only dispatches to the pure reducer — it never reimplements the FSM, so the deterministic core stays the single source of truth.

## What I learned

- How to model a deterministic multi-stage FSM (Lead) with a pure reducer and domain guards.
- How to derive live KPIs from state so the UI can never show inconsistent numbers.
- How to build a sales narrative backed by sourced industry data instead of invented metrics.
- How to apply mutation testing (Stryker) to ensure the tests really catch bugs.
- How to expose a deterministic core to external AI agents through a thin agentic layer (MCP + plugin + skill) without letting them break the logic.

## Privacy

Public, read-only copy of the demo. It doesn't include secrets, credentials, real environment variables or internal infrastructure URLs. The original version is a private repository.

---

**Other languages:** [Español](./README.es.md)
