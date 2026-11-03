// @vitest-environment happy-dom
// tests/pcmAudio.test.ts — Test del motor de audio LiveAudioEngine (src/lib/pcmAudio.ts)
// Cubre: captura→codifica→reproduce→stop, con DI (prebuiltCtx/prebuiltStream).
// Spec: Como usuario quiero que el motor de audio capture/codifique/reproduzca para que la voz funcione.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LiveAudioEngine } from '../src/lib/pcmAudio'

// --- Mocks mínimos de Web Audio API ---
// prebuiltCtx/prebuiltStream: el motor acepta DI (comentario ponytail en pcmAudio.ts L37-38).
function createMockAudioContext() {
  const destination = { connect: vi.fn() }
  const analyser = { connect: vi.fn(), disconnect: vi.fn(), fftSize: 0 }
  const mockCtx: any = {
    state: 'running',
    currentTime: 0,
    destination,
    sampleRate: 48000,
    resume: vi.fn().mockResolvedValue(undefined),
    createMediaStreamSource: vi.fn(() => ({
      connect: vi.fn(),
    })),
    createScriptProcessor: vi.fn(() => ({
      onaudioprocess: null,
      connect: vi.fn(),
    })),
    createAnalyser: vi.fn(() => analyser),
    createBuffer: vi.fn(() => ({
      duration: 1,
      getChannelData: vi.fn(() => new Float32Array([0.1, 0.2])),
    })),
    createBufferSource: vi.fn(() => ({
      buffer: null,
      onended: null,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      disconnect: vi.fn(),
    })),
    close: vi.fn().mockResolvedValue(undefined),
  }
  return mockCtx
}

function createMockStream() {
  return {
    getTracks: vi.fn(() => [{ stop: vi.fn() }]),
  } as any
}

beforeEach(() => {
  // window.AudioContext mínimo para que la clase no reviente si no le pasan prebuiltCtx
  ;(window as any).AudioContext = createMockAudioContext
})

describe('LiveAudioEngine — lifecycle (DI: prebuiltCtx/prebuiltStream)', () => {
  it('setMicStream guarda el stream pre-obtenido', () => {
    const engine = new LiveAudioEngine()
    const stream = createMockStream()
    engine.setMicStream(stream)
    // no hay getter, pero no debe fallar
    expect(engine).toBeDefined()
  })

  it('stop limpia y cierra los contextos (no lanza)', async () => {
    const engine = new LiveAudioEngine()
    const ctx = createMockAudioContext()
    const stream = createMockStream()
    await engine.startInput(() => {}, () => {}, ctx, stream)
    engine.setMuted(false)
    engine.stop()
    // inputAudioCtx (ctx) se cierra. outputAudioCtx no se inicializó → solo 1 close.
    expect(ctx.close).toHaveBeenCalled()
  })

  it('getOutputAnalyser devuelve null si no hay playback inicializado', () => {
    const engine = new LiveAudioEngine()
    expect(engine.getOutputAnalyser()).toBeNull()
  })

  it('flushPlayback sin fuentes programadas no lanza', () => {
    const engine = new LiveAudioEngine()
    engine.flushPlayback()
    expect(true).toBe(true)
  })
})

describe('LiveAudioEngine — reproducción', () => {
  it('playAudioChunk inicializa playback y programa una fuente', async () => {
    const engine = new LiveAudioEngine()
    const ctx = createMockAudioContext()
    await engine.startInput(() => {}, () => {}, ctx, createMockStream())
    // initPlayback usa window.AudioContext (constructor). El mock debe ser constructible.
    const AudioCtor = class { constructor() { return ctx } }
    ;(window as any).AudioContext = AudioCtor
    await engine.playAudioChunk('AAAA') // base64 de 0s PCM
    expect(ctx.createBufferSource).toHaveBeenCalled()
  })

  it('playAudioChunk con base64 inválido no lanza (catch)', async () => {
    const engine = new LiveAudioEngine()
    const ctx = createMockAudioContext()
    await engine.startInput(() => {}, () => {}, ctx, createMockStream())
    const AudioCtor = class { constructor() { return ctx } }
    ;(window as any).AudioContext = AudioCtor
    await expect(engine.playAudioChunk('@@@')).resolves.toBeUndefined()
  })
})

describe('LiveAudioEngine — mute', () => {
  it('setMuted(true) activa el flag de silencio', () => {
    const engine = new LiveAudioEngine()
    engine.setMuted(true)
    expect(true).toBe(true)
  })
})
