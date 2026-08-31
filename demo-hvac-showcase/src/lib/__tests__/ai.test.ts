import { describe, it, expect } from 'vitest';
import { parseCallTranscript, simulateMissedCall } from '../ai';
import type { ParsedIntent } from '../types';

// rol: suite de pruebas para el parseo de intención y la simulación de llamada

describe('parseCallTranscript — extracción determinista', () => {
  it('detecta AC repair urgente en zona north', () => {
    const intent = parseCallTranscript(
      "Hi, my AC broke down and there's no cool air. Please come ASAP, " +
        "we have a baby at home. We're on the north side of town.",
    );
    expect(intent.issue.length).toBeGreaterThan(0);
    expect(intent.serviceType).toBe('AC repair');
    expect(intent.urgency).toBe('urgent');
    expect(intent.zone).toBe('north');
    expect(intent.estimatedTicket).toBeGreaterThan(0);
  });

  it('detecta furnace tune-up como mantenimiento de baja urgencia', () => {
    const intent = parseCallTranscript(
      "Can someone do a furnace tune-up? It's not an emergency, just " +
        'maintenance before winter. We are downtown near central.',
    );
    expect(intent.serviceType).toBe('furnace tune-up');
    expect(intent.urgency).toBe('low');
    expect(intent.zone).toBe('central');
  });

  it('detecta duct cleaning', () => {
    const intent = parseCallTranscript(
      'We need duct cleaning, the air smells dusty. House is on the south side.',
    );
    expect(intent.serviceType).toBe('duct cleaning');
    expect(intent.zone).toBe('south');
  });

  it('texto sin señales → fallback robusto: issue no vacío y ticket no negativo', () => {
    const intent = parseCallTranscript('hello?');
    expect(intent.issue.length).toBeGreaterThan(0);
    expect(intent.serviceType.length).toBeGreaterThan(0);
    expect(intent.estimatedTicket).toBeGreaterThanOrEqual(0);
  });

  it('estimatedTicket nunca es negativo', () => {
    const intent = parseCallTranscript('');
    expect(intent.estimatedTicket).toBeGreaterThanOrEqual(0);
  });
});

describe('parseCallTranscript — invariantes de contrato', () => {
  const samples = [
    'AC broke, urgent, north zone',
    'furnace tune-up booking, central',
    'duct cleaning quote please',
  ];
  it('todo ParsedIntent respeta el contrato', () => {
    for (const text of samples) {
      const intent: ParsedIntent = parseCallTranscript(text);
      expect(intent.issue.length).toBeGreaterThan(0);
      expect(intent.urgency).toMatch(/^(low|normal|high|urgent)$/);
      expect(['north', 'central', 'south']).toContain(intent.zone);
      expect(intent.estimatedTicket).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('simulateMissedCall — invariantes', () => {
  it('genera transcript + intent consistente y válido', () => {
    for (let i = 0; i < 20; i++) {
      const { transcript, intent } = simulateMissedCall();
      expect(typeof transcript).toBe('string');
      expect(transcript.length).toBeGreaterThan(0);
      expect(intent.issue.length).toBeGreaterThan(0);
      expect(intent.estimatedTicket).toBeGreaterThanOrEqual(0);
      // el intent DEBE poder re-derivarse del transcript (consistencia)
      const reparsed = parseCallTranscript(transcript);
      expect(reparsed.serviceType).toBe(intent.serviceType);
      expect(reparsed.zone).toBe(intent.zone);
    }
  });

  it('es determinista y estable entre llamadas (evita hydration mismatch #418)', () => {
    // El contador global mutable rompía SSR: server y client renderizaban distinto.
    // Ahora devuelve SIEMPRE el escenario[0] para que SSR y client coincidan.
    const a = simulateMissedCall();
    const b = simulateMissedCall();
    expect(a.transcript).toBe(b.transcript);
    expect(a.intent.serviceType).toBe(b.intent.serviceType);
    expect(a.intent.serviceType).toBe('AC repair'); // escenario[0]
  });
});
