# Lead Qualifier AI — Real Estate y Law

Una demo interactiva de un **calificador de leads IA** para firmas de Real Estate y Law: un prospecto llena un formulario, la IA responde en **menos de 60 segundos**, califica el lead con un score y una razón, y agenda una llamada en Calendly — todo en un solo tablero con KPIs en vivo. Es una demo MVP que construí para mostrar cómo modelo un flujo de negocio determinista (una máquina de estados de Lead) con lógica testeable, una narrativa de venta por nicho respaldada por datos reales de la industria, y una capa agéntica que permite que cualquier IA externa opere el funnel sin romperlo.

**Demo en vivo:** https://demo-lead-qualifier-jobhunteraai.vercel.app

---

## Qué es

Un Lead Qualifier AI para dos nichos (Real Estate y Law) con:

- **Formulario del prospecto → respuesta IA <60s**: un lead se captura, se califica con un score (0-100) y una razón, y se agenda — todo el funnel corre en menos de un minuto (speed-to-lead).
- **FSM determinista de Lead**: `new → qualified → booked`. Las transiciones ilegales se rechazan con `changed: false` y una `reason`. El flujo no se puede romper.
- **KPIs en vivo**: leads totales, leads calificados, leads agendados, speed-to-lead promedio, tasa de respuesta bajo 60s y tasa de agendado — todos derivados del estado, nunca guardados de forma independiente.
- **Dashboard de leads**: un tablero que agrupa los leads por estado con su score, razón y link de agendado.
- **Dos nichos como configuración**: Real Estate (dark luxury) y Law (navy serio), cada uno con su narrativa de venta, design tokens y fórmula de ROI — un nicho es un cambio de config, no de código.
- **Capa agéntica (MCP)**: `src/agent/plugin.ts` + `mcp.json` + `plugin.json` + `skills/` exponen las tres acciones agénticas (`capture_lead` / `qualify` / `book`) a cualquier IA externa vía `reduce()`. El reducer valida cada transición, así que la IA no puede romper la lógica.
- **CTA a Calendly**: una acción de "agenda una llamada" que apunta a un link real de agendamiento (nunca `mailto:`).
- **Badge "MODO DEMO"**: un badge claro en la navegación para que sea obvio que esto es una demo, no un sistema de negocio en vivo.

Los datos viven en el `localStorage` del navegador. No hay backend: en producción el calificador IA se conectaría al CRM y al sistema de agendamiento de la firma. Los KPIs son **derivados** del estado, nunca guardados como datos independientes.

## Stack y por qué

