/**
 * PATIENT TABLE — tabla paginada (8-10 filas) + filtros por estado/tratamiento + CRUD .
 * Consume el core determinista (reduce) para CRUD + persistencia (saveState). Presentacional.
 * Paginación: 8 filas/página, prev/next + contador "X de Y". Touch ≥44px.
 * Filtros: búsqueda (nombre/RUT/email) + estado + tratamiento.
 */
import { useMemo, useState } from 'react';
import type { DemoState, Paciente, PacienteEstado, Tratamiento } from '../lib/types';
import type { UiStrings } from '../i18n/strings';
import { reduce } from '../lib/state';
import { saveState } from '../lib/storage';
import { formatCurrency, formatDate } from './ui/format';
import StatusBadge from './ui/StatusBadge';
import PatientForm, { type PatientDraft } from './PatientForm';
import { Search, Pencil, Trash2, Plus } from 'lucide-react';

const PAGE_SIZE = 8;
const TRATAMIENTOS: Tratamiento[] = ['Limpieza', 'Ortodoncia', 'Blanqueamiento', 'Implante', 'Endodoncia'];
const ESTADOS: PacienteEstado[] = ['activo', 'inactivo', 'pendiente'];

interface Props {
 state: DemoState;
 strings: UiStrings;
 /** Callback para notificar al padre que el estado cambió (persistencia + re-render). */
 onStateChange: (next: DemoState) => void;
}

