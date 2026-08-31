import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CTACalendly from '@/components/ui/CTACalendly';
import { cfg, t, CALENDLY } from '../../../tests/helpers/fixture';

describe('CTACalendly', () => {
  const re = cfg('realestate');

  it('apunta SIEMPRE a calendly.com/csch1305 (nunca mailto)', () => {
    render(<CTACalendly href={re.cta.url} label={re.cta.label} radius={re.aesthetic.radius} accent={re.aesthetic.accent} />);
    const link = screen.getByTestId('cta-calendly');
    expect(link).toHaveAttribute('href', CALENDLY);
    expect(link.getAttribute('href')).not.toMatch(/^mailto:/);
  });

  it('abre en nueva pestaña con rel noopener', () => {
    render(<CTACalendly href={re.cta.url} label="x" accent="#000" />);
    const link = screen.getByTestId('cta-calendly');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('usa radius pill para RE (elegante) y rounded para Law (autoridad)', () => {
    const law = cfg('law');
    const { rerender } = render(<CTACalendly href={re.cta.url} label="x" radius={re.aesthetic.radius} accent="#000" />);
    expect(screen.getByTestId('cta-calendly').className).toContain('rounded-full');
    rerender(<CTACalendly href={law.cta.url} label="x" radius={law.aesthetic.radius} accent="#000" />);
    expect(screen.getByTestId('cta-calendly').className).toContain('rounded-lg');
  });

  it('cumple touch >= 44px', () => {
    render(<CTACalendly href={re.cta.url} label="x" accent="#000" />);
    const link = screen.getByTestId('cta-calendly');
    expect(link.className).toContain('min-h-[44px]');
  });
});
