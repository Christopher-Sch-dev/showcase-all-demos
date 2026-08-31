/**
 * I18N STRINGS — strings de UI bilingües (EN default + es-CL neutro).
 * DI: los componentes reciben `t: UIStrings` por prop; NUNCA importan strings hardcodeados.
 * La narrativa de venta (hero/painPoint/roi/proof/cta) viene de la config Zod del nicho
 * (src/config), NO de aquí. Este archivo cubre SOLO la UI (nav, badge, form, KPIs, footer).
 */
export type Lang = 'en' | 'es';

export interface UIStrings {
  lang: Lang;
  navDemoLabel: string;
  toggleLabel: string;
  modeBadge: string;
  reset: string;
  proofHeadline: string;
  proofEyebrow: string;
  solutionEyebrow: string;
  solutionHeadline: string;
  solutionBody: string;
  roiEyebrow: string;
  roiHeadline: string;
  roiBodyNote: string;
  painEyebrow: string;
  footerMadeWith: string;
  formHeadline: string;
  formSubtitle: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  topicLabel: string;
  topicPlaceholder: string;
  budgetLabel: string;
  budgetPlaceholder: string;
  submit: string;
  errEmail: string;
  errPhone: string;
  errName: string;
  errTopic: string;
  timerLabel: string;
  timerResponded: string;
  scoreLabel: string;
  reasonLabel: string;
  statusLabel: string;
  bookCta: string;
  bookedCta: string;
  responseLine: string;
  dashboardHeadline: string;
  dashboardSub: string;
  leadsByStatus: string;
  emptyDashboard: string;
  colLead: string;
  colStatus: string;
  colScore: string;
  colTopic: string;
  colAction: string;
  kpiTotalLeads: string;
  kpiQualified: string;
  kpiBooked: string;
  kpiAvgSpeed: string;
  kpiResponseUnder60: string;
  kpiBookingRate: string;
  kpiSource: string;
  kpiEstimatedNote: string;
  kpiSeconds: string;
  roiInputLabel: string;
  roiValueLabel: string;
  roiAnnualValue: string;
  roiEstimatedNote: string;
  roiCta: string;
  aiEthicsNote: string;
  statusNew: string;
  statusQualified: string;
  statusBooked: string;
}

