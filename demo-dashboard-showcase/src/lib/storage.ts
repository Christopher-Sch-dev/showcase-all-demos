import type { Cita, CitaStatus, DemoState, Paciente, PacienteEstado, Tratamiento } from './types';
import { createSeedState } from './seed';
import { CURRENT_VERSION, STORAGE_KEY } from './constants';

// re-export de la clave de persistencia.
export { STORAGE_KEY, CURRENT_VERSION };

// rol: persistencia del estado de la demo en localStorage con versionado y fallback
// .
// El seed NO se duplica aquí: se inyecta desde seed.ts (DI,) → una
// única fuente de verdad (seedPacientes/seedCitas). Solo guardamos la definición del fallback.
// Best practice web validada: try/catch + versionado + deep validation → fallback a seed
// (localStorage corrupto NUNCA crashea la app).

const VALID_CITA_STATUS = new Set<CitaStatus>(['scheduled', 'confirmed', 'completed', 'no_show', 'cancelled']);
const VALID_PACIENTE_ESTADO = new Set<PacienteEstado>(['activo', 'inactivo', 'pendiente']);
const VALID_TRATAMIENTO = new Set<Tratamiento>(['Limpieza', 'Ortodoncia', 'Blanqueamiento', 'Implante', 'Endodoncia']);

// rol: validar que un paciente del estado persistido respete el contrato mínimo de tipos.
// Si cualquier paciente está malformado → el estado completo es corrupto → rollback a seed.
function isValidPaciente(p: unknown): p is Paciente {
 if (typeof p !== 'object' || p === null) return false;
 const x = p as Record<string, unknown>;
 return ( typeof x.id === 'string' &&
 typeof x.nombre === 'string' &&
 typeof x.rut === 'string' &&
 typeof x.email === 'string' &&
 typeof x.telefono === 'string' &&
 typeof x.ultimaVisita === 'string' &&
 typeof x.tratamiento === 'string' &&
 VALID_TRATAMIENTO.has(x.tratamiento as Tratamiento) &&
 typeof x.estado === 'string' &&
 VALID_PACIENTE_ESTADO.has(x.estado as PacienteEstado) &&
 typeof x.revenueTotal === 'number' &&
 typeof x.citasProgramadas === 'number' &&
 typeof x.noShows === 'number' &&
 typeof x.ultimaCita === 'string' &&
 typeof x.createdAt === 'number' &&
 typeof x.updatedAt === 'number'
);
}

// rol: validar que una cita del estado persistido respete el contrato mínimo de tipos.
function isValidCita(c: unknown): c is Cita {
 if (typeof c !== 'object' || c === null) return false;
 const x = c as Record<string, unknown>;
 return ( typeof x.id === 'string' &&
 typeof x.pacienteId === 'string' &&
 typeof x.fecha === 'string' &&
 typeof x.tratamiento === 'string' &&
 VALID_TRATAMIENTO.has(x.tratamiento as Tratamiento) &&
 typeof x.estado === 'string' &&
 VALID_CITA_STATUS.has(x.estado as CitaStatus) &&
 typeof x.valor === 'number' &&
 typeof x.createdAt === 'number' &&
 typeof x.updatedAt === 'number'
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
 if ( !Array.isArray(parsed.pacientes) ||
 !Array.isArray(parsed.citas) ||
 typeof parsed.pacienteCounter !== 'number' ||
 typeof parsed.citaCounter !== 'number' ||
 !parsed.pacientes.every(isValidPaciente) ||
 !parsed.citas.every(isValidCita)
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
