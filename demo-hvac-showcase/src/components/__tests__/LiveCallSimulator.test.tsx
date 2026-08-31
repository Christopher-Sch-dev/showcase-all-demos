import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LiveCallSimulator } from '../LiveCallSimulator';
import { createSeedState } from '../../lib/seed';
import { parseCallTranscript } from '../../lib/ai';
import type { Action } from '../../lib/state';

// rol: suite del simulador de llamada perdida en vivo (transcript + intent + capture).
// Usa DI (prop `call`) para fijar una llamada conocida y no depender del índice global.

const CALL = {
  transcript:
    "Hi, my AC broke down, no cool air, baby at home, urgent, north side. " +
    "Please come asap.",
  intent: parseCallTranscript(
    "Hi, my AC broke down, no cool air, baby at home, urgent, north side. " +
      "Please come asap.",
  ),
};

describe('LiveCallSimulator — transcript e intención', () => {
  it('muestra un transcript de llamada y su intención parseada', () => {
    render(<LiveCallSimulator state={createSeedState()} onAction={() => {}} call={CALL} />);
    const transcriptEl = screen.getByTestId('call-transcript');
    expect(transcriptEl.textContent?.length).toBeGreaterThan(0);
    expect(screen.getByTestId('call-intent')).toBeInTheDocument();
  });

  it('muestra serviceType, urgency, zone y ticket del intent parseado', () => {
    render(<LiveCallSimulator state={createSeedState()} onAction={() => {}} call={CALL} />);
    expect(screen.getByText(CALL.intent.serviceType)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(CALL.intent.urgency, 'i'))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(CALL.intent.zone, 'i'))).toBeInTheDocument();
    expect(screen.getByText(`$${CALL.intent.estimatedTicket.toLocaleString('en-US')}`)).toBeInTheDocument();
  });
});

describe('LiveCallSimulator — captura como lead', () => {
  it('el botón "Capture as lead" despacha captureCall con la intención', () => {
    const onAction = vi.fn();
    render(<LiveCallSimulator state={createSeedState()} onAction={onAction} call={CALL} />);
    fireEvent.click(screen.getByRole('button', { name: /capture as lead/i }));
    expect(onAction).toHaveBeenCalled();
    const action = onAction.mock.calls[0][0] as Extract<Action, { type: 'captureCall' }>;
    expect(action.type).toBe('captureCall');
    expect(action.payload).toBeTruthy();
  });

  it('despacha con la urgency y zone de la intención parseada', () => {
    const onAction = vi.fn();
    render(<LiveCallSimulator state={createSeedState()} onAction={onAction} call={CALL} />);
    fireEvent.click(screen.getByRole('button', { name: /capture as lead/i }));
    const action = onAction.mock.calls[0][0] as Extract<Action, { type: 'captureCall' }>;
    expect(action.payload.priority).toBe(CALL.intent.urgency);
    expect(action.payload.zone).toBe(CALL.intent.zone);
  });
});
