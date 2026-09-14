# Configuración

## 1. Clonar y preparar

```bash
git clone <REPOSITORY_URL> autodev-stack
cd autodev-stack
pnpm install --frozen-lockfile
cp .env.example .env
```

En PowerShell, reemplazar el último comando por:

```powershell
Copy-Item .env.example .env
```

Requisitos: Node.js 24, pnpm 10, Docker, kubectl, AWS CLI y Argo CD CLI.

## 2. Ejecutar localmente

Stack completo:

```bash
docker compose up --build
```

- Frontend: `http://localhost:3001`
- API: `http://localhost:3000/api/health`
- PostgreSQL: `localhost:5432`

Desarrollo directo:

```bash
docker compose up -d postgres
pnpm dev
```

## 3. Validar

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
docker compose config --quiet
kubectl kustomize infrastructure/kubernetes/overlays/dev
```

## 4. Generar aplicaciones adicionales

```bash
pnpm nx g @nx/next:application apps/frontends/<frontend> --appDir --useProjectJson
pnpm nx g @nx/nest:application apps/backends/<backend> --useProjectJson
```

Cada aplicación desplegable debe agregar tags Nx, pruebas, Dockerfile, manifiestos Kustomize, repositorio ECR y entrada en CI.

## 5. Configurar GitHub Actions

Crear variables del repositorio:

```text
AWS_REGION=<region>
AWS_DEPLOY_ROLE_ARN=<github-oidc-role-arn>
ECR_REGISTRY=<account>.dkr.ecr.<region>.amazonaws.com
```

El rol debe usar GitHub OIDC y restringir repositorio, rama, environment y permisos AWS.

## 6. Crear repositorios ECR

```bash
aws ecr create-repository --repository-name autodev-api
aws ecr create-repository --repository-name autodev-web
```

## 7. Configurar Kubernetes

Reemplazar `REPLACE_ECR_REGISTRY`, `REPLACE_API_DIGEST` y `REPLACE_WEB_DIGEST` en:

```text
infrastructure/kubernetes/overlays/dev/kustomization.yaml
infrastructure/kubernetes/overlays/staging/kustomization.yaml
infrastructure/kubernetes/overlays/prod/kustomization.yaml
```

## 8. Conectar Argo CD

```bash
argocd app create autodev-dev \
  --repo <REPOSITORY_URL> \
  --path infrastructure/kubernetes/overlays/dev \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace autodev-dev \
  --sync-policy automated
```

Repetir para `staging` y `prod` con sus respectivos overlays, namespaces y políticas.

## 9. Configurar Microsoft Entra

```text
ENTRA_TENANT_ID=<tenant-id>
ENTRA_CLIENT_ID=<client-id>
ENTRA_EXTERNAL_TENANT_ID=<external-tenant-id>
ENTRA_EXTERNAL_CLIENT_ID=<external-client-id>
OPENAI_API_KEY=<openai-api-key>
ENGRAM_MCP_COMMAND=<engram-stdio-command>
```

Entra ID se usa para workforce y administración. Entra External ID se usa para clientes y usuarios externos.

## 10. Configurar secretos

```bash
aws secretsmanager create-secret \
  --name autodev/prod/database \
  --secret-string '{"DATABASE_URL":"<postgres-url>"}'
```

Los pods acceden mediante EKS Pod Identity y permisos mínimos.

## 11. Publicar

```bash
git checkout -b feature/<name>
git add .
git commit -m "feat: <description>"
git push -u origin feature/<name>
```

El pull request ejecuta los quality gates. `main` publica imágenes inmutables en ECR; el flujo GitOps actualiza digests y Argo CD sincroniza EKS.
