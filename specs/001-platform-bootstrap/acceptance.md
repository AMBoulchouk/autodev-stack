# Acceptance evidence

| Requirement          | Evidence                                                   |
| -------------------- | ---------------------------------------------------------- |
| Workspace quality    | `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`   |
| API health           | `GET /api/health` returns `status: ok`                     |
| Local runtime        | `docker compose config --quiet` and image builds           |
| GitOps manifests     | `kubectl kustomize infrastructure/kubernetes/overlays/dev` |
| Immutable delivery   | ECR digest written to the staging overlay                  |
| Autonomous lifecycle | Orchestrator transition tests reject skipped phases        |
| Human control        | Approval phase exists before delivery                      |
