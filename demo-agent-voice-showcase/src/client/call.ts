// rol: modo llamada. Captura el micrófono como PCM 16 kHz, lo manda por WebSocket
// a Gemini Live y reproduce el audio de vuelta, con visualizador.
// La lógica de audio vive en src/lib/ (pcmAudio, audioUtils) y no se toca.
import { LiveAudioEngine } from '../lib/pcmAudio';
import { downsampleTo16k, floatTo16BitPCM, arrayBufferToBase64 } from '../lib/audioUtils';

const WS_URL = 'wss://agent-voice-backend-v2.chschiefelbein.deno.net/ws/live';
const MODEL = 'models/gemini-3.1-flash-live-preview';

export interface CallDeps {
  systemPrompt: string;
  vizEl: HTMLCanvasElement | null;
  add: (role: 'user' | 'bot', text: string) => void;
  setStatus: (text: string) => void;
  onActiveChange: (active: boolean) => void;
}

let active = false;
let ws: WebSocket | null = null;
let engine: LiveAudioEngine | null = null;
let vizAnim = 0;
let deps: CallDeps | null = null;

// rol: dibuja el espectro de frecuencia del audio que devuelve el modelo.
function drawVisualizer() {
  if (!engine || !deps?.vizEl) { vizAnim = 0; return; }
  const el = deps.vizEl;
  const analyser = engine.getOutputAnalyser();
  if (!analyser) { vizAnim = requestAnimationFrame(drawVisualizer); return; }

  const bins = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(bins);
  const ctx = el.getContext('2d');
  if (!ctx) return;

  const { width: w, height: h } = el;
  ctx.clearRect(0, 0, w, h);
  const barW = (w / bins.length) * 2;
  let x = 0;
  for (const bin of bins) {
    const barH = (bin / 255) * h;
    if (barH > 0) {
      const grad = ctx.createLinearGradient(0, h, 0, 0);
      grad.addColorStop(0, '#22a5cc');
      grad.addColorStop(1, '#3cc2e8');
      ctx.fillStyle = grad;
      ctx.fillRect(x, h - barH, Math.max(barW - 1, 1), barH);
    }
    x += barW;
  }
  vizAnim = requestAnimationFrame(drawVisualizer);
}

// rol: corta todo y devuelve la UI a modo texto. Idempotente.
export function stopCall() {
  const d = deps;
  active = false;
  if (vizAnim) { cancelAnimationFrame(vizAnim); vizAnim = 0; }
  if (engine) { engine.stop(); engine = null; }
  if (ws) { try { ws.close(); } catch { /* ya cerrado */ } ws = null; }
  if (d?.vizEl) d.vizEl.style.display = 'none';
  d?.onActiveChange(false);
  d?.setStatus('Llamada finalizada');
}

export async function startCall(next: CallDeps) {
  deps = next;
  const { systemPrompt, setStatus, add, onActiveChange } = next;

  setStatus('Preparando audio...');
  let micStream: MediaStream, inputCtx: AudioContext, processor: ScriptProcessorNode;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    inputCtx = new AudioCtx();
    if (inputCtx.state === 'suspended') await inputCtx.resume();
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
    });
    const source = inputCtx.createMediaStreamSource(micStream);
    processor = inputCtx.createScriptProcessor(4096, 1, 1);
    source.connect(processor);
    processor.connect(inputCtx.destination);
  } catch {
    setStatus('Permiso de micrófono denegado');
    return;
  }

  setStatus('Conectando llamada...');
  ws = new WebSocket(WS_URL);
  active = true;
  engine = new LiveAudioEngine();
  engine.initPlayback().catch(() => {});
  onActiveChange(true);
  if (next.vizEl) next.vizEl.style.display = '';

  // rol: el audio se acumula hasta que el setup del modelo termina.
  let buffered: string[] = [];
  processor.onaudioprocess = (ev) => {
    if (!active || !ws) return;
    const raw = ev.inputBuffer.getChannelData(0);
    const pcm = floatTo16BitPCM(downsampleTo16k(raw, inputCtx.sampleRate));
    const b64 = arrayBufferToBase64(pcm);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ realtimeInput: { mediaChunks: [{ data: b64, mimeType: 'audio/pcm;rate=16000' }] } }));
    } else {
      buffered.push(b64);
    }
  };

  ws.onopen = () => {
    ws!.send(JSON.stringify({
      setup: { model: MODEL, generationConfig: { responseModalities: ['AUDIO'] }, systemInstruction: { parts: [{ text: systemPrompt }] } },
    }));
    setStatus('Conectando...');
  };

  ws.onmessage = (event) => {
    if (!active) return;
    let data: any;
    try { data = JSON.parse(event.data); } catch { return; }

    if (data?.setupComplete) {
      for (const b64 of buffered) {
        ws!.send(JSON.stringify({ realtimeInput: { mediaChunks: [{ data: b64, mimeType: 'audio/pcm;rate=16000' }] } }));
      }
      buffered = [];
      setStatus('Llamada activa · hable normalmente');
      add('bot', 'Modo llamada activado con voz real. Hable normalmente. Toque "Colgar" para salir.');
      if (vizAnim) cancelAnimationFrame(vizAnim);
      vizAnim = requestAnimationFrame(drawVisualizer);
      return;
    }

    const parts = data?.serverContent?.modelTurn?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData?.mimeType?.startsWith('audio/')) engine?.playAudioChunk(part.inlineData.data).catch(() => {});
      }
    }
    const input = data?.serverContent?.inputTranscription;
    if (input?.text && input.finished) add('user', input.text);
    const output = data?.serverContent?.outputTranscription;
    if (output?.text && output.finished) add('bot', output.text);
    if (data?.serverContent?.interrupted) engine?.flushPlayback();
  };

  ws.onerror = () => { deps?.setStatus('Error en la llamada'); stopCall(); };
  ws.onclose = () => { if (active) stopCall(); };
}
