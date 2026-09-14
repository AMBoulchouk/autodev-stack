# Platform bootstrap

## Outcome

The repository provides one production-shaped Next.js frontend and one NestJS backend that run through Nx, Docker Compose and Kubernetes manifests consumed by Argo CD.

## Acceptance scenarios

- Given a clean checkout, when dependencies are installed, then lint, typecheck, test and build targets succeed.
- Given Docker Compose, when the stack starts, then the frontend is reachable and reports API health.
- Given the dev overlay, when Kustomize renders it, then valid web and API resources are produced.
- Given a pull request, when `main.yaml` runs, then affected projects and deployment descriptors are validated.
