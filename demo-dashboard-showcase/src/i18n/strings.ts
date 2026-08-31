/**
 * I18N STRINGS — UI del demo-dashboard (tipo e, dental).
 * Objeto bilingüe EN (default) / es-CL (neutro). DI: los componentes reciben
 * el objeto de strings ya resuelto por idioma (— nunca if(lang) en componente).
 * El copy de VENTA (hero/pain/roi/proof/cta) NO vive aquí: viene de la config Zod
 * del nicho (src/config/niches/dental.ts). Aquí solo strings de UI/navegación/form.
 */
export type Lang = 'en' | 'es';

export interface UiStrings {
 lang: Lang;
 /** Nav */
 nav: { brand: string; dashboard: string; landing: string; switchTo: string };
 /** Badge MODO DEMO */
 demoBadge: { label: string; hint: string };
 /** Reset (demo segura) */
 reset: { label: string; confirm: string };
 /** Dashboard header */
 dashboard: { title: string; eyebrow: string };
 /** KPI labels (derivados de deriveKpi) */
 kpi: {
 activePatients: string;
 noShowRate: string;
 totalRevenue: string;
 revenuePerPatient: string;
 scheduledAppointments: string;
 completedAppointments: string;
 /** Nota de honestidad para proyecciones */
 estimatedNote: string;
 /** Label de source (métricas del sector) */
 source: string;
 };
 /** Charts */
 charts: {
 revenueByMonth: string;
 appointmentsByMonth: string;
 revenueByTreatment: string;
 legend: string;
 };
 /** Tabla paginada + filtros */
 table: {
 search: string;
 allStatuses: string;
 allTreatments: string;
 newPatient: string;
 prev: string;
 next: string;
 /** Contador de página con placeholders {current}/{total} (serializable: Astro no
 * serializa funciones en props de islands — bug de producción detectado por E2E real). */
 pageOf: string;
 empty: string;
 columns: {
 name: string;
 rut: string;
 treatment: string;
 lastVisit: string;
 status: string;
 revenue: string;
 actions: string;
 };
 edit: string;
 delete: string;
 deleteConfirm: string;
 };
 /** Form paciente */
 form: {
 titleNew: string;
 titleEdit: string;
 name: string;
 rut: string;
 email: string;
 phone: string;
 treatment: string;
 status: string;
 save: string;
 cancel: string;
 errors: {
 nameRequired: string;
 emailInvalid: string;
 phoneInvalid: string;
 rutInvalid: string;
 };
 };
 /** Estados */
 status: {
 activo: string;
 inactivo: string;
 pendiente: string;
 scheduled: string;
 confirmed: string;
 completed: string;
 no_show: string;
 cancelled: string;
 };
 /** CTA Calendly */
 cta: { bookDemo: string; microTrust: string };
 /** ROI calculator (label del slider + unidad del resultado). */
 roi: { inputLabel: string; perYear: string };
 /** Copy de venta de la landing. EN usa la config Zod (hero/pain/roi/proof/cta);
 * ES (es-CL) vive aquí porque la config solo trae copy EN. */
 landing?: {
 hero: { eyebrow: string; headline: string; subheadline: string; ctaLabel: string };
 pain: { headline: string; body: string; metrics: { label: string; value: string; source: string }[] };
 solution: { headline: string; body: string; bullets: string[] };
 roi: { headline: string; body: string };
 proof: { headline: string; body: string; items: { text: string; source?: string }[] };
 cta: { headline: string; body: string; label: string };
 };
 /** Footer */
 footer: { tagline: string; stack: string; rights: string };
}

