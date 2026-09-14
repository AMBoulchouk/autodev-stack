# Autodev Stack

AI-native Nx monorepo for independently deployable Next.js frontends and NestJS backends.

## Requirements

- Node.js 24
- pnpm 10
- Docker with Compose
- kubectl with Kustomize support

## Local development

```bash
pnpm install
pnpm dev
```

Frontend: `http://localhost:3001`  
API health: `http://localhost:3000/api/health`

Run the production-shaped local stack:

```bash
docker compose up --build
```

## Quality gates

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Generate applications

```bash
pnpm nx g @nx/next:application apps/frontends/<name> --appDir --useProjectJson
pnpm nx g @nx/nest:application apps/backends/<name> --useProjectJson
```

Every generated deployable must add its Dockerfile, Kustomize resources, Nx tags and CI image target in the same change.

## GitOps

Argo CD must watch one environment path:

```text
infrastructure/kubernetes/overlays/dev
infrastructure/kubernetes/overlays/staging
infrastructure/kubernetes/overlays/prod
```

GitHub Actions publishes immutable images to ECR. Promotion updates the image digest in the target overlay; Argo CD is the only actor that applies manifests to EKS.
