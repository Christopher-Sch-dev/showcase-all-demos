/**
 * ROUTER DE CONFIG POR NICHO — demo-dashboard (tipo e).
 * Resuelve la config de narrativa de venta + estética de un nicho por DI.
 * NUNCA `if (niche === 'x')` en un componente: los componentes reciben la config
 * ya resuelta (— Dependency Injection).
 * Patrón: schema + niches + router DI.
 */
import { dentalConfig } from './niches/dental';
import type { NicheConfig } from './schema';

/** Registro por defecto de todos los nichos del demo . Añadir un nicho = 1 entrada aquí. */
export const DEFAULT_REGISTRY: Record<string, NicheConfig> = {
 dental: dentalConfig,
};

/**
 * Resuelve la config de un nicho por su clave.
 * `registry` es inyectable por DI (por defecto DEFAULT_REGISTRY); permite añadir/resolver
 * nichos custom sin tocar componentes (extensibilidad,).
 * Devuelve undefined si el nicho no existe.
 */
export function getNicheConfig( niche: string,
 registry: Record<string, NicheConfig> = DEFAULT_REGISTRY,
): NicheConfig | undefined {
 return registry[niche];
}
