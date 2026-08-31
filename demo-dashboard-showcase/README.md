# Dashboard and backoffice for a dental clinic

A control panel for a dental clinic that shows you **live KPIs, production charts, a paginated patient table with full CRUD and a deterministic state machine for appointments**. It's an MVP demo I built to show how I organize a frontend with testable business logic and an agentic layer that any external AI can operate.

**Live demo:** https://demo-dashboard-jobhunteraai.vercel.app

---

## What it is

A dental dashboard/backoffice with:

- **Derived live KPIs**: active patients, no-show rate, total revenue, revenue per patient, scheduled appointments and completed appointments.
- **Charts**: bar chart of revenue and appointments per month, and donut chart of revenue per treatment.
- **Paginated patient table** with search and filters by status and treatment.
- **Patient CRUD**: registration, editing and deletion with inline validation.
- **Deterministic appointment FSM**: `scheduled → confirmed → completed / no_show / cancelled`. Illegal transitions are rejected.
- **Agentic layer (MCP)**: a plugin (`src/agent/plugin.ts` + `mcp.json` + `plugin.json` + `skills/`) that exposes the FSM and CRUD to any external AI (Claude, ChatGPT, Cursor, Codex, MCP) via `reduce()`, without the AI being able to break the logic.

The data lives in the browser's `localStorage` (`demo-dashboard:v1`). For this demo there's no backend: in production it would connect to the practice's database. The KPIs are **derived** from the state, never stored as independent data.

## Stack and why

| Layer | Tool | Why |
|------|-------------|---------|
| Framework | **Astro 4** (static) | Generates an ultra-fast static site, without unnecessary serverless. `output: 'static'`. |
| UI | **React 18** (islands) | Interactive components (table, charts, forms) as islands inside the static HTML. |
| Language | **TypeScript 5.7** | Types that protect me from state and forms. |
| Business logic | Pure modules `src/lib/` | All the logic (state, KPIs, charts, storage) lives in testable modules without a browser. |
| Validation | **Zod 3** | Type contract and of the per-niche sales narrative. |
| Styles | **Tailwind 3** | Per-niche design tokens from the Zod config. |
| Unit tests | **Vitest 3** | Cover the real logic: FSM, KPIs, charts, CRUD, shape-safety. |
| E2E | **Playwright** | Real browser flows: dashboard, landing and adversarial. |
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
│   │   └── BaseLayout.astro     # Base layout with design tokens
│   ├── components/
│   │   ├── Dashboard.tsx        # Orchestrator: KPIs + charts + table + CTA
│   │   ├── KpiBar.tsx           # 6 derived KPIs with visible source
│   │   ├── ChartBar.tsx          # Bar chart (revenue/appointments per month)
│   │   ├── ChartDonut.tsx        # Donut chart (revenue per treatment)
│   │   ├── PatientTable.tsx      # Paginated table + filters + CRUD
│   │   ├── PatientForm.tsx       # Patient form with inline validation
│   │   ├── RoiCalculator.tsx     # ROI calculator
│   │   └── ui/                   # Presentational components
│   ├── lib/
│   │   ├── state.ts              # ★ Pure reducer + appointment FSM + CRUD
│   │   ├── kpi.ts                # KPIs derived from state
│   │   ├── charts.ts             # Aggregations for the charts
│   │   ├── storage.ts            # localStorage persistence
│   │   ├── seed.ts               # Realistic sample data
│   │   ├── types.ts              # Domain type contract
│   │   └── constants.ts          # Centralized constants
│   ├── config/                   # Per-niche Zod config (dental)
│   ├── i18n/                     # Strings per language
│   └── agent/
│       └── plugin.ts             # ★ Agentic layer: wrappers over reduce()
├── features/                     # BDD scenarios (Gherkin)
├── e2e/                          # Playwright tests
├── skills/dashboard/SKILL.md     # Skill that explains to an AI how to operate the FSM
├── mcp.json                      # Exposes the agentic layer as MCP tools
├── plugin.json                   # Agent Plugins v1.0.0 manifest
├── scripts/
│   ├── mcp-server.mjs            # MCP stdio server
│   └── ts-resolve-loader.mjs     # TS loader for the MCP server
├── stryker.config.json
├── vitest.config.ts
├── playwright.config.ts
└── astro.config.mjs
```

## What it demonstrates

- **Isolated, testable business logic**: the pure reducer (`state.ts`) is the single source of truth. The UI and the agentic layer import it, never duplicate it. The tests use the same code as the app.
- **Deterministic FSM**: appointments can only transition through legal paths. An illegal transition is rejected with `changed: false` and a `reason`. The AI can't break it.
- **Derived KPIs, never stored**: the KPIs are calculated from the state on every render, so there's no inconsistent data.
- **Real agentic layer**: any external AI operates the dashboard via `reduce()` (through `plugin.ts` + MCP), without mutating the state directly. The input state is never modified.
- **Testing in three layers**: unit (Vitest), E2E (Playwright) and mutation (Stryker).
- **Basic UI security**: everything rendered in the table goes through escaping to prevent injection.

## Decisions and tradeoffs

- **Pure reducer in `state.ts`**: I extracted all the business logic into a pure module so I could test it with mutation testing. The UI and the agentic layer only connect.
- **localStorage instead of a backend**: for a demo without infrastructure, the data lives in the browser. The model is designed to migrate to an API in a single point of change.
- **Derived KPIs instead of stored**: avoids inconsistencies, at the cost of recalculating on every render (irrelevant at this scale).
- **Agentic layer as a plugin**: instead of coupling the AI to the state, I expose it as a standard plugin (Agent Plugins v1.0.0) that any AI can consume.

## What I learned

- How to separate testable business logic from UI wiring in an Astro + React project.
- How to model a deterministic FSM with a pure reducer and expose it to external agents without breaking it.
- How to apply mutation testing (Stryker) to ensure the tests really catch bugs.
- How to do shape-safety: validate the structure of the data, not just the JSON.parse.
- How to build an agentic layer (plugin + MCP + skill) that any AI can operate.

## Privacy

Public, read-only copy of the demo. It doesn't include secrets, credentials, real environment variables or internal infrastructure URLs. The original version is a private repository.

---

**Other languages:** [Español](./README.es.md)
