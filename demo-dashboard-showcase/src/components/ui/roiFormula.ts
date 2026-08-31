/**
 * FÓRMULA DE ROI — demo dental .
 * La config Zod define `roiFormula.compute` como función, pero Astro NO serializa
 * funciones en las props de los islands (bug de producción detectado por E2E real:
 * `e.compute is not a function` al hidratar). Este módulo es la fuente de verdad de
 * la fórmula para el island RoiCalculator (importable, no vía prop).
 * Fórmula (config dental): citas/día × 7.4% no-show × $250 valor promedio × 365 días × 22.95% recovery.
 */
export function computeRoi(appointmentsPerDay: number): number {
 return appointmentsPerDay * 0.074 * 250 * 365 * 0.2295;
}
