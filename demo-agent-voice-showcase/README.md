# Recepcionista virtual con IA (voz + chat) para clínica dental — Sonrisa Vital

Soy Christopher y esto es **la demo que más me enorgullece**: una recepcionista virtual con inteligencia artificial para una clínica dental, que puedes **chatear** como si hablaras con una persona real. Es el frontend de una demo de asistente de voz con IA.

La idea es simple pero potente: que una PyME pueda tener atención 24/7 — responder precios, horarios, isapres, reservar horas — sin depender de una persona al teléfono. Y la parte que más impresiona es que el asistente responde por voz en tiempo real, como en una llamada.

- **Demo en vivo:** [https://agent-voice-pied.vercel.app](https://agent-voice-pied.vercel.app)
- **Nota:** esta es la copia de solo lectura del frontend. La llamada de voz real y el chat con IA corren en un backend separado en **Deno Deploy** (org `chschiefelbein`, `https://agent-voice-backend-v2.chschiefelbein.deno.net`); el chat de demostración de este repo funciona con un motor local para que puedas probar la interacción sin infraestructura.

---

## 🧠 Qué hace y cómo funciona

Hay **3 formas de interactuar**, y las 3 usan el mismo cerebro (Gemini):

| Modo | Qué pasa | Cómo lo hace el código |
|------|----------|------------------------|
| 💬 **Chat escrito** | Escribís una pregunta, la IA responde | `POST /api/chat` al backend, respuesta en **JSON directo** (campo `text`) |
| 🎙️ **Micrófono (chat)** | Hablás, se transcribe y responde por texto | **Web Speech API** del navegador (`SpeechRecognition`) transcribe tu voz y la manda al chat |
| 📞 **Modo llamada** | Hablás y escuchás en vivo, como una llamada real | **WebSocket → Gemini Live API**. Tu audio viaja en tiempo real y la IA te responde hablando |

El flujo de voz en el modo llamada (lo más técnico del proyecto):

1. El navegador captura el micrófono con `getUserMedia`.
2. El audio se **downsamplia a 16 kHz** y se convierte a **PCM 16-bit → Base64** (en `src/lib/pcmAudio.ts` y `src/lib/audioUtils.ts`).
3. Cada chunk se manda por WebSocket como `realtimeInput` hacia Gemini Live API.
4. Gemini devuelve **audio** (24 kHz PCM) que se reproduce al instante, más la **transcripción** de lo que dijiste y de lo que responde, que aparece en el chat.
5. Un **visualizer** (`AnalyserNode` → `<canvas>`) dibuja las barras de audio en vivo.

Si el backend no está disponible, la demo no se cae: cae en un **modo showcase** local con respuestas preparadas y matching por palabras clave. Ese modo está pensado para que la demo siempre "funcione" en público.

### El "cerebro"

Un solo `SYSTEM_PROMPT` en `index.astro` define a la recepcionista: su nombre, datos de la clínica (servicios, precios, isapres, horarios, equipo), tono cercano con **tuteo** (español chileno neutro, sin voseo rioplatense), y **reglas duras**: solo habla de la clínica, no da consejos médicos, no se sale del rol, y deriva a WhatsApp cuando no sabe algo.

> 🔒 **Privacidad:** este repo es solo el frontend, sin claves de API ni credenciales. La autenticación y los secrets viven en un backend de IA separado (no incluido en esta copia). El frontend público nunca ve una API key.

---

## 🧰 Stack

- **Astro 7** — generación de sitio estático (`output: 'static'`, única dependencia del proyecto).
- **Web Audio API** — captura y reproducción de audio PCM en el navegador.
- **Web Speech API** — reconocimiento de voz para el micrófono del chat.
- **WebSocket** — canal de audio bidireccional con Gemini Live API (modo llamada).
- **Vercel** — hosting del frontend (`vercel.json`, build con `npm`).

```
Frontend (este repo)         Backend de IA (Deno Deploy, separado)
─────────────────            ─────────────────────────────────────
Astro 7 estático             Deno Deploy (Deno.serve + WebSocket)
  │                            │
  ├─ chat  ────────── POST ────┤  ──► Gemini (texto, JSON directo)
  ├─ mic   ──── Web Speech ────┤      (transcribe → chat)
  └─ llamada ───── WebSocket ──┴──► Gemini Live (audio real-time)
                     (wss /ws/live)
```

---

## 🚀 Cómo correrlo localmente

Requisitos: **Node 18+** y npm. (Solo el frontend; para el modo llamada necesitás el backend corriendo.)

```bash
# 1. Instalá dependencias
npm install

# 2. Levantá el servidor de desarrollo
npm run dev
# → Abrí http://localhost:4321
```

Comandos útiles:

```bash
npm run build     # build estático a /dist
npm run preview   # probar el build de producción localmente
```

**Deploy a Vercel:**

```bash
npx vercel --prod --yes
```

---

## 📁 Estructura

```
demo-agent-voice/
├── src/
│   ├── pages/
│   │   └── index.astro      # Toda la UI + lógica del asistente (chat + llamada)
│   └── lib/
│       ├── pcmAudio.ts      # Motor de audio en vivo: captura mic + playback + visualizer
│       └── audioUtils.ts    # Utilidades puras de audio (downsample, PCM, Base64, WAV)
├── public/
│   └── audio-capture-processor.js  # Procesador de captura de audio (AudioWorklet)
├── astro.config.mjs         # Config Astro (output estático)
├── vercel.json              # Config deploy Vercel
└── package.json             # Única dep: astro
```

---

## ✨ Qué demuestra

- **Voz + chat + IA en un mismo producto.** Es raro ver las 3 integradas: puedes escribir, hablarle, o llamarla y conversar en tiempo real.
- **Audio en vivo con Gemini Live API.** Captura real del micrófono, streaming bidireccional por WebSocket y respuesta hablada — no es TTS recortado, es una conversación.
- **Un solo prompt define a un "personaje" de negocio.** Cambias los datos de la clínica en `BUSINESS` y el mismo frontend sirve para cualquier PyME (dental, restaurant, abogado...). *Replicable para tu PyME*.
- **Resiliencia**: fallback a modo demo si el backend no responde, para que nunca se vea roto en público.
- **Estética terminal** — tema oscuro con acento verde, badges y visualizer de audio.
## Decisiones y tradeoffs

- **Frontend estático, backend separado en Deno Deploy**: esta copia de solo lectura del frontend deja la llamada de voz real y el chat con IA fuera (corren en un backend de Deno Deploy, org `chschiefelbein`); el chat de demostración funciona con un motor local para que cualquiera pueda probar la interacción sin infraestructura.
- **Web Audio API para audio en vivo**: captura y procesamiento de audio PCM en el navegador, sin librerías pesadas.
- **Sin credenciales en el cliente**: la autenticación vive en el backend, nunca en el frontend.

## Qué aprendí

- Cómo capturar audio del micrófono y procesarlo en PCM real-time con Web Audio API.
- Cómo estructurar un frontend que consume un backend de streaming (WebSocket) de forma limpia.
- Cómo separar un motor de demostración local de un motor conectado a la IA, sin romper la experiencia.
---

*Demo de recepcionista virtual con IA · [Ver demo en vivo](https://agent-voice-pied.vercel.app)*
