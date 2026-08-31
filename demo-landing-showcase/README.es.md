# Landing de conversión para clínica dental — Sonrisa Vital

Una landing page de alto rendimiento construida para **Sonrisa Vital**, una clínica dental en Santiago Centro. La hice con **Astro** (sitio 100% estático) para demostrar cómo traduzco un negocio real — "reserva tu hora sin esperas" — en una página web que convierte visitantes en pacientes.

> **Demo en vivo:** [https://demo-landing-jade-three.vercel.app](https://demo-landing-jade-three.vercel.app)

---

## ¿Qué es?

Una landing de conversión de una sola página para una clínica dental. El objetivo no es "mostrar bonito": es que una persona que llega desde Google o redes **reserve una hora en menos de un minuto**.

La estructura sigue un recorrido de conversión claro:

- **Hero** con propuesta clara y CTA principal ("Reservar mi hora" + "WhatsApp urgencias").
- **Servicios** con precios explícitos (menos fricción, más confianza).
- **Equipo** con carrusel de especialistas (autoridad).
- **FAQ** que derriba objeciones típicas (isapres, Fonasa, financiamiento, urgencias).
- **Formulario de reserva** con los datos justos para que el equipo pueda contactar al paciente.
- **SEO completo**: title, meta description, Open Graph, canonical, `lang="es"`, favicon.

## Stack y por qué

| Herramienta | Rol | Por qué la elegí |
|---|---|---|
| **Astro 7** | Framework del sitio | Genera HTML estático puro → carga instantánea, mejor SEO y core-web-vitals. Cero JavaScript de framework en el camino crítico. |
| **HTML + CSS inline** | Diseño e interacción | Una sola página, sin dependencias de UI. Más rápido de mantener, más rápido de cargar. |
| **TypeScript** | Tipado | Base sólida y mantenible, compatible con las herramientas de testing. |
| **Vitest** | Tests de render | Verifico el HTML que realmente se sirve (SEO, CTAs, formulario) — no solo código unitario que no prueba nada del producto. |
| **Stryker** | Mutation testing | Configurado para asegurar que los tests realmente detectan bugs (en este repo la lógica es estática, por eso la suite de tests protege el output renderizado). |

**Por qué Astro:** este proyecto no necesita un SPA. Un sitio de conversión quiere lo más rápido posible y lo más indexable posible. Astro me da HTML estático por defecto y la opción de añadir interactividad donde hace falta (carrusel, formulario, scroll-reveal).

## Cómo correrlo localmente

Requisito: Node.js 18+ y npm.

```bash
# 1. Instalar dependencias
npm install

# 2. Servidor de desarrollo (→ http://localhost:4321)
npm run dev

# 3. Build de producción (→ carpeta dist/)
npm run build

# 4. Previsualizar el build localmente
npm run preview

# 5. Correr la suite de tests (verifica el HTML renderizado de dist/)
npm test
```

> Los tests leen la salida de `dist/`, así que **corre `npm run build` antes de `npm test`** o validarán el HTML anterior.

## Estructura del proyecto

```
demo-landing-showcase/
├── src/
│   └── pages/
│       └── index.astro      # Toda la landing (HTML + CSS + JS, ~1200 líneas)
├── public/
│   └── images/              # Ilustraciones (mascota, etc.)
├── tests/
│   └── landing.test.ts      # 10 tests de render (SEO, CTAs, form, lang, sin placeholders)
├── astro.config.mjs         # Config de Astro (output static, site)
├── vitest.config.ts         # Config de Vitest
├── stryker.config.json      # Config de mutation testing
└── package.json
```

**Nota honesta:** el formulario está conectado a un webhook de demo (no captura leads reales todavía). En el código está preparado para conectarse a una automatización real (N8N → CRM → WhatsApp) cuando el negocio lo decida. El foco de este repo es el *frontend* de conversión.

## Qué demuestra

- **Craft de UI:** paleta coherente (navy/ocean), tipografía única (Poppins), tarjetas con sombras suaves y bordes generosos, animaciones sutiles de scroll-reveal y carrusel "spotlight", respeto por `prefers-reduced-motion`.
- **Diseño orientado a conversión:** jerarquía clara, CTAs visibles, precios explícitos, FAQ que responde objeciones, formulario corto y con `aria-live` para feedback.
- **Accesibilidad y SEO:** landmarks semánticos, `lang="es"`, `aria-label` en interactivos, meta tags completos, canonical.
- **Testing real:** una suite que valida el HTML servido — que el título SEO, las meta descriptions, los Open Graph, los CTAs y el formulario estén presentes y que no haya placeholders sin rellenar.
- **Responsive:** del móvil al escritorio con grids adaptativos.

---

Hecho por **Christopher** — construcción de productos web reales, de la idea al deploy.

---

## Decisiones y tradeoffs

- **Astro en lugar de un SPA**: una landing de conversión necesita carga instantánea y buen SEO. Astro entrega HTML estático puro y añade interactividad solo donde hace falta.
- **HTML + CSS inline en un solo archivo**: sin dependencias de UI ni de framework en el camino crítico. Más fácil de mantener y más rápido de cargar.
- **Tests sobre el HTML renderizado**: valido lo que realmente se sirve (SEO, CTAs, formulario), no solo funciones unitarias.

## Qué aprendí

- Cómo traducir un negocio real en un recorrido de conversión efectivo (hero → servicios → prueba social → formulario).
- Cómo estructurar SEO completo (Open Graph, canonical, lang, meta) para que una landing sea indexable.
- Cómo usar Vitest + Stryker para verificar que una página estática realmente entrega lo que promete.

## Privacidad

Copia pública de solo lectura de la demo. No incluye secretos, credenciales, variables de entorno reales ni URLs de infraestructura interna. La versión original es un repositorio privado.

---

**Otros idiomas:** [English](./README.md)
