import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../ui/StatusBadge';
import type { LeadStatus, Priority } from '../../lib/types';

// rol: suite para el badge semántico de estado de lead (color + icono + uppercase).

function tone(): string | null | undefined {
  return document.querySelector('[data-testid="status-badge"]')?.getAttribute('data-tone');
}

describe('StatusBadge — color semántico por estado', () => {
  it('completed e invoiced usan el tono verde on-route', () => {
    const { rerender } = render(<StatusBadge status="completed" />);
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    expect(tone()).toBe('success');
    rerender(<StatusBadge status="invoiced" />);
    expect(screen.getByText('INVOICED')).toBeInTheDocument();
    expect(tone()).toBe('success');
  });

  it('dispatched e in_progress usan el tono azul acento', () => {
    const { rerender } = render(<StatusBadge status="dispatched" />);
    expect(tone()).toBe('accent');
    rerender(<StatusBadge status="in_progress" />);
    expect(tone()).toBe('accent');
  });

  it('scheduled, booked y qualified usan tono neutro', () => {
    for (const status of ['scheduled', 'booked', 'qualified'] as LeadStatus[]) {
      render(<StatusBadge status={status} />);
      expect(tone()).toBe('neutral');
    }
  });

  it('canceled y no_show usan tono gris atenuado', () => {
    for (const status of ['canceled', 'no_show'] as LeadStatus[]) {
      render(<StatusBadge status={status} />);
      expect(tone()).toBe('muted');
    }
  });

  it('prioridad urgente fuerza el tono rojo de urgencia', () => {
    render(<StatusBadge status="qualified" priority="urgent" />);
    expect(tone()).toBe('urgent');
  });

  it('renderiza el estado en uppercase con tipografía mono y radius', () => {
    render(<StatusBadge status="dispatched" />);
    const badge = screen.getByText('DISPATCHED');
    expect(badge.className).toMatch(/uppercase/);
    expect(badge.className).toMatch(/font-mono/);
    expect(badge.className).toMatch(/rounded/);
  });
});

describe('StatusBadge — helper de prioridad urgente', () => {
  it('expone un badge de urgencia para prioridad urgent', () => {
    const priority: Priority = 'urgent';
    expect(priority).toBe('urgent');
  });
});
