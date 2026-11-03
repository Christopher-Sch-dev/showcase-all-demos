// rol: orquestación de la app. Conecta el DOM con el chat (Gemini o showcase
// local), el dictado por voz y el modo llamada. No contiene reglas de negocio:
// eso vive en src/lib/showcase.ts.
import { buildShowcase } from '../lib/showcase';
import { startCall, stopCall } from './call';
import { buildSystemPrompt } from './prompt';
import { renderShowcase } from './showcaseList';

const API = 'https://agent-voice-backend-v2.chschiefelbein.deno.net/api/chat';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const businessData = JSON.parse($('business-data').textContent || '{}');
const { items: showcase, pickShowcase, renderText } = buildShowcase(businessData);

const el = {
  engine: $('engine'),
  messages: $('messages'),
  form: $<HTMLFormElement>('form'),
  input: $<HTMLInputElement>('input'),
  status: $('status'),
  mic: $<HTMLButtonElement>('mic'),
  send: $<HTMLButtonElement>('send'),
  speaker: $<HTMLButtonElement>('speaker'),
  call: $<HTMLButtonElement>('callbtn'),
  hangup: $<HTMLButtonElement>('hangup'),
  showcase: $('showcase'),
  count: $('count'),
  viz: $<HTMLCanvasElement>('viz'),
};

let busy = false;
let lastReply = '';
let cloud = false;

const SYSTEM_PROMPT = buildSystemPrompt(businessData);

const setStatus = (text: string) => { el.status.textContent = text; };

function add(role: 'user' | 'bot', text: string) {
  const node = document.createElement('div');
  node.className = 'chat__msg chat__msg--' + role;
  node.innerHTML = renderText(text);
  el.messages.appendChild(node);
  el.messages.scrollTop = el.messages.scrollHeight;
  if (role === 'bot') { lastReply = text; el.speaker.disabled = false; }
}

// rol: detecta si hay backend vivo. Si no responde, la demo sigue funcionando
// con el motor local del showcase (nunca queda muerta).
async function detectEngine() {
  try {
    const r = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system: 'ping', message: 'ping' }),
    });
    if (r.status === 200 || r.status === 400) {
      cloud = true;
      el.engine.textContent = 'IA · Gemini';
      return;
    }
  } catch { /* sin backend */ }
  cloud = false;
  el.engine.textContent = 'Demo local';
}

// rol: el backend devuelve un texto fijo cuando todos sus modelos fallan
// ("Gemini Omni Studio ha analizado tu solicitud"). Eso no es una respuesta de la
// recepcionista: lo tratamos como fallo para usar el motor local, que sí contesta
// con los precios y horarios reales de la clínica.
const STUB_RE = /Gemini Omni Studio ha analizado tu solicitud|Respuesta a tu consulta:/i;

async function askCloud(text: string) {
  const resp = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: text, systemInstruction: SYSTEM_PROMPT, thinkingLevel: 'low' }),
  });
  if (!resp.ok) throw new Error('api-' + resp.status);
  const data = await resp.json();
  const reply = (data && data.text) || '';
  if (!reply || STUB_RE.test(reply)) throw new Error('respuesta-vacia-stub');
  return reply;
}

async function send(text: string) {
  if (busy || !text.trim()) return;
  el.input.value = '';
  add('user', text);
  busy = true; el.send.disabled = true;
  setStatus(cloud ? 'Pensando...' : 'Buscando en la demo local...');
  try {
    const reply = cloud ? await askCloud(text) : await (async () => {
      await new Promise(r => setTimeout(r, 400 + Math.random() * 600));
      return pickShowcase(text);
    })();
    add('bot', reply);
    setStatus('');
  } catch {
    add('bot', pickShowcase(text));
    setStatus('Mostrando respuesta de la demo');
  } finally {
    busy = false; el.send.disabled = false;
  }
}

function speak(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'es-CL'; u.rate = 1.0; u.pitch = 1.0;
  const voice = window.speechSynthesis.getVoices().find(v => v.lang.startsWith('es'));
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
}

// rol: entrada por micrófono con el reconocedor del navegador (si existe).
function setupDictation() {
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SR) {
    el.mic.disabled = true;
    el.mic.title = 'Este navegador no soporta dictado por voz';
    return;
  }
  const recog = new SR();
  recog.lang = 'es-CL'; recog.continuous = false; recog.interimResults = false;
  el.mic.disabled = false;
  let recording = false;

  const reset = () => {
    recording = false;
    el.mic.classList.remove('btn--rec');
    el.mic.setAttribute('aria-label', 'Hablar');
    setStatus('');
  };

  el.mic.addEventListener('click', () => {
    if (recording) { recog.stop(); return; }
    recording = true;
    el.mic.classList.add('btn--rec');
    el.mic.setAttribute('aria-label', 'Detener dictado');
    setStatus('Escuchando...');
    try { recog.start(); } catch { reset(); }
  });

  recog.addEventListener('result', (e: any) => {
    const text = e.results[0][0].transcript;
    el.input.value = text;
    reset();
    send(text);
  });
  recog.addEventListener('end', reset);
  recog.addEventListener('error', () => { reset(); setStatus('No se pudo usar el micrófono'); });
}

function setupCallMode() {
  const deps = {
    systemPrompt: SYSTEM_PROMPT,
    vizEl: el.viz,
    add,
    setStatus,
    onActiveChange: (isActive: boolean) => {
      el.call.style.display = isActive ? 'none' : '';
      el.hangup.style.display = isActive ? '' : 'none';
      el.input.disabled = isActive;
      el.send.disabled = isActive;
      el.mic.disabled = isActive;
    },
  };
  el.call.addEventListener('click', async () => {
    if (!cloud) { setStatus('El modo llamada necesita la IA conectada'); return; }
    await startCall(deps);
  });
  el.hangup.addEventListener('click', stopCall);
}

export async function boot() {
  el.form.addEventListener('submit', (e) => { e.preventDefault(); send(el.input.value); });
  el.speaker.addEventListener('click', () => { if (lastReply) speak(lastReply); });
  renderShowcase(showcase, el.showcase, el.count, (q) => { el.input.value = q; el.form.dispatchEvent(new Event('submit')); });
  setupDictation();
  setupCallMode();

  await detectEngine();
  const greeting = cloud
    ? `Hola, soy la recepcionista virtual de ${businessData.nombre}. Estoy conectada a un modelo de IA. ¿En qué te ayudo?`
    : `Hola, soy la recepcionista virtual de ${businessData.nombre}. Toque una pregunta de la derecha para ver cómo respondo, o escriba la suya. ¿En qué te ayudo?`;
  add('bot', greeting);
}

boot();
