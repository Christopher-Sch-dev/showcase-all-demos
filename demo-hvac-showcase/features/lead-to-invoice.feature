# language: en
Feature: Call-capture lead-to-invoice funnel (HVAC demo, tipo a)

  As an HVAC business owner
  I want to simulate a missed call that the AI captures, qualifies, dispatches and invoices
  So that I see the value of the AI add-on and book a call

  Background:
    Given the demo is seeded with 3 technicians (Carlos, Ana, Mike) across 3 zones
    And 5 pre-existing leads in "qualified" state
    And KpiBar shows baseline KPIs from seed

  Scenario: AI captures a missed call and creates a lead
    When the user clicks "Simulate missed call" on LiveCallSimulator
    Then a call transcript is generated with an HVAC complaint (no AC, urgent, North zone)
    And a new Lead is created in "lead" state with customer name, phone, address and issue
    And the speed-to-lead timer starts (< 5 min)
    And the lead appears at the top of LeadQueue
    And KpiBar shows +1 "calls recovered by AI"

  Scenario: Lead is qualified and booked
    Given a lead exists in "lead" state
    When the user clicks "Qualify" on the lead
    Then the lead transitions to "qualified" with a qualification score and reason
    When the user clicks "Book" on the qualified lead
    Then the lead becomes a Job in "booked" state with a scheduled date/time
    And the lead is removed from LeadQueue and appears in DispatchBoard as unassigned

  Scenario: Job is dispatched to a technician by zone
    Given a Job in "booked" state in the North zone
    When the user selects the job on DispatchBoard and assigns Carlos (North zone)
    Then the job transitions to "scheduled"
    When the user clicks "Dispatch"
    Then the job transitions to "dispatched" with technician assigned and an ETA shown
    And the on-route status (#16A34A) is visible

  Scenario: Job progresses to in_progress and completed
    Given a Job in "dispatched" state
    When the user clicks "Start job"
    Then the job transitions to "in_progress"
    When the user clicks "Complete job"
    Then the job transitions to "completed"
    And a completion note is captured

  Scenario: Job is invoiced and KPIs update
    Given a Job in "completed" state
    When the user clicks "Invoice"
    Then the job transitions to "invoiced" with a total amount
    And KpiBar updates: +revenue captured, conversion %, avg speed-to-lead
    And the funnel (lead→invoiced) reflects the new counts

  Scenario: No-show / canceled are supported (not dead-ends)
    Given a Job in "booked" state
    When the user clicks "No-show" or "Cancel"
    Then the job transitions to "no_show" or "canceled" and is excluded from revenue KPIs

  Scenario: Reset restores demo seed
    Given the user has moved several leads through the funnel
    When the user clicks "Reset demo"
    Then all state returns to the seeded baseline
    And localStorage is cleared for the demo key

  Invariants (mutation testing):
    - Price/KPI total never negative.
    - State transition valid: only forward (lead→…→invoiced) or to canceled/no_show from booked/scheduled.
    - A lead is invoiced only once (idempotent invoiced).
    - A lead/ticket without a technician is not dispatched (domain guard).
    - KPIs derive from state, never stored independently.
    - ROI always with source; projections labeled "Estimated based on industry averages".