export default function PatientTable({ state, strings, onStateChange }: Props) {
 const [query, setQuery] = useState('');
 const [estado, setEstado] = useState<'all' | PacienteEstado>('all');
 const [tratamiento, setTratamiento] = useState<'all' | Tratamiento>('all');
 const [page, setPage] = useState(0);
 const [editing, setEditing] = useState<Paciente | null>(null);
 const [creating, setCreating] = useState(false);

 // Filtros (búsqueda + estado + tratamiento) — memoizado.
 const filtered = useMemo(() => {
 const q = query.trim().toLowerCase();
 return state.pacientes.filter((p) => {
 if (estado !== 'all' && p.estado !== estado) return false;
 if (tratamiento !== 'all' && p.tratamiento !== tratamiento) return false;
 if (q && !`${p.nombre} ${p.rut} ${p.email}`.toLowerCase().includes(q)) return false;
 return true;
 });
 }, [state.pacientes, query, estado, tratamiento]);

 const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
 const safePage = Math.min(page, totalPages - 1);
 const rows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

 // rol: aplicar una acción del reducer y persistir (CRUD via FSM determinista).
 const apply = (action: Parameters<typeof reduce>[1]) => {
 const res = reduce(state, action, Date.now());
 if (res.changed) {
 saveState(res.state);
 onStateChange(res.state);
 }
 };

 const handleCreate = (draft: PatientDraft) => {
 apply({ type: 'create_paciente', paciente: { ...draft, ultimaVisita: '', revenueTotal: 0, citasProgramadas: 0, noShows: 0, ultimaCita: '' } });
 setCreating(false);
 };

 const handleUpdate = (draft: PatientDraft) => {
 if (!editing) return;
 apply({ type: 'update_paciente', pacienteId: editing.id, cambios: draft });
 setEditing(null);
 };

 const handleDelete = (p: Paciente) => {
 if (window.confirm(strings.table.deleteConfirm)) {
 apply({ type: 'delete_paciente', pacienteId: p.id });
 }
 };

 const btnCls =
 'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-border p-2 text-text-secondary transition-colors duration-150 hover:bg-surface-2 hover:text-accent-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-accent';

 return ( <section aria-label="Patients" className="rounded-card border border-border bg-surface p-4 shadow-sm">
 {/* Toolbar: búsqueda + filtros + nuevo */}
 <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
 <div className="relative w-full lg:max-w-xs">
 <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
 <input
 value={query}
 onChange={(e) => { setQuery(e.target.value); setPage(0); }}
 placeholder={strings.table.search}
 className="min-h-[44px] w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
 aria-label={strings.table.search}
 />
 </div>
 <div className="flex flex-wrap items-center gap-2">
 <select
 value={estado}
 onChange={(e) => { setEstado(e.target.value as 'all' | PacienteEstado); setPage(0); }}
 className="min-h-[44px] rounded-lg border border-border bg-surface px-3 text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
 aria-label={strings.table.allStatuses}
 >
 <option value="all">{strings.table.allStatuses}</option>
 {ESTADOS.map((s) => ( <option key={s} value={s}>{strings.status[s]}</option>
))}
 </select>
 <select
 value={tratamiento}
 onChange={(e) => { setTratamiento(e.target.value as 'all' | Tratamiento); setPage(0); }}
 className="min-h-[44px] rounded-lg border border-border bg-surface px-3 text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
 aria-label={strings.table.allTreatments}
 >
 <option value="all">{strings.table.allTreatments}</option>
 {TRATAMIENTOS.map((t) => ( <option key={t} value={t}>{t}</option>
))}
 </select>
 <button
 onClick={() => setCreating(true)}
 className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-accent px-4 font-semibold text-white transition-colors duration-150 hover:bg-accent-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
 >
 <Plus className="h-4 w-4" aria-hidden="true" />
 {strings.table.newPatient}
 </button>
 </div>
 </div>

 {/* Form crear/editar */}
 {(creating || editing) && ( <div className="mt-4 rounded-lg border border-border bg-surface-2 p-4">
 <PatientForm
 strings={strings}
 initial={editing ?? undefined}
 onSubmit={editing ? handleUpdate : handleCreate}
 onCancel={() => { setCreating(false); setEditing(null); }}
 />
 </div>
)}

 {/* Tabla */}
 <div className="mt-4 overflow-x-auto">
 <table className="w-full min-w-[640px] text-left text-sm">
 <thead>
 <tr className="border-b border-border text-xs uppercase tracking-wide text-text-muted">
 <th className="py-2 pr-3 font-medium">{strings.table.columns.name}</th>
 <th className="hidden py-2 pr-3 font-medium md:table-cell">{strings.table.columns.rut}</th>
 <th className="py-2 pr-3 font-medium">{strings.table.columns.treatment}</th>
 <th className="hidden py-2 pr-3 font-medium sm:table-cell">{strings.table.columns.lastVisit}</th>
 <th className="py-2 pr-3 font-medium">{strings.table.columns.status}</th>
 <th className="hidden py-2 pr-3 font-medium sm:table-cell">{strings.table.columns.revenue}</th>
 <th className="py-2 font-medium">{strings.table.columns.actions}</th>
 </tr>
 </thead>
 <tbody>
 {rows.length === 0 ? ( <tr>
 <td colSpan={7} className="py-8 text-center text-text-muted">{strings.table.empty}</td>
 </tr>
) : ( rows.map((p) => ( <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface-2">
 <td className="py-3 pr-3 font-medium text-text">{p.nombre}</td>
 <td className="hidden py-3 pr-3 font-mono text-text-secondary md:table-cell">{p.rut}</td>
 <td className="py-3 pr-3 text-text-secondary">{p.tratamiento}</td>
 <td className="hidden py-3 pr-3 text-text-secondary sm:table-cell">{formatDate(p.ultimaVisita, strings.lang)}</td>
 <td className="py-3 pr-3"><StatusBadge value={p.estado} strings={strings} /></td>
 <td className="hidden py-3 pr-3 font-medium text-text sm:table-cell">{formatCurrency(p.revenueTotal, strings.lang)}</td>
 <td className="py-3">
 <div className="flex gap-2">
 <button onClick={() => setEditing(p)} className={btnCls} aria-label={`${strings.table.edit} ${p.nombre}`} title={strings.table.edit}>
 <Pencil className="h-4 w-4" aria-hidden="true" />
 </button>
 <button onClick={() => handleDelete(p)} className={btnCls} aria-label={`${strings.table.delete} ${p.nombre}`} title={strings.table.delete}>
 <Trash2 className="h-4 w-4" aria-hidden="true" />
 </button>
 </div>
 </td>
 </tr>
))
)}
 </tbody>
 </table>
 </div>

 {/* Paginación */}
 <div className="mt-4 flex items-center justify-between">
 <span className="text-sm text-text-secondary">
 {strings.table.pageOf.replace('{current}', String(safePage + 1)).replace('{total}', String(totalPages))}
 </span>
 <div className="flex gap-2">
 <button
 onClick={() => setPage((p) => Math.max(0, p - 1))}
 disabled={safePage === 0}
 className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-border px-4 font-medium text-text-secondary transition-colors duration-150 hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
 >
 {strings.table.prev}
 </button>
 <button
 onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
 disabled={safePage >= totalPages - 1}
 className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-border px-4 font-medium text-text-secondary transition-colors duration-150 hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
 >
 {strings.table.next}
 </button>
 </div>
 </div>
 </section>
);
}
