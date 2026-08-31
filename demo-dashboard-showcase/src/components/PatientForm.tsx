/**
 * PATIENT FORM — form de paciente con validación inline .
 * Dispara CRUD vía callback onSubmit (DI). Presentacional: sin lógica de negocio.
 * Validación inline: nombre requerido, email válido, teléfono válido, RUT válido.
 * Touch ≥44px en inputs/buttons. Errores inline (no alert()).
 */
import { useState } from 'react';
import type { Paciente, PacienteEstado, Tratamiento } from '../lib/types';
import type { UiStrings } from '../i18n/strings';

export interface PatientDraft {
 nombre: string;
 rut: string;
 email: string;
 telefono: string;
 tratamiento: Tratamiento;
 estado: PacienteEstado;
}

interface Props {
 strings: UiStrings;
 /** Paciente a editar (undefined = crear nuevo). */
 initial?: Paciente;
 /** Callback de submit (DI): el padre orquesta reduce() + persistencia. */
 onSubmit: (draft: PatientDraft) => void;
 onCancel: () => void;
}

const TRATAMIENTOS: Tratamiento[] = ['Limpieza', 'Ortodoncia', 'Blanqueamiento', 'Implante', 'Endodoncia'];
const ESTADOS: PacienteEstado[] = ['activo', 'inactivo', 'pendiente'];

// rol: validar email con regex simple.
function isValidEmail(v: string): boolean {
 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
// rol: validar teléfono (permite +, dígitos, espacios, guiones).
function isValidPhone(v: string): boolean {
 return /^\+?[0-9][0-9\s-]{6,}$/.test(v);
}
// rol: validar RUT chileno (formato 12.345.678-9 o 12345678-9).
function isValidRut(v: string): boolean {
 return /^\d{1,2}(\.\d{3}){2}-[\dkK]$/.test(v) || /^\d{7,8}-[\dkK]$/.test(v);
}

export default function PatientForm({ strings, initial, onSubmit, onCancel }: Props) {
 const [draft, setDraft] = useState<PatientDraft>({
 nombre: initial?.nombre ?? '',
 rut: initial?.rut ?? '',
 email: initial?.email ?? '',
 telefono: initial?.telefono ?? '',
 tratamiento: initial?.tratamiento ?? 'Limpieza',
 estado: initial?.estado ?? 'activo',
 });
 const [errors, setErrors] = useState<Partial<Record<keyof PatientDraft, string>>>({});

 const set = (key: keyof PatientDraft) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
 setDraft((d) => ({ ...d, [key]: e.target.value }));
 // limpiar error inline al corregir (validación en vivo).
 setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
 };

 const validate = (): boolean => {
 const next: Partial<Record<keyof PatientDraft, string>> = {};
 if (!draft.nombre.trim()) next.nombre = strings.form.errors.nameRequired;
 if (!isValidEmail(draft.email)) next.email = strings.form.errors.emailInvalid;
 if (!isValidPhone(draft.telefono)) next.telefono = strings.form.errors.phoneInvalid;
 if (draft.rut && !isValidRut(draft.rut)) next.rut = strings.form.errors.rutInvalid;
 setErrors(next);
 return Object.keys(next).length === 0;
 };

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!validate()) return;
 onSubmit(draft);
 };

 const inputCls =
 'min-h-[44px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent';
 const errCls = 'mt-1 text-xs text-danger';

 return ( <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-label={initial ? strings.form.titleEdit : strings.form.titleNew}>
 <h3 className="font-display text-lg font-semibold text-text">
 {initial ? strings.form.titleEdit : strings.form.titleNew}
 </h3>

 <div>
 <label htmlFor="pf-nombre" className="mb-1 block text-sm font-medium text-text-secondary">
 {strings.form.name} *
 </label>
 <input id="pf-nombre" value={draft.nombre} onChange={set('nombre')} className={inputCls} aria-invalid={!!errors.nombre} />
 {errors.nombre ? <p className={errCls} role="alert">{errors.nombre}</p> : null}
 </div>

 <div>
 <label htmlFor="pf-rut" className="mb-1 block text-sm font-medium text-text-secondary">
 {strings.form.rut}
 </label>
 <input id="pf-rut" value={draft.rut} onChange={set('rut')} className={inputCls} aria-invalid={!!errors.rut} />
 {errors.rut ? <p className={errCls} role="alert">{errors.rut}</p> : null}
 </div>

 <div>
 <label htmlFor="pf-email" className="mb-1 block text-sm font-medium text-text-secondary">
 {strings.form.email} *
 </label>
 <input id="pf-email" type="email" value={draft.email} onChange={set('email')} className={inputCls} aria-invalid={!!errors.email} />
 {errors.email ? <p className={errCls} role="alert">{errors.email}</p> : null}
 </div>

 <div>
 <label htmlFor="pf-phone" className="mb-1 block text-sm font-medium text-text-secondary">
 {strings.form.phone} *
 </label>
 <input id="pf-phone" type="tel" value={draft.telefono} onChange={set('telefono')} className={inputCls} aria-invalid={!!errors.telefono} />
 {errors.telefono ? <p className={errCls} role="alert">{errors.telefono}</p> : null}
 </div>

 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
 <div>
 <label htmlFor="pf-tratamiento" className="mb-1 block text-sm font-medium text-text-secondary">
 {strings.form.treatment}
 </label>
 <select id="pf-tratamiento" value={draft.tratamiento} onChange={set('tratamiento')} className={inputCls}>
 {TRATAMIENTOS.map((t) => ( <option key={t} value={t}>{t}</option>
))}
 </select>
 </div>
 <div>
 <label htmlFor="pf-estado" className="mb-1 block text-sm font-medium text-text-secondary">
 {strings.form.status}
 </label>
 <select id="pf-estado" value={draft.estado} onChange={set('estado')} className={inputCls}>
 {ESTADOS.map((s) => ( <option key={s} value={s}>{strings.status[s]}</option>
))}
 </select>
 </div>
 </div>

 <div className="flex flex-wrap gap-3 pt-2">
 <button
 type="submit"
 className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-accent px-6 py-3 font-semibold text-white transition-colors duration-150 hover:bg-accent-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
 >
 {strings.form.save}
 </button>
 <button
 type="button"
 onClick={onCancel}
 className="inline-flex min-h-[48px] items-center justify-center rounded-lg border border-border px-6 py-3 font-semibold text-text-secondary transition-colors duration-150 hover:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
 >
 {strings.form.cancel}
 </button>
 </div>
 </form>
);
}
