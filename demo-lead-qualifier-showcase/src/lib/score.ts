/**
 * SCORE — Demo Lead Qualifier AI (tipo b · Real Estate/Law)
 * Calificación DETERMINISTA de leads (spec.md AC-2).
 * Función pura scoreLead(lead, niche) → { score 0-100, reason }.
 * Nunca aleatorio, nunca con IA: mismo input → mismo output (invariante).
 * Score >= 60 = qualified (AC-2); el umbral es configuración exportada.
 */
import type { Lead, Niche, Urgency } from './types';

/** Umbral de calificación (AC-2): score >= 60 es qualified. */
export const QUALIFIED_THRESHOLD = 60;

/** Un lead está calificado si su score alcanza el umbral. */
export function isQualified(score: number): boolean {
  return score >= QUALIFIED_THRESHOLD;
}

/** Deriva la urgencia determinista del score (buckets por rangos). */
export function urgencyFromScore(score: number): Urgency {
  if (score < 40) return 'low';
  if (score < 60) return 'normal';
  if (score < 80) return 'high';
  return 'urgent';
}

/** Palabras clave de intención de compra para Real Estate. */
const RE_TOPIC_KEYS = [
  'house',
  'apartment',
  'condo',
  'townhouse',
  'home',
  'property',
  'buy',
  'purchase',
];

/** Tipo de caso que indican alto interés de retainer para Law. */
const LAW_CASE_KEYS = [
  'injury',
  'divorce',
  'criminal',
  'family',
  'estate',
  'contract',
  'employment',
];

/** Señales de urgencia para Law (urgente/asap/emergency). */
const LAW_URGENCY_KEYS = ['urgent', 'asap', 'emergency', 'immediately', 'today'];

// rol: retorna cuántas keywords de un set aparecen en el topic (case-insensitive).
function keywordHits(topic: string, keys: string[]): number {
  const hay = topic.toLowerCase();
  return keys.filter((k) => hay.includes(k)).length;
}

// rol: punto de entrada de calificación para Real Estate.
function scoreRealEstate(lead: Lead): { score: number; reason: string } {
  const topicHits = keywordHits(lead.topic, RE_TOPIC_KEYS);
  const hasBudget = typeof lead.budget === 'number' && lead.budget > 0;
  const budgetAdequate = hasBudget && lead.budget! >= 100_000;

  const topicScore = topicHits > 0 ? 45 : 0;
  const budgetScore = budgetAdequate ? 50 : hasBudget ? 25 : 0;
  const score = Math.min(100, topicScore + budgetScore);

  const bits: string[] = [];
  if (topicHits > 0) bits.push('shows buying intent');
  if (budgetAdequate) bits.push('budget adequate for purchase');
  else if (hasBudget) bits.push('budget provided but limited');
  else bits.push('no budget provided');
  const reason = bits.length > 0 ? `Real estate lead: ${bits.join('; ')}.` : 'Real estate lead: low intent, no purchase signal.';

  return { score, reason };
}

// rol: helper para construir la razón neutra en inglés a partir de señales.
function buildReason(signal: string[], fallback: string): string {
  return signal.length > 0 ? `Lead qualifies: ${signal.join('; ')}.` : fallback;
}

// rol: punto de entrada para el nicho Legal Law.
function scoreLaw(lead: Lead): { score: number; reason: string } {
  const caseHits = keywordHits(lead.topic, LAW_CASE_KEYS);
  const urgencyHits = keywordHits(lead.topic, LAW_URGENCY_KEYS);
  const hasBudget = typeof lead.budget === 'number' && lead.budget > 0;

  const caseScore = caseHits > 0 ? 35 : 0;
  const urgencyScore = urgencyHits > 0 ? 20 : 0;
  const budgetScore = hasBudget ? 15 : 0;
  const score = Math.min(100, caseScore + urgencyScore + budgetScore);

  const bits: string[] = [];
  if (caseHits > 0) bits.push('identifiable case type');
  if (urgencyHits > 0) bits.push('urgency expressed');
  if (hasBudget) bits.push('budget provided');
  else bits.push('no budget provided');
  const reason = buildReason(bits, 'Law lead: low engagement, no case or urgency signal.');

  return { score, reason };
}

// rol: router por nicho (nicho = configuración, nunca if en componente). Puro.
/** Califica un lead de forma determinista según su nicho (AC-2). */
export function scoreLead(lead: Lead, niche: Niche): { score: number; reason: string } {
  switch (niche) {
    case 'realestate':
      return scoreRealEstate(lead);
    case 'law':
      return scoreLaw(lead);
    default:
      throw new Error(`Unsupported niche: ${String(niche)}`);
  }
}
