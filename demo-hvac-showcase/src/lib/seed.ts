import type { DemoState, Lead, Technician } from './types';

// Zona de referencia por zona para el seed de la demo.
const ZONE_SEED_BASE = 1_700_000_000_000;

// rol: 3 técnicos de campo, uno por zona, con color distinto (spec + feature Background).
export const seedTechnicians: Technician[] = [
  { id: 'tech-north', name: 'Carlos', color: '#2563EB', zone: 'north', active: true },
  { id: 'tech-central', name: 'Ana', color: '#9333EA', zone: 'central', active: true },
  { id: 'tech-south', name: 'Mike', color: '#0D9488', zone: 'south', active: true },
];

// rol: construir un lead qualified con timeline coherente (captura → respuesta → qualify).
function makeQualifiedLead(
  id: string,
  name: string,
  phone: string,
  address: string,
  city: string,
  issue: string,
  zone: Lead['zone'],
  priority: Lead['priority'],
  score: number,
  reason: string,
  capturedOffsetMs: number,
): Lead {
  const capturedAt = ZONE_SEED_BASE - capturedOffsetMs;
  const respondedAt = capturedAt + 3 * 60_000; // respuesta en 3 min (< 5 min objetivo)
  return {
    id,
    status: 'qualified',
    customerName: name,
    customerPhone: phone,
    address,
    city,
    issue,
    zone,
    priority,
    capturedAt,
    respondedAt,
    qualification: { score, reason },
    timeline: [
      { status: 'lead', at: capturedAt },
      { status: 'qualified', at: respondedAt, note: reason },
    ],
    createdAt: capturedAt,
    updatedAt: respondedAt,
  };
}

// rol: 5 leads pre-existentes en estado qualified repartidos por las 3 zonas (feature Background).
export const seedLeads: Lead[] = [
  makeQualifiedLead(
    'L1',
    'María González',
    '555-0142',
    '48 Oak Ridge Dr',
    'Northville',
    'AC not cooling, upstairs thermostat dead',
    'north',
    'high',
    88,
    'High urgency: no cooling during heat wave, owns the system, ready to book.',
    2 * 60 * 60 * 1000, // capturado hace 2h
  ),
  makeQualifiedLead(
    'L2',
    'James Whitfield',
    '555-0177',
    '1209 Pine Ave',
    'Northville',
    'Furnace short-cycling and making loud noise',
    'north',
    'normal',
    74,
    'Needs repair, moderate budget, flexible on scheduling.',
    5 * 60 * 60 * 1000, // capturado hace 5h
  ),
  makeQualifiedLead(
    'L3',
    'Elena Ruiz',
    '555-0110',
    '77 Central Blvd',
    'Central City',
    'Air handler leaking water in attic',
    'central',
    'normal',
    81,
    'Clear symptom, homeowner insurance claim likely, wants quote first.',
    3 * 60 * 60 * 1000, // capturado hace 3h
  ),
  makeQualifiedLead(
    'L4',
    'Priya Nair',
    '555-0199',
    '33 Willow Ln',
    'Central City',
    'No heating at all, pilot light keeps going out',
    'central',
    'urgent',
    92,
    'Urgent: no heat in freezing weather, two kids at home, ready to book today.',
    90 * 60 * 1000, // capturado hace 1.5h
  ),
  makeQualifiedLead(
    'L5',
    'Tom Becker',
    '555-0163',
    '215 Harbor St',
    'Southport',
    'Condenser unit not turning on after storm',
    'south',
    'high',
    85,
    'Storm damage likely covered, prompt response requested.',
    4 * 60 * 60 * 1000, // capturado hace 4h
  ),
];

/**
 * Estado inicial (seed) aplicado de la demo.
 * Crea una copia FRESCA en cada llamada (reset = re-seed sin mutar el estado anterior).
 */
export function createSeedState(): DemoState {
  return {
    version: 1,
    leads: seedLeads.map((l) => ({ ...l, timeline: l.timeline.map((e) => ({ ...e })) })),
    technicians: seedTechnicians.map((t) => ({ ...t })),
    callCounter: seedLeads.length,
    seeded: true,
  };
}
