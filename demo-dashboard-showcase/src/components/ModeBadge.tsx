/**
 * MODE BADGE — badge "MODO DEMO" siempre visible + hint de demo segura.
 * Presentacional: recibe strings (DI). Sin lógica de negocio.
 */
import type { UiStrings } from '../i18n/strings';
import { FlaskConical } from 'lucide-react';

interface Props {
 strings: UiStrings;
}

export default function ModeBadge({ strings }: Props) {
 return ( <span
 className="inline-flex min-h-[28px] items-center gap-1.5 rounded-pill bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-strong"
 role="status"
 aria-label={strings.demoBadge.label}
 title={strings.demoBadge.hint}
 >
 <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
 {strings.demoBadge.label}
 </span>
);
}
