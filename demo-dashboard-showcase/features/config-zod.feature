# Fase Config Zod — demo-dashboard
# Nichos por contrato Zod, NUNCA if-por-nicho en componente
# Patrón: schema + niches + router DI

Feature: Config Zod de narrativa de venta por nicho
 Scenario: El schema Zod fuerza una narrativa de venta completa
 Given un contrato NicheConfigSchema con painPoint, hero, metrics[] con source,
 roiFormula, integrations[], proof[], cta y aesthetic
 When se parsea una config de nicho que omite painPoint, hero, metrics o aesthetic
 Then el parse falla (safeParse.success === false) — sin narrativa completa NO compila
 And una config completa y válida parsea con éxito

 Scenario: Cada métrica del sector lleva source URL verificable  Given el MetricSchema exige label, value y source
 When una métrica omite source
 Then el parse falla — ninguna métrica sin source (anti-invención)

 Scenario: El CTA es SIEMPRE Calendly, nunca mailto  Given el cta.url es un literal 'https://calendly.com/csch1305'
 When se intenta una CTA mailto
 Then el parse falla

 Scenario: El nicho dental implementa el contrato con copy EN honesto
 Given el nicho dental (niches/dental.ts) parsea NicheConfigSchema
 When se inspecciona su narrativa
 Then hero 'Your schedule is leaking revenue', pain con no-show 7.4% (Planet DDS),
 revenue/patient $500 (Teero), pérdida $105K+ (Clerri/Arini), CTA Calendly,
 estética light clínico (teal #2F9E9B + lavanda)

 Scenario: El router resuelve config por DI, nunca if-por-nicho en componente
 Given un registro DEFAULT_REGISTRY con el nicho dental
 When getNicheConfig('dental') se invoca
 Then devuelve la config dental validada
 And getNicheConfig('desconocido') devuelve undefined sin lanzar
 And un registry custom inyectado por DI resuelve nichos extra sin tocar componentes
