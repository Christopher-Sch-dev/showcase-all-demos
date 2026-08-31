# HVAC Call-Capture + Dispatch Simulator

An interactive simulator of an **AI receptionist for HVAC businesses**: it captures a missed call, qualifies the lead, books and schedules the job, dispatches a technician, and tracks it through to invoicing — all on a single board with live KPIs. It's an MVP demo I built to show how I model a deterministic business workflow (a Lead→Job state machine) with testable logic and a sales narrative backed by real industry data.

**Live demo:** https://demo-hvac-jobhunteraai.vercel.app

---

## What it is

A call-capture and dispatch simulator for HVAC field service with:

- **Live call simulator**: plays realistic missed-call transcripts (AC repair, furnace tune-up, duct cleaning) and parses the intent into a lead.
- **Deterministic Lead→Job FSM**: `lead → qualified → booked → scheduled → dispatched → in_progress → completed → invoiced`, with `no_show` / `canceled` branches from `booked`/`scheduled`. Illegal transitions are rejected.
- **Live KPIs**: calls captured, qualified leads, booked/dispatched/completed jobs, recovered revenue, speed-to-lead and conversion — all derived from state, never stored independently.
- **Dispatch board**: assign a technician, dispatch with an ETA, and move the job through to invoicing.
- **ROI calculator**: a slider of missed calls per week projects recovered annual revenue, with honest industry metrics that always cite their source.
- **CTA to Calendly**: a "book a demo call" action pointing to a real scheduling link.
- **"MODE DEMO" badge**: a clear badge in the nav so it's obvious this is a simulator, not a live business system.

The data lives in the browser's `localStorage` (`demo-hvac:v1`). There's no backend: in production the AI receptionist would connect to the company's CRM and dispatch system. The KPIs are **derived** from the state, never stored as independent data.

## Stack and why

| Layer | Tool | Why |
|------|-------------|---------|
| Framework | **Astro 4** (static) | Generates an ultra-fast static site, without unnecessary serverless. `output: 'static'`. |
| UI | **React 18** (islands) | Interactive components (simulator, board, KPIs, calculator) as islands inside the static HTML. |
| Language | **TypeScript 5.7** | Types that protect me from state and forms. |
| Business logic | Pure modules `src/lib/` | All the logic (FSM, KPIs, storage, AI parsing) lives in testable modules without a browser. |
| Validation | **Zod 3** | Type contract and per-niche config schema. |
| Styles | **Tailwind 3** | Per-niche design tokens from the Zod config. |
| Motion | **motion** | Lightweight, accessible transitions for the live simulator. |
| Unit tests | **Vitest 3** | Cover the real logic: FSM, KPIs, AI parsing, storage, components. |
| E2E | **Playwright** | Real browser flows: landing, funnel, edge cases and adversarial. |
| BDD | **Cucumber** | `features/lead-to-invoice.feature` documents the full scenario. |
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
│   │   ├── index.astro          # Landing (EN)
│   │   └── es/index.astro       # Landing (ES)
│   ├── layouts/
│   │   └── BaseLayout.astro     # Base layout with design tokens + MODE DEMO badge
│   ├── components/
│   │   ├── Dashboard.tsx        # Orchestrator: simulator + board + KPIs + CTA
│   │   ├── LiveCallSimulator.tsx # Plays missed-call transcripts and parses intent
│   │   ├── LeadQueue.tsx        # Captured leads with qualification
│   │   ├── DispatchBoard.tsx    # Assign tech, dispatch with ETA, track to invoice
│   │   ├── KpiBar.tsx           # Live derived KPIs with visible source
│   │   ├── ROICalculator.tsx    # ROI calculator with sourced industry metrics
│   │   ├── OnboardingGuide.tsx  # Step-by-step guide of the flow
│   │   └── ui/                  # Presentational components
│   ├── lib/
│   │   ├── state.ts             # ★ Pure reducer + Lead→Job FSM
│   │   ├── kpi.ts               # KPIs derived from state
│   │   ├── ai.ts                # Simulated call parsing (intent from transcript)
│   │   ├── loop.ts              # Deterministic simulation loop
│   │   ├── storage.ts           # localStorage persistence
│   │   ├── seed.ts              # Realistic sample data
│   │   ├── intl.ts              # Currency / number formatting
│   │   ├── types.ts             # Domain type contract
│   │   └── __tests__/           # Unit tests for the logic
│   ├── config/                  # Per-niche Zod config (HVAC)
│   ├── i18n/                    # Strings per language
│   └── middleware.ts            # Manual i18n locale resolution
├── features/                    # BDD scenarios (Gherkin)
├── e2e/                         # Playwright tests (landing, funnel, edge, adversarial)
├── stryker.conf.json
├── vitest.config.ts
├── playwright.config.ts
└── astro.config.mjs
```

## What it demonstrates

- **Isolated, testable business logic**: the pure reducer (`state.ts`) is the single source of truth. The UI imports it, never duplicates it. The tests use the same code as the app.
- **Deterministic FSM**: a lead can only move through legal transitions. An illegal transition is rejected with `changed: false` and a `reason`. The workflow can't be broken.
- **Derived KPIs, never stored**: the KPIs are calculated from the state on every render, so there's no inconsistent data.
- **Domain guards**: a lead without an assigned technician can't be dispatched; invoicing is idempotent; prices and KPIs are never negative.
- **Sales narrative with honest data**: the ROI calculator and pain-point metrics always cite their source, instead of inventing numbers.
- **Testing in three layers**: unit (Vitest), E2E (Playwright) and mutation (Stryker), plus BDD scenarios (Cucumber).

## Decisions and tradeoffs

- **Pure reducer in `state.ts`**: I extracted all the business logic into a pure module so I could test it with mutation testing. The UI only connects.
- **localStorage instead of a backend**: for a demo without infrastructure, the data lives in the browser. The model is designed to migrate to an API in a single point of change.
- **Derived KPIs instead of stored**: avoids inconsistencies, at the cost of recalculating on every render (irrelevant at this scale).
- **Simulated AI instead of a real LLM call**: the call parsing is a deterministic simulator so the demo runs offline and is fully testable. In production it would call a real speech-to-text + LLM pipeline.
- **Per-niche config as data**: the whole sales narrative and ROI formula live in a Zod-validated config, so a new niche is a config change, not a code change.

## What I learned

- How to model a deterministic multi-stage FSM (Lead→Job) with a pure reducer and domain guards.
- How to derive live KPIs from state so the UI can never show inconsistent numbers.
- How to build a sales narrative backed by sourced industry data instead of invented metrics.
- How to apply mutation testing (Stryker) to ensure the tests really catch bugs.
- How to structure a demo so the "AI" layer is a deterministic, testable simulator that can later be swapped for a real LLM pipeline.

## Privacy

Public, read-only copy of the demo. It doesn't include secrets, credentials, real environment variables or internal infrastructure URLs. The original version is a private repository.

---

**Other languages:** [Español](./README.es.md)
