import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DispatchBoard } from '../DispatchBoard';
import { createSeedState, seedTechnicians } from '../../lib/seed';
import type { DemoState, Lead, Technician } from '../../lib/types';
import type { Action } from '../../lib/state';

// rol: estrechar una Action a las que llevan `id` (despacho/colas).
function withId(action: Action): Action & { id: string } {
  if ('id' in action) return action as Action & { id: string };
  throw new Error('Acción sin id');
}

// rol: suite para el board de despacho por zonas con jobs scheduled/dispatched/in_progress.

// rol: construir un estado con 3 jobs (uno por estado transitable) en zonas distintas.
function jobBoardState(): DemoState {
  const base = createSeedState();
  const tech = (zone: Technician['zone']) => base.technicians.find((t) => t.zone === zone)!;
  const mkJob = (id: string, zone: Lead['zone'], status: Lead['status'], technicianId?: string): Lead => ({
    id,
    status,
    customerName: `Client-${id}`,
    customerPhone: '555-0000',
    address: '1 St',
    city: 'City',
    issue: 'AC repair',
    zone,
    priority: 'high',
    capturedAt: 1,
    respondedAt: 2,
    bookedAt: 3,
    technicianId,
    scheduledDate: '2026-08-21',
    scheduledTime: '09:00',
    timeline: [{ status, at: 4 }],
    createdAt: 1,
    updatedAt: 4,
  });
  return {
    ...base,
    leads: [
      mkJob('J1', 'north', 'scheduled', tech('north').id),
      mkJob('J2', 'central', 'dispatched', tech('central').id),
      mkJob('J3', 'south', 'in_progress', tech('south').id),
    ],
  };
}

describe('DispatchBoard — columnas por zona', () => {
  it('muestra las 3 zonas como columnas', () => {
    render(<DispatchBoard state={jobBoardState()} onAction={() => {}} />);
    expect(screen.getByText(/north/i)).toBeInTheDocument();
    expect(screen.getByText(/central/i)).toBeInTheDocument();
    expect(screen.getByText(/south/i)).toBeInTheDocument();
  });

  it('muestra cada job con ticket JOB-xxx, cliente y técnico', () => {
    render(<DispatchBoard state={jobBoardState()} onAction={() => {}} />);
    expect(screen.getByText('JOB-J1')).toBeInTheDocument();
    expect(screen.getByText('Client-J1')).toBeInTheDocument();
    for (const t of seedTechnicians) {
      expect(screen.getByText(t.name)).toBeInTheDocument();
    }
  });

  it('muestra el StatusBadge del estado de cada job', () => {
    render(<DispatchBoard state={jobBoardState()} onAction={() => {}} />);
    expect(screen.getByText('SCHEDULED')).toBeInTheDocument();
    expect(screen.getByText('DISPATCHED')).toBeInTheDocument();
    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
  });
});

describe('DispatchBoard — acciones Dispatch/Start/Complete', () => {
  it('job scheduled ofrece Dispatch y dispara onAction dispatch', () => {
    const onAction = vi.fn();
    render(<DispatchBoard state={jobBoardState()} onAction={onAction} />);
    const dispatchBtn = screen.getByText('Dispatch');
    fireEvent.click(dispatchBtn);
    expect(onAction).toHaveBeenCalled();
    const action = onAction.mock.calls[0][0] as Action;
    expect(action.type).toBe('dispatch');
    expect(withId(action).id).toBe('J1');
  });

  it('job dispatched ofrece Start y dispara onAction startJob', () => {
    const onAction = vi.fn();
    render(<DispatchBoard state={jobBoardState()} onAction={onAction} />);
    fireEvent.click(screen.getByText('Start'));
    expect(onAction).toHaveBeenCalled();
    const action = onAction.mock.calls[0][0] as Action;
    expect(action.type).toBe('startJob');
    expect(withId(action).id).toBe('J2');
  });

  it('job in_progress ofrece Complete y dispara onAction completeJob', () => {
    const onAction = vi.fn();
    render(<DispatchBoard state={jobBoardState()} onAction={onAction} />);
    fireEvent.click(screen.getByText('Complete'));
    expect(onAction).toHaveBeenCalled();
    const action = onAction.mock.calls[0][0] as Action;
    expect(action.type).toBe('completeJob');
    expect(withId(action).id).toBe('J3');
  });

  it('el dot del técnico usa el color del técnico', () => {
    render(<DispatchBoard state={jobBoardState()} onAction={() => {}} />);
    // tech-north = Carlos, color #2563EB (jsdom normaliza a rgb(37, 99, 235))
    const dot = document.querySelector('[data-tech-dot="tech-north"]');
    expect(dot).not.toBeNull();
    const style = dot?.getAttribute('style') ?? '';
    expect(style).toMatch(/rgb\(37,\s*99,\s*235\)/i);
  });
});
