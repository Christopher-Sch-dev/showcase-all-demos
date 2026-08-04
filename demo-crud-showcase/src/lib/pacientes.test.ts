import { describe, it, expect, beforeEach } from 'vitest';
import {
  Paciente,
  seedPacientes,
  STORAGE_KEY,
  load,
  save,
  uuid,
  escapeHtml,
  filterPacientes,
  stats,
  upsertPaciente,
  deletePaciente,
  buildPaciente,
} from './pacientes';

// Mock de Storage (localStorage compatible)
function mockStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() { return store.size; },
    clear: () => store.clear(),
    getItem: (k: string) => store.get(k) ?? null,
    key: (i: number) => [...store.keys()][i] ?? null,
    removeItem: (k: string) => { store.delete(k); },
    setItem: (k: string, v: string) => { store.set(k, v); },
  } as Storage;
}

describe('load', () => {
  it('si no hay datos, siembra los seedPacientes', () => {
    const s = mockStorage();
    const result = load(s);
    expect(result).toHaveLength(3);
    expect(s.getItem(STORAGE_KEY)).toBeTruthy();
  });

  it('si hay datos válidos, los parsea', () => {
    const s = mockStorage();
    s.setItem(STORAGE_KEY, JSON.stringify([{ id: 'x1', nombre: 'Test', rut: '1-1', email: 'a@b.c', telefono: '555', ultimaVisita: '2026-01-01', tratamiento: 'Limpieza', estado: 'activo' }]));
    const result = load(s);
    expect(result).toHaveLength(1);
    expect(result[0].nombre).toBe('Test');
  });

  it('rechaza registros incompletos (shape-safety real: falta rut/estado)', () => {
    const s = mockStorage();
    s.setItem(STORAGE_KEY, JSON.stringify([{ id: 'x1', nombre: 'Test' }]));
    const result = load(s);
    expect(result).toHaveLength(3); // vuelve a seed — no crashea
  });

  it('rechaza estado inválido en load (shape-safety)', () => {
    const s = mockStorage();
    s.setItem(STORAGE_KEY, JSON.stringify([{ id: 'x1', nombre: 'Test', rut: '', email: '', telefono: '', ultimaVisita: '', tratamiento: '', estado: 'basura' }]));
    const result = load(s);
    expect(result).toHaveLength(3);
  });

  it('devuelve copia, no referencia compartida al seed (mutar no contamina)', () => {
    const s = mockStorage();
    const r1 = load(s);
    r1.push({ id: 'x9', nombre: 'Extra', rut: '', email: '', telefono: '', ultimaVisita: '', tratamiento: '', estado: 'activo' });
    const r2 = load(s);
    expect(r2).toHaveLength(3); // el seed no se contamina
  });

  it('si hay JSON corrupto, vuelve a seed (no crashea)', () => {
    const s = mockStorage();
    s.setItem(STORAGE_KEY, '{corrupto');
    const result = load(s);
    expect(result).toHaveLength(3);
  });

  it('si hay JSON válido de forma INCORRECTA (null), vuelve a seed (no crashea)', () => {
    const s = mockStorage();
    s.setItem(STORAGE_KEY, 'null');
    const result = load(s);
    expect(result).toHaveLength(3);
  });

  it('si hay JSON válido de forma INCORRECTA ({}), vuelve a seed', () => {
    const s = mockStorage();
    s.setItem(STORAGE_KEY, '{}');
    const result = load(s);
    expect(result).toHaveLength(3);
  });
});

describe('save', () => {
  it('persiste la lista en localStorage', () => {
    const s = mockStorage();
    save(s, [{ id: 'x', nombre: 'A', rut: '', email: '', telefono: '', ultimaVisita: '', tratamiento: '', estado: 'activo' }]);
    expect(JSON.parse(s.getItem(STORAGE_KEY)!) ).toHaveLength(1);
  });
});

describe('uuid', () => {
  it('genera ids únicos', () => {
    const a = uuid();
    const b = uuid();
    expect(a).not.toBe(b);
    expect(a.startsWith('p')).toBe(true);
  });
});

describe('escapeHtml', () => {
  it('escapa caracteres peligrosos', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    expect(escapeHtml('"&')).toBe('&quot;&amp;');
    expect(escapeHtml("'")).toBe('&#39;');
  });

  it('maneja no-strings sin crashear', () => {
    expect(escapeHtml(null)).toBe('null');
    expect(escapeHtml(undefined)).toBe('undefined');
  });
});

