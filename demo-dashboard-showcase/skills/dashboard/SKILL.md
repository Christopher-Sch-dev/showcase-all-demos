---
name: dashboard
description: Operar el dashboard dental demo-dashboard (demo-dashboard) desde cualquier IA externa: crear/actualizar/eliminar pacientes, transicionar citas en la FSM determinista (scheduled→confirmed→completed/no_show/cancelled) y leer KPIs, sin romper la lógica. Use when an external agent needs to operate the dental dashboard state machine.
license: MIT
metadata:
 version: "1.0.0"
---

# Operar el dashboard dental (demo-dashboard)

Este plugin expone la **FSM determinista** del dashboard dental a cualquier IA externa. La IA **nunca muta el estado directo**: solo pide acciones legales a través de `reduce()`, que valida cada transición. Una transición ilegal se rechaza con `changed:false` y un `reason`.

## Contrato agéntico

Todas las operaciones devuelven `ReduceResult`:

```ts
interface ReduceResult {
 state: DemoState; // estado NUEVO (inmutable: el de entrada nunca se muta)
 changed: boolean; // false = transición inválida / entidad inexistente (REJECT)
 reason?: string; // por qué se rechazó (solo cuando changed=false)
}
```

El estado de entrada **nunca se modifica**. Para persistir, guardá `result.state` (p.ej. en localStorage bajo `demo-dashboard:v1`).

## Métodos

### `operateDashboard(state, action, now)`
Manejador genérico: pasá cualquier `AgentAction` y delega en `reduce()`.

### `createPatient(state, paciente, now)`
Crea un paciente. `paciente` omite `id/createdAt/updatedAt` (se generan). Devuelve el paciente con `id` secuencial (`PAC-N`).

### `updatePatient(state, pacienteId, cambios, now)`
Actualiza campos parciales. `id` y `createdAt` **nunca se pisan**. Paciente inexistente → REJECT.

### `deletePatient(state, pacienteId, now)`
Elimina un paciente. Inexistente → REJECT.

### `transitionCita(state, citaId, to, now)`
Transiciona una cita a un estado destino de la FSM. `to` ∈ `confirmed | completed | no_show | cancelled`.

## FSM de citas (determinista)

```
scheduled → confirmed → completed
 ↘ no_show
 ↘ cancelled
```

- Toda cita nueva arranca en `scheduled`.
- `completed`, `no_show` y `cancelled` son **terminales** (no se puede salir).
- `complete`/`no_show` requieren `confirmed` previo. `scheduled → completed` directo → **REJECT**.
- Cita inexistente → REJECT.

## KPIs (derivados, nunca guardados)

Leé el estado y derivá los KPIs (no los guardes como datos independientes):

- **Pacientes activos** = count(estado='activo')
- **No-show rate** = noShows / citasProgramadas × 100
- **Revenue total** = Σ valor citas `completed`
- **Revenue per patient** = totalRevenue / activePatients
- **Citas programadas** = count(estado scheduled|confirmed)
- **Citas completadas** = count(estado completed)

## Ejemplo de flujo (agente)

1. `createPatient(state, {...}, now)` → creá un paciente.
2. `operateDashboard(state, { type: 'create_cita', cita: {...} }, now)` → agendá una cita (arranca `scheduled`).
3. `transitionCita(state, citaId, 'confirmed', now)` → confirmá.
4. `transitionCita(state, citaId, 'completed', now)` → completá (o `no_show` si no asistió).
5. Derivá los KPIs del `result.state` final.

## Reglas

- **Nunca** mutes `state` directo; siempre usá los métodos (o `operateDashboard`).
- **Nunca** fuerces una transición ilegal: la FSM la rechaza.
- `now` es un timestamp (ms) que **inyectás vos** (sin `Date.now()` dentro del reducer) para mantener la pureza.
- CTA de venta: siempre a Calendly (`https://calendly.com/csch1305`), nunca mailto.
