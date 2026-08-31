import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '@/components/ui/StatusBadge';
import { cfg, t } from '../../../tests/helpers/fixture';

describe('StatusBadge', () => {
  const re = cfg('realestate');
  const law = cfg('law');

  it('renderiza label i18n del estado + icono lucide (qualified)', () => {
    render(<StatusBadge status="qualified" accent={re.aesthetic.accent} label={t().statusQualified} />);
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveTextContent('Qualified');
    expect(badge.querySelector('svg')).toBeTruthy();
  });

  it('usa el acento de marca para "qualified" (no hardcode por nicho)', () => {
    render(<StatusBadge status="qualified" accent={re.aesthetic.accent} label={t().statusQualified} />);
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveStyle({ backgroundColor: re.aesthetic.accent });
  });

  it('booked usa verde éxito independiente del nicho', () => {
    const { rerender } = render(<StatusBadge status="booked" accent={law.aesthetic.accent} label={t().statusBooked} />);
    expect(screen.getByTestId('status-badge')).toHaveStyle({ backgroundColor: '#22c55e' });
    rerender(<StatusBadge status="booked" accent={re.aesthetic.accent} label={t().statusBooked} />);
    expect(screen.getByTestId('status-badge')).toHaveStyle({ backgroundColor: '#22c55e' });
  });

  it('new usa neutro y el label i18n', () => {
    render(<StatusBadge status="new" accent={re.aesthetic.accent} label={t('es').statusNew} />);
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveTextContent('Nuevo');
    expect(badge).toHaveStyle({ backgroundColor: '#8A8F98' });
  });
});
