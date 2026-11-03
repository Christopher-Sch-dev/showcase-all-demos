// rol: motor de showcase local de la demo (respuestas por matching local, sin backend).
// Textos en español chileno neutro con tuteo: nada de voseo rioplatense.
export type Business = {
  whatsapp: string;
  ubicacion: string;
  estacionamiento: string;
  horarios: string;
  medios_pago: string;
  promo: string;
  equipo: { nombre: string; rol: string }[];
};

export type ShowcaseItem = { q: string; a: string };

// rol: normaliza para comparar (minúsculas y sin tildes), así una pregunta escrita
// con o sin acento encuentra igual su respuesta.
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function buildShowcase(business: Business) {
  const items: ShowcaseItem[] = [
    { q: '¿Cuánto cuesta la limpieza?', a: 'La limpieza profunda cuesta $25.000 CLP y dura 45 minutos. Incluye profilaxis con ultrasonido. ¿Quieres reservar?' },
    { q: '¿Toman Consalud?', a: 'Sí, trabajamos con Consalud, Cruz Blanca, Banmédica, Colmena y Nueva Masvida. También atendemos con bonos Fonasa. Te entregamos el programa para reembolso.' },
    { q: '¿Tienen ortodoncia invisible?', a: 'Sí. La ortodoncia invisible parte desde $890.000 CLP, con un plan de 6 a 12 meses según el caso. Hacemos evaluación inicial sin costo. ¿Quieres agendar la evaluación?' },
    { q: '¿Atienden urgencias?', a: 'Sí, atendemos urgencias dentales 24/7. El costo parte desde $35.000 CLP. Si es urgente ahora, escríbenos directo al WhatsApp ' + business.whatsapp + ' y respondemos en menos de 30 minutos.' },
    { q: '¿Cómo llego?', a: business.ubicacion + '. ' + business.estacionamiento + '. Atendemos ' + business.horarios + '.' },
    { q: '¿Quiénes son los doctores?', a: 'Tenemos 8 odontólogos. Entre ellos: ' + business.equipo.map(e => e.nombre + ' (' + e.rol + ')').join('; ') + '.' },
    { q: '¿Qué medios de pago aceptan?', a: business.medios_pago + '. También facturamos para reembolso con isapre.' },
    { q: '¿Tienen alguna promo?', a: business.promo + '. Es solo mencionando este chat al momento de reservar.' },
    { q: 'Quiero reservar una limpieza', a: 'Perfecto. Dime tu nombre completo, qué día te acomoda mejor y un teléfono de contacto. Te confirmo por WhatsApp en menos de 1 hora.' },
    { q: '¿Hacen implantes?', a: 'Sí. Implante dental unitario parte desde $450.000 CLP. Requiere evaluación previa con la Dra. Francisca Leiva (implantología). ¿Quieres agendar la evaluación?' },
  ];

  function pickShowcase(text: string): string {
    const t = normalize(text);
    let best: ShowcaseItem | null = null;
    let bestScore = 0;

    for (const item of items) {
      const words = normalize(item.q).split(/\W+/).filter(w => w.length > 3);
      let score = 0;
      for (const w of words) if (t.includes(w)) score++;
      if (score > bestScore) { bestScore = score; best = item; }
    }

    if (best) return best.a;

    const fallbacks = [
      'Recibido. ¿Quieres que te derive con un humano por WhatsApp ' + business.whatsapp + '?',
      'Esa información no la manejo yo, pero te puedo ayudar con reservas, precios, servicios o ubicación.',
      '¿Quieres que te cuente sobre nuestros servicios o te reservo una hora?',
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  function renderText(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
      .replace(/\n/g, '<br>');
  }

  return { items, pickShowcase, renderText };
}
