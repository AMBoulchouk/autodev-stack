# Acceptance: agent control plane

```gherkin
Feature: Trusted autonomous workflow control plane

  Scenario: Reject production dispatch from a feature branch
    Given the workflow was manually dispatched from a non-main ref
    When GitHub evaluates the production job
    Then the production job is skipped

  Scenario: Reject a forged approval checkpoint
    Given a checkpoint claims approval without the required history and evidence
    When the orchestrator resumes it
    Then schema or invariant validation rejects the checkpoint
    And delivery is not invoked

  Scenario: Stop a phase without evidence
    Given RED returns passed without expected failing-test evidence
    When the control plane evaluates the result
    Then the workflow does not transition to GREEN

  Scenario: Rework after review
    Given review returns rework with typed review evidence
    When the control plane evaluates the result
    Then the workflow transitions back to GREEN

  Scenario: Atomic checkpoint recovery
    Given the process terminates while writing a checkpoint
    When the workflow is resumed
    Then the last complete checkpoint remains readable

  Scenario: Prevent concurrent resume
    Given one process owns the run lock
    When another process resumes the same run
    Then the second process exits without executing a phase

  Scenario: Deliver through GitOps
    Given all deterministic gates passed and a human approved the run
    When delivery executes
    Then the GitHub App opens a pull request from the isolated branch
    And the LLM receives no production or Kubernetes credentials
```