const en: UIStrings = {
  lang: 'en',
  navDemoLabel: 'Lead Qualifier AI',
  toggleLabel: 'EN · ES',
  modeBadge: 'MODO DEMO',
  reset: 'Reset demo',
  proofHeadline: 'Trusted, auditable numbers',
  proofEyebrow: 'PROOF',
  solutionEyebrow: 'SOLUTION · LIVE',
  solutionHeadline: 'See it run on a real lead.',
  solutionBody:
    'This is the system — live, not a mockup. Drop in a lead and watch it get captured, scored, qualified and booked in under 60 seconds, 24/7, no one staffing the inbox.',
  roiEyebrow: 'ROI',
  roiHeadline: 'Your intake is worth what your response time makes of it.',
  roiBodyNote:
    'Under a 60-second SLA you compete against the top firms that respond that fast — the rest are your time to win.',
  painEyebrow: 'THE PROBLEM',
  footerMadeWith: 'Deterministic funnel · external AI can operate it',
  formHeadline: 'Get your lead handled in <60s',
  formSubtitle:
    'Fill the same form a prospect would. Watch it captured, scored and booked — with the timer running.',
  nameLabel: 'Name',
  namePlaceholder: 'Maria Gonzalez',
  emailLabel: 'Email',
  emailPlaceholder: 'maria@example.com',
  phoneLabel: 'Phone',
  phonePlaceholder: '555-0100',
  topicLabel: 'What are you looking for?',
  topicPlaceholder: '4-bedroom house under $600k in North Dallas',
  budgetLabel: 'Budget (optional)',
  budgetPlaceholder: '600000',
  submit: 'See it in action',
  errEmail: 'Enter a valid email.',
  errPhone: 'Enter a valid phone number.',
  errName: 'Name is required.',
  errTopic: 'Tell us what you are looking for.',
  timerLabel: 'Speed-to-lead',
  timerResponded: 'Responded in',
  scoreLabel: 'Lead score',
  reasonLabel: 'Why',
  statusLabel: 'Status',
  bookCta: 'Book a consultation',
  bookedCta: 'Booked',
  responseLine: 'captured · scored · booked in under a minute',
  dashboardHeadline: 'Live funnel',
  dashboardSub: 'Every lead persisted to this browser.',
  leadsByStatus: 'By status',
  emptyDashboard: 'No leads yet. Drop one in above.',
  colLead: 'Lead',
  colStatus: 'Status',
  colScore: 'Score',
  colTopic: 'Topic',
  colAction: 'Action',
  kpiTotalLeads: 'Total leads',
  kpiQualified: 'Qualified',
  kpiBooked: 'Booked',
  kpiAvgSpeed: 'Avg speed-to-lead',
  kpiResponseUnder60: 'Replied <60s',
  kpiBookingRate: 'Booking rate',
  kpiSource: 'Source',
  kpiEstimatedNote: 'Estimated based on industry averages',
  kpiSeconds: 's',
  roiInputLabel: 'Leads / month',
  roiValueLabel: 'Recovered / year',
  roiAnnualValue: 'Estimated annual value',
  roiEstimatedNote: 'Estimated based on industry averages',
  roiCta: 'Book a free walkthrough',
  aiEthicsNote:
    'Intake is handled by AI 24/7; every qualified matter is reviewed by a licensed lawyer before booking.',
  statusNew: 'New',
  statusQualified: 'Qualified',
  statusBooked: 'Booked',
};

const es: UIStrings = {
  lang: 'es',
  navDemoLabel: 'Lead Qualifier AI',
  toggleLabel: 'ES · EN',
  modeBadge: 'MODO DEMO',
  reset: 'Reiniciar demo',
  proofHeadline: 'Números confiables y auditables',
  proofEyebrow: 'PRUEBA',
  solutionEyebrow: 'SOLUCIÓN',
  solutionHeadline: 'Míralo correr con un lead real.',
  solutionBody:
    'Este es el sistema — en vivo, no un mockup. Ingresa un lead y observa cómo se captura, califica y agenda en menos de 60 segundos, 24/7, sin nadie atendiendo la bandeja.',
  roiEyebrow: 'ROI',
  roiHeadline: 'Tu intake vale lo que tu velocidad de respuesta hace de él.',
  roiBodyNote:
    'Con un SLA de 60 segundos compites contra el top que responde así de rápido — el resto es tu ventana para ganar.',
  painEyebrow: 'EL PROBLEMA',
  footerMadeWith: 'Funnel determinista · operable por una IA externa',
  formHeadline: 'Atiende tu lead en <60s',
  formSubtitle:
    'Completa el mismo formulario que llenaría un prospecto. Verás captura, calificación y agendado en vivo — con el cronómetro corriendo.',
  nameLabel: 'Nombre',
  namePlaceholder: 'María González',
  emailLabel: 'Correo',
  emailPlaceholder: 'maria@ejemplo.com',
  phoneLabel: 'Teléfono',
  phonePlaceholder: '+56 9 1234 5678',
  topicLabel: '¿Qué estás buscando?',
  topicPlaceholder: 'casa de 4 dormitorios bajo $600k en Dallas',
  budgetLabel: 'Presupuesto (opcional)',
  budgetPlaceholder: '500000',
  submit: 'Ver mi respuesta',
  errEmail: 'Ingresa un correo válido.',
  errPhone: 'Ingresa un teléfono válido.',
  errName: 'El nombre es obligatorio.',
  errTopic: 'Cuéntanos qué buscas.',
  timerLabel: 'Tiempo de respuesta',
  timerResponded: 'Respondido en',
  scoreLabel: 'Score',
  reasonLabel: 'Razón',
  statusLabel: 'Estado',
  bookCta: 'Agendar consulta',
  bookedCta: 'Agendado',
  responseLine: 'capturado · calificado · agendado en menos de un minuto',
  dashboardHeadline: 'Funnel en vivo',
  dashboardSub: 'Cada lead queda guardado en este navegador.',
  leadsByStatus: 'Por estado',
  emptyDashboard: 'Aún no hay leads. Ingresa uno arriba.',
  colLead: 'Lead',
  colStatus: 'Estado',
  colScore: 'Score',
  colTopic: 'Tema',
  colAction: 'Acción',
  kpiTotalLeads: 'Leads totales',
  kpiQualified: 'Calificados',
  kpiBooked: 'Agendados',
  kpiAvgSpeed: 'Tiempo promedio',
  kpiResponseUnder60: 'Respondidos <60s',
  kpiBookingRate: 'Tasa de agendado',
  kpiSource: 'Fuente',
  kpiEstimatedNote: 'Estimado basado en promedios de la industria',
  kpiSeconds: 's',
  roiInputLabel: 'Leads / mes',
  roiValueLabel: 'Recuperado / año',
  roiAnnualValue: 'Valor anual estimado',
  roiEstimatedNote: 'Estimado basado en promedios de la industria',
  roiCta: 'Agendar un walkthrough',
  aiEthicsNote:
    'El intake lo maneja una IA 24/7; cada asunto calificado lo revisa un abogado antes de agendar.',
  statusNew: 'Nuevo',
  statusQualified: 'Calificado',
  statusBooked: 'Agendado',
};

