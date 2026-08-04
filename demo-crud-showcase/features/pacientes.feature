Feature: Patient management

  Background:
    Given there are example patients in the system

  Scenario: Register a new patient
    Given the user opens the new patient form
    When the user fills name "Rosa Martínez", rut "11.111.111-1", estado "activo"
    Then the patient "Rosa Martínez" appears in the list
    And the total patient count increases by 1

  Scenario: Edit an existing patient
    Given the patient "María Fernández" exists
    When the user edits the name to "María F. Actualizada"
    Then the patient "María F. Actualizada" replaces the previous one

  Scenario: Delete a patient
    Given the patient "Juan Pérez" exists
    When the user deletes it
    Then the patient "Juan Pérez" is no longer in the list

  Scenario: Search patients
    Given there are 3 example patients
    When the user searches for "carolina"
    Then only 1 patient is shown
    And that patient is "Carolina Soto"

  Scenario: Filter by inactive status
    Given there are 3 example patients
    When the user filters by estado "inactivo"
    Then only 1 patient is shown
    And that patient is "Carolina Soto"

  Scenario: Mutation testing invariant — equivalent mutant needs no throwaway test
    Given the system has a discount of 0
    When the discount is evaluated as negative or not
    Then the result is the same and the mutant is equivalent
