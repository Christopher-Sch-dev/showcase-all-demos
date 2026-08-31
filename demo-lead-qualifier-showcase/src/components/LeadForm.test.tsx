import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LeadForm from '@/components/LeadForm';
import { t } from '../../tests/helpers/fixture';
import { createSeedState } from '@/lib/seed';
import { reduce } from '@/lib/state';

describe('LeadForm', () => {
  // rol: mock del dispatch que reduce contra el core real (FSM determinista).
  function makeDemo() {
    const dispatch = vi.fn((action: any, now = Date.now()) => {
      const res = reduce(state, action, now);
      if (res.changed) state = res.state;
      return res.changed;
    });
    let state = createSeedState();
    return { dispatch, state: () => state };
  }

  it('valida email inline y bloquea captura si es inválido', () => {
    const { dispatch } = makeDemo();
    render(<LeadForm t={t()} niche="realestate" demo={{ dispatch }} />);
    fireEvent.change(screen.getByTestId('lf-name'), { target: { value: 'Maria' } });
    fireEvent.change(screen.getByTestId('lf-email'), { target: { value: 'bad-email' } });
    fireEvent.change(screen.getByTestId('lf-phone'), { target: { value: '555-0100' } });
    fireEvent.change(screen.getByTestId('lf-topic'), { target: { value: '4-bedroom house' } });
    fireEvent.blur(screen.getByTestId('lf-email'));
    fireEvent.click(screen.getByTestId('lf-submit'));
    expect(screen.getByText('Enter a valid email.')).toBeTruthy();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('dispara capture_lead con intent válido → lead new (FSM core)', () => {
    const { dispatch, state } = makeDemo();
    render(<LeadForm t={t()} niche="realestate" demo={{ dispatch }} />);
    fireEvent.change(screen.getByTestId('lf-name'), { target: { value: 'Maria Gonzalez' } });
    fireEvent.change(screen.getByTestId('lf-email'), { target: { value: 'maria@example.com' } });
    fireEvent.change(screen.getByTestId('lf-phone'), { target: { value: '555-0100' } });
    fireEvent.change(screen.getByTestId('lf-topic'), { target: { value: 'looking for 4-bedroom house' } });
    fireEvent.change(screen.getByTestId('lf-budget'), { target: { value: '600000' } });
    fireEvent.click(screen.getByTestId('lf-submit'));
    expect(dispatch).toHaveBeenCalledTimes(1);
    const action = dispatch.mock.calls[0][0];
    expect(action.type).toBe('capture_lead');
    expect(action.intent.niche).toBe('realestate');
    expect(action.intent.name).toBe('Maria Gonzalez');
    expect(action.intent.budget).toBe(600000);
    // verificar que el core generó un lead new persistido en estado.
    const lead = state().leads.find((l) => l.name === 'Maria Gonzalez');
    expect(lead?.status).toBe('new');
  });

  it('campos min-height 44px (touch)', () => {
    const { dispatch } = makeDemo();
    render(<LeadForm t={t()} niche="realestate" demo={{ dispatch }} />);
    expect(screen.getByTestId('lf-name').className).toContain('min-h-[44px]');
  });
});
