// pacientes.ts — lógica pura del CRUD (extraída del index.astro para testing).
// 1+1: ESTA es la fuente de verdad. El index.astro la usa (o importa si es TS).

export interface Paciente {
  id: string;
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
  ultimaVisita: string;
  tratamiento: string;
  estado: 'activo' | 'inactivo' | 'pendiente';
}

export const STORAGE_KEY = 'sonrisa.pacientes';

export const seedPacientes: Paciente[] = [
  { id: 'p1', nombre: 'María Fernández', rut: '12.345.678-9', email: 'maria.f@example.com', telefono: '+569****5678', ultimaVisita: '2026-06-15', tratamiento: 'Limpieza profunda', estado: 'activo' },
  { id: 'p2', nombre: 'Juan Pérez', rut: '15.876.543-2', email: 'juan.perez@example.com', telefono: '+569****4321', ultimaVisita: '2026-07-02', tratamiento: 'Ortodoncia invisible', estado: 'activo' },
  { id: 'p3', nombre: 'Carolina Soto', rut: '18.234.567-1', email: 'carolina.soto@example.com', telefono: '+569****6789', ultimaVisita: '2026-04-20', tratamiento: 'Blanqueamiento', estado: 'inactivo' },
];

const CAMPOS: (keyof Paciente)[] = ['id', 'nombre', 'rut', 'email', 'telefono', 'ultimaVisita', 'tratamiento', 'estado'];

export function isPacienteArray(v: unknown): v is Paciente[] {
  return Array.isArray(v) && v.every(
    (x) => x && typeof x === 'object'
      && CAMPOS.every((k) => typeof (x as Record<keyof Paciente, unknown>)[k] === 'string')
      && ['activo', 'inactivo', 'pendiente'].includes((x as Paciente).estado)
  );
}

export function load(storage: Storage): Paciente[] {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    storage.setItem(STORAGE_KEY, JSON.stringify(seedPacientes));
    return [...seedPacientes];
  }
  try {
    const parsed = JSON.parse(raw);
    if (!isPacienteArray(parsed)) {
      storage.setItem(STORAGE_KEY, JSON.stringify(seedPacientes));
      return [...seedPacientes];
    }
    return parsed;
  } catch {
    return [...seedPacientes];
  }
}

export function save(storage: Storage, list: Paciente[]): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function uuid(): string {
  return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function escapeHtml(s: unknown): string {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

export function normalizeText(s: unknown): string {
  return String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function filterPacientes(
  all: Paciente[],
  query: string,
  estado: string,
): Paciente[] {
  const q = normalizeText(query.trim());
  return all.filter((p) => {
    const matchQ = !q
      || normalizeText(p.nombre).includes(q)
      || normalizeText(p.rut).includes(q)
      || normalizeText(p.email).includes(q);
    const matchF = !estado || p.estado === estado;
    return matchQ && matchF;
  });
}

export function stats(all: Paciente[]) {
  return {
    total: all.length,
    activo: all.filter((p) => p.estado === 'activo').length,
    inactivo: all.filter((p) => p.estado === 'inactivo').length,
    pendiente: all.filter((p) => p.estado === 'pendiente').length,
  };
}

export function upsertPaciente(list: Paciente[], rec: Paciente): Paciente[] {
  const existing = list.findIndex((p) => p.id === rec.id);
  if (existing >= 0) {
    const next = [...list];
    next[existing] = rec;
    return next;
  }
  return [rec, ...list];
}

export function deletePaciente(list: Paciente[], id: string): Paciente[] {
  return list.filter((p) => p.id !== id);
}

export const ESTADOS: Paciente['estado'][] = ['activo', 'inactivo', 'pendiente'];

export function buildPaciente(form: Record<string, FormDataEntryValue | null>): Paciente {
  const nombre = String(form.nombre || '').trim();
  if (!nombre) {
    throw new Error('nombre es requerido');
  }
  const estado = String(form.estado || 'activo');
  if (!ESTADOS.includes(estado as Paciente['estado'])) {
    throw new Error(`estado inválido: ${estado}`);
  }
  return {
    id: String(form.id || uuid()),
    nombre,
    rut: String(form.rut || '').trim(),
    email: String(form.email || '').trim(),
    telefono: String(form.telefono || '').trim(),
    tratamiento: String(form.tratamiento || '').trim(),
    estado: estado as Paciente['estado'],
    ultimaVisita: String(form.ultimaVisita || ''),
  };
}
