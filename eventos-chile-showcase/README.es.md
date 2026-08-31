# Eventos Chile — Frontend de gestión de eventos culturales

Frontend en **React + Vite** para una plataforma de gestión de eventos culturales. Permite explorar eventos, registrarse y administrar el contenido desde un panel, con autenticación por roles.

## Demo en vivo

[https://eventos-chile-20.vercel.app](https://eventos-chile-20.vercel.app)

## Para quién es

Es un proyecto de portafolio que muestra cómo construir el frontend de una plataforma real: listado de eventos, detalle, administración con roles y subida de imágenes. Sirve como referencia para quien quiera ver cómo estructuro una app React con backend separado.

## Stack

| Capa | Tecnología |
|------|------------|
| UI | React 18 |
| Build | Vite |
| Routing | React Router |
| HTTP | Axios |
| Estilos | Bootstrap 5 |
| Testing | Vitest |

## Qué demuestra

- **Arquitectura por capas**: `components`, `pages`, `services`, `context` y `utils` bien separados.
- **Autenticación y roles**: control de acceso por tipo de usuario en el frontend.
- **Manejo de estado**: contextos de React para sesión y datos compartidos.
- **Subida de imágenes**: integración con almacenamiento en la nube (Supabase) para imágenes de eventos y perfiles.
- **Testing**: suite con Vitest y tests de componentes.

## Decisiones y tradeoffs

- **React + Vite** en lugar de Next.js: el frontend es una SPA que consume una API separada; no necesita renderizado del lado del servidor.
- **Bootstrap 5** para UI: prioriza velocidad de desarrollo y consistencia sobre un design system custom.
- **Separación frontend/backend**: el frontend no conoce la base de datos; se comunica con la API por HTTP. Esto permite escalar cada parte por separado.

## Qué aprendí

- Cómo estructurar un frontend grande y mantenible con responsabilidades claras por carpeta.
- Cómo integrar autenticación JWT del lado del cliente (guardas de ruta, almacenamiento de sesión).
- Cómo manejar subida y optimización de imágenes del lado del cliente antes de enviarlas al storage.
- Cómo escribir tests para componentes de React y servicios.

## Privacidad

Copia pública de solo lectura del frontend. No incluye credenciales, la URL del backend ni variables de entorno reales (reemplazadas por placeholders).

---

**Otros idiomas:** [English](./README.md)
