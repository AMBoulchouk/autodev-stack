# Plan: autonomy hardening

## Objective

Close the security, orchestration and GitOps gaps found in the bootstrap review.

## Workstreams

1. Protect local secrets with `.env*` exclusions and CI secret scanning.
2. Execute and persist every SDD/TDD phase, pause at approval and resume delivery explicitly.
3. Restrict Engram to an explicit read-only tool allowlist and bound model, turns, output and retries.
4. Build immutable ECR releases, promote the recorded staging manifest and verify digests in ECR.
5. Replace direct writes to `main` with GitHub App-authenticated promotion pull requests.
6. Validate all Kustomize overlays and Kubernetes schemas in CI.
7. Correct ALB service health checks and complete Nx type dependency constraints.

## Acceptance gates

- No local `.env` file can be committed by default.
- A workflow checkpoint survives process restarts and production delivery requires `--approve`.
- Engram cannot start without an explicit tool allowlist.
- Production accepts no user-supplied image digest.
- Staging and production desired-state changes reach `main` only through pull requests.
- Dev, staging and prod manifests render and pass schema validation.

## External configuration

- Configure production environment required reviewers in GitHub.
- Install a promotion GitHub App with Contents and Pull requests write permissions.
- Configure branch protection to require CI and review for promotion pull requests.
- Replace bootstrap NetworkPolicy rules with VPC/CNI-specific egress and ingress controls before production.
