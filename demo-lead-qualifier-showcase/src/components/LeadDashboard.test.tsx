import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LeadDashboard from '@/components/LeadDashboard';
import { t, cfg, CALENDLY } from '../../tests/helpers/fixture';
import { createSeedState } from '@/lib/seed';

describe('LeadDashboard', () => {
  const re = cfg('realestate');

  it('lista leads por estado del seed (new/qualified/booked)', () => {
    const s = createSeedState();
    render(<LeadDashboard t={t()} state={s} config={re} />);
    // seed L1 booked, L2 qualified, L5 new RE
    expect(screen.getByTestId('score-L1')).toHaveTextContent('94');
    expect(screen.getByTestId('score-L2')).toHaveTextContent('88');
  });

  it('muestra CTA agendar → Calendly para leads qualified (nunca mailto)', () => {
    const s = createSeedState();
    render(<LeadDashboard t={t()} state={s} config={re} />);
    const ctas = screen.getAllByTestId('cta-calendly');
    expect(ctas.length).toBeGreaterThan(0);
    ctas.forEach((cta) => expect(cta).toHaveAttribute('href', CALENDLY));
  });

  it('lead booked expone bookingUrl Calendly', () => {
    const s = createSeedState();
    const booked = s.leads.find((l) => l.status === 'booked')!;
    render(<LeadDashboard t={t()} state={s} config={re} />);
    const link = screen.getByTestId(`booking-${booked.id}`);
    expect(link).toHaveAttribute('href', booked.bookingUrl);
  });

  it('empty state muestra mensaje i18n', () => {
    render(<LeadDashboard t={t('es')} state={{ version: 1, leads: [], leadCounter: 0, seeded: false }} config={re} />);
    expect(screen.getByTestId('dashboard')).toHaveTextContent('Aún no hay leads');
  });
});
