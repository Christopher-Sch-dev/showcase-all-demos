# Simulador de Call-Capture + Despacho para HVAC

Un simulador interactivo de una **recepcionista IA para negocios de HVAC**: captura una llamada perdida, califica el lead, agenda y programa el trabajo, despacha a un técnico y lo sigue hasta la facturación — todo en un solo tablero con KPIs en vivo. Es una demo MVP que construí para mostrar cómo modelo un flujo de negocio determinista (una máquina de estados Lead→Job) con lógica testeable y una narrativa de venta respaldada por datos reales de la industria.

**Demo en vivo:** https://demo-hvac-jobhunteraai.vercel.app

---

## Qué es

Un simulador de call-capture y despacho para servicio técnico de HVAC con:

- **Simulador de llamadas en vivo**: reproduce transcripciones realistas de llamadas perdidas (reparación de AC, mantenimiento de horno, limpieza de ductos) y parsea la intención en un lead.
- **FSM determinista Lead→Job**: `lead → qualified → booked → scheduled → dispatched → in_progress → completed → invoiced`, con ramas `no_show` / `canceled` desde `booked`/`scheduled`. Las transiciones ilegales se rechazan.
- **KPIs en vivo**: llamadas capturadas, leads calificados, trabajos agendados/despachados/completados, ingresos recuperados, speed-to-lead y conversión — todos derivados del estado, nunca guardados de forma independiente.
- **Tablero de despacho**: asigna un técnico, despacha con una ETA y mueve el trabajo hasta la facturación.
- **Calculadora de ROI**: un slider de llamadas perdidas por semana proyecta los ingresos anuales recuperados, con métricas honestas de la industria que siempre citan su fuente.
- **CTA a Calendly**: una acción de "agenda una demo" que apunta a un link real de agendamiento.
- **Badge "MODO DEMO"**: un badge claro en la navegación para que sea obvio que esto es un simulador, no un sistema de negocio en vivo.

Los datos viven en el `localStorage` del navegador (`demo-hvac:v1`). No hay backend: en producción la recepcionista IA se conectaría al CRM y al sistema de despacho de la empresa. Los KPIs son **derivados** del estado, nunca guardados como datos independientes.

## Stack y por qué

