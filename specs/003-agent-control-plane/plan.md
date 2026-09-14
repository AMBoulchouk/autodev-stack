# Plan: agent control plane

## Objective

Convert the current phase narrator into a deterministic, resumable and auditable control plane whose transitions depend on verified outcomes and whose mutating executors run with isolated least-privilege capabilities.

## Scope

- Restrict manual production promotion to `refs/heads/main`.
- Model phase outcomes and evidence as validated domain data.
- Make the control plane, not the LLM, decide every transition.
- Validate checkpoint structure and workflow invariants at runtime.
- Persist checkpoints atomically and prevent concurrent resume.
- Implement rework paths already declared by the state machine.
- Replace phase-level retries with transient model-request retries.
- Introduce isolated repository executors for RED, GREEN and review.
- Keep approval and GitOps delivery deterministic and outside LLM authority.

## Out of scope

- Autonomous production approval.
- Direct Kubernetes or AWS mutation by an LLM.
- Durable distributed orchestration in PostgreSQL or Redis.
- Automatic merge without protected branch checks.

## Target architecture

```text
Intent
  -> SpecificationExecutor (LLM + Engram RO)
  -> PlanningExecutor      (LLM + repository RO)
  -> RedExecutor           (isolated worktree RW + tests)
  -> GreenExecutor         (same worktree RW + tests)
  -> ReviewExecutor        (fresh context + diff/repository RO)
       -> changes_requested -> GreenExecutor
       -> approved          -> ApprovalGate
  -> ApprovalGate          (deterministic human gate)
       -> rework            -> PlanningExecutor
       -> approved          -> DeliveryExecutor
  -> DeliveryExecutor      (deterministic GitHub/GitOps adapter)
  -> Completed
```

## Phase 1 — Trust boundary

1. Require `github.ref == 'refs/heads/main'` for the production job.
2. Document the matching GitHub Environment deployment branch policy.
3. Add `WorkflowRunSchema` and `WorkflowCheckpointSchema` with Zod.
4. Validate phase, status, history order, output coverage and approval invariants when resuming.
5. Reject unknown checkpoint properties and unsupported schema versions.
6. Write checkpoints to a temporary sibling file, flush, close and atomically rename.
7. Acquire an exclusive run lock before resume and release it on every exit path.

## Phase 2 — Deterministic outcomes

1. Add a versioned `PhaseOutputSchema` with:
   - `outcome`: `passed | failed | blocked | rework`.
   - typed evidence: `command | test | diff | artifact | review | deployment`.
   - summary, risks and next inputs.
2. Define evidence requirements per phase.
3. Encode transition rules in pure functions.
4. Stop on `blocked` or `failed` without losing resumability.
5. Route review `rework` to GREEN.
6. Route approval `rework` to planning.
7. Prevent approval when required evidence is absent.

## Phase 3 — Retry and execution safety

1. Remove the wrapper that retries a complete phase.
2. Configure Agents SDK model retry for transient network, throttling and server failures.
3. Assign an idempotency key to each phase attempt.
4. Record attempt number, model, token usage and terminal error in the checkpoint.
5. Never retry repository, GitHub, AWS or delivery side effects implicitly.

## Phase 4 — Repository executors

1. Define a common `PhaseExecutor` interface and capability manifest.
2. Keep specification on LLM + Engram read-only.
3. Give planning read-only repository access.
4. Create an isolated Git worktree per run.
5. Implement RED with repository write access restricted to tests and test execution.
6. Require evidence of a failing test for the intended reason.
7. Implement GREEN with scoped patch and command capabilities.
8. Require the RED test and affected quality gates to pass.
9. Run review in fresh context with read-only access to the diff and test evidence.
10. Destroy or retain worktrees according to the terminal state and audit policy.

## Phase 5 — Approval and delivery adapters

1. Replace the LLM delivery phase with a deterministic delivery adapter.
2. Validate the approved run ID, commit and evidence bundle.
3. Push only the isolated branch and open a pull request through the GitHub App.
4. Delegate image build, scan, promotion and EKS reconciliation to the existing GitHub Actions and Argo CD flow.
5. Store PR, workflow run, release manifest and deployment references as typed evidence.
6. Mark the workflow completed only after the configured delivery criterion is observed.

## Verification strategy

- Unit tests for schemas, invariants, outcome gates and every valid/invalid transition.
- Corruption tests for truncated, unknown-version and forged approval checkpoints.
- Concurrency tests proving a run cannot be resumed twice.
- Failure-injection tests around temporary write, flush and rename.
- Executor contract tests with fake repositories and commands.
- Integration tests in a disposable Git worktree.
- Tests proving RED cannot pass without expected failure evidence.
- Tests proving GREEN cannot advance with failing gates.
- Tests proving review rework loops and human rework loops terminate safely.
- Workflow test proving production is skipped for non-main dispatch refs.

## Delivery order

1. Production ref guard.
2. Checkpoint schemas and invariant validation.
3. Atomic persistence and locking.
4. Outcome/evidence model and deterministic gates.
5. Rework transitions.
6. Model-level retry policy and attempt accounting.
7. Executor interfaces and capability manifests.
8. RED/GREEN isolated worktree implementation.
9. Independent review executor.
10. Deterministic approval and GitOps delivery adapter.

## Exit criteria

- A forged or inconsistent checkpoint cannot reach delivery.
- A phase cannot advance with empty required evidence.
- Every transition is selected by deterministic code from a validated outcome.
- RED produces and proves the expected failing test.
- GREEN produces a scoped change and proves required tests pass.
- Review can request rework and the workflow returns to GREEN.
- Human approval can request re-planning without bypassing gates.
- No phase with side effects is automatically replayed.
- Production dispatch from any ref other than main is rejected.
- Delivery uses the existing protected GitOps PR path and grants no production credentials to the LLM.
