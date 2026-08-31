---
name: lead-qualifier
description: Operate the demo lead-qualifier funnel (capture → qualify → book) on its deterministic FSM via the agentic layer src/agent/plugin.ts. Any AI can run the funnel; the reducer validates every transition so you cannot break the logic.
---

# Lead Qualifier — operate the lead funnel as an AI agent

You are an external AI operating the **demo-lead-qualifier** app. Your job is to
respond to, qualify, and book leads **<60s** (speed-to-lead, AC-1). You never
mutate state directly: every action goes through the deterministic FSM reducer,
which validates each transition — you cannot force an illegal one.

## The funnel (agent language)

```
form capture → lead `new` → qualify → `qualified` → book → `booked` (Calendly CTA)
```

The three agentic actions are the **only** operations available (AgentAction, AC-5):

| Action | Effect | Valid from | Required fields |
|---|---|---|---|
| `capture_lead` | creates a lead `new`, starts speed-to-lead timer | any state | intent (name, email, phone, topic, budget?, niche?) |
| `qualify` | `new → qualified` with score + reason; marks first response (<60s) | `new` only | leadId, score (0-100), reason (non-empty) |
| `book` | `qualified → booked`, bookingUrl default Calendly (AC-8, never mailto) | `qualified` only | leadId, bookingUrl? |

## How to call (the plugin layer)

Import the agentic handlers from `src/agent/plugin.ts` — thin wrappers over the
pure reducer `src/lib/state.ts::reduce(state, action, now)`:

```ts
import { captureLead, qualifyLead, bookLead, operateLead } from './src/agent/plugin';
import type { DemoState } from './src/lib/types';

// 1. Capture
const cap = captureLead(state, {
  name: 'Jane Smith', email: 'jane@example.com', phone: '555-0100',
  topic: 'Looking for a 4 bed house under $600k', budget: 550000,
  niche: 'realestate', capturedAt: Date.now(),
}, Date.now());
if (!cap.changed) throw new Error(cap.reason); // reason: 'Razón requerida' etc.
let state: DemoState = cap.state;
const id = state.leads[0].id;

// 2. Qualify — new → qualified. Respond inside 60s of capturedAt.
const q = qualifyLead(state, id, 85, 'High budget, ready this week', Date.now());
if (!q.changed) throw new Error(q.reason); // 'Transición inválida: qualified → qualified', ...
state = q.state;

// 3. Book — qualified → booked. No URL → Calendly default (AC-8).
const b = bookLead(state, id, undefined, Date.now());
if (!b.changed) throw new Error(b.reason); // 'Transición inválida: new → booked', ...
state = b.state;
```

Or dispatch any action generically with `operateLead(state, action, now)`.

## Invariants (do not violate)

- **Never mutate state directly.** The wrappers return a *new* state; the FSM
  rejects illegal transitions (`changed: false` + `reason`). Check `changed` and
  propagate `reason` — never force an action past a rejection.
- **FSM is forward-only:** `new → qualified → booked`. No skipping, no idempotent
  re-runs. `qualify` twice or `book` from `new` is rejected.
- **`now` is injected** (reducer is pure, no `Date.now()` inside). Pass the same
  `now` as timestamps you need for speed-to-lead.
- **Score 0-100**, reason non-empty, `bookingUrl` never `mailto:`.
- **Lead id must exist** in the state's `leads`; otherwise REJECT (`Lead no encontrado`).
- Persistence: keep the returned state (or re-load `loadState()` from
  `src/lib/storage.ts`) and pass it forward — do not drop it between calls.

## Testing

`src/agent/plugin.test.ts` covers the full funnel + illegal transitions (13 tests).
Run: `npx vitest run src/agent/plugin.test.ts` and `npx tsc --noEmit`.
