/**
 * REGISTRY DE NICHOS — para getStaticPaths() de la ruta dinámica [type]/[niche].
 * Añadir un nicho = añadir 1 .ts en niches/ y registrarlo aquí (demo-kit).
 */
import { hvacConfig } from './hvac';

export interface NicheEntry {
  type: string;
  niche: string;
  config: typeof hvacConfig;
}

/** Todos los nichos disponibles (hoy solo el tipo (a) HVAC). */
export const niches: NicheEntry[] = [
  { type: 'a', niche: 'hvac', config: hvacConfig },
];

/** Resuelve un nicho por (type, niche); undefined si no existe. */
export function getNiche(type: string, niche: string): NicheEntry | undefined {
  return niches.find((n) => n.type === type && n.niche === niche);
}