| Capa | Herramienta | Por qué |
|------|-------------|---------|
| Framework | **Astro 4** (estático) | Genera un sitio estático ultrarápido, sin serverless innecesario. `output: 'static'`. |
| UI | **React 18** (islands) | Componentes interactivos (formulario, tarjeta de calificación, dashboard, KPIs) como islands dentro del HTML estático. |
| Lenguaje | **TypeScript 5.7** | Tipos que me protegen del estado y los formularios. |
| Lógica de negocio | Módulos puros `src/lib/` | Toda la lógica (FSM, KPIs, scoring, storage) vive en módulos testeables sin navegador. |
| Validación | **Zod 3** | Contrato de tipos y esquema de configuración por nicho. |
| Estilos | **Tailwind 3** | Design tokens por nicho desde la config Zod. |
| Tests unitarios | **Vitest 3** | Cubren la lógica real: FSM, KPIs, scoring, storage, componentes. |
| E2E | **Playwright** | Flujos reales de navegador: landing, funnel y adversarial. |
| BDD | **Cucumber** | `features/islands-landing.feature` documenta el escenario completo. |
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
│   │   ├── index.astro          # Landing (EN, Real Estate)
│   │   └── es/index.astro       # Landing (ES)
│   ├── layouts/
│   │   └── BaseLayout.astro     # Layout base con design tokens + badge MODO DEMO
│   ├── components/
│   │   ├── DemoShell.tsx        # Orquestador: form + calificación + dashboard + KPIs
│   │   ├── LeadForm.tsx         # Captura un lead y arranca el timer speed-to-lead
│   │   ├── QualifyCard.tsx      # Score + razón + CTA de agendado Calendly
│   │   ├── LeadDashboard.tsx    # Leads agrupados por estado con KPIs
│   │   ├── KpiBar.tsx           # KPIs derivados en vivo con fuente visible
│   │   ├── ROICalculator.tsx    # Calculadora de ROI con métricas de la industria con source
│   │   ├── ModeBadge.tsx        # Badge "MODO DEMO" + reset
│   │   └── ui/                  # Componentes presentacionales (StatusBadge, CTACalendly)
│   ├── agent/
│   │   └── plugin.ts            # ★ Capa agéntica: capture/qualify/book sobre reduce()
│   ├── lib/
│   │   ├── state.ts             # ★ Reducer puro + FSM de Lead (new→qualified→booked)
│   │   ├── kpi.ts               # KPIs derivados del estado
│   │   ├── score.ts             # Urgencia desde el score
│   │   ├── ai.ts                # Lógica de respuesta IA simulada
│   │   ├── storage.ts           # Persistencia en localStorage
│   │   ├── seed.ts              # Datos de ejemplo realistas
│   │   ├── constants.ts         # Constantes de dominio centralizadas (URL Calendly, nicho default)
│   │   ├── types.ts             # Contrato de tipos del dominio
│   │   └── __tests__/           # Tests unitarios de la lógica
│   ├── config/                  # Config Zod por nicho (Real Estate / Law)
│   └── i18n/                    # Strings por idioma
├── features/                    # Escenarios BDD (Gherkin)
├── e2e/                         # Tests Playwright (landing, funnel, adversarial)
├── skills/                      # Skill agéntica del demo
├── mcp.json                     # Tools MCP (capture_lead / qualify / book)
├── plugin.json                  # Manifiesto del plugin agéntico
├── stryker.config.json
├── vitest.config.ts
├── playwright.config.ts
└── astro.config.mjs
```

## Qué demuestra

- **Lógica de negocio aislada y testeable**: el reducer puro (`state.ts`) es la única fuente de verdad. La UI lo importa, nunca lo duplica. Los tests usan el mismo código que la app.
- **FSM determinista**: un lead solo puede moverse por transiciones legales. Una transición ilegal se rechaza con `changed: false` y una `reason`. El flujo no se puede romper.
- **KPIs derivados, nunca guardados**: los KPIs se calculan del estado en cada render, así que no hay datos inconsistentes.
- **Config por nicho como datos**: toda la narrativa de venta, los design tokens y la fórmula de ROI viven en una config validada con Zod, así que un nicho nuevo es un cambio de config, no de código.
- **Capa agéntica sobre un core determinista**: cualquier IA externa opera el funnel a través de `reduce()` — el reducer valida cada transición, así que la IA no puede romper la lógica.
- **Narrativa de venta con datos honestos**: la calculadora de ROI y las métricas del pain point siempre citan su fuente, en vez de inventar números.
- **Testing en tres capas**: unitario (Vitest), E2E (Playwright) y mutation (Stryker), más escenarios BDD (Cucumber).

## Decisiones y tradeoffs

- **Reducer puro en `state.ts`**: extraje toda la lógica de negocio a un módulo puro para poder testearla con mutation testing. La UI solo conecta.
- **localStorage en vez de backend**: para una demo sin infraestructura, los datos viven en el navegador. El modelo está diseñado para migrar a una API en un solo punto de cambio.
- **KPIs derivados en vez de guardados**: evita inconsistencias, a costa de recalcular en cada render (irrelevante a esta escala).
- **IA simulada en vez de una llamada real a un LLM**: la respuesta IA es un simulador determinista para que la demo corra offline y sea totalmente testeable. En producción llamaría a un pipeline real de LLM.
- **Config por nicho como datos**: toda la narrativa de venta y la fórmula de ROI viven en una config validada con Zod, así que un nicho nuevo es un cambio de config, no de código.
- **Capa agéntica como wrapper delgado**: la capa MCP/plugin solo despacha al reducer puro — nunca reimplementa la FSM, así que el core determinista sigue siendo la única fuente de verdad.

## Qué aprendí

- Cómo modelar un FSM determinista de múltiples etapas (Lead) con un reducer puro y guardas de dominio.
- Cómo derivar KPIs en vivo del estado para que la UI nunca muestre números inconsistentes.
- Cómo construir una narrativa de venta respaldada por datos de la industria con fuente, en vez de métricas inventadas.
- Cómo aplicar mutation testing (Stryker) para asegurar que los tests realmente atrapan bugs.
- Cómo exponer un core determinista a agentes IA externos a través de una capa agéntica delgada (MCP + plugin + skill) sin dejar que rompan la lógica.

## Privacidad

Copia pública de solo lectura de la demo. No incluye secretos, credenciales, variables de entorno reales ni URLs de infraestructura interna. La versión original es un repositorio privado.

---

**Otros idiomas:** [English](./README.md)
