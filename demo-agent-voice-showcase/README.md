# AI virtual receptionist (voice + chat) for a dental clinic — Sonrisa Vital

I'm Christopher and this is **the demo I'm most proud of**: an AI virtual receptionist for a dental clinic that you can **chat with** as if you were talking to a real person. It's the frontend of an AI voice assistant demo.

The idea is simple but powerful: that an SME can have 24/7 service — answering prices, hours, isapres, booking appointments — without depending on a person on the phone. And the most impressive part is that the assistant responds by voice in real time, like a phone call.

- **Live demo:** [https://agent-voice-pied.vercel.app](https://agent-voice-pied.vercel.app)
- **Note:** this is the read-only copy of the frontend. The real voice call and AI chat run on a separate backend on **Deno Deploy** (org `chschiefelbein`, `https://agent-voice-backend-v2.chschiefelbein.deno.net`); the demo chat in this repo works with a local engine so you can try the interaction without infrastructure.

---

## 🧠 What it does and how it works

There are **3 ways to interact**, and all 3 use the same brain (Gemini):

| Mode | What happens | How the code does it |
|------|----------|------------------------|
| 💬 **Written chat** | You type a question, the AI answers | `POST /api/chat` to the backend, response in **direct JSON** (`text` field) |
| 🎙️ **Microphone (chat)** | You speak, it transcribes and answers by text | The browser's **Web Speech API** (`SpeechRecognition`) transcribes your voice and sends it to the chat |
| 📞 **Call mode** | You speak and listen live, like a real call | **WebSocket → Gemini Live API**. Your audio travels in real time and the AI answers you by speaking |

The voice flow in call mode (the most technical part of the project):

1. The browser captures the microphone with `getUserMedia`.
2. The audio is **downsampled to 16 kHz** and converted to **PCM 16-bit → Base64** (in `src/lib/pcmAudio.ts` and `src/lib/audioUtils.ts`).
3. Each chunk is sent over WebSocket as `realtimeInput` to the Gemini Live API.
4. Gemini returns **audio** (24 kHz PCM) that plays instantly, plus the **transcription** of what you said and what it answers, which appears in the chat.
5. A **visualizer** (`AnalyserNode` → `<canvas>`) draws the live audio bars.

If the backend isn't available, the demo doesn't break: it falls back to a local **showcase mode** with prepared responses and keyword matching. That mode is designed so the demo always "works" in public.

### The "brain"

A single `SYSTEM_PROMPT` in `index.astro` defines the receptionist: its name, the clinic's data (services, prices, isapres, hours, team), a warm tone with **tuteo** (neutral Chilean Spanish, no Rioplatense voseo), and **hard rules**: it only talks about the clinic, gives no medical advice, doesn't leave its role, and refers to WhatsApp when it doesn't know something.

> 🔒 **Privacy:** this repo is only the frontend, with no API keys or credentials. Authentication and secrets live in a separate AI backend (not included in this copy). The public frontend never sees an API key.

---

## 🧰 Stack

- **Astro 7** — static site generation (`output: 'static'`, the project's only dependency).
- **Web Audio API** — PCM audio capture and playback in the browser.
- **Web Speech API** — speech recognition for the chat microphone.
- **WebSocket** — bidirectional audio channel with the Gemini Live API (call mode).
- **Vercel** — frontend hosting (`vercel.json`, build with `npm`).

```
Frontend (this repo)         AI backend (Deno Deploy, separate)
─────────────────            ─────────────────────────────────────
Astro 7 static               Deno Deploy (Deno.serve + WebSocket)
  │                            │
  ├─ chat  ────────── POST ────┤  ──► Gemini (text, direct JSON)
  ├─ mic   ──── Web Speech ────┤      (transcribe → chat)
  └─ call ────── WebSocket ────┴──► Gemini Live (real-time audio)
                     (wss /ws/live)
```

---

## 🚀 How to run it locally

Requirements: **Node 18+** and npm. (Frontend only; for call mode you need the backend running.)

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
# → Open http://localhost:4321
```

Useful commands:

```bash
npm run build     # static build to /dist
npm run preview   # test the production build locally
```

**Deploy to Vercel:**

```bash
npx vercel --prod --yes
```

---

## 📁 Structure

```
demo-agent-voice/
├── src/
│   ├── pages/
│   │   └── index.astro      # The whole UI + assistant logic (chat + call)
│   └── lib/
│       ├── pcmAudio.ts      # Live audio engine: mic capture + playback + visualizer
│       └── audioUtils.ts    # Pure audio utilities (downsample, PCM, Base64, WAV)
├── public/
│   └── audio-capture-processor.js  # Audio capture processor (AudioWorklet)
├── astro.config.mjs         # Astro config (static output)
├── vercel.json              # Vercel deploy config
└── package.json             # Only dep: astro
```

---

## ✨ What it demonstrates

- **Voice + chat + AI in a single product.** It's rare to see all 3 integrated: you can type, talk to it, or call it and have a real-time conversation.
- **Live audio with the Gemini Live API.** Real microphone capture, bidirectional streaming over WebSocket and spoken response — it's not clipped TTS, it's a conversation.
- **A single prompt defines a business "character".** You change the clinic's data in `BUSINESS` and the same frontend works for any SME (dental, restaurant, lawyer...). *Replicable for your SME*.
- **Resilience**: fallback to demo mode if the backend doesn't respond, so it never looks broken in public.
- **Terminal aesthetic** — dark theme with green accent, badges and audio visualizer.

## Decisions and tradeoffs

- **Static frontend, separate backend on Deno Deploy**: this read-only copy of the frontend leaves the real voice call and AI chat out (they run on a Deno Deploy backend, org `chschiefelbein`); the demo chat works with a local engine so anyone can try the interaction without infrastructure.
- **Web Audio API for live audio**: PCM audio capture and processing in the browser, without heavy libraries.
- **No credentials on the client**: authentication lives on the backend, never on the frontend.

## What I learned

- How to capture microphone audio and process it in real-time PCM with the Web Audio API.
- How to structure a frontend that consumes a streaming backend (WebSocket) cleanly.
- How to separate a local demo engine from an AI-connected engine without breaking the experience.

---

*AI virtual receptionist demo · [See live demo](https://agent-voice-pied.vercel.app)*

---

**Other languages:** [Español](./README.es.md)
