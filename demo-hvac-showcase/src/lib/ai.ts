import type { ParsedIntent, Zone } from './types';

// rol: simula una llamada perdida y parsea la intención desde el transcript

export const STORAGE_KEY = 'demo-hvac:v1';

// Catalogos de llamadas HVAC realistas (tipo de servicio → plantilla + ticket).
const SCENARIOS: Array<{
  serviceType: string;
  urgency: ParsedIntent['urgency'];
  zone: Zone;
  ticket: number;
  phrase: string;
}> = [
  {
    serviceType: 'AC repair',
    urgency: 'urgent',
    zone: 'north',
    ticket: 2200,
    phrase:
      "Hi, my AC broke down and there's no cool air coming out. Please come as soon as possible, " +
      "we have a baby at home and it's 95 degrees. We're on the north side of town.",
  },
  {
    serviceType: 'furnace tune-up',
    urgency: 'low',
    zone: 'central',
    ticket: 180,
    phrase:
      "Can someone do a furnace tune-up before winter? It's not an emergency, just maintenance. " +
      "We are downtown near the central district.",
  },
  {
    serviceType: 'duct cleaning',
    urgency: 'normal',
    zone: 'south',
    ticket: 450,
    phrase:
      'We need duct cleaning, the air smells dusty every time the fan runs. House is on the south side.',
  },
];

// Rol: mapea un texto de llamada a una intención estructurada.
// Fallback robusto: siempre devuelve un ParsedIntent válido (issue no vacío, ticket >= 0).
export function parseCallTranscript(text: string): ParsedIntent {
  const t = text.toLowerCase();

  // Ponytail: heurística por keyword (no un NLP real) — suficiente para la demo.
  const has = (...words: string[]) => words.some((w) => t.includes(w));

  let serviceType = 'HVAC service';
  let urgency: ParsedIntent['urgency'] = 'normal';
  let zone: Zone = 'central';
  let ticket = 0;

  // Keywords específicas: "furnace" contiene la subcadena "ac", así que AC usa
  // tokens propios ('a/c', 'air conditioner', 'no cool') y furnace se chequea antes.
  if (has('furnace', 'tune-up', 'tune up', 'heating')) {
    serviceType = 'furnace tune-up';
    ticket = 180;
  } else if (has('duct', 'ductwork', 'dust')) {
    serviceType = 'duct cleaning';
    ticket = 450;
  } else if (has('a/c', 'air conditioner', 'air conditioning', 'no cool', 'no ac', 'broke', 'warm air')) {
    serviceType = 'AC repair';
    ticket = 2200;
  }

  if (!has('not an emergency', 'not urgent') && has('urgent', 'asap', 'emergency', 'broke', 'no cool', 'no ac', 'baby', 'warm air')) {
    urgency = 'urgent';
  } else if (has('maintenance', 'not an emergency', 'tune-up', 'quote')) {
    urgency = 'low';
  }

  if (has('north')) zone = 'north';
  else if (has('south')) zone = 'south';
  else zone = 'central';

  // Invariante: el issue nunca vacío.
  const issue = t.trim()
    ? t.replace(/\s+/g, ' ').trim()
    : 'Missed call — no service requested';

  return { issue, serviceType, urgency, zone, estimatedTicket: ticket };
}

// Rol: genera una llamada simulada realista y su intención parseada (consistente).
// DETERMINISTA (ponytail): sin contador global mutable — un módulo global `callIdx`
// rompe la hidratación SSR (el server renderiza con un índice y el client con otro →
// React error #418). Devuelve SIEMPRE el escenario [0] para que SSR y client coincidan.
// La variedad de llamadas la aportan los loops (call feed), no este inicial.
export function simulateMissedCall(): { transcript: string; intent: ParsedIntent } {
  const s = SCENARIOS[0];
  const transcript = s.phrase;
  return { transcript, intent: parseCallTranscript(transcript) };
}
