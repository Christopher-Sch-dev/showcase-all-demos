# CRUD de gestión de pacientes para clínica dental — Sonrisa Vital

Un panel interno para una clínica dental que te permite **dar de alta, buscar, filtrar y editar pacientes**. Es una demo MVP que construí para mostrar cómo organizo el código y cómo hago *testing en serio*.

**Demo en vivo:** https://demo-crud-three.vercel.app

---

## Qué es

Un CRUD completo de pacientes con:

- **Alta y edición** de pacientes (nombre, RUT, email, teléfono, última visita, tratamiento y estado) desde un modal.
- **Búsqueda** por nombre, RUT o email (ignora acentos y mayúsculas).
- **Filtro por estado**: `activo`, `inactivo` y `pendiente`.
- **Estadísticas** en vivo: total, activos, inactivos y pendientes.
- **Borrado** con confirmación y botón para **resetear** los datos de ejemplo.

Los datos viven en `localStorage` del navegador (`sonrisa.pacientes`). Para esta demo no hay backend: en producción se conectarían a la base de datos del estudio. El modelo de datos está pensado para que esa migración sea un solo cambio.

## Stack y por qué

| Capa | Herramienta | Por qué |
|------|-------------|---------|
| Framework | **Astro 7** (static) | Genera un sitio estático ultra rápido, sin serverless innecesario. `output: 'static'`. |
| Lenguaje | **TypeScript 5.9** | Tipos que me protegen del estado y de los formularios. |
| Lógica de negocio | Módulo puro `src/lib/pacientes.ts` | Toda la lógica vive en un solo lugar, testeable sin navegador. |
| Tests unitarios | **Vitest 4** | 42 tests que cubren la lógica real: filtros, estados, alta, escape de HTML, shape-safety. |
| BDD | **Cucumber + Gherkin** | Los escenarios de usuario (`features/`) se ejecutan como tests reales y describen el comportamiento esperado. |
| Mutation testing | **Stryker** | Verifica que los tests realmente *matan* bugs: mete mutantes en el código y exige que los tests los detecten. |

> Nota: uso **TypeScript 5.9**, no la 7.x, porque la 7.x rompe Stryker (`parseConfigFileTextToJson` no existe).

## Cómo correrlo localmente

```bash
npm install
npm run dev          # → http://localhost:4321
```

Comandos de testing y build:

```bash
npm run test         # Vitest: 42 tests unitarios
npm run test:gherkin # Cucumber: 6 escenarios BDD
npm run mutate       # Stryker: mutation testing sobre src/lib/
npm run build        # Genera dist/ (sitio estático)
npm run preview      # Sirve el build localmente
```

## Estructura del proyecto

```
.
├── src/
│   ├── pages/
│   │   └── index.astro        # La página: HTML, CSS y el modal
│   ├── lib/
│   │   ├── pacientes.ts       # ★ Lógica de negocio pura (única fuente de verdad)
│   │   └── pacientes.test.ts  # 42 tests Vitest de esa lógica
│   └── scripts/
│       └── crud.ts            # UI wiring (importa la lógica, nunca la duplica)
├── features/
│   └── pacientes.feature      # Escenarios BDD (Gherkin) ejecutables
├── tests/
│   └── step_definitions/
│       └── pacientes.steps.ts # Implementación de los steps de Cucumber
├── cucumber.json              # Config de Cucumber
├── stryker.config.json        # Config de mutation testing (Stryker)
├── vitest.config.ts
└── astro.config.mjs
```

## Qué demuestra

- **Separación real de responsabilidades**: la lógica de negocio está aislada en `pacientes.ts`; la página y el wiring de UI importan ese módulo, no lo duplican. La app y los tests usan *el mismo código* (patrón que llamo **1+1 real**), así los tests no mienten.
- **Testing serio en tres capas**: unitarios (Vitest), de escenario (Cucumber/BDD) y de mutación (Stryker). Los tests incluyen *shape-safety*: rechazan registros corruptos o con estado inválido en vez de crashear.
- **Estado manejado con cuidado**: `load()` devuelve copias (mutar el resultado no contamina el seed) y valida el shape de lo que hay en `localStorage` antes de usarlo.
- **Seguridad básica de UI**: todo lo que se pinta en la tabla pasa por `escapeHtml()` para evitar inyección.
- **Arquitectura portable**: al no depender de backend, este mismo patrón se adapta a talleres, restaurantes o cualquier servicio con catálogo de clientes.

---

Demo MVP — los datos no se envían a ningún servidor.

---

## Decisiones y tradeoffs

- **Lógica en un módulo puro (`pacientes.ts`)**: extraje el negocio del `.astro` para poder testearlo con mutation testing. La UI solo conecta.
- **localStorage en lugar de backend**: para un demo sin infraestructura, los datos viven en el navegador. El modelo está pensado para migrar a una API en un solo punto de cambio.
- **Gherkin ejecutable**: los escenarios se conectan a la lógica real, no son decoración.

## Qué aprendí

- Cómo separar la lógica de negocio testeable del wiring de UI en un proyecto Astro.
- Cómo aplicar mutation testing (Stryker) para asegurar que los tests realmente detectan bugs.
- Cómo hacer shape-safety: validar la estructura de los datos, no solo el JSON.parse.
- Cómo proteger la UI de XSS escapando toda interpolación de usuario.

## Privacidad

Copia pública de solo lectura de la demo. No incluye secretos, credenciales, variables de entorno reales ni URLs de infraestructura interna. La versión original es un repositorio privado.
