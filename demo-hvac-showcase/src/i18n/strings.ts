/**
 * I18N MANUAL demo-hvac — strings compartidos de chrome (nav/badge/footer/CTA)
 * + copy de venta traducido para la landing ES (la config hvac es EN).
 * EN = default (`/`), ES = es-CL neutro (tuteo 'tú', NUNCA rioplatense).
 * Los valores numéricos del config (62%, $2,200, etc.) se reutilizan tal cual.
 */
export const DEFAULT_LOCALE = 'en' as const;
export type Locale = 'en' | 'es';

/** Chrome + secciones compartidas (nav, badge, footer, headings). */
export const ui = {
  en: {
    nav: {
      brand: 'demo-hvac',
      localeSwitch: 'ES',
      localeTitle: 'Ver en español',
    },
    badge: 'Mode demo',
    onboarding: {
      title: 'How to use this demo — 4 steps',
      subtitle:
        'Follow the board left to right. Every button below is real — click them in this order to take one call from a lost lead to a paid invoice.',
      toggleShow: 'Show steps',
      toggleHide: 'Hide steps',
      tipTitle: 'No action? The AI still works for you',
      tipBody:
        'If you don\u2019t click anything, the system calls the lead back and qualifies it on its own within a few minutes — speed-to-lead. The demo moves by itself, like it would for your business.',
      steps: [
        {
          title: 'Capture the call',
          body: 'A call is ringing in the "Live call" panel. Click "Capture as lead" to turn that missed call into a lead instead of losing the job.',
        },
        {
          title: 'Qualify & book',
          body: 'The lead lands in the "Lead queue". Click "Qualify" to score it, then "Book" to lock in the appointment.',
        },
        {
          title: 'Assign & dispatch',
          body: 'In the zone board, pick a tech from the "Assign…" dropdown, then click "Dispatch", "Start" and "Complete" to move the job along.',
        },
        {
          title: 'Invoice',
          body: 'Click "Invoice" to close the job — the revenue ticks up instantly in the KPI bar at the top.',
        },
      ],
    },
    sections: {
      solution: {
        eyebrow: 'How it works',
        headline: 'From missed call to paid invoice — without adding headcount',
        body: 'The moment a call comes in, the system answers, qualifies, and routes the job — so every lead becomes a scheduled appointment and a dispatched tech, not a voicemail.',
      },
      dashboard: {
        eyebrow: 'See it live',
        headline: 'One board runs the whole funnel',
        body: 'This is the working product, not a mockup. Drag a lead to dispatch, watch the queue, and see revenue recovered in real time.',
      },
      proof: {
        eyebrow: 'Why teams switch',
        headline: 'Built for the reality of field service',
      },
      roi: {
        eyebrow: 'The number that matters',
        headline: 'What a few missed calls cost you',
      },
      cta: {
        eyebrow: 'Ready when you are',
        headline: 'See it on your own business',
        body: 'Book a 20-minute call. We walk through your call volume, your average ticket, and what the same system recovers for you.',
      },
    },
    solutionSteps: [
      {
        title: 'Answer every call',
        body: 'The AI receptionist picks up on the first ring — no hold music, no missed caller.',
      },
      {
        title: 'Qualify & capture the lead',
        body: 'It asks the right questions and books a slot before the caller hangs up.',
      },
      {
        title: 'Schedule instantly',
        body: 'The job lands on your board as a confirmed appointment with a window.',
      },
      {
        title: 'Dispatch the closest tech',
        body: 'Your crew sees the job on their phone and hits the road, not the phone lines.',
      },
      {
        title: 'Invoice & close the loop',
        body: 'Complete on site, invoice in one tap, and get the revenue booked.',
      },
    ],
    proofTitle: 'Proof',
    integrationsTitle: 'Connects to the tools you already run',
    ctaLabel: 'Book a demo call',
    footer: {
      metricsSourced: 'Metrics sourced from industry reports.',
      estimated: 'Estimated based on industry averages.',
      brand: 'demo-hvac',
      rights: 'All rights reserved.',
      demoDisclaimer:
        'Interactive product demo. Projected figures are estimates based on industry averages, not guarantees.',
    },
  },

  es: {
    nav: {
      brand: 'demo-hvac',
      localeSwitch: 'EN',
      localeTitle: 'View in English',
    },
    badge: 'Modo demo',
    onboarding: {
      title: 'Cómo usar esta demo — 4 pasos',
      subtitle:
        'Sigue el tablero de izquierda a derecha. Todos los botones de abajo son reales: haz clic en este orden para llevar una llamada de lead perdido a factura pagada.',
      toggleShow: 'Mostrar pasos',
      toggleHide: 'Ocultar pasos',
      tipTitle: '¿No haces nada? La IA igual trabaja por ti',
      tipBody:
        'Si no haces clic en nada, el sistema devuelve la llamada y la califica solo en pocos minutos — velocidad de respuesta. La demo se mueve sola, como lo haría en tu negocio.',
      steps: [
        {
          title: 'Captura la llamada',
          body: 'Una llamada está sonando en el panel "Live call". Haz clic en "Capture as lead" para convertir esa llamada perdida en un lead en lugar de perder el trabajo.',
        },
        {
          title: 'Califica y agenda',
          body: 'El lead aparece en la "Lead queue". Haz clic en "Qualify" para puntuarlo y luego en "Book" para fijar la cita.',
        },
        {
          title: 'Asigna y despacha',
          body: 'En el tablero de zonas, elige un técnico en el menú "Assign…" y luego haz clic en "Dispatch", "Start" y "Complete" para avanzar el trabajo.',
        },
        {
          title: 'Factura',
          body: 'Haz clic en "Invoice" para cerrar el trabajo: el ingreso sube al instante en la barra de KPIs de arriba.',
        },
      ],
    },
    sections: {
      solution: {
        eyebrow: 'Cómo funciona',
        headline: 'De la llamada perdida a la factura pagada — sin contratar a nadie',
        body: 'En cuanto entra la llamada, el sistema responde, califica y enruta el trabajo, para que cada lead se convierta en una cita agendada y un técnico despachado, no en un buzón de voz.',
      },
      dashboard: {
        eyebrow: 'Míralo en vivo',
        headline: 'Un solo tablero maneja todo el embudo',
        body: 'Este es el producto funcionando, no un mockup. Despacha un lead, observa la cola y mira el ingreso recuperado en tiempo real.',
      },
      proof: {
        eyebrow: 'Por qué cambian los equipos',
        headline: 'Diseñado para la realidad del servicio técnico',
      },
      roi: {
        eyebrow: 'El número que importa',
        headline: 'Lo que te cuestan unas pocas llamadas perdidas',
      },
      cta: {
        eyebrow: 'Cuando estés listo',
        headline: 'Míralo con tu propio negocio',
        body: 'Agenda una llamada de 20 minutos. Revisamos tu volumen de llamadas, tu ticket promedio y cuánto recupera el mismo sistema en tu caso.',
      },
    },
    solutionSteps: [
      {
        title: 'Responde cada llamada',
        body: 'La recepcionista por IA contesta al primer ring — sin música en espera ni llamadas perdidas.',
      },
      {
        title: 'Califica y captura el lead',
        body: 'Hace las preguntas correctas y agenda un horario antes de que el cliente cuelgue.',
      },
      {
        title: 'Agenda al instante',
        body: 'El trabajo llega a tu tablero como una cita confirmada con horario.',
      },
      {
        title: 'Despacha al técnico más cercano',
        body: 'Tu equipo ve el trabajo en su teléfono y arranca, sin pelear con los teléfonos.',
      },
      {
        title: 'Factura y cierra el ciclo',
        body: 'Completa en sitio, factura con un toque y registra el ingreso.',
      },
    ],
    proofTitle: 'Resultados',
    integrationsTitle: 'Se conecta con las herramientas que ya usas',
    ctaLabel: 'Agenda una demo',
    footer: {
      metricsSourced: 'Métricas basadas en reportes de la industria.',
      estimated: 'Estimación basada en promedios de la industria.',
      brand: 'demo-hvac',
      rights: 'Todos los derechos reservados.',
      demoDisclaimer:
        'Demo interactiva del producto. Las cifras proyectadas son estimaciones basadas en promedios de la industria, no garantías.',
    },
  },
} as const;

