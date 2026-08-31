/**
 * ROUTER DE CONFIG POR NICHO — demo-lead-qualifier (tipo b).
 * Resuelve la config de narrativa de venta + estética de un nicho por DI.
 * NUNCA `if (niche === 'x')` en un componente: los componentes reciben la config
 * ya resuelta (Mandamiento 2 — Dependency Injection).
 */
import { realestateConfig } from './niches/realestate';
import { lawConfig } from './niches/law';
import type { NicheConfig } from './schema';

/** Registro por defecto de todos los nichos del demo (AC-6). Añadir un nicho = 1 entrada aquí. */
export const DEFAULT_REGISTRY: Record<string, NicheConfig> = {
  realestate: realestateConfig,
  law: lawConfig,
};

/**
 * Resuelve la config de un nicho por su clave.
 * `registry` es inyectable por DI (por defecto DEFAULT_REGISTRY); permite añadir/resolver
 * nichos custom sin tocar componentes (extensibilidad, Mandamiento 3).
 * Devuelve undefined si el nicho no existe.
 */
export function getNicheConfig(
  niche: string,
  registry: Record<string, NicheConfig> = DEFAULT_REGISTRY,
): NicheConfig | undefined {
  return registry[niche];
}