/** Strings EN (default, mercado global). */
const en: UiStrings = {
 lang: 'en',
 nav: {
 brand: 'Dental Dashboard',
 dashboard: 'Dashboard',
 landing: 'Landing',
 switchTo: 'Español',
 },
 demoBadge: { label: 'MODO DEMO', hint: 'Sample data — safe to explore' },
 reset: { label: 'Reset data', confirm: 'Reset all demo data to the original sample?' },
 dashboard: { title: 'Dashboard', eyebrow: '// Internal panel · Dental clinic' },
 kpi: {
 activePatients: 'Active patients',
 noShowRate: 'No-show rate',
 totalRevenue: 'Total revenue',
 revenuePerPatient: 'Revenue / patient',
 scheduledAppointments: 'Scheduled',
 completedAppointments: 'Completed',
 estimatedNote: 'Estimated based on industry averages',
 source: 'Source',
 },
 charts: {
 revenueByMonth: 'Revenue by month',
 appointmentsByMonth: 'Appointments by month',
 revenueByTreatment: 'Revenue by treatment',
 legend: 'Legend',
 },
 table: {
 search: 'Search by name, ID or email…',
 allStatuses: 'All statuses',
 allTreatments: 'All treatments',
 newPatient: '+ New patient',
 prev: '← Prev',
 next: 'Next →',
 pageOf: '{current} of {total}',
 empty: 'No patients match your filters.',
 columns: {
 name: 'Name',
 rut: 'ID',
 treatment: 'Treatment',
 lastVisit: 'Last visit',
 status: 'Status',
 revenue: 'Revenue',
 actions: 'Actions',
 },
 edit: 'Edit',
 delete: 'Delete',
 deleteConfirm: 'Delete this patient?',
 },
 form: {
 titleNew: 'New patient',
 titleEdit: 'Edit patient',
 name: 'Full name',
 rut: 'ID (RUT)',
 email: 'Email',
 phone: 'Phone',
 treatment: 'Treatment',
 status: 'Status',
 save: 'Save patient',
 cancel: 'Cancel',
 errors: {
 nameRequired: 'Name is required.',
 emailInvalid: 'Enter a valid email address.',
 phoneInvalid: 'Enter a valid phone number.',
 rutInvalid: 'Enter a valid ID (e.g. 12.345.678-9).',
 },
 },
 status: {
 activo: 'Active',
 inactivo: 'Inactive',
 pendiente: 'Pending',
 scheduled: 'Scheduled',
 confirmed: 'Confirmed',
 completed: 'Completed',
 no_show: 'No-show',
 cancelled: 'Cancelled',
 },
 cta: {
 bookDemo: 'Book your live demo',
 microTrust: 'HIPAA-aware · Built for dental & med spa · No credit card required',
 },
 roi: { inputLabel: 'Appointments per day', perYear: '/ year recovered' },
 footer: {
 tagline: 'A live dashboard that shows where your practice leaks revenue — and how to recover it.',
 stack: 'Astro · React · Tailwind · TypeScript',
 rights: '© 2026 Dental Dashboard. All rights reserved.',
 },
};

