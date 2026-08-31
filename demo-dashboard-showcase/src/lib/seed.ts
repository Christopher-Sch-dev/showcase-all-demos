import type { Cita, DemoState, Paciente, Tratamiento } from './types';

// rol: base temporal de la demo (pasado) para createdAt/updatedAt válidos y anteriores a `now`.
const SEED_BASE = 1_700_000_000_000; // 2023-11-14, siempre < Date.now() en la demo

// rol: construir un paciente seed con datos financieros coherentes.
function makePaciente( id: string,
 nombre: string,
 rut: string,
 email: string,
 telefono: string,
 tratamiento: Tratamiento,
 estado: Paciente['estado'],
 revenueTotal: number,
 citasProgramadas: number,
 noShows: number,
 ultimaCita: string,
): Paciente {
 return {
 id,
 nombre,
 rut,
 email,
 telefono,
 ultimaVisita: ultimaCita,
 tratamiento,
 estado,
 revenueTotal,
 citasProgramadas,
 noShows,
 ultimaCita,
 createdAt: SEED_BASE,
 updatedAt: SEED_BASE,
 };
}

// rol: construir una cita seed con fecha y valor (para charts por mes/tratamiento).
function makeCita( id: string,
 pacienteId: string,
 fecha: string,
 tratamiento: Tratamiento,
 estado: Cita['estado'],
 valor: number,
): Cita {
 return {
 id,
 pacienteId,
 fecha,
 tratamiento,
 estado,
 valor,
 createdAt: SEED_BASE,
 updatedAt: SEED_BASE,
 };
}

/** Pacientes seed realistas (nombres reales, datos financieros, nunca lorem). */
export const seedPacientes: Paciente[] = [
 makePaciente('P1', 'María Fernández', '12.345.678-9', 'maria.fernandez@example.com', '+56 9 1234 5678', 'Limpieza', 'activo', 1250, 5, 0, '2026-08-18'),
 makePaciente('P2', 'Juan Pérez', '9.876.543-2', 'juan.perez@example.com', '+56 9 2345 6789', 'Ortodoncia', 'activo', 3200, 8, 1, '2026-08-12'),
 makePaciente('P3', 'Carolina Soto', '15.234.567-1', 'carolina.soto@example.com', '+56 9 3456 7890', 'Blanqueamiento', 'activo', 800, 3, 0, '2026-07-28'),
 makePaciente('P4', 'Andrés Rojas', '11.111.222-3', 'andres.rojas@example.com', '+56 9 4567 8901', 'Implante', 'activo', 5400, 6, 1, '2026-08-05'),
 makePaciente('P5', 'Valentina Muñoz', '18.765.432-1', 'valentina.munoz@example.com', '+56 9 5678 9012', 'Endodoncia', 'activo', 2100, 4, 0, '2026-06-30'),
 makePaciente('P6', 'Diego Castro', '13.579.246-8', 'diego.castro@example.com', '+56 9 6789 0123', 'Limpieza', 'inactivo', 450, 2, 1, '2026-03-15'),
 makePaciente('P7', 'Francisca Herrera', '16.864.209-5', 'francisca.herrera@example.com', '+56 9 7890 1234', 'Ortodoncia', 'inactivo', 1800, 5, 2, '2026-02-20'),
 makePaciente('P8', 'Rodrigo Salinas', '10.246.813-5', 'rodrigo.salinas@example.com', '+56 9 8901 2345', 'Blanqueamiento', 'pendiente', 0, 1, 0, '2026-08-20'),
 makePaciente('P9', 'Camila Torres', '14.802.468-1', 'camila.torres@example.com', '+56 9 9012 3456', 'Implante', 'pendiente', 0, 1, 0, '2026-08-22'),
];

/** Citas seed realistas cubriendo los 5 estados de la FSM y varios meses. */
export const seedCitas: Cita[] = [
 // ── completadas (revenue) ──
 makeCita('C1', 'P1', '2026-08-18', 'Limpieza', 'completed', 120),
 makeCita('C2', 'P2', '2026-08-12', 'Ortodoncia', 'completed', 400),
 makeCita('C3', 'P4', '2026-08-05', 'Implante', 'completed', 1800),
 makeCita('C4', 'P5', '2026-06-30', 'Endodoncia', 'completed', 700),
 makeCita('C5', 'P3', '2026-07-28', 'Blanqueamiento', 'completed', 350),
 makeCita('C6', 'P1', '2026-07-10', 'Limpieza', 'completed', 120),
 makeCita('C7', 'P2', '2026-06-15', 'Ortodoncia', 'completed', 400),
 makeCita('C8', 'P4', '2026-05-20', 'Implante', 'completed', 1800),
 // ── confirmadas (programadas) ──
 makeCita('C9', 'P1', '2026-09-02', 'Limpieza', 'confirmed', 120),
 makeCita('C10', 'P2', '2026-09-10', 'Ortodoncia', 'confirmed', 400),
 // ── scheduled (programadas sin confirmar) ──
 makeCita('C11', 'P8', '2026-09-05', 'Blanqueamiento', 'scheduled', 350),
 makeCita('C12', 'P9', '2026-09-12', 'Implante', 'scheduled', 1800),
 // ── no_show (recuperables) ──
 makeCita('C13', 'P6', '2026-03-15', 'Limpieza', 'no_show', 120),
 makeCita('C14', 'P7', '2026-02-20', 'Ortodoncia', 'no_show', 400),
 // ── cancelled ──
 makeCita('C15', 'P7', '2026-04-10', 'Ortodoncia', 'cancelled', 400),
];

/**
 * Estado inicial (seed) de la demo dashboard dental.
 * Crea una copia FRESCA en cada llamada (reset = re-seed sin mutar el estado previo).
 */
export function createSeedState(): DemoState {
 return {
 version: 1,
 pacientes: seedPacientes.map((p) => ({ ...p })),
 citas: seedCitas.map((c) => ({ ...c })),
 pacienteCounter: seedPacientes.length,
 citaCounter: seedCitas.length,
 seeded: true,
 };
}
