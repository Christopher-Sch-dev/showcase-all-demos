# AI educational tutor — Aula Viva AI (PWA)

> **Class can't depend on whether the teacher uploaded the PDF correctly.**

*Progressive Web App | React + Vite + Gemini | Christopher Schiefelbein*

> **Live demo:** [aula-viva.vercel.app](https://aula-viva.vercel.app)

---

## Why this exists

I studied at Duoc UC and lived the problem firsthand: teachers sometimes show PDFs in class that they never upload to the platform, or upload them wrong. The day's content is lost. Students don't pay attention, don't take good notes, and when it's time to study they have nothing.

Aula Viva replaces and streamlines that whole process, for both sides of the classroom.

The teacher can upload the class material, organize their content by subject and date, and have AI support to prepare their class. The student, by being enrolled in the same subject, accesses the material directly, can do smart reviews, ask for summaries, ask questions about the content, and learn much more actively.

Everything organized by subject, by date and by student order. Nothing gets lost.

---

## How it works

The core of the app is a **RAG (Retrieval-Augmented Generation)** pipeline that runs entirely in the browser:

1. The teacher uploads a PDF to the class.
2. `pdf.js` extracts the text in a Web Worker (without blocking the UI).
3. If the PDF is a scanned image, Tesseract.js applies OCR automatically.
4. The extracted text is injected into the **Gemini 2.5 Flash** context along with the chat history.
5. The student or teacher interacts with the AI, which answers based on the real content of the material.

The AI adapts its response according to the user's role:
- **Teacher**: didactic approach, planning, Bloom's taxonomy.
- **Student**: simple explanations, analogies, mnemonics, review mode.

---

## Technical philosophy for a DEMO in PWA (Android port)

I made the decision to do everything **Local-First** so it can be tested in both roles (teacher and student): no own backend, no server database, no infrastructure costs.

- **Persistence**: IndexedDB via Dexie.js — a complete transactional database in the browser.
- **API Key**: BYOK model (the user brings their own Gemini key), never transmitted to any server of mine.
- **Deploy**: Vercel, public domain, no installation friction.

It was the right decision for a portfolio project that has to work instantly for anyone who wants to try it.

---

## Stack

| Layer | Technology |
|------|------------|
| UI | React 18, TypeScript |
| Build | Vite |
| State | Zustand, React Router v7 |
| Local DB | Dexie.js (IndexedDB) |
| Styles | Tailwind CSS, Framer Motion |
| AI | Google Gemini 2.5 Flash API |
| PDF | pdf.js (Web Worker), Tesseract.js (OCR) |
| Deploy | Vercel |

---

## Run locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Compile for production
npm run build
```

> You need a Google Gemini API Key. You can get one for free at [aistudio.google.com](https://aistudio.google.com). The app asks for it at startup, and it's stored only in your `localStorage`.

---

## Security

- The API key never leaves the browser.
- AI responses go through `react-markdown` with sanitization to prevent XSS.
- Strict roles: students don't access teacher editing controls.

---

*Developed by Christopher Schiefelbein — January 2026*

---

## Decisions and tradeoffs

- **Local-First (IndexedDB)**: so the demo works instantly without an own backend or infrastructure costs. Persistence is transactional and complete in the browser.
- **RAG in the browser**: PDF text extraction with `pdf.js`, OCR with Tesseract and context injected into Gemini, all client-side.
- **BYOK (bring your own API key)**: the user uses their own Gemini key, never transmitted to a server of mine.

## What it demonstrates

- A complete educational PWA that turns class material into interactive AI reviews.
- PDF processing in the browser without blocking the UI (Web Workers).
- Local-First architecture with roles (teacher/student) and IndexedDB persistence.

## What I learned

- How to set up a complete RAG pipeline inside the browser, from PDF to AI response.
- How to use OCR for scanned PDFs without a backend.
- How to design an installable PWA with roles and transactional local data.

## Privacy

Public, read-only copy of the demo. It doesn't include secrets, credentials, real environment variables or internal infrastructure URLs. The original version is a private repository.

---

**Other languages:** [Español](./README.es.md)