/** Diccionario bilingüe EN/es-CL. */
export const strings: Record<Lang, UIStrings> = { en, es };

/**
 * NARRATIVA ES-CL — copy de secciones de la landing para /es/.
 * La narrativa EN de la landing viene del config Zod (src/config) por idioma default.
 * Para es-CL (no duplicada en el contrato Zod), el copy vive aquí en i18n.
 * Las métricas/valores/sources NUNCA se traducen (vienen del config).
 */
export const esNarrative = {
  heroEyebrow: 'RESPUESTA DE IA · <60s',
  heroHeadline: 'Nunca pierdas un lead por una respuesta lenta.',
  heroSubheadline:
    'Tu comprador no espera. La firma promedio tarda 42 horas en responder — tu próximo cliente decide en minutos. Mira un lead responderse, calificarse y agendarse en menos de 60 segundos.',
  heroCta: 'Verlo en acción',
  painHeadline: 'Tu lead se enfría en minutos.',
  painBody:
    'Tu propiedad sale a la venta. Un comprador envía el formulario a las 9pm — mientras estás en una visita. Si nadie responde en minutos, se contacta con un agente competidor. Un lead contactado en 5 minutos tiene 100x más probabilidad de conectarse y 21x más de calificarse que uno respondido 30 minutos después. El promedio de la industria es 42 horas.',
  solutionSub: 'Solución · EN VIVO',
  solutionHeadline: 'Míralo correr con un lead real.',
  solutionBody:
    'Este es el sistema — en vivo, no un mockup. Ingresa un lead y observa cómo se captura, se califica y se agenda en menos de 60 segundos, 24/7.',
  roiTitle: 'Tu intake vale lo que tu velocidad de respuesta hace de él.',
  roiBody:
    'Con un SLA de 60 segundos compites contra el top que responde así de rápido — el resto es tu ventana para ganar. Multiplica los leads que pierdes fuera de horario × tu ticket promedio.',
  proofTitle: 'Números confiables y auditables.',
  proofBody:
    'Sin testimonios inventados. Cada cifra está citada de estudios públicos (MIT/InsideSales, HBR, Clio, Hennessey Digital) — auditables. Demo de producto-real, construida sobre un sistema determinista que una IA externa puede operar.',
};

