import type { ParsedLeadIntent } from './types';

// rol: simula el form/transcript de un prospecto y parsea la intención (determinista).

// rol: mapear un transcript a una intención estructurada. Fallback robusto: siempre
// devuelve un ParsedLeadIntent válido (topic/name/email/phone no vacíos, capturedAt > 0).
export function parseLeadTranscript(text: string): ParsedLeadIntent {
  const t = text.trim();

  // Nombre: 'Name is Maria', 'my name is X', 'I am X' / "I'm X".
  const nameMatch = t.match(/(?:name is|my name is|i am|i'm)\s+([A-Za-z][A-Za-z\s'.-]*?)(?:[,.!;]|$)/i);
  const name = nameMatch ? nameMatch[1].trim().replace(/\s+/g, ' ') : 'Unknown Prospect';

  // Email: patrón de correo estándar. Fallback sintético no vacío con @ (contrato).
  const emailMatch = t.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  const email = emailMatch ? emailMatch[0] : 'lead@example.com';

  // Teléfono: dígitos con separadores. Fallback sintético no vacío.
  const phoneMatch = t.match(/\+?\d[\d\s().-]{6,}\d/);
  const phone = phoneMatch ? phoneMatch[0].replace(/\s+/g, '') : '555-0000';

  // Topic: deriva por keywords de nicho (RE vs Law); fallback genérico no vacío.
  const lower = t.toLowerCase();
  const realEstate = ['house', 'apartment', 'condo', 'townhouse', 'home', 'property', 'buy', 'purchase', 'sell', 'closing', 'mortgage', 'listing'];
  const law = ['lawyer', 'law', 'legal', 'custody', 'divorce', 'injury', 'contract', 'dispute', 'lawsuit', 'attorney', 'representation', 'family law'];
  const reHits = realEstate.filter((k) => lower.includes(k));
  const lawHits = law.filter((k) => lower.includes(k));

  let topic: string;
  if (reHits.length > 0 && lawHits.length > 0) {
    topic = `lead: ${reHits[0]} and ${lawHits[0]}`;
  } else if (reHits.length > 0) {
    topic = `real estate lead: ${reHits[0]}`;
  } else if (lawHits.length > 0) {
    topic = `law lead: ${lawHits[0]}`;
  } else {
    topic = 'general inquiry';
  }

  return { name, email, phone, topic, capturedAt: Date.now() };
}

// Catálogo de escenarios simulados de lead (RE/Law). Solo el [0] se usa (determinista).
const SCENARIOS: Array<{ phrase: string }> = [
  {
    phrase:
      "Hi, I'm looking to buy a 4-bedroom house under $600k in North Dallas, ASAP, " +
      "we need to close before school starts. My name is Maria. Contact maria@example.com, phone 555-0100.",
  },
];

/**
 * Genera un lead simulado y su intención parseada (consistente).
 * DETERMINISTA: sin contador global mutable — un índice global rompe la hidratación
 * SSR (server/client renderizan distinto → React error #418). Devuelve SIEMPRE el
 * escenario[0]; intent se re-deriva del transcript con parseLeadTranscript.
 */
export function simulateLeadResponse(): { transcript: string; intent: ParsedLeadIntent } {
  const transcript = SCENARIOS[0].phrase;
  return { transcript, intent: parseLeadTranscript(transcript) };
}
