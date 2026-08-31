#!/usr/bin/env node
/**
 * MCP stdio server — demo-dashboard.
 * Expone las acciones del plugin agéntico (src/agent/plugin.ts) como tools MCP.
 * La IA externa opera la FSM determinista via reduce(); el reducer sigue siendo
 * puro (now se inyecta aquí, en la capa de transporte, no dentro del reducer).
 *
 * Protocolo: MCP (Model Context Protocol) sobre stdio, JSON-RPC 2.0.
 * Estado en memoria (seed inicial); cada tool devuelve el estado nuevo.
 */
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
// rol: registrar el loader de resolución TS ANTES de importar src/lib y src/agent.
// register() es async en Node 22 → los imports del core se hacen dinámicos tras await.
await register('./ts-resolve-loader.mjs', pathToFileURL('./scripts/mcp-server.mjs'));

const [{ createSeedState }, { operateDashboard, createPatient, updatePatient, deletePatient, transitionCita }, { deriveKpi }] =
 await Promise.all([
 import('../src/lib/seed.ts'),
 import('../src/agent/plugin.ts'),
 import('../src/lib/kpi.ts'),
 ]);

// ── estado en memoria (persistencia queda a cargo del cliente) ──
let state = createSeedState();

// ── helpers JSON-RPC ──
const readline = await import('node:readline');
const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });

function send(msg) {
 process.stdout.write(JSON.stringify(msg) + '\n');
}

function now() {
 return Date.now();
}

// ── tools MCP ──
const TOOLS = [
 {
 name: 'create_patient',
 description: 'Crea un paciente en el dashboard dental. Devuelve el estado nuevo.',
 inputSchema: {
 type: 'object',
 properties: {
 nombre: { type: 'string' },
 rut: { type: 'string' },
 email: { type: 'string' },
 telefono: { type: 'string' },
 ultimaVisita: { type: 'string' },
 tratamiento: { type: 'string', enum: ['Limpieza', 'Ortodoncia', 'Blanqueamiento', 'Implante', 'Endodoncia'] },
 estado: { type: 'string', enum: ['activo', 'inactivo', 'pendiente'] },
 revenueTotal: { type: 'number' },
 citasProgramadas: { type: 'number' },
 noShows: { type: 'number' },
 ultimaCita: { type: 'string' },
 },
 required: ['nombre', 'rut', 'email', 'telefono', 'ultimaVisita', 'tratamiento', 'estado'],
 },
 },
 {
 name: 'update_patient',
 description: 'Actualiza campos parciales de un paciente. id/createdAt nunca se pisan.',
 inputSchema: {
 type: 'object',
 properties: {
 pacienteId: { type: 'string' },
 cambios: { type: 'object' },
 },
 required: ['pacienteId', 'cambios'],
 },
 },
 {
 name: 'delete_patient',
 description: 'Elimina un paciente.',
 inputSchema: {
 type: 'object',
 properties: { pacienteId: { type: 'string' } },
 required: ['pacienteId'],
 },
 },
 {
 name: 'transition_cita',
 description: 'Transiciona una cita en la FSM determinista. to ∈ confirmed|completed|no_show|cancelled. Transición ilegal → changed:false.',
 inputSchema: {
 type: 'object',
 properties: {
 citaId: { type: 'string' },
 to: { type: 'string', enum: ['confirmed', 'completed', 'no_show', 'cancelled'] },
 },
 required: ['citaId', 'to'],
 },
 },
 {
 name: 'operate_dashboard',
 description: 'Manejador genérico: pasa cualquier AgentAction (create_cita, confirm_cita, complete_cita, no_show_cita, cancel_cita, create_paciente, update_paciente, delete_paciente).',
 inputSchema: {
 type: 'object',
 properties: { action: { type: 'object' } },
 required: ['action'],
 },
 },
 {
 name: 'get_dashboard',
 description: 'Devuelve KPIs derivados (nunca guardados) + pacientes + citas del estado actual.',
 inputSchema: { type: 'object', properties: {} },
 },
];

function applyResult(r) {
 if (r.changed) state = r.state;
 return { changed: r.changed, reason: r.reason ?? null, state };
}

function handleToolCall(name, args) {
 switch (name) {
 case 'create_patient':
 return applyResult(createPatient(state, args, now()));
 case 'update_patient':
 return applyResult(updatePatient(state, args.pacienteId, args.cambios, now()));
 case 'delete_patient':
 return applyResult(deletePatient(state, args.pacienteId, now()));
 case 'transition_cita':
 return applyResult(transitionCita(state, args.citaId, args.to, now()));
 case 'operate_dashboard':
 return applyResult(operateDashboard(state, args.action, now()));
 case 'get_dashboard':
 return { kpi: deriveKpi(state), pacientes: state.pacientes, citas: state.citas };
 default:
 throw new Error(`Tool desconocida: ${name}`);
 }
}

rl.on('line', (line) => {
 let msg;
 try {
 msg = JSON.parse(line);
 } catch {
 return; // ignorar JSON inválido
 }
 const id = msg.id;

 if (msg.method === 'initialize') {
 send({
 jsonrpc: '2.0',
 id,
 result: {
 protocolVersion: '2024-11-05',
 capabilities: { tools: {} },
 serverInfo: { name: 'demo-dashboard', version: '0.1.0' },
 },
 });
 return;
 }
 if (msg.method === 'notifications/initialized' || msg.method === 'notifications/cancelled') {
 return; // notificación, sin respuesta
 }
 if (msg.method === 'ping') {
 send({ jsonrpc: '2.0', id, result: {} });
 return;
 }
 if (msg.method === 'tools/list') {
 send({ jsonrpc: '2.0', id, result: { tools: TOOLS } });
 return;
 }
 if (msg.method === 'tools/call') {
 try {
 const result = handleToolCall(msg.params.name, msg.params.arguments ?? {});
 send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(result) }] } });
 } catch (e) {
 send({
 jsonrpc: '2.0',
 id,
 error: { code: -32603, message: e.message },
 });
 }
 return;
 }
 // método desconocido
 send({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Método no soportado' } });
});