/** Strings ES es-CL (neutro chileno). */
const es: UiStrings = {
 lang: 'es',
 nav: {
 brand: 'Panel Dental',
 dashboard: 'Panel',
 landing: 'Landing',
 switchTo: 'English',
 },
 demoBadge: { label: 'MODO DEMO', hint: 'Datos de ejemplo — seguro de explorar' },
 reset: { label: 'Resetear datos', confirm: '¿Resetear todos los datos demo al ejemplo original?' },
 dashboard: { title: 'Panel', eyebrow: '// Panel interno · Clínica dental' },
 kpi: {
 activePatients: 'Pacientes activos',
 noShowRate: 'Tasa de inasistencia',
 totalRevenue: 'Ingresos totales',
 revenuePerPatient: 'Ingreso por paciente',
 scheduledAppointments: 'Programadas',
 completedAppointments: 'Completadas',
 estimatedNote: 'Estimado basado en promedios del sector',
 source: 'Fuente',
 },
 charts: {
 revenueByMonth: 'Ingresos por mes',
 appointmentsByMonth: 'Citas por mes',
 revenueByTreatment: 'Ingresos por tratamiento',
 legend: 'Leyenda',
 },
 table: {
 search: 'Buscar por nombre, RUT o email…',
 allStatuses: 'Todos los estados',
 allTreatments: 'Todos los tratamientos',
 newPatient: '+ Nuevo paciente',
 prev: '← Anterior',
 next: 'Siguiente →',
 pageOf: '{current} de {total}',
 empty: 'Ningún paciente coincide con tus filtros.',
 columns: {
 name: 'Nombre',
 rut: 'RUT',
 treatment: 'Tratamiento',
 lastVisit: 'Última visita',
 status: 'Estado',
 revenue: 'Ingresos',
 actions: 'Acciones',
 },
 edit: 'Editar',
 delete: 'Eliminar',
 deleteConfirm: '¿Eliminar este paciente?',
 },
 form: {
 titleNew: 'Nuevo paciente',
 titleEdit: 'Editar paciente',
 name: 'Nombre completo',
 rut: 'RUT',
 email: 'Email',
 phone: 'Teléfono',
 treatment: 'Tratamiento',
 status: 'Estado',
 save: 'Guardar paciente',
 cancel: 'Cancelar',
 errors: {
 nameRequired: 'El nombre es obligatorio.',
 emailInvalid: 'Ingresa un email válido.',
 phoneInvalid: 'Ingresa un teléfono válido.',
 rutInvalid: 'Ingresa un RUT válido (ej. 12.345.678-9).',
 },
 },
 status: {
 activo: 'Activo',
 inactivo: 'Inactivo',
 pendiente: 'Pendiente',
 scheduled: 'Agendada',
 confirmed: 'Confirmada',
 completed: 'Completada',
 no_show: 'Inasistencia',
 cancelled: 'Cancelada',
 },
 cta: {
 bookDemo: 'Agenda tu demo en vivo',
 microTrust: 'Consciente de HIPAA · Hecho para dental y med spa · Sin tarjeta de crédito',
 },
 roi: { inputLabel: 'Citas por día', perYear: '/ año recuperado' },
 // Copy de venta ES es-CL (la config Zod solo trae EN; aquí la traducción neutra chilena).
 landing: {
 hero: {
 eyebrow: 'DENTAL · BACKOFFICE · EN VIVO',
 headline: 'Tu agenda está perdiendo ingresos. Mira exactamente dónde — y cuánto.',
 subheadline:
 'Cada silla vacía es dinero que ya ganaste. Este panel muestra tu tasa de inasistencia, ingreso por paciente y producción en tiempo real — para que dejes de adivinar y empieces a recuperar.',
 ctaLabel: 'Mira tus números en una demo en vivo',
 },
 pain: {
 headline: 'No tienes un problema de pacientes. Tienes un problema de inasistencia.',
 body: 'Agendas la silla, preparas el equipo y armas la bandeja. Y el paciente no llega. La clínica dental promedio pierde el 7,4% de sus citas confirmadas por inasistencia — y otro 15,5% por cancelaciones anticipadas (Planet DDS, 3.400 clínicas). No es un detalle de agenda. A $200–$375 por cupo perdido (Denzif, Tandem Health), son más de $105.000 al año saliendo por la puerta (Clerri, Arini).',
 metrics: [
 { label: 'Tasa de inasistencia dental promedio', value: '7,4%', source: 'https://www.planetdds.com/resources/2025-dental-industry-outlook-report/' },
 { label: 'Costo real de una cita perdida', value: '$200–$375', source: 'https://denzif.com/blog/dental-no-show-cost-revenue-loss-2026/' },
 { label: 'Lo que pierde la clínica promedio al año', value: '$105K+', source: 'https://clerri.com/blog/dental-patient-no-show-statistics' },
 ],
 },
 solution: {
 headline: 'Míralo en vivo. Haz clic en un paciente, mira cómo reacciona el panel.',
 body: 'Esto no es un mockup. Agrega un paciente, marca una inasistencia y mira cómo la barra de KPIs se recalcula en tiempo real. Filtra por tratamiento, pagina la tabla y ve los ingresos por mes y por procedimiento — todo derivado en vivo de tus datos, nunca hardcodeado.',
 bullets: [
 'Tasa de inasistencia — en vivo, para que veas la fuga antes de que se acumule.',
 'Ingreso por paciente — sabes qué pacientes valen más para tu clínica.',
 'Producción por mes y por tratamiento — ves dónde está el dinero y dónde está atascado.',
 'Inasistencias recuperadas — el panel rastrea los cupos que recuperas, no solo los que pierdes.',
 ],
 },
 roi: {
 headline: 'Reduce tus inasistencias a la mitad. Conserva el ingreso que ya ganaste.',
 body: 'Los recordatorios automáticos reducen las inasistencias un 22,95% (Dental Tribune/Sesame, 1,6M de citas). Mueve el control para ver cuánto recuperarías con tus propios números.',
 },
 proof: {
 headline: 'Clínicas reales. Números reales. Sin testimonios inventados.',
 body: 'No fabricamos citas. Esto es lo que muestran los datos del sector y clínicas reales con nombre:',
 items: [
 { text: 'Los recordatorios automáticos redujeron las inasistencias un 22,95% en 1.604.184 citas de 64 clínicas — con $31.456,88 de producción incremental documentada.', source: 'https://us.dental-tribune.com/news/study-reveals-how-automated-patient-appointment-reminders-affect-dental-practice-no-show-rates-and-production/' },
 { text: 'El 10% superior de las clínicas dentales mantiene las inasistencias en 1% mientras el promedio está en 15% — la brecha son sistemas, no suerte.', source: 'https://clerri.com/blog/dental-patient-no-show-statistics' },
 { text: 'Weave — Sonrisa Dental ahorra $50K/año y Smith Dental suma +28% de pacientes nuevos (casos con nombre, reportados por el proveedor).', source: 'https://getweave.com/industry/dentistry/' },
 ],
 },
 cta: {
 headline: 'Mira los números de tu clínica en un recorrido en vivo de 20 minutos.',
 body: 'Sin discurso de venta. Abriremos el panel, pondremos tus números y te mostraremos exactamente cuánto te cuesta tu tasa de inasistencia — y cuánto vale recuperarla.',
 label: 'Agenda tu demo en vivo',
 },
 },
 footer: {
 tagline: 'Un panel en vivo que muestra dónde tu clínica pierde ingresos — y cómo recuperarlos.',
 stack: 'Astro · React · Tailwind · TypeScript',
 rights: '© 2026 Panel Dental. Todos los derechos reservados.',
 },
};

/** Registro bilingüe (DI). */
export const STRINGS: Record<Lang, UiStrings> = { en, es };

/** Resuelve strings por idioma (default en). */
export function getStrings(lang: Lang = 'en'): UiStrings {
 return STRINGS[lang] ?? en;
}