describe('filterPacientes', () => {
  it('filtra por query en nombre', () => {
    const r = filterPacientes(seedPacientes, 'maría', '');
    expect(r).toHaveLength(1);
    expect(r[0].nombre).toContain('María');
  });

  it('filtra por query en rut', () => {
    const r = filterPacientes(seedPacientes, '15.876', '');
    expect(r).toHaveLength(1);
    expect(r[0].rut).toBe('15.876.543-2');
  });

  it('filtra por estado', () => {
    const r = filterPacientes(seedPacientes, '', 'inactivo');
    expect(r).toHaveLength(1);
    expect(r[0].nombre).toBe('Carolina Soto');
  });

  it('combina query + estado', () => {
    const r = filterPacientes(seedPacientes, 'juan', 'activo');
    expect(r).toHaveLength(1);
  });

  it('query vacía devuelve todos (con filtro vacío)', () => {
    const r = filterPacientes(seedPacientes, '', '');
    expect(r).toHaveLength(3);
  });

  it('case insensitive', () => {
    const r = filterPacientes(seedPacientes, 'CAROLINA', '');
    expect(r).toHaveLength(1);
  });
});

describe('stats', () => {
  it('cuenta total, activos, inactivos, pendientes', () => {
    const r = stats(seedPacientes);
    expect(r.total).toBe(3);
    expect(r.activo).toBe(2);
    expect(r.inactivo).toBe(1);
    expect(r.pendiente).toBe(0);
  });
});

describe('upsertPaciente', () => {
  it('agrega nuevo paciente al inicio', () => {
    const nuevo: Paciente = { id: 'p9', nombre: 'Nuevo', rut: '', email: '', telefono: '', ultimaVisita: '', tratamiento: '', estado: 'pendiente' };
    const r = upsertPaciente(seedPacientes, nuevo);
    expect(r).toHaveLength(4);
    expect(r[0].id).toBe('p9');
  });

  it('actualiza paciente existente (mismo id)', () => {
    const editado: Paciente = { ...seedPacientes[0], nombre: 'María Editada' };
    const r = upsertPaciente(seedPacientes, editado);
    expect(r).toHaveLength(3);
    expect(r.find((p) => p.id === 'p1')!.nombre).toBe('María Editada');
  });
});

describe('deletePaciente', () => {
  it('elimina por id', () => {
    const r = deletePaciente(seedPacientes, 'p2');
    expect(r).toHaveLength(2);
    expect(r.find((p) => p.id === 'p2')).toBeUndefined();
  });
});

describe('buildPaciente', () => {
  it('construye rec con trim', () => {
    const rec = buildPaciente({ nombre: '  Cris  ', rut: 'x', email: '', telefono: '', tratamiento: '', estado: 'activo', ultimaVisita: '2026-08-02' });
    expect(rec.nombre).toBe('Cris');
  });

  it('defaults estado a activo', () => {
    const rec = buildPaciente({ nombre: 'A', rut: '', email: '', telefono: '', tratamiento: '', estado: '', ultimaVisita: '' });
    expect(rec.estado).toBe('activo');
    expect(rec.rut).toBe('');
    expect(rec.email).toBe('');
    expect(rec.telefono).toBe('');
    expect(rec.tratamiento).toBe('');
    expect(rec.ultimaVisita).toBe('');
  });

  it('rechaza nombre vacío (validación de dominio)', () => {
    expect(() => buildPaciente({ nombre: '   ', rut: '', email: '', telefono: '', tratamiento: '', estado: '', ultimaVisita: '' })).toThrow(/nombre/);
  });

  it('rechaza estado inválido (matando el cast mentiroso)', () => {
    expect(() => buildPaciente({ nombre: 'A', rut: '', email: '', telefono: '', tratamiento: '', estado: 'basura', ultimaVisita: '' })).toThrow(/estado/);
  });

  it('genera id si no viene', () => {
    const rec = buildPaciente({ nombre: 'A', rut: '', email: '', telefono: '', tratamiento: '', estado: '', ultimaVisita: '' });
    expect(rec.id.startsWith('p')).toBe(true);
  });
});

// ── Tests anti-mutante (matan survivors de lógica detectados por Stryker) ──

describe('anti-mutante: escapeHtml', () => {
  it('escapa TODOS los 5 caracteres en una cadena mixta', () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe('&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;');
  });

  it('escapa > también (StringLiteral en el map)', () => {
    expect(escapeHtml('>')).toBe('&gt;');
  });
});

