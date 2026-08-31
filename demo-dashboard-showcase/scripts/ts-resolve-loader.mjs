// rol: loader de resolución ESM para Node type-stripping.
// Añade la extensión `.ts` a imports relativos sin extensión (estilo TS bundler),
// para que Node 22.22+ pueda ejecutar src/lib y src/agent directamente sin build.
export async function resolve {
 if ( specifier.startsWith('.') &&
 !specifier.endsWith('.ts') &&
 !specifier.endsWith('.js') &&
 !specifier.endsWith('.mjs') &&
 !specifier.endsWith('.json')
) {
 try {
 return await nextResolve;
 } catch {
 // si no existe con .ts, dejar que Node resuelva como siempre
 }
 }
 return nextResolve;
}
