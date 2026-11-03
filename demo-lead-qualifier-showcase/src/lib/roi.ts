/**
 * ROI — cálculo y formateo del valor anual proyectado.
 * La fórmula viaja como DATO (`multiplier`), nunca como función: las props de un
 * Astro island con `client:*` se serializan a JSON y una función no sobrevive,
 * así que el componente cliente recibiría `undefined` (bug real en producción:
 * "t.compute is not a function").
 */

// rol: valor anual = input del prospecto × multiplicador del nicho.
export function computeAnnual(multiplier: number, input: number): number {
  return input * multiplier;
}

// rol: formatear valor monetario USD de forma compacta ($1.3M · $50K · $900).
export function formatUSDCompact(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${Math.round(value).toLocaleString('en-US')}`;
}
