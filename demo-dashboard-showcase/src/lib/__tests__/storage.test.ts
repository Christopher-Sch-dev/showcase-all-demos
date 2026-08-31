import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadState, saveState, resetDemo, STORAGE_KEY } from '../storage';
import { seedPacientes, seedCitas } from '../seed';
import type { Cita, DemoState, Paciente } from '../types';

// rol: suite de persistencia en localStorage . Deep validation:
// localStorage corrupto NUNCA crashea → fallback a seed (best practice web validada).

describe('storage — seed ÚNICO inyectado desde seed.ts (DI, no seed duplicado)', () => {
 beforeEach(() => localStorage.clear());
 afterEach(() => localStorage.clear());

 it('loadState usa EXACTAMENTE el seed de seed.ts (DI, no seed duplicado)', () => {
 const state = loadState();
 expect(state.pacientes).toHaveLength(seedPacientes.length);
 expect(state.citas).toHaveLength(seedCitas.length);
 const seedIds = seedPacientes.map((p) => p.id).sort();
 const stateIds = state.pacientes.map((p) => p.id).sort();
 expect(stateIds).toEqual(seedIds);
 });

 it('createSeedState arma el estado global con contadores coherentes', () => {
 const s = loadState();
 expect(s.version).toBe(1);
 expect(s.seeded).toBe(true);
 expect(s.pacienteCounter).toBeGreaterThanOrEqual(seedPacientes.length);
 expect(s.citaCounter).toBeGreaterThanOrEqual(seedCitas.length);
 });
});

describe('storage — loadState con versión y fallback', () => {
 beforeEach(() => localStorage.clear());
 afterEach(() => localStorage.clear());

 it('sin datos en localStorage → devuelve estado seed válido (no lanza)', () => {
 const state = loadState();
 expect(state.version).toBe(1);
 expect(Array.isArray(state.pacientes)).toBe(true);
 expect(state.seeded).toBe(true);
 });

 it('JSON corrupto → fallback a seed sin lanzar', () => {
 localStorage.setItem(STORAGE_KEY, '{"version":1,"pacientes":['); // JSON inválido
 const state = loadState();
 expect(state.seeded).toBe(true);
 expect(state.pacientes.length).toBeGreaterThan(0);
 });

 it('versión incompatible → fallback a seed', () => {
 localStorage.setItem( STORAGE_KEY,
 JSON.stringify({ version: 99, pacientes: [], citas: [], pacienteCounter: 5, citaCounter: 5, seeded: true }),
);
 const state = loadState();
 expect(state.version).toBe(1);
 expect(state.seeded).toBe(true);
 });

 it('carga correctamente un estado guardado (round-trip)', () => {
 const state = loadState();
 saveState(state);
 const loaded = loadState();
 expect(loaded).toEqual(state);
 expect(loaded.pacientes.length).toBe(state.pacientes.length);
 });

 it('round-trip de un estado VÁLIDO no-seed pasa por la validación (no cae a seed)', () => {
 // Guarda un estado válido con un paciente/cita MODIFICADO (no el seed).
 // Si la validación de shape estuviera rota (siempre false), loadState caería
 // a seed y el round-trip fallaría → mata los mutantes de isValidPaciente/isValidCita.
 const base = loadState();
 const custom: DemoState = {
 ...base,
 pacientes: [{ ...base.pacientes[0], nombre: 'Paciente Editado', revenueTotal: 999 }],
 citas: [{ ...base.citas[0], valor: 777 }],
 };
 saveState(custom);
 const loaded = loadState();
 expect(loaded).toEqual(custom);
 expect(loaded.pacientes[0].nombre).toBe('Paciente Editado');
 expect(loaded.pacientes[0].revenueTotal).toBe(999);
 expect(loaded.citas[0].valor).toBe(777);
 });
});

