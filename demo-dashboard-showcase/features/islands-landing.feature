# Feature: Islands + Landing (fase presentacional — consume config Zod + core determinista)
# demo-dashboard (tipo e) — dental. NO modifica src/lib/*.ts ni src/config/*.ts.

Feature: Islands React + Landing de venta (EN / + ES /es/)

 Scenario: KpiBar muestra los 6 KPIs derivados con source visible
 Given un estado demo con pacientes y citas
 When KpiBar se renderiza con deriveKpi(state)
 Then muestra activePatients, noShowRate, totalRevenue, revenuePerPatient, scheduledAppointments, completedAppointments
 And las métricas del sector muestran su source; las proyecciones se etiquetan "Estimated based on industry averages"

 Scenario: ChartBar y ChartDonut derivan data de charts.ts
 Given un estado demo con citas completed
 When ChartBar se renderiza con revenueByMonth/appointmentsByMonth
 Then dibuja barras por mes con valor y aria-label
 When ChartDonut se renderiza con revenueByTreatment
 Then dibuja un donut por tratamiento con leyenda y aria-label

 Scenario: PatientTable pagina (8-10 filas) y filtra por estado/tratamiento
 Given más de 10 pacientes en el estado
 When PatientTable se renderiza
 Then muestra 8-10 filas por página con controles prev/next y contador "X de Y"
 And filtra por estado y por tratamiento

 Scenario: PatientForm valida inline y dispara CRUD
 Given el usuario abre el form de nuevo paciente
 When ingresa un email inválido o nombre vacío
 Then muestra error inline sin enviar el form
 When envía un paciente válido
 Then dispara create_paciente vía reduce() y persiste

 Scenario: ModeBadge y CTACalendly siempre visibles
 Given la landing o dashboard se renderiza
 Then ModeBadge muestra "MODO DEMO" siempre visible
 And CTACalendly enlaza a https://calendly.com/csch1305 (target blank, NUNCA mailto)

 Scenario: Landing EN / y ES /es/ consumen getNicheConfig('dental')
 Given la config Zod del nicho dental
 When index.astro se renderiza en EN
 Then muestra hero → painPoint → solution → roi → proof → cta desde la config
 When es/index.astro se renderiza en es-CL
 Then muestra la misma estructura con strings i18n en español

 Scenario: Estética light clínico aplicada por config, no hardcode
 Given getNicheConfig('dental').aesthetic
 When BaseLayout aplica los tokens (teal #2F9E9B + lavanda + Plus Jakarta Sans)
 Then el CSS usa variables derivadas de la config, sin if-por-nicho en componente
