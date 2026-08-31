# Fase Plugin — demo-dashboard
# Capa agéntica/plugin: cualquier IA externa opera la FSM determinista sin romperla.
# "uso completo para el agente": CUALQUIER IA externa opera la FSM determinista sin romperla.
# Patrón: Agent Plugins v1.0.0 (agent-plugins.org) — plugin.json + skills/ + mcp.json.
# "Build once, run anywhere" — soportado por ChatGPT/Codex/Cursor/Copilot/VS Code.
# Contrato agéntico: src/lib/types.ts AgentAction + reduce(state, action, now) (src/lib/state.ts).
# El plugin ES UNA CAPA sobre reduce(): NUNCA muta directo, NUNCA modifica src/lib ni src/config.

Feature: Capa agéntica PLUGIN — la IA opera la FSM determinista sin romperla

 Scenario: El manejador operateDashboard expone las acciones del reducer como funciones invocables
 Given un estado DemoState y un now inyectado
 When una IA externa invoca operateDashboard(state, action, now)
 Then devuelve ReduceResult { state, changed, reason? } delegando en reduce()
 And el estado de entrada nunca se muta (reducer puro)

 Scenario: Wrappers puros createPatient/updatePatient/deletePatient/transitionCita
 Given un estado DemoState
 When se invoca createPatient/updatePatient/deletePatient/transitionCita
 Then cada wrapper construye la AgentAction correspondiente y la pasa a reduce()
 And devuelve ReduceResult sin mutar el estado de entrada

 Scenario: La IA no puede forzar una transición ilegal de la FSM
 Given una cita en estado scheduled
 When la IA intenta complete_cita directo (sin confirm previo)
 Then el plugin devuelve changed=false con reason 'Transición inválida'
 And el estado queda intacto (misma referencia)

 Scenario: El manifest plugin.json es conforme a Agent Plugins v1.0.0
 Given un plugin.json en la raíz
 When se valida contra la spec v1.0.0
 Then $schema es https://agent-plugins.org/schemas/1.0.0/plugin.schema.json
 And name 'demo-dashboard' cumple las restricciones (a-z0-9-., 1-64 chars, alfanumérico en extremos)
 And solo campos permitidos (sin hooks/agents/commands/mcpServers en top-level)

 Scenario: El SKILL.md explica a cualquier IA cómo operar el dashboard dental
 Given skills/dashboard/SKILL.md
 When una IA externa lo lee
 Then describe createPatient/updatePatient/deletePatient/transitionCita y ver KPIs
 And usa lenguaje de agente (no marketing) y referencia el contrato agéntico

 Scenario: mcp.json expone las acciones como tools MCP stdio
 Given un mcp.json en la raíz
 When se valida contra la spec v1.0.0
 Then $schema es https://agent-plugins.org/schemas/1.0.0/mcp.schema.json
 And mcpServers contiene un server type 'stdio' con command plugin-relative './'