describe('storage — localStorage corrupto a nivel de contenido (deep validation)', () => {
 beforeEach(() => localStorage.clear());
 afterEach(() => localStorage.clear());

 // rol: guardar un estado válido como base para corromper campos individuales.
 function storedBaseline(): DemoState {
 const s = loadState();
 saveState(s);
 return s;
 }

 // rol: afirmar que loadState devolvió el SEED COMPLETO (no el estado corrupto).
 // Distingue fallback de pass-through: el estado corrupto tiene 1 paciente/cita,
 // el seed tiene seedPacientes.length/seedCitas.length.
 function expectFullSeed(state: DemoState): void {
 expect(state.seeded).toBe(true);
 expect(state.pacientes).toHaveLength(seedPacientes.length);
 expect(state.citas).toHaveLength(seedCitas.length);
 expect(state.pacientes[0].nombre).toBe(seedPacientes[0].nombre);
 }

 it('paciente con estado inválido → fallback a seed (no crashea KPI/UI)', () => {
 storedBaseline();
 const base = loadState();
 const corrupt = { ...base, pacientes: [{ ...base.pacientes[0], estado: 'bogus' }] };
 localStorage.setItem(STORAGE_KEY, JSON.stringify(corrupt));
 expectFullSeed(loadState());
 });

 it('paciente con tratamiento inválido → fallback a seed', () => {
 storedBaseline();
 const base = loadState();
 localStorage.setItem( STORAGE_KEY,
 JSON.stringify({ ...base, pacientes: [{ ...base.pacientes[0], tratamiento: 'plumbing' }] }),
);
 expectFullSeed(loadState());
 });

 it('paciente con revenueTotal no numérico → fallback a seed', () => {
 storedBaseline();
 const base = loadState();
 localStorage.setItem( STORAGE_KEY,
 JSON.stringify({ ...base, pacientes: [{ ...base.pacientes[0], revenueTotal: 'mucho' }] }),
);
 expectFullSeed(loadState());
 });

 it('paciente sin id → fallback a seed', () => {
 storedBaseline();
 const base = loadState();
 const { id, ...noId } = base.pacientes[0];
 void id;
 localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...base, pacientes: [noId] }));
 expectFullSeed(loadState());
 });

 it('cita con estado inválido → fallback a seed', () => {
 storedBaseline();
 const base = loadState();
 localStorage.setItem( STORAGE_KEY,
 JSON.stringify({ ...base, citas: [{ ...base.citas[0], estado: 'bogus' }] }),
);
 expectFullSeed(loadState());
 });

 it('cita con valor no numérico → fallback a seed', () => {
 storedBaseline();
 const base = loadState();
 localStorage.setItem( STORAGE_KEY,
 JSON.stringify({ ...base, citas: [{ ...base.citas[0], valor: 'gratis' }] }),
);
 expectFullSeed(loadState());
 });

 it('pacientes no es array → fallback a seed', () => {
 localStorage.setItem( STORAGE_KEY,
 JSON.stringify({ version: 1, pacientes: 'nope', citas: [], pacienteCounter: 0, citaCounter: 0, seeded: true }),
);
 expectFullSeed(loadState());
 });

 it('parsed no es objeto (null / string / número) → fallback a seed sin lanzar', () => {
 localStorage.setItem(STORAGE_KEY, 'null');
 expectFullSeed(loadState());
 localStorage.setItem(STORAGE_KEY, '"hello"');
 expectFullSeed(loadState());
 localStorage.setItem(STORAGE_KEY, '42');
 expectFullSeed(loadState());
 });

 // rol: corromper CADA campo de un paciente/cita para matar los mutantes de
 // validación de shape (typeof x.field === 'string' → '!=='). Cada campo corrupto
 // debe disparar fallback a seed.
 it('cada campo de un paciente corrupto → fallback a seed (shape-safety total)', () => {
 storedBaseline();
 const base = loadState();
 const p = base.pacientes[0];
 const stringFields: (keyof Paciente)[] = ['id', 'nombre', 'rut', 'email', 'telefono', 'ultimaVisita', 'ultimaCita'];
 const numberFields: (keyof Paciente)[] = ['revenueTotal', 'citasProgramadas', 'noShows', 'createdAt', 'updatedAt'];
 for (const f of stringFields) {
 localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...base, pacientes: [{ ...p, [f]: 123 }] }));
 expectFullSeed(loadState());
 }
 for (const f of numberFields) {
 localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...base, pacientes: [{ ...p, [f]: 'x' }] }));
 expectFullSeed(loadState());
 }
 });

 it('cada campo de una cita corrupto → fallback a seed (shape-safety total)', () => {
 storedBaseline();
 const base = loadState();
 const c = base.citas[0];
 const stringFields: (keyof Cita)[] = ['id', 'pacienteId', 'fecha'];
 const numberFields: (keyof Cita)[] = ['valor', 'createdAt', 'updatedAt'];
 for (const f of stringFields) {
 localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...base, citas: [{ ...c, [f]: 123 }] }));
 expectFullSeed(loadState());
 }
 for (const f of numberFields) {
 localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...base, citas: [{ ...c, [f]: 'x' }] }));
 expectFullSeed(loadState());
 }
 });
});

describe('storage — saveState / resetDemo', () => {
 beforeEach(() => localStorage.clear());
 afterEach(() => localStorage.clear());

 it('saveState persiste el estado en la clave correcta', () => {
 const state: DemoState = {
 version: 1,
 pacientes: [],
 citas: [],
 pacienteCounter: 7,
 citaCounter: 3,
 seeded: true,
 };
 saveState(state);
 expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
 expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).pacienteCounter).toBe(7);
 });

 it('resetDemo limpia localStorage de la clave demo', () => {
 saveState(loadState());
 expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
 resetDemo();
 expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
 });
});
