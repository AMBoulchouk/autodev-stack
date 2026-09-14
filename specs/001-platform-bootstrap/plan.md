# Implementation plan

## Architecture

- Nx and pnpm manage independently deployable applications and shared packages.
- Next.js provides the initial frontend; NestJS exposes the initial API.
- Docker Compose provides local PostgreSQL and application execution.
- ECR stores immutable images; Kustomize declares desired state; Argo CD reconciles EKS.
- GitHub Actions validates affected projects, images and manifests before delivery.

## Quality strategy

- Unit tests define behavior before implementation.
- Nx lint, typecheck, test and build targets are mandatory.
- Pull requests build every deployable Docker image.
- Kubernetes overlays must render successfully.

## Security

- GitHub authenticates to AWS with OIDC.
- EKS workloads run non-root with dropped capabilities.
- Secrets originate in AWS Secrets Manager and reach pods through the CSI driver.
- Production promotion remains approval-gated.
