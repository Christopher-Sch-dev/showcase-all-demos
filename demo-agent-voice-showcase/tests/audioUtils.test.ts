import { describe, it, expect } from 'vitest';
import {
  pcmToWavBuffer,
  downsampleTo16k,
  floatTo16BitPCM,
  arrayBufferToBase64,
  base64ToPCMFloat32,
} from '../src/lib/audioUtils';

describe('audioUtils — utilidades de audio PCM', () => {
  describe('floatTo16BitPCM', () => {
    it('codifica Float32 a PCM16 little-endian (2 bytes por muestra)', () => {
      const buf = floatTo16BitPCM(new Float32Array([1.0, -1.0, 0.5, 0.0]));
      expect(buf.byteLength).toBe(4 * 2); // 4 muestras × 2 bytes
      const dv = new DataView(buf);
      expect(dv.getInt16(0, true)).toBe(0x7fff); // +1 → 32767
      expect(dv.getInt16(2, true)).toBe(-32768); // -1 → -32768
      expect(dv.getInt16(4, true)).toBe(0x3fff); // 0.5 → 16383
      expect(dv.getInt16(6, true)).toBe(0); // 0 → 0
    });

    it('clampa muestras fuera de [-1, 1]', () => {
      const buf = floatTo16BitPCM(new Float32Array([2.0, -2.0]));
      const dv = new DataView(buf);
      expect(dv.getInt16(0, true)).toBe(0x7fff);
      expect(dv.getInt16(2, true)).toBe(-32768);
    });
  });

  describe('arrayBufferToBase64 + base64ToPCMFloat32 (round-trip)', () => {
    it('recupera las muestras originales en [-1,1]', () => {
      const input = new Float32Array([1.0, -1.0, 0.5, -0.5, 0.0, 0.25]);
      const b64 = arrayBufferToBase64(floatTo16BitPCM(input));
      const out = base64ToPCMFloat32(b64);
      expect(out.length).toBe(input.length);
      for (let i = 0; i < input.length; i++) {
        expect(out[i]).toBeCloseTo(input[i], 4);
      }
    });

    it('base64ToPCMFloat32 decodifica silencio (0) a Float32Array de ceros', () => {
      const b64 = arrayBufferToBase64(floatTo16BitPCM(new Float32Array([0, 0, 0])));
      const out = base64ToPCMFloat32(b64);
      expect(Array.from(out)).toEqual([0, 0, 0]);
    });
  });

  describe('downsampleTo16k', () => {
    it('reduce 48kHz a 16kHz (factor 3)', () => {
      const input = new Float32Array(480);
      for (let i = 0; i < input.length; i++) input[i] = i;
      const out = downsampleTo16k(input, 48000);
      expect(out.length).toBe(160);
      expect(out[0]).toBe(0);
      expect(out[1]).toBe(3); // muestra 3
    });

    it('devuelve el mismo buffer si ya esta a 16000Hz (sin copia)', () => {
      const input = new Float32Array(64);
      expect(downsampleTo16k(input, 16000)).toBe(input);
    });
  });

  describe('pcmToWavBuffer', () => {
    it('construye un header RIFF/WAVE valido de 44 bytes', () => {
      const pcm = Buffer.from([0x00, 0x00, 0x01, 0x00]);
      const wav = pcmToWavBuffer(pcm, 24000, 1);
      expect(wav.length).toBe(44 + pcm.length);
      expect(wav.toString('ascii', 0, 4)).toBe('RIFF');
      expect(wav.toString('ascii', 8, 12)).toBe('WAVE');
      expect(wav.toString('ascii', 36, 40)).toBe('data');
      expect(wav.readUInt32LE(24)).toBe(24000); // sampleRate
      expect(wav.readUInt32LE(40)).toBe(pcm.length); // dataSize
    });
  });
});
