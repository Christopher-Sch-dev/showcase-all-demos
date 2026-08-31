/**
 * LANG TOGGLE — toggle EN/ES persistente (localStorage). Navegación entre / y /es/.
 * Presentacional: recibe el idioma actual + href/label del otro idioma (DI).
 */
import { Languages } from 'lucide-react';

interface Props {
 lang: 'en' | 'es';
 otherHref: string;
 otherLabel: string;
}

export default function LangToggle({ lang, otherHref, otherLabel }: Props) {
 const handleClick = () => {
 try {
 localStorage.setItem('demo-dashboard:lang', lang === 'en' ? 'es' : 'en');
 } catch {
 /* localStorage no disponible — el toggle sigue funcionando por navegación. */
 }
 };
 return ( <a
 href={otherHref}
 onClick={handleClick}
 className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-border px-3 font-medium text-text-secondary transition-colors duration-150 hover:bg-surface-2 hover:text-accent-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
 aria-label={otherLabel}
 title={otherLabel}
 >
 <Languages className="h-4 w-4" aria-hidden="true" />
 {otherLabel}
 </a>
);
}
