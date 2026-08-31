# GHERKIN — Fase Islands + Landing (demo-lead-qualifier, tipo b Lead Qualifier AI)
# TDD RED→GREEN por island. Consume config Zod (src/config) + core determinista (src/lib).
# NO toca src/lib ni src/config. i18n EN default `/` + es-CL `/es/`.

Feature: Lead Qualifier AI — islands y landing por nicho (RE/Law)

  Scenario: StatusBadge muestra estado con color semántico e icono
    Given un lead con status "new" | "qualified" | "booked"
    When StatusBadge se renderiza con la config del nicho
    Then muestra el label i18n del estado y un icono lucide
    And el color semántico deriva de la config (accent/neutro/verde), no hardcode por nicho

  Scenario: CTACalendly apunta SIEMPRE a calendly.com/csch1305
    Given una landing con CTA
    When se renderiza CTACalendly
    Then el anchor href es https://calendly.com/csch1305 (NUNCA mailto)
    And target=_blank rel=noopener y touch >= 44px

  Scenario: ModeBadge siempre visible con MODO DEMO + reset
    Given la landing renderizada
    When ModeBadge se monta
    Then muestra "MODO DEMO" y botón reset que llama resetDemo()

  Scenario: LeadForm captura un lead y arranca el timer
    Given el usuario en la landing
    When completa name/email/phone/topic (validación inline email+phone)
    Then dispara capture_lead → lead status "new" y se persiste vía storage
    And arranca el countdown speed-to-lead <60s

  Scenario: QualifyCard muestra score+razón y CTA agendar Calendly
    Given un lead "qualified" con score y razón
    When QualifyCard se renderiza
    Then muestra score, razón, countdown <60s y CTA "Agenda consulta" → book(bookingUrl=Calendly)
    And el lead pasa a "booked" y se persiste

  Scenario: LeadDashboard lista leads por estado + KPIs en vivo
    Given leads new/qualified/booked persistidos
    When LeadDashboard se renderiza
    Then agrupa por estado y muestra KPIs derivados (deriveKpi) en vivo

  Scenario: KpiBar muestra métricas con source y proyecciones etiquetadas
    Given la config del nicho con metrics[] con source
    When KpiBar se renderiza
    Then cada métrica muestra su source visible
    And las proyecciones llevan "Estimated based on industry averages"

  Scenario: ROICalculator usa config.roiFormula
    Given la config del nicho con roiFormula (compute)
    When el usuario mueve el slider
    Then computa el valor anual con config.roiFormula.compute y muestra "Estimated based on industry averages"
    And CTA Calendly

  Scenario: i18n EN default y ES es-CL
    Given la landing EN en "/" y ES en "/es/"
    When se renderiza cada idioma
    Then la UI usa strings.ts bilingüe y la narrativa viene de la config del nicho
    And el toggle EN/ES es persistente

  Scenario: Landing completa Hero→Pain→Solution→ROI→Proof→CTA
    Given la config del nicho
    When la landing se renderiza
    Then consume getNicheConfig('realestate'|'law') y su estética
    And expone Hero, PainPoint, Solution (LeadForm+QualifyCard en vivo), ROI (ROICalculator), Proof y CTA Calendly

  Scenario: Prefers-reduced-motion off
    Given prefers-reduced-motion: reduce
    When se renderiza cualquier motion
    Then la animación se desactiva (motion off)
