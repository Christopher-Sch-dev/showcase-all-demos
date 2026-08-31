/**
 * CTA CALENDLY — botón CTA → https://calendly.com/csch1305 (, NUNCA mailto).
 * La URL viene de la config Zod del nicho (cta.url) o del core (CALENDLY_URL).
 * target="_blank" rel="noopener". Presentacional, sin lógica de negocio.
 */
import type { UiStrings } from '../../i18n/strings';
import { ArrowRight } from 'lucide-react';

interface Props {
 /** Label del CTA (viene de config.cta.label o strings.cta.bookDemo). */
 label: string;
 /** URL Calendly (config.cta.url o CALENDLY_URL). */
 url: string;
 strings: UiStrings;
 /** Variante visual: primario (hero/cierre) o secundario. */
 variant?: 'primary' | 'secondary';
 /** Micro-trust bajo el CTA (opcional). */
 microTrust?: string;
}

export default function CTACalendly({ label, url, strings, variant = 'primary', microTrust }: Props) {
 const base =
 'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2';
 const styles =
 variant === 'primary'
 ? 'bg-accent text-white hover:bg-accent-strong'
 : 'border border-accent text-accent-strong hover:bg-accent-soft';
 return ( <div className="flex flex-col items-center gap-2">
 <a href={url} target="_blank" rel="noopener noreferrer" className={`${base} ${styles}`}>
 {label}
 <ArrowRight className="h-5 w-5" aria-hidden="true" />
 </a>
 {microTrust ? ( <p className="text-xs text-text-secondary" aria-label={microTrust}>
 {microTrust}
 </p>
) : null}
 </div>
);
}
