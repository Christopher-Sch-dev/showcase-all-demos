# Dashboard y backoffice para clínica dental

Un panel de control para una clínica dental que te muestra **KPIs en vivo, gráficos de producción, una tabla paginada de pacientes con CRUD completo y una máquina de estados determinista para las citas**. Es una demo MVP que construí para mostrar cómo organizo un frontend con lógica de negocio testeable y una capa agéntica que cualquier IA externa puede operar.

**Demo en vivo:** https://demo-dashboard-jobhunteraai.vercel.app

---

## Qué es

Un dashboard/backoffice dental con:

- **KPIs derivados en vivo**: pacientes activos, no-show rate, revenue total, revenue por paciente, citas programadas y citas completadas.
- **Charts**: bar chart de revenue y citas por mes, y donut chart de revenue por tratamiento.
- **Tabla paginada** de pacientes con búsqueda y filtros por estado y tratamiento.
- **CRUD de pacientes**: alta, edición y borrado con validación inline.
- **FSM determinista de citas**: `scheduled → confirmed → completed / no_show / cancelled`. Las transiciones ilegales se rechazan.
- **Capa agéntica (MCP)**: un plugin (`src/agent/plugin.ts` + `mcp.json` + `plugin.json` + `skills/`) que expone la FSM y el CRUD a cualquier IA externa (Claude, ChatGPT, Cursor, Codex, MCP) vía `reduce()`, sin que la IA pueda romper la lógica.

Los datos viven en `localStorage` del navegador (`demo-dashboard:v1`). Para esta demo no hay backend: en producción se conectarían a la base de datos del estudio. Los KPIs se **derivan** del estado, nunca se guardan como datos independientes.

## Stack y por qué

| Capa | Herramienta | Por qué |
|------|-------------|---------|
| Framework | **Astro 4** (static) | Genera un sitio estático ultra rápido, sin serverless innecesario. `output: 'static'`. |
| UI | **React 18** (islands) | Componentes interactivos (tabla, charts, formularios) como islas dentro del HTML estático. |
| Lenguaje | **TypeScript 5.7** | Tipos que me protegen del estado y de los formularios. |
| Lógica de negocio | Módulos puros `src/lib/` | Toda la lógica (estado, KPIs, charts, storage) vive en módulos testeables sin navegador. |
| Validación | **Zod 3** | Contrato de tipos y de la narrativa de venta por nicho. |
| Estilos | **Tailwind 3** | Tokens de diseño por nicho desde la config Zod. |
| Tests unitarios | **Vitest 3** | Cubren la lógica real: FSM, KPIs, charts, CRUD, shape-safety. |
| E2E | **Playwright** | Flujos reales en navegador: dashboard, landing y adversarial. |
| Mutation testing | **Stryker** | Verifica que los tests realmente *matan* bugs. |

## Cómo correrlo localmente

```bash
npm install
npm run dev          # → http://localhost:4321
```

Comandos de testing y build:

```bash
npm run test         # Vitest: tests unitarios
npm run test:e2e     # Playwright: tests E2E
npm run test:mutate  # Stryker: mutation testing
npm run build        # Genera dist/ (sitio estático)
npm run preview      # Sirve el build localmente
```

## Estructura del proyecto

