import type { DemoState, Lead, LeadStatus, Niche, Urgency } from './types';
import { createSeedState } from './seed';

// rol: persistencia del estado de la demo en localStorage con versionado y fallback
// (spec AC-9: persistencia por sesión, clave 'demo-lead-qualifier:v1').
// El seed NO se duplica aquí: se inyecta desde seed.ts (DI, Mandamiento 2) → una
// única fuente de verdad (seedLeads). Solo guardamos la definición del fallback.

export const STORAGE_KEY = 'demo-lead-qualifier:v1';

export const CURRENT_VERSION = 1;

const VALID_STATUSES = new Set<Lead['status']>(['new', 'qualified', 'booked']);
const VALID_NICHES = new Set<Niche>(['realestate', 'law']);
const VALID_URGENCIES = new Set<Urgency>(['low', 'normal', 'high', 'urgent']);

// rol: validar que un lead del estado persistido respete el contrato mínimo de tipos.
// Si cualquier lead está malformado → el estado completo es corrupto → rollback a seed.
// Esto evita que un status inválido crashee deriveKpi/StatusBadge o produzca KPIs raros.
function isValidLead(l: unknown): l is Lead {
  if (typeof l !== 'object' || l === null) return false;
  const x = l as Record<string, unknown>;
  return (
    typeof x.id === 'string' &&
    typeof x.status === 'string' &&
    VALID_STATUSES.has(x.status as Lead['status']) &&
    typeof x.niche === 'string' &&
    VALID_NICHES.has(x.niche as Niche) &&
    typeof x.urgency === 'string' &&
    VALID_URGENCIES.has(x.urgency as Urgency) &&
    typeof x.name === 'string' &&
    typeof x.capturedAt === 'number' &&
    Array.isArray(x.timeline)
  );
}

// rol: carga el estado; versionado + rollback corrupto/incompatible → seed (seed.ts).
export function loadState(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedState();
    const parsed = JSON.parse(raw) as DemoState;
    if (!parsed || typeof parsed !== 'object' || parsed.version !== CURRENT_VERSION) {
      return createSeedState();
    }
    // validación profunda: arrays + cada elemento con contrato válido.
    if (
      !Array.isArray(parsed.leads) ||
      typeof parsed.leadCounter !== 'number' ||
      !parsed.leads.every(isValidLead)
    ) {
      return createSeedState();
    }
    return parsed;
  } catch {
    return createSeedState();
  }
}

// rol: persiste el estado completo en la clave demo.
export function saveState(state: DemoState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// rol: limpia el estado demo del localStorage (Restore seed → Gherkin AC).
export function resetDemo(): void {
  localStorage.removeItem(STORAGE_KEY);
}
