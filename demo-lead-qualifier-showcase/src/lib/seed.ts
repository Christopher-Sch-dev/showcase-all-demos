import type { DemoState, Lead, Niche, LeadStatus } from './types';
import { urgencyFromScore } from './score';
import { CALENDLY_URL } from './constants';

// rol: base temporal de la demo (pasado) para capturedAt válido y anterior a `now`.
const SEED_BASE = 1_700_000_000_000; // 2023-11-14, siempre < Date.now() en la demo

// rol: construir un lead seed con timeline coherente (captura → respuesta → estado).
function makeLead(
  id: string,
  status: LeadStatus,
  niche: Niche,
  name: string,
  email: string,
  phone: string,
  topic: string,
  score: number,
  reason: string,
  capturedOffsetMs: number,
): Lead {
  const capturedAt = SEED_BASE - capturedOffsetMs;
  const respondedAt = capturedAt + 45_000; // respuesta en <60s (AC-01)
  const bookedAt = respondedAt + 5 * 60_000;

  const timeline: Lead['timeline'] = [{ status: 'new', at: capturedAt }];
  if (status !== 'new') {
    timeline.push({ status: 'qualified', at: respondedAt, note: reason });
  }
  if (status === 'booked') {
    timeline.push({ status: 'booked', at: bookedAt, note: 'Booked via Calendly' });
  }

  return {
    id,
    status,
    niche,
    source: 'form',
    name,
    email,
    phone,
    topic,
    urgency: urgencyFromScore(score), // fuente única de urgencia: score.ts (AC-2)
    capturedAt,
    respondedAt: status === 'new' ? undefined : respondedAt,
    qualification: status === 'new' ? undefined : { score, reason },
    bookedAt: status === 'booked' ? bookedAt : undefined,
    bookingUrl: status === 'booked' ? CALENDLY_URL : undefined,
    timeline,
    createdAt: capturedAt,
    updatedAt: status === 'booked' ? bookedAt : respondedAt,
  };
}

// rol: 5 leads pre-existentes cubriendo ambos nichos y todos los estados (feature Background).
export const seedLeads: Lead[] = [
  makeLead(
    'L1',
    'booked',
    'realestate',
    'María González',
    'maria.g@example.com',
    '555-0100',
    'looking for 4-bedroom house under $600k in North Dallas',
    94,
    'Real estate lead: shows buying intent; budget adequate for purchase.',
    2 * 60 * 60 * 1000, // capturado hace 2h
  ),
  makeLead(
    'L2',
    'qualified',
    'realestate',
    'James Whitfield',
    'james.w@example.com',
    '555-0177',
    'selling my condo near downtown, flexible timeline',
    88,
    'Real estate lead: shows selling intent; budget provided.',
    5 * 60 * 60 * 1000, // capturado hace 5h
  ),
  makeLead(
    'L3',
    'qualified',
    'law',
    'Elena Ruiz',
    'elena.r@example.com',
    '555-0110',
    'family law consult about child custody, urgent',
    81,
    'Law lead: identifiable family case type; urgency expressed.',
    3 * 60 * 60 * 1000, // capturado hace 3h
  ),
  makeLead(
    'L4',
    'booked',
    'law',
    'Priya Nair',
    'priya.n@example.com',
    '555-0199',
    'contract dispute, need representation ASAP',
    90,
    'Law lead: identifiable contract case; urgency expressed.',
    90 * 60 * 1000, // capturado hace 1.5h
  ),
  makeLead(
    'L5',
    'new',
    'realestate',
    'Tom Becker',
    'tom.b@example.com',
    '555-0163',
    'looking for a townhouse under $400k',
    0,
    '',
    4 * 60 * 60 * 1000, // capturado hace 4h
  ),
];

/**
 * Estado inicial (seed) de la demo lead-qualifier.
 * Crea una copia FRESCA en cada llamada (reset = re-seed sin mutar el estado previo).
 */
export function createSeedState(): DemoState {
  return {
    version: 1,
    leads: seedLeads.map((l) => ({ ...l, timeline: l.timeline.map((e) => ({ ...e })) })),
    leadCounter: seedLeads.length,
    seeded: true,
  };
}
