import { defineMiddleware } from 'astro:middleware';

/**
 * i18n manual por contenido (demo-kit).
 * EN default `/`, ES en `/es/`. Sin redirects server-side:
 * la ruta dinámica [type]/[niche] renderiza según el prefijo de locale.
 * Este middleware existe porque Astro exige uno con `i18n.routing: 'manual'`,
 * y aquí va cualquier lógica de locale que haga falta (p. ej. setear un
 * contexto de idioma por URL).
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const url = context.url;
  const locale = url.pathname.startsWith('/es/') || url.pathname === '/es'
    ? 'es'
    : 'en';

  context.locals.locale = locale;

  return next();
});