```
.
├── src/
│   ├── pages/
│   │   ├── index.astro          # Landing (EN)
│   │   └── es/index.astro       # Landing (ES)
│   ├── layouts/
│   │   └── BaseLayout.astro     # Layout base con tokens de diseño
│   ├── components/
│   │   ├── Dashboard.tsx        # Orquestador: KPIs + charts + tabla + CTA
│   │   ├── KpiBar.tsx           # 6 KPIs derivados con source visible
│   │   ├── ChartBar.tsx          # Bar chart (revenue/citas por mes)
│   │   ├── ChartDonut.tsx        # Donut chart (revenue por tratamiento)
│   │   ├── PatientTable.tsx      # Tabla paginada + filtros + CRUD
│   │   ├── PatientForm.tsx       # Form de paciente con validación inline
│   │   ├── RoiCalculator.tsx     # Calculadora de ROI
│   │   └── ui/                   # Componentes presentacionales
│   ├── lib/
│   │   ├── state.ts              # ★ Reducer puro + FSM de citas + CRUD
│   │   ├── kpi.ts                # KPIs derivados del estado
│   │   ├── charts.ts             # Agregaciones para los charts
│   │   ├── storage.ts            # Persistencia en localStorage
│   │   ├── seed.ts               # Datos de ejemplo realistas
│   │   ├── types.ts              # Contrato de tipos del dominio
│   │   └── constants.ts          # Constantes centralizadas
│   ├── config/                   # Config Zod por nicho (dental)
│   ├── i18n/                     # Strings por idioma
│   └── agent/
│       └── plugin.ts             # ★ Capa agéntica: wrappers sobre reduce()
├── features/                     # Escenarios BDD (Gherkin)
├── e2e/                          # Tests Playwright
├── skills/dashboard/SKILL.md     # Skill que explica a una IA cómo operar la FSM
├── mcp.json                      # Expone la capa agéntica como tools MCP
├── plugin.json                   # Manifest Agent Plugins v1.0.0
├── scripts/
│   ├── mcp-server.mjs            # Servidor MCP stdio
│   └── ts-resolve-loader.mjs     # Loader de TS para el server MCP
├── stryker.config.json
├── vitest.config.ts
├── playwright.config.ts
└── astro.config.mjs
```

## Qué demuestra

- **Lógica de negocio aislada y testeable**: el reducer puro (`state.ts`) es la única fuente de verdad. La UI y la capa agéntica lo importan, nunca lo duplican. Los tests usan el mismo código que la app.
- **FSM determinista**: las citas solo pueden transicionar por caminos legales. Una transición ilegal se rechaza con `changed: false` y un `reason`. La IA no puede romperla.
- **KPIs derivados, nunca guardados**: los KPIs se calculan del estado en cada render, así no hay datos inconsistentes.
- **Capa agéntica real**: cualquier IA externa opera el dashboard vía `reduce()` (a través de `plugin.ts` + MCP), sin mutar el estado directo. El estado de entrada nunca se modifica.
- **Testing en tres capas**: unitarios (Vitest), E2E (Playwright) y de mutación (Stryker).
- **Seguridad básica de UI**: todo lo que se pinta en la tabla pasa por escape para evitar inyección.

## Decisiones y tradeoffs

- **Reducer puro en `state.ts`**: extraje toda la lógica de negocio a un módulo puro para poder testearla con mutation testing. La UI y la capa agéntica solo conectan.
- **localStorage en lugar de backend**: para un demo sin infraestructura, los datos viven en el navegador. El modelo está pensado para migrar a una API en un solo punto de cambio.
- **KPIs derivados en vez de guardados**: evita inconsistencias, a costa de recalcular en cada render (irrelevante a esta escala).
- **Capa agéntica como plugin**: en vez de acoplar la IA al estado, la expongo como un plugin estándar (Agent Plugins v1.0.0) que cualquier IA puede consumir.

## Qué aprendí

- Cómo separar la lógica de negocio testeable del wiring de UI en un proyecto Astro + React.
- Cómo modelar una FSM determinista con un reducer puro y exponerla a agentes externos sin romperla.
- Cómo aplicar mutation testing (Stryker) para asegurar que los tests realmente detectan bugs.
- Cómo hacer shape-safety: validar la estructura de los datos, no solo el JSON.parse.
- Cómo construir una capa agéntica (plugin + MCP + skill) que cualquier IA puede operar.

## Privacidad

Copia pública de solo lectura de la demo. No incluye secretos, credenciales, variables de entorno reales ni URLs de infraestructura interna. La versión original es un repositorio privado.

---

**Otros idiomas:** [English](./README.md)