describe('anti-mutante: filterPacientes logical operators', () => {
  const mixed = [
    ...seedPacientes,
    { id: 'p4', nombre: 'Pedro', rut: '', email: '', telefono: '', ultimaVisita: '', tratamiento: '', estado: 'pendiente' },
    { id: 'p5', nombre: 'Ana', rut: '99.999.999-9', email: 'ana@x.com', telefono: '', ultimaVisita: '', tratamiento: '', estado: 'activo' },
  ];

  it('query que no matchea nada devuelve [] (matchQ false)', () => {
    expect(filterPacientes(mixed, 'zzzzzz', '')).toHaveLength(0);
  });

  it('estado que no matchea nada devuelve [] (matchF false)', () => {
    expect(filterPacientes(mixed, '', 'inexistente')).toHaveLength(0);
  });

  it('pendiente por estado', () => {
    expect(filterPacientes(mixed, '', 'pendiente')).toHaveLength(1);
  });

  it('filtra por email', () => {
    expect(filterPacientes(mixed, 'ana@x.com', '')).toHaveLength(1);
  });
});

describe('anti-mutante: buildPaciente trims', () => {
  it('trim en rut/email/telefono/tratamiento', () => {
    const rec = buildPaciente({ id: 'z', nombre: '  A  ', rut: '  1  ', email: '  e@x.com  ', telefono: '  55  ', tratamiento: '  limpieza  ', estado: 'activo', ultimaVisita: '2026-01-01' });
    expect(rec.nombre).toBe('A');
    expect(rec.rut).toBe('1');
    expect(rec.email).toBe('e@x.com');
    expect(rec.telefono).toBe('55');
    expect(rec.tratamiento).toBe('limpieza');
  });

  it('preserva id si viene (String(form.id || uuid()))', () => {
    const rec = buildPaciente({ id: 'fixed-1', nombre: 'A', rut: '', email: '', telefono: '', tratamiento: '', estado: '', ultimaVisita: '' });
    expect(rec.id).toBe('fixed-1');
  });
});

// ── Tests anti-mutante fase 2 (matan survivors REALES detectados por validación) ──

describe('anti-mutante fase 2: filterPacientes', () => {
  it('matchea con espacios alrededor (query.trim)', () => {
    expect(filterPacientes(seedPacientes, '  maría  ', '')).toHaveLength(1);
  });

  it('normaliza acentos (perez matchea Pérez)', () => {
    expect(filterPacientes(seedPacientes, 'perez', '')).toHaveLength(1);
  });

  it('RUT con k minúscula matchea K mayúscula (toLowerCase en rut)', () => {
    const conK = [...seedPacientes, { id: 'pk', nombre: 'Karina', rut: '12.345.678-K', email: '', telefono: '', ultimaVisita: '', tratamiento: '', estado: 'activo' }];
    expect(filterPacientes(conK, '12.345.678-k', '')).toHaveLength(1);
  });
});

describe('anti-mutante fase 2: stats con pendiente', () => {
  it('cuenta pendientes cuando existen', () => {
    const conPendiente = [...seedPacientes, { id: 'pp', nombre: 'Pend', rut: '', email: '', telefono: '', ultimaVisita: '', tratamiento: '', estado: 'pendiente' }];
    const r = stats(conPendiente);
    expect(r.total).toBe(4);
    expect(r.pendiente).toBe(1);
  });
});

describe('anti-mutante fase 2: constantes y formato', () => {
  it('STORAGE_KEY es el literal esperado', () => {
    expect(STORAGE_KEY).toBe('sonrisa.pacientes');
  });

  it('uuid tiene formato p + base36', () => {
    const u = uuid();
    expect(u).toMatch(/^p[0-9a-z]+$/);
    expect(u.length).toBeGreaterThan(3);
  });
});

describe('anti-mutante fase 2: deletePaciente', () => {
  it('elimina TODOS los registros con el id (filter, no splice)', () => {
    const dups = [
      { id: 'dup', nombre: 'A', rut: '', email: '', telefono: '', ultimaVisita: '', tratamiento: '', estado: 'activo' },
      { id: 'dup', nombre: 'B', rut: '', email: '', telefono: '', ultimaVisita: '', tratamiento: '', estado: 'activo' },
    ];
    const r = deletePaciente(dups, 'dup');
    expect(r).toHaveLength(0);
  });
});
