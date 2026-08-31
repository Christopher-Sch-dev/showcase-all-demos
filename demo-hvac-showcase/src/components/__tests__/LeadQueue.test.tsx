import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeadQueue } from '../LeadQueue';
import { createSeedState, seedLeads } from '../../lib/seed';
import type { DemoState } from '../../lib/types';
import type { Action } from '../../lib/state';

// rol: suite para la cola de leads pendientes (qualified/booked) con acciones.

describe('LeadQueue — renderiza los leads del seed', () => {
  it('muestra los 5 leads del seed con nombre, score y razón', () => {
    render(<LeadQueue state={createSeedState()} onAction={() => {}} />);
    for (const lead of seedLeads) {
      expect(screen.getByText(lead.customerName)).toBeInTheDocument();
      expect(screen.getByText(String(lead.qualification?.score ?? 0))).toBeInTheDocument();
      expect(screen.getByText(lead.qualification?.reason ?? '')).toBeInTheDocument();
    }
  });

  it('muestra leads recién capturados (lead) para poder calificarlos', () => {
    const state = createSeedState();
    // añadir un lead 'lead' (capturado, no cualificado) que DEBE aparecer con botón Qualify
    const withRaw: DemoState = {
      ...state,
      leads: [
        ...state.leads,
        {
          id: 'LEAD-RAW',
          status: 'lead',
          customerName: 'ShouldRender',
          customerPhone: 'x',
          address: 'x',
          city: 'x',
          issue: 'No cool air',
          zone: 'north',
          priority: 'normal',
          capturedAt: 1,
          timeline: [],
          createdAt: 1,
          updatedAt: 1,
        },
      ],
    };
    render(<LeadQueue state={withRaw} onAction={() => {}} />);
    expect(screen.getByText('ShouldRender')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Qualify /i })).toBeInTheDocument();
  });
});

describe('LeadQueue — acciones dispatch al reducer', () => {
  it('el botón Book dispara onAction con action book', () => {
    const onAction = vi.fn();
    render(<LeadQueue state={createSeedState()} onAction={onAction} />);
    // seed: todos los leads están qualified → botones Book.
    const bookButtons = screen.getAllByRole('button', { name: /^Book /i });
    fireEvent.click(bookButtons[0]);
    expect(onAction).toHaveBeenCalled();
    const action = onAction.mock.calls[0][0] as Action;
    expect(action.type).toBe('book');
  });

  it('un lead capturado (lead) ofrece Qualify y dispara action qualify', () => {
    const onAction = vi.fn();
    const state = createSeedState();
    const rawLead: DemoState['leads'][number] = {
      id: 'LEAD-RAW',
      status: 'lead',
      customerName: 'AC Emergency',
      customerPhone: '555-CALL',
      address: 'Incoming call',
      city: 'north',
      issue: 'No cool air, baby at home, north side',
      zone: 'north',
      priority: 'urgent',
      capturedAt: 1,
      timeline: [],
      createdAt: 1,
      updatedAt: 1,
    };
    render(<LeadQueue state={{ ...state, leads: [rawLead] }} onAction={onAction} />);
    const qualifyBtn = screen.getByRole('button', { name: /^Qualify /i });
    fireEvent.click(qualifyBtn);
    expect(onAction).toHaveBeenCalled();
    const action = onAction.mock.calls[0][0] as Action;
    expect(action.type).toBe('qualify');
  });
});

describe('LeadQueue — colores/estados', () => {
  it('muestra un badge de urgencia para leads con prioridad urgent', () => {
    render(<LeadQueue state={createSeedState()} onAction={() => {}} />);
    // L4 Priya Nair es urgent
    expect(screen.getAllByText(/URGENT/i).length).toBeGreaterThan(0);
  });
});
