import type { DemoState, Lead } from './types';
import { createSeedState } from './seed';
import { STORAGE_KEY } from './ai';

// rol: persistencia del estado de la demo en localStorage con versionado y fallback

export const CURRENT_VERSION = 1;

// rol: validar que un lead del estado persistido respete el contrato mínimo de tipos
// (id string, status es un LeadStatus conocido, timestamps numéricos). Si cualquier
// lead está malformado → el estado completo es corrupto → fallback a seed. Esto evita
// que un lead con status inválido crashee deriveKpi/StatusBadge o produzca KPIs raros.
const VALID_STATUSES = new Set([
  'lead', 'qualified', 'booked', 'scheduled', 'dispatched',
  'in_progress', 'completed', 'invoiced', 'no_show', 'canceled',
]);

function isValidLead(l: unknown): l is Lead {
  if (typeof l !== 'object' || l === null) return false;
  const x = l as Record<string, unknown>;
  return (
    typeof x.id === 'string' &&
    typeof x.status === 'string' &&
    VALID_STATUSES.has(x.status) &&
    typeof x.capturedAt === 'number' &&
    Array.isArray(x.timeline)
  );
}

// rol: validar que un técnico respete el contrato mínimo.
function isValidTechnician(t: unknown): boolean {
  if (typeof t !== 'object' || t === null) return false;
  const x = t as Record<string, unknown>;
  return (
    typeof x.id === 'string' &&
    typeof x.name === 'string' &&
    typeof x.zone === 'string' &&
    typeof x.active === 'boolean'
  );
}

// rol: carga el estado; versionado + fallback corrupto/incompatible → seed (reutiliza seed.ts).
export function loadState(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedState();
    const parsed = JSON.parse(raw) as DemoState;
    if (!parsed || parsed.version !== CURRENT_VERSION) return createSeedState();
    // validación profunda: arrays + cada elemento con contrato válido.
    if (
      !Array.isArray(parsed.leads) ||
      !Array.isArray(parsed.technicians) ||
      !parsed.leads.every(isValidLead) ||
      !parsed.technicians.every(isValidTechnician)
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