export type UiStrings = (typeof ui)[Locale];

/** Copy de venta de la landing ES (traducción de la config hvac, que es EN). */
export const esCopy = {
  hero: {
    eyebrow: 'Recepción por IA · Servicio técnico',
    headline: 'Deja de perder trabajos de $2,200 por llamadas perdidas',
    subheadline:
      'Cada llamada que tu equipo pierde mientras está en ruta es un trabajo que agenda un competidor. Captura, califica, despacha y factura en un solo tablero.',
    ctaLabel: 'Míralo en vivo',
  },
  painPoint: {
    headline: 'El 62% de las llamadas HVAC quedan sin respuesta',
    body: 'Tus técnicos están en el camión, tu oficina está sin personal y el teléfono no para de sonar. El 62% de las llamadas a negocios de HVAC se pierden, y el 85% de esos clientes nunca vuelve a llamar. Son $14,700 millones que se fugan de la industria cada año.',
    metrics: [
      {
        label: 'Llamadas perdidas por negocios HVAC',
        value: '62%',
        source: 'https://calljolt.com/blog/hvac/hvac-industry-missed-call-statistics-2026',
      },
      {
        label: 'Clientes que nunca vuelven a llamar',
        value: '85%',
        source: 'https://skipcalls.com/blog/the-62-percent-problem-contractor-speed-to-lead',
      },
      {
        label: 'Ticket promedio de servicio HVAC',
        value: '$2,200',
        source: 'https://calljolt.com/blog/hvac/hvac-industry-missed-call-statistics-2026',
      },
    ],
  },
  proof: [
    {
      type: 'statistic' as const,
      text: 'Responder en menos de 5 minutos te hace 21 veces más probable de calificar un lead que hacerlo en 30 minutos.',
      source: 'https://calljolt.com/blog/guides/speed-to-lead-statistics-5-minute-rule',
    },
    {
      type: 'case_study' as const,
      text: 'Un taller HVAC de 2 camiones que recupera 5 llamadas perdidas a la semana, con un ticket de $2,200, suma cerca de $350,000 en ingresos anuales.',
    },
  ],
};
