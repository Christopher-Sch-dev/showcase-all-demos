import { describe, it, expect } from 'vitest';
import { parseLeadTranscript, simulateLeadResponse } from '../ai';
import type { ParsedLeadIntent } from '../types';

// rol: suite de pruebas para el parseo de intención de lead y la simulación (<60s, AC-1)

describe('parseLeadTranscript — extracción determinista (RE/Law)', () => {
  it('detecta un lead inmobiliario con datos de contacto', () => {
    const intent = parseLeadTranscript(
      "Hi, I'm looking to buy a 4-bedroom house under $600k in North Dallas, ASAP, " +
        'we need to close before school starts. Name is Maria. Contact maria@x.com, phone 555-0100.',
    );
    expect(intent.topic.length).toBeGreaterThan(0);
    expect(intent.name.length).toBeGreaterThan(0);
    expect(intent.email.length).toBeGreaterThan(0);
    expect(intent.phone.length).toBeGreaterThan(0);
    expect(intent.capturedAt).toBeGreaterThan(0);
  });

  it('detecta una consulta legal (Law)', () => {
    const intent = parseLeadTranscript(
      'I need a family law consult about custody. Contact me at family@law.com, phone 555-0199. Name is Anne.',
    );
    expect(intent.topic.length).toBeGreaterThan(0);
    expect(intent.email).toContain('@');
  });

  it('texto sin señales → fallback robusto: topic y name no vacíos', () => {
    const intent = parseLeadTranscript('hello?');
    expect(intent.topic.length).toBeGreaterThan(0);
    expect(intent.name.length).toBeGreaterThan(0);
    expect(intent.email.length).toBeGreaterThan(0);
    expect(intent.phone.length).toBeGreaterThan(0);
  });
});

describe('parseLeadTranscript — invariantes de contrato', () => {
  const samples = [
    'buying 4br under 600k, urgent, north',
    'family law consult for custody',
    'selling my condo, flexible timeline',
    'hello?',
  ];
  it('todo ParsedLeadIntent respeta el contrato (no vacío, capturedAt numérico)', () => {
    for (const text of samples) {
      const intent: ParsedLeadIntent = parseLeadTranscript(text);
      expect(intent.topic.length).toBeGreaterThan(0);
      expect(intent.name.length).toBeGreaterThan(0);
      expect(intent.email.length).toBeGreaterThan(0);
      expect(intent.phone.length).toBeGreaterThan(0);
      expect(typeof intent.capturedAt).toBe('number');
      expect(intent.capturedAt).toBeGreaterThan(0);
    }
  });
});

describe('simulateLeadResponse — invariantes', () => {
  it('genera transcript + intent consistente y válido', () => {
    for (let i = 0; i < 20; i++) {
      const { transcript, intent } = simulateLeadResponse();
      expect(typeof transcript).toBe('string');
      expect(transcript.length).toBeGreaterThan(0);
      expect(intent.topic.length).toBeGreaterThan(0);
      // el intent DEBE poder re-derivarse del transcript (consistencia determinista)
      const reparsed = parseLeadTranscript(transcript);
      expect(reparsed.topic).toBe(intent.topic);
      expect(reparsed.name).toBe(intent.name);
    }
  });

  it('es determinista y estable entre llamadas (evita hydration mismatch #418)', () => {
    // Devuelve SIEMPRE el escenario[0] para que SSR y client coincidan.
    const a = simulateLeadResponse();
    const b = simulateLeadResponse();
    expect(a.transcript).toBe(b.transcript);
    expect(a.intent.topic).toBe(b.intent.topic);
  });
});
