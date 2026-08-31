/**
 * SEO / AEO / GEO metadata — demo-hvac.
 * Centraliza: URL base (canonical/hreflang/OG) + meta por locale + FAQ JSON-LD
 * (AEO: las preguntas que un AI assistant respondería, derivadas del guion de venta).
 * HONESTIDAD: SITE_URL es la URL canónica real del proyecto Vercel `demo-hvac`
 * (demo-hvac-delta.vercel.app). El default `demo-hvac.vercel.app` está TOMADO por
 * otro proyecto viejo (Acme HVAC) — NO usar. Actualizar si se agrega dominio custom.
 */
export const SITE_URL = 'https://demo-hvac-delta.vercel.app';

/** URL por locale. `/` = EN default (sin prefijo), `/es/` = es-CL. */
export const localePaths: Record<Locale, string> = {
  en: '/',
  es: '/es/',
};

export type Locale = 'en' | 'es';

export interface SeoMeta {
  /** Title < 60 chars, keyword-first. */
  title: string;
  /** Description < 160 chars. */
  description: string;
  ogImage: string; // ruta local (placeholder honesto)
  /** Og:locale + html lang. */
  localeTag: 'en_US' | 'es_CL';
}

/** Meta técnica por locale (title/description/OG). */
export const seoMeta: Record<Locale, SeoMeta> = {
  en: {
    title: 'HVAC Call-Capture + Dispatch — AI Receptionist Demo',
    description:
      'Interactive demo: capture missed HVAC calls, dispatch your closest tech, and recover $2,200 jobs with an AI receptionist. Book a 20-min call.',
    ogImage: '/og-image.svg',
    localeTag: 'en_US',
  },
  es: {
    title: 'Captura de Llamadas + Despacho HVAC — Demo Recepción por IA',
    description:
      'Demo interactiva: captura llamadas perdidas HVAC, despacha a tu técnico más cercano y recupera trabajos de $2,200 con una recepción por IA. Agenda una llamada de 20 min.',
    ogImage: '/og-image.svg',
    localeTag: 'es_CL',
  },
};

export interface FaqItem {
  question: string;
  answer: string;
}

/** AEO — FAQ que un LLM/assistant respondería al evaluar esta demo (objeciones del guion de venta). */
export const seoFaq: Record<Locale, FaqItem[]> = {
  en: [
    {
      question: 'What does this HVAC demo do?',
      answer:
        'It simulates a full lead-to-invoice funnel for an HVAC business: an AI receptionist captures a missed call, qualifies and books the lead, dispatches the closest technician, invoices on completion, and updates live KPIs — all in one board.',
    },
    {
      question: 'How much revenue do HVAC businesses lose to missed calls?',
      answer:
        'Per the 2026 CallJolt report, 62% of calls to HVAC businesses go unanswered, 85% of those callers never call back, and the average service ticket is $2,200. The industry loses roughly $14.7B a year to missed calls.',
    },
    {
      question: 'How fast should I follow up on a lead?',
      answer:
        'Speed-to-lead matters: responding within 5 minutes makes you 21x more likely to qualify a lead than responding at 30 minutes. This demo tracks speed-to-lead live.',
    },
    {
      question: 'Is this a real product or a mockup?',
      answer:
        'It is a working interactive demo. You can drag a lead to dispatch, watch the queue update, and see revenue recovered in real time. It is ungated (no signup) and reset at the click of a button.',
    },
    {
      question: 'Can I see what this would do for my own business?',
      answer:
        'Yes — book a 20-minute call via Calendly and we review your call volume, average ticket, and what the same system recovers for you.',
    },
  ],
  es: [
    {
      question: '¿Qué hace esta demo de HVAC?',
      answer:
        'Simula el embudo completo de lead a factura para un negocio de HVAC: una recepcionista por IA captura la llamada perdida, califica y agenda el lead, despacha al técnico más cercano, factura al completar y actualiza KPIs en vivo — todo en un solo tablero.',
    },
    {
      question: '¿Cuánto dinero pierden los negocios HVAC por llamadas perdidas?',
      answer:
        'Según el reporte CallJolt 2026, el 62% de las llamadas a negocios HVAC quedan sin respuesta, el 85% de esos clientes nunca vuelve a llamar y el ticket promedio es de $2,200. La industria pierde cerca de $14,700 millones al año por llamadas perdidas.',
    },
    {
      question: '¿Qué tan rápido debería responder a un lead?',
      answer:
        'La velocidad importa: responder en menos de 5 minutos te hace 21 veces más probable de calificar un lead que hacerlo en 30 minutos. Esta demo mide el speed-to-lead en vivo.',
    },
    {
      question: '¿Esto es un producto real o un mockup?',
      answer:
        'Es una demo interactiva funcional. Puedes despachar un lead, observar cómo se actualiza la cola y ver el ingreso recuperado en tiempo real. Es sin registro y se reinicia con un clic.',
    },
    {
      question: '¿Puedo ver qué haría esto en mi propio negocio?',
      answer:
        'Sí — agenda una llamada de 20 minutos por Calendly y revisamos tu volumen de llamadas, tu ticket promedio y cuánto recupera el mismo sistema en tu caso.',
    },
  ],
};
