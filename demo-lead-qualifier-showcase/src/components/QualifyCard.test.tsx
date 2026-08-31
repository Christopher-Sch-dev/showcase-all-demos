import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import QualifyCard from '@/components/QualifyCard';
import { t, cfg, CALENDLY } from '../../tests/helpers/fixture';
import { createSeedState } from '@/lib/seed';

// rol: lead "qualified" del seed (L2 RE, score 88) con timestamps reales.
function qualifiedLead() {
  const s = createSeedState();
  return s.leads.find((l) => l.status === 'qualified')!;
}

describe('QualifyCard', () => {
  const re = cfg('realestate');

  it('muestra score, razón y estado qualified', () => {
    const lead = qualifiedLead();
    render(
      <QualifyCard
        t={t()}
        lead={lead}
        accent={re.aesthetic.accent}
        radius={re.aesthetic.radius}
        bookingUrl={re.cta.url}
        demo={{ qualify: () => {}, book: () => {} }}
        ctaLabel={re.cta.label}
      />,
    );
    expect(screen.getByTestId('score')).toHaveTextContent(String(lead.qualification!.score));
    expect(screen.getByTestId('reason')).toHaveTextContent(lead.qualification!.reason);
    expect(screen.getByTestId('status-badge')).toHaveTextContent('Qualified');
  });

  it('muestra speed <60s (respondedAt - capturedAt) para un lead qualified', () => {
    const lead = qualifiedLead();
    render(
      <QualifyCard
        t={t()}
        lead={lead}
        accent={re.aesthetic.accent}
        radius={re.aesthetic.radius}
        bookingUrl={re.cta.url}
        demo={{ qualify: () => {}, book: () => {} }}
        ctaLabel={re.cta.label}
      />,
    );
    // seed responde en 45s → <60s ✓
    expect(screen.getByTestId('speed')).toHaveTextContent('45s');
    expect(screen.getByTestId('timer').textContent).toContain('<60s');
  });

  it('lead new dispara qualify automático (IA invisible determinista)', () => {
    const qualify = vi.fn();
    const s = createSeedState();
    const newLead = s.leads.find((l) => l.status === 'new')!;
    render(
      <QualifyCard
        t={t()}
        lead={newLead}
        accent={re.aesthetic.accent}
        radius={re.aesthetic.radius}
        bookingUrl={re.cta.url}
        demo={{ qualify, book: () => {} }}
        ctaLabel={re.cta.label}
      />,
    );
    expect(qualify).toHaveBeenCalledWith(newLead);
  });

  it('lead qualified expone CTA agendar → Calendly (nunca mailto)', () => {
    const lead = qualifiedLead();
    render(
      <QualifyCard
        t={t()}
        lead={lead}
        accent={re.aesthetic.accent}
        radius={re.aesthetic.radius}
        bookingUrl={re.cta.url}
        demo={{ qualify: () => {}, book: () => {} }}
        ctaLabel={re.cta.label}
      />,
    );
    const cta = screen.getByTestId('cta-calendly');
    expect(cta).toHaveAttribute('href', CALENDLY);
    expect(cta.getAttribute('href')).not.toMatch(/^mailto:/);
  });

  it('lead booked muestra bookedCta en vez de agendar', () => {
    const s = createSeedState();
    const booked = s.leads.find((l) => l.status === 'booked')!;
    render(
      <QualifyCard
        t={t()}
        lead={booked}
        accent={re.aesthetic.accent}
        radius={re.aesthetic.radius}
        bookingUrl={booked.bookingUrl!}
        demo={{ qualify: () => {}, book: () => {} }}
        ctaLabel={re.cta.label}
      />,
    );
    expect(screen.getByTestId('cta-calendly')).toHaveTextContent('Booked');
  });

  it('lead qualified: hacer clic en CTA agendar dispara book con bookingUrl Calendly', () => {
    const s = createSeedState();
    const qualified = s.leads.find((l) => l.status === 'qualified')!;
    const book = vi.fn();
    render(
      <QualifyCard
        t={t()}
        lead={qualified}
        accent={re.aesthetic.accent}
        radius={re.aesthetic.radius}
        bookingUrl={re.cta.url}
        demo={{ qualify: () => {}, book }}
        ctaLabel={re.cta.label}
      />,
    );
    screen.getByTestId('cta-calendly').click();
    expect(book).toHaveBeenCalledWith(qualified.id, re.cta.url);
  });
});
