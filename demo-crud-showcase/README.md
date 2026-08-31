# Patient management CRUD for a dental clinic — Sonrisa Vital

An internal panel for a dental clinic that lets you **register, search, filter and edit patients**. It's an MVP demo I built to show how I organize code and how I do *serious testing*.

**Live demo:** https://demo-crud-three.vercel.app

---

## What it is

A complete patient CRUD with:

- **Registration and editing** of patients (name, RUT, email, phone, last visit, treatment and status) from a modal.
- **Search** by name, RUT or email (ignores accents and capitalization).
- **Filter by status**: `active`, `inactive` and `pending`.
- **Live statistics**: total, active, inactive and pending.
- **Deletion** with confirmation and a button to **reset** the sample data.

The data lives in the browser's `localStorage` (`sonrisa.pacientes`). For this demo there's no backend: in production it would connect to the practice's database. The data model is designed so that migration is a single change.

## Stack and why

| Layer | Tool | Why |
|------|-------------|---------|
| Framework | **Astro 7** (static) | Generates an ultra-fast static site, without unnecessary serverless. `output: 'static'`. |
| Language | **TypeScript 5.9** | Types that protect me from state and forms. |
| Business logic | Pure module `src/lib/pacientes.ts` | All the logic lives in one place, testable without a browser. |
| Unit tests | **Vitest 4** | 42 tests covering the real logic: filters, statuses, registration, HTML escaping, shape-safety. |
| BDD | **Cucumber + Gherkin** | The user scenarios (`features/`) run as real tests and describe the expected behavior. |
| Mutation testing | **Stryker** | Verifies that the tests really *kill* bugs: it injects mutants into the code and requires the tests to catch them. |

> Note: I use **TypeScript 5.9**, not 7.x, because 7.x breaks Stryker (`parseConfigFileTextToJson` doesn't exist).

## How to run it locally

```bash
npm install
npm run dev          # → http://localhost:4321
```

Testing and build commands:

```bash
npm run test         # Vitest: 42 unit tests
npm run test:gherkin # Cucumber: 6 BDD scenarios
npm run mutate       # Stryker: mutation testing on src/lib/
npm run build        # Generates dist/ (static site)
npm run preview      # Serves the build locally
```

## Project structure

```
.
├── src/
│   ├── pages/
│   │   └── index.astro        # The page: HTML, CSS and the modal
│   ├── lib/
│   │   ├── pacientes.ts       # ★ Pure business logic (single source of truth)
│   │   └── pacientes.test.ts  # 42 Vitest tests for that logic
│   └── scripts/
│       └── crud.ts            # UI wiring (imports the logic, never duplicates it)
├── features/
│   └── pacientes.feature      # Executable BDD (Gherkin) scenarios
├── tests/
│   └── step_definitions/
│       └── pacientes.steps.ts # Cucumber step implementation
├── cucumber.json              # Cucumber config
├── stryker.config.json        # Mutation testing config (Stryker)
├── vitest.config.ts
└── astro.config.mjs
```

## What it demonstrates

- **Real separation of responsibilities**: the business logic is isolated in `pacientes.ts`; the page and UI wiring import that module, they don't duplicate it. The app and the tests use *the same code* (a pattern I call **1+1 real**), so the tests don't lie.
- **Serious testing in three layers**: unit (Vitest), scenario (Cucumber/BDD) and mutation (Stryker). The tests include *shape-safety*: they reject corrupt records or records with invalid status instead of crashing.
- **Carefully managed state**: `load()` returns copies (mutating the result doesn't contaminate the seed) and validates the shape of what's in `localStorage` before using it.
- **Basic UI security**: everything rendered in the table goes through `escapeHtml()` to prevent injection.
- **Portable architecture**: by not depending on a backend, this same pattern adapts to workshops, restaurants or any service with a customer catalog.

---

MVP demo — the data isn't sent to any server.

---

## Decisions and tradeoffs

- **Logic in a pure module (`pacientes.ts`)**: I extracted the business out of the `.astro` so I could test it with mutation testing. The UI only connects.
- **localStorage instead of a backend**: for a demo without infrastructure, the data lives in the browser. The model is designed to migrate to an API in a single point of change.
- **Executable Gherkin**: the scenarios connect to the real logic, they're not decoration.

## What I learned

- How to separate testable business logic from UI wiring in an Astro project.
- How to apply mutation testing (Stryker) to ensure the tests really catch bugs.
- How to do shape-safety: validate the structure of the data, not just the JSON.parse.
- How to protect the UI from XSS by escaping all user interpolation.

## Privacy

Public, read-only copy of the demo. It doesn't include secrets, credentials, real environment variables or internal infrastructure URLs. The original version is a private repository.

---

**Other languages:** [Español](./README.es.md)