| Capa | Herramienta | Por qué |
|------|-------------|---------|
| Framework | **Astro 4** (estático) | Genera un sitio estático ultrarápido, sin serverless innecesario. `output: 'static'`. |
| UI | **React 18** (islands) | Componentes interactivos (simulador, tablero, KPIs, calculadora) como islands dentro del HTML estático. |
| Lenguaje | **TypeScript 5.7** | Tipos que me protegen del estado y los formularios. |
| Lógica de negocio | Módulos puros `src/lib/` | Toda la lógica (FSM, KPIs, storage, parsing IA) vive en módulos testeables sin navegador. |
| Validación | **Zod 3** | Contrato de tipos y esquema de configuración por nicho. |
| Estilos | **Tailwind 3** | Design tokens por nicho desde la config Zod. |
| Motion | **motion** | Transiciones livianas y accesibles para el simulador en vivo. |
| Tests unitarios | **Vitest 3** | Cubren la lógica real: FSM, KPIs, parsing IA, storage, componentes. |
| E2E | **Playwright** | Flujos reales de navegador: landing, funnel, edge cases y adversarial. |
| BDD | **Cucumber** | `features/lead-to-invoice.feature` documenta el escenario completo. |
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
│   │   └── BaseLayout.astro     # Layout base con design tokens + badge MODO DEMO
│   ├── components/
│   │   ├── Dashboard.tsx        # Orquestador: simulador + tablero + KPIs + CTA
│   │   ├── LiveCallSimulator.tsx # Reproduce transcripciones de llamadas perdidas y parsea intención
│   │   ├── LeadQueue.tsx        # Leads capturados con calificación
│   │   ├── DispatchBoard.tsx    # Asigna técnico, despacha con ETA, sigue hasta facturar
│   │   ├── KpiBar.tsx           # KPIs derivados en vivo con fuente visible
│   │   ├── ROICalculator.tsx    # Calculadora de ROI con métricas de la industria con source
│   │   ├── OnboardingGuide.tsx  # Guía paso a paso del flujo
│   │   └── ui/                  # Componentes presentacionales
│   ├── lib/
│   │   ├── state.ts             # ★ Reducer puro + FSM Lead→Job
│   │   ├── kpi.ts               # KPIs derivados del estado
│   │   ├── ai.ts                # Parsing de llamada simulado (intención desde transcripción)
│   │   ├── loop.ts              # Loop de simulación determinista
│   │   ├── storage.ts           # Persistencia en localStorage
│   │   ├── seed.ts              # Datos de ejemplo realistas
│   │   ├── intl.ts              # Formato de moneda / números
│   │   ├── types.ts             # Contrato de tipos del dominio
│   │   └── __tests__/           # Tests unitarios de la lógica
│   ├── config/                  # Config Zod por nicho (HVAC)
│   ├── i18n/                    # Strings por idioma
│   └── middleware.ts            # Resolución de locale i18n manual
├── features/                    # Escenarios BDD (Gherkin)
├── e2e/                         # Tests Playwright (landing, funnel, edge, adversarial)
├── stryker.conf.json
├── vitest.config.ts
├── playwright.config.ts
└── astro.config.mjs
```

## Qué demuestra

- **Lógica de negocio aislada y testeable**: el reducer puro (`state.ts`) es la única fuente de verdad. La UI lo importa, nunca lo duplica. Los tests usan el mismo código que la app.
- **FSM determinista**: un lead solo puede moverse por transiciones legales. Una transición ilegal se rechaza con `changed: false` y una `reason`. El flujo no se puede romper.
- **KPIs derivados, nunca guardados**: los KPIs se calculan del estado en cada render, así que no hay datos inconsistentes.
- **Guardas de dominio**: un lead sin técnico asignado no se puede despachar; la facturación es idempotente; los precios y KPIs nunca son negativos.
- **Narrativa de venta con datos honestos**: la calculadora de ROI y las métricas del pain point siempre citan su fuente, en vez de inventar números.
- **Testing en tres capas**: unitario (Vitest), E2E (Playwright) y mutation (Stryker), más escenarios BDD (Cucumber).

## Decisiones y tradeoffs

- **Reducer puro en `state.ts`**: extraje toda la lógica de negocio a un módulo puro para poder testearla con mutation testing. La UI solo conecta.
- **localStorage en vez de backend**: para una demo sin infraestructura, los datos viven en el navegador. El modelo está diseñado para migrar a una API en un solo punto de cambio.
- **KPIs derivados en vez de guardados**: evita inconsistencias, a costa de recalcular en cada render (irrelevante a esta escala).
- **IA simulada en vez de una llamada real a un LLM**: el parsing de llamadas es un simulador determinista para que la demo corra offline y sea totalmente testeable. En producción llamaría a un pipeline real de speech-to-text + LLM.
- **Config por nicho como datos**: toda la narrativa de venta y la fórmula de ROI viven en una config validada con Zod, así que un nicho nuevo es un cambio de config, no de código.

## Qué aprendí

- Cómo modelar un FSM determinista de múltiples etapas (Lead→Job) con un reducer puro y guardas de dominio.
- Cómo derivar KPIs en vivo del estado para que la UI nunca muestre números inconsistentes.
- Cómo construir una narrativa de venta respaldada por datos de la industria con fuente, en vez de métricas inventadas.
- Cómo aplicar mutation testing (Stryker) para asegurar que los tests realmente atrapan bugs.
- Cómo estructurar una demo para que la capa "IA" sea un simulador determinista y testeable que luego se pueda cambiar por un pipeline real de LLM.

## Privacidad

Copia pública de solo lectura de la demo. No incluye secretos, credenciales, variables de entorno reales ni URLs de infraestructura interna. La versión original es un repositorio privado.

---

**Otros idiomas:** [English](./README.md)
