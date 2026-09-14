# Plan: stack de desarrollo autónomo con IA

## 1. Objetivo operativo

Transformar instrucciones de negocio en cambios desplegados mediante un flujo autónomo y auditable:

```text
Idea / incidente
  -> especificación ejecutable
  -> aclaración y criterios de aceptación
  -> diseño y plan
  -> tests RED
  -> implementación GREEN
  -> refactor
  -> revisión independiente
  -> CI y seguridad
  -> preview por PR
  -> aprobación humana de producto
  -> producción y observabilidad
  -> aprendizaje persistido
```

El usuario no edita código. Su interfaz es lenguaje natural, aprobación funcional de previews y decisiones de negocio. Los despliegues productivos, cambios destructivos, migraciones irreversibles, permisos y gastos extraordinarios conservan aprobación humana.

## 2. Stack objetivo

| Capa | Tecnología | Decisión |
|---|---|---|
| Monorepo | pnpm + Turborepo | Aplicaciones y paquetes compartidos con caché reproducible |
| Frontend | Next.js + TypeScript | App Router, Server Components y BFF sólo cuando corresponda |
| Backend | NestJS + TypeScript | API modular, OpenAPI y workers |
| Contratos | OpenAPI + JSON Schema | Contrato versionado; clientes y validadores generados |
| Persistencia | PostgreSQL en Amazon RDS/Aurora | Multi-AZ productivo, PITR, cifrado KMS y RDS Proxy si aplica |
| ORM/migraciones | Prisma | Esquema tipado; migraciones expand/contract y rollback documentado |
| Identidad interna | Microsoft Entra ID | OIDC/OAuth 2.0, grupos y roles de aplicación |
| Identidad de clientes | Microsoft Entra External ID | CIAM para usuarios externos, clientes y partners |
| Storage | Amazon S3 | Buckets privados, URLs firmadas, versionado, lifecycle y SSE-KMS |
| Funciones y eventos | Lambda, EventBridge, SQS, SNS, Step Functions | Procesamiento asíncrono, reintentos, DLQ e idempotencia |
| Email | Amazon SES | Plantillas, eventos de entrega y supresión |
| Secretos | Secrets Manager + KMS | Rotación y acceso por rol; ningún secreto en prompts o repositorio |
| Observabilidad | OpenTelemetry + CloudWatch/X-Ray | Logs estructurados, métricas, trazas, alertas y presupuestos |
| Edge/seguridad | CloudFront + WAF | Protección de endpoints y contenido S3 cuando sea necesario |
| Infraestructura | AWS CDK v2 con TypeScript | Infraestructura tipada, revisada y desplegada por CI |
| Contenedores | Docker + Amazon ECR | Una imagen inmutable por aplicación, firmada y escaneada |
| Orquestación | Amazon EKS + Kubernetes | Runtime productivo para web, API y workers |
| GitOps Kubernetes | Argo CD + Kustomize | Argo CD existente sincroniza manifiestos y overlays por ambiente |
| Desarrollo local | Docker Compose | Stack reproducible con servicios y dependencias locales |
| Preview web | Vercel | URL aislada por pull request |
| Producción web | Vercel | Next.js; conexión privada/segura con servicios AWS |
| CI/CD | GitHub Actions + OIDC | Sin claves AWS persistentes; gates y ambientes protegidos |
| Agente principal | OpenAI Codex | Especifica, implementa, prueba, revisa y mantiene el repositorio |
| Orquestación | OpenAI Agents SDK | Roles especializados, handoffs, trazabilidad y límites |
| Integraciones | MCP | GitHub y herramientas externas con permisos mínimos |
| Memoria | Engram por MCP | Decisiones, convenciones, incidentes y aprendizajes persistentes |
| Metodología | GitHub Spec Kit + Superpowers | SDD como fuente de verdad y TDD estricto como ejecución |

> Microsoft Entra External ID será la solución CIAM para clientes y usuarios externos. Microsoft Entra ID se mantiene exclusivamente para workforce y administración. [Microsoft Learn](https://learn.microsoft.com/en-us/entra/external-id/customers/faq-customers)

## 3. Arquitectura de referencia

```text
Usuario
  -> Vercel / Next.js
       -> Entra ID o Entra External ID
       -> NestJS API en AWS
            -> PostgreSQL (RDS/Aurora)
            -> S3
            -> EventBridge -> SQS -> Lambda/worker
            -> Step Functions
            -> SES/SNS

GitHub Issue
  -> Orquestador Agents SDK
       -> Codex + Spec Kit + Superpowers
       -> Engram MCP
       -> GitHub MCP
       -> worktree/branch aislado
       -> PR -> CI -> Vercel Preview
       -> aprobación -> deploy
```

### Topología inicial recomendada

- `apps/web`: Next.js desplegado en Vercel.
- `apps/api`: NestJS contenerizado y desplegado en Amazon EKS detrás de AWS Load Balancer Controller; Lambda queda para cargas event-driven y breves.
- `apps/workers`: consumidores NestJS contenerizados en EKS para procesos sostenidos.
- `apps/functions`: Lambdas pequeñas, idempotentes y de responsabilidad única.
- `apps/web` también produce una imagen Docker compatible con EKS para portabilidad, contingencia o migración desde Vercel.
- ECR almacena imágenes por digest; EKS despliega digests promovidos, nunca tags mutables.
- Argo CD sincroniza el estado declarado con EKS; Kustomize mantiene una base común y overlays para `dev`, `staging` y `prod`.
- PostgreSQL y recursos internos en subredes privadas; acceso administrativo mediante mecanismos auditables, no exposición pública.
- Ambientes `dev`, `preview`, `staging` y `prod` separados por cuenta/proyecto y credenciales.

## 4. Repositorio como sistema de control

```text
.
├── AGENTS.md
├── apps/
│   ├── web/
│   │   └── Dockerfile
│   ├── api/
│   │   └── Dockerfile
│   ├── workers/
│   │   └── Dockerfile
│   └── functions/
├── packages/
│   ├── contracts/
│   ├── domain/
│   ├── auth/
│   ├── observability/
│   ├── test-utils/
│   └── config/
├── infrastructure/
│   ├── cdk/
│   └── kubernetes/
│       ├── base/
│       │   ├── kustomization.yaml
│       │   ├── deployments/
│       │   ├── services/
│       │   └── policies/
│       ├── overlays/
│       │   ├── dev/
│       │   │   └── kustomization.yaml
│       │   ├── staging/
│       │   │   └── kustomization.yaml
│       │   └── prod/
│       │       └── kustomization.yaml
│       └── policies/
├── specs/
│   └── NNN-feature/
│       ├── spec.md
│       ├── plan.md
│       ├── tasks.md
│       ├── data-model.md
│       ├── contracts/
│       └── acceptance.md
├── docs/
│   ├── adr/
│   ├── runbooks/
│   └── threat-models/
├── .github/
│   ├── workflows/
│   │   └── main.yaml
│   ├── CODEOWNERS
│   └── pull_request_template.md
├── compose.yaml
├── .dockerignore
└── .specify/
```

### Contrato de ejecución generado

- Cada aplicación desplegable contiene un `Dockerfile` multi-stage, non-root, con healthcheck y versión de Node fijada.
- `compose.yaml` levanta `web`, `api`, `workers`, PostgreSQL y emuladores AWS estrictamente necesarios.
- Las imágenes usadas por Compose, CI y EKS se construyen desde los mismos Dockerfiles.
- La configuración se inyecta por ambiente; las imágenes no contienen secretos ni archivos `.env`.
- En local, Entra usa un tenant de desarrollo. Sólo los tests aislados pueden usar un proveedor de identidad simulado.
- La base Kustomize define `Deployment`, `Service`, `Ingress`, `ServiceAccount`, `ConfigMap`, autoscaling, probes, disruption budgets y network policies.
- Los overlays sólo contienen diferencias explícitas por ambiente; no duplican manifiestos completos.
- Argo CD es el único actor autorizado para aplicar manifiestos al clúster. GitHub Actions actualiza el estado deseado, pero no ejecuta `kubectl apply`.
- Secrets Store CSI Driver sincroniza secretos autorizados desde AWS Secrets Manager; no se versionan `Secret` de Kubernetes.

### Workflow `.github/workflows/main.yaml`

```text
pull_request
  -> install/lint/typecheck/test
  -> contract/integration/e2e
  -> build Docker images
  -> scan images, dependencias, secretos e IaC
  -> kustomize build + schema/policy checks
  -> publish imagen efímera
  -> preview + smoke tests

push main
  -> repetir gates
  -> publicar imágenes inmutables en ECR
  -> actualizar por digest el overlay de EKS staging
  -> Argo CD sincroniza staging
  -> smoke/contract/E2E
  -> aprobación de environment production
  -> promover los mismos digests al overlay de EKS production
  -> Argo CD sincroniza production
  -> verificar rollout/SLO
  -> rollback automático ante fallo seguro
```

El workflow usa concurrencia por rama, permisos mínimos explícitos, caché con claves reproducibles, artefactos con retención y OIDC para asumir roles AWS. Ningún job de pull request proveniente de forks recibe permisos de despliegue.

`specs/` es la fuente de verdad funcional. Código, tests, contratos y documentación deben enlazar el identificador del requisito que satisfacen. Spec Kit formaliza `constitution -> specify -> clarify -> plan -> tasks -> analyze -> implement -> converge`; su flujo está diseñado para producir artefactos Markdown encadenados. [Spec Kit](https://github.github.com/spec-kit/) y [referencia de workflows](https://github.com/github/spec-kit/blob/main/docs/reference/overview.md)

## 5. Constitución del agente

Reglas no negociables en `AGENTS.md` y `.specify/memory/constitution.md`:

1. Ningún cambio funcional sin especificación, escenarios Given/When/Then y trazabilidad.
2. Ningún código productivo antes de un test que falle por la razón esperada.
3. Ciclo obligatorio `RED -> GREEN -> REFACTOR`, registrado en commits o evidencia CI.
4. Tests unitarios para dominio, integración con PostgreSQL/servicios emulados y E2E para caminos críticos.
5. No mockear el comportamiento que se pretende demostrar en pruebas de integración.
6. Todo endpoint nace de OpenAPI; cambios incompatibles requieren nueva versión o migración coordinada.
7. Toda escritura/evento es idempotente; timeouts, retries, DLQ y correlation IDs son obligatorios.
8. Cero secretos en código, logs, memoria Engram, issues, artefactos o contexto del modelo.
9. Dependencias, skills y servidores MCP fijados por versión/commit, revisados y escaneados.
10. El agente no puede aprobar su propio PR ni omitir controles de rama.
11. Migraciones destructivas, IAM, producción y aumento material de costos requieren gate humano.
12. Una tarea no termina hasta actualizar spec, tests, ADR/runbook y memoria aplicable.

## 6. Flujo autónomo por cambio

### Entrada

- El usuario crea una solicitud en lenguaje natural desde una interfaz simple o GitHub Issue.
- El agente de producto clasifica: feature, bug, mantenimiento, incidente o experimento.
- Engram recupera decisiones y precedentes relevantes; nunca reemplaza a los artefactos versionados.

### SDD

- `specify`: genera objetivo, historias, restricciones y resultados medibles.
- `clarify`: detecta ambigüedad; sólo consulta al usuario por decisiones de negocio irreversibles o materialmente diferentes.
- `plan`: produce arquitectura, modelo, contratos, threat model, estrategia de migración y observabilidad.
- `tasks`: divide en slices verticales verificables y pequeños.
- `analyze`: valida contradicciones, cobertura y cumplimiento de la constitución.

### TDD y ejecución

- Un agente implementador toma una tarea en worktree aislado.
- Superpowers fuerza brainstorming cuando corresponde, TDD, debugging sistemático y ejecución por subagentes. La integración oficial documenta descubrimiento nativo de skills en Codex. [Superpowers para Codex](https://github.com/OverTM/obra.superpowers/blob/main/docs/README.codex.md)
- Un agente de especificación verifica intención y criterios.
- Un agente revisor verifica calidad, arquitectura y seguridad sin compartir el rol de autor.
- Un agente de pruebas ejecuta suites, mutación selectiva y smoke tests.
- Sólo se abre PR si todos los gates locales pasan.

### Entrega

- GitHub Actions repite validaciones en entorno limpio.
- El workflow construye una vez, publica en ECR y promueve exactamente el mismo digest entre ambientes.
- CI ejecuta `kustomize build`, validación de esquemas y políticas; Argo CD sincroniza EKS, controla el estado de salud y reporta divergencias.
- Vercel crea preview y se ejecutan E2E contra ella.
- El agente publica un resumen no técnico: qué cambió, evidencia, riesgos y enlace de preview.
- El usuario aprueba la experiencia, no el código.
- Merge queue despliega staging, ejecuta smoke/contract tests y promueve a producción.
- Fallas disparan rollback automático cuando sea seguro; si hay datos involucrados, se ejecuta el runbook específico.

## 7. Agentes especializados

| Agente | Responsabilidad | Escritura permitida |
|---|---|---|
| Intake/Product | Convertir intención en resultados y preguntas mínimas | Specs |
| Spec reviewer | Hallar ambigüedad, contradicciones y falta de aceptación | Comentarios/checklists |
| Architect | Plan, ADR, contratos, datos, seguridad y costo | Plan/docs |
| Implementer | Ejecutar un slice con TDD | Código/tests |
| Test engineer | Pruebas negativas, integración, E2E y regresión | Tests |
| Security reviewer | Threat model, IAM, supply chain y secretos | Reportes/fixes acotados |
| Code reviewer | Correctitud, mantenibilidad y adherencia | Comentarios/fixes acotados |
| Release manager | CI, preview, promoción, rollback y changelog | Automatización/release |
| SRE | Métricas, incidentes, runbooks y feedback a specs | Ops/docs/issues |

Agents SDK coordina handoffs y límites; Codex realiza el trabajo de ingeniería. Separar autor, revisor y release reduce auto-validación complaciente.

## 8. Engram: política de memoria

Antes de adoptarlo se debe seleccionar una única distribución, revisar licencia/seguridad y fijar un commit. La propuesta base es `thebtf/engram`, que expone memoria compartida persistente mediante MCP local. [Repositorio](https://github.com/thebtf/engram)

Guardar:

- ADR resumidos y su enlace canónico.
- Convenciones verificadas del repositorio.
- Causas raíz, intentos fallidos y soluciones de incidentes.
- Preferencias explícitas del usuario y decisiones de producto vigentes.
- Patrones de prueba, límites conocidos y runbooks.

No guardar:

- Secretos, tokens, PII, payloads productivos o datos regulados.
- Suposiciones no verificadas como hechos.
- Código completo ni documentación que ya posee una fuente canónica.

Cada memoria incluye `project`, `environment`, `source`, `commit`, `timestamp`, `confidence`, `expires_at` y clasificación. Al cerrar una tarea se consolida; periódicamente se detectan contradicciones y expiran entradas obsoletas.

## 9. Quality gates

Un PR no puede avanzar si falla cualquiera de estos controles:

```text
format
lint
typecheck
unit tests + thresholds por código modificado
integration tests con PostgreSQL real efímero
contract tests OpenAPI
E2E de caminos críticos
migration dry-run y compatibilidad expand/contract
dependency + secret + SAST scan
IaC synth/diff + policy checks
Docker build + SBOM + image scan
kustomize build + schema/policy validation
build Next.js/NestJS
preview smoke tests
spec/code traceability
revisión independiente
```

Agregar mutation testing en dominio crítico y DAST en staging de forma programada. Cobertura es una señal, no el objetivo; exigir comportamiento y tests de mutantes en reglas sensibles.

## 10. Seguridad y autonomía

- GitHub Actions asume roles AWS mediante OIDC y credenciales temporales.
- Pods de EKS usan EKS Pod Identity con roles dedicados por workload; no comparten credenciales de nodo.
- EKS ejecuta workloads en subredes privadas, con endpoint del API restringido y Network Policies por defecto.
- Imágenes de ECR se referencian por digest y se escanean antes de la promoción.
- MCP aplica allowlists por agente: lectura por defecto; escritura sólo en el recurso requerido.
- Producción no se expone al agente mediante credenciales permanentes.
- GitHub Environments protege `staging` y `production`; branch protection impide bypass.
- Acciones destructivas usan plan/diff, doble confirmación y respaldo verificado.
- Prompt injection se trata como entrada no confiable: contenido de issues, web, documentos y logs nunca concede autoridad.
- CloudTrail, GitHub audit log, trazas del Agents SDK y logs de CI conforman la auditoría.
- Presupuestos AWS/Vercel/OpenAI y límites de tokens, concurrencia y reintentos detienen loops costosos.
- Kill switch revoca roles, pausa workflows y bloquea merges/deploys sin eliminar evidencia.

## 11. Estrategia de pruebas

| Nivel | Alcance | Herramienta sugerida |
|---|---|---|
| Unitario | Dominio puro, guards, policies, casos límite | Vitest o Jest |
| Integración | NestJS + PostgreSQL + S3/SQS compatibles | Testcontainers + LocalStack donde aporte fidelidad |
| Contrato | OpenAPI, consumidores y proveedores | Schemathesis/Pact según necesidad |
| Componentes UI | Estados y accesibilidad | Testing Library + axe |
| E2E | Flujos reales de usuario y auth | Playwright |
| Infraestructura | CDK, Docker y Kubernetes | CDK assertions + cdk-nag + Trivy + Kustomize + policy-as-code |
| Resiliencia | Retries, DLQ, duplicados, timeouts | Suites de fallo controlado |
| Producción | Smoke, SLO y synthetic checks | CloudWatch Synthetics |

## 12. Fases de implementación

### Fase 0 — Decisiones y amenazas (semana 1)

- Confirmar tenant de workforce y tenant External ID.
- Elegir región AWS, residencia de datos, RTO/RPO y presupuesto.
- Elegir RDS PostgreSQL versus Aurora PostgreSQL con datos de carga/costo.
- Seleccionar y auditar distribución de Engram y versión de Superpowers.
- Definir acciones siempre humanas y matriz de permisos.
- Entregables: threat model, ADR base, mapa de datos y constitución.

### Fase 1 — Golden path local (semanas 2–3)

- Crear monorepo, Next.js, NestJS, contratos y CDK.
- Crear Dockerfiles multi-stage para web, API y workers.
- Crear `compose.yaml` para levantar el stack completo en local con PostgreSQL y emulación selectiva AWS.
- Crear manifiestos base y overlays Kustomize para `dev`, `staging` y `prod`.
- Instalar Spec Kit para Codex y adaptar templates al stack.
- Instalar Superpowers con versión fijada.
- Conectar Engram por MCP y probar política de memoria.
- Implementar un slice vertical mínimo usando SDD/TDD completo.

### Fase 2 — Plataforma cloud (semanas 4–5)

- Provisionar cuentas/ambientes AWS, VPC, EKS, ECR, RDS, S3, colas, secretos y observabilidad.
- Instalar AWS Load Balancer Controller, Secrets Store CSI Driver, EKS Pod Identity y observabilidad ADOT/CloudWatch.
- Integrar Entra ID/External ID en Next.js y validación JWT en NestJS.
- Crear `.github/workflows/main.yaml` con GitHub OIDC, build/push ECR, actualización de overlays Kustomize y Vercel previews.
- Integrar el repositorio y las rutas de overlays con el Argo CD existente, sin reinstalar ni administrar Argo CD desde este proyecto.
- Probar backup/restore, migración y rollback.

### Fase 3 — Fábrica autónoma (semanas 6–7)

- Implementar orquestador con Agents SDK, estados reanudables y presupuestos.
- Automatizar Issue -> spec -> plan -> tasks -> worktree -> PR.
- Incorporar revisores independientes, merge queue y evidencia de gates.
- Producir resumen funcional y aprobación desde preview.

### Fase 4 — Endurecimiento (semanas 8–9)

- SAST, secretos, dependencias, SBOM, firma de artefactos y policy-as-code.
- E2E de identidad, aislamiento tenant, autorizaciones y abuso.
- Chaos/resilience sobre eventos, duplicados y caídas parciales.
- Alertas, SLO, runbooks, kill switch y FinOps.

### Fase 5 — Piloto y autonomía progresiva (semanas 10–12)

- Ejecutar 10–20 cambios reales con supervisión.
- Medir fallos escapados, retrabajo, costo, tiempo y consultas humanas.
- Ampliar permisos sólo donde la evidencia muestre seguridad.
- Autorizar auto-merge únicamente para clases de cambio reversibles y de bajo riesgo.

## 13. Niveles de autonomía

| Nivel | Capacidad | Gate humano |
|---|---|---|
| A0 | Analiza y propone | Todo cambio |
| A1 | Implementa y abre PR | Merge y deploy |
| A2 | Merge automático de bajo riesgo | Producción |
| A3 | Deploy automático reversible con canary | Cambios sensibles |
| A4 | Operación rutinaria y rollback automático | Negocio, datos, IAM y gasto material |

Comenzar en A1. El ascenso se decide por tipo de cambio, no globalmente, y requiere métricas sostenidas. “No tocar código” es viable; “sin gobernanza humana” no es un objetivo seguro.

## 14. Métricas de éxito

- Porcentaje de solicitudes completadas sin edición manual de código.
- Lead time desde intención hasta preview y producción.
- Cantidad de aclaraciones humanas por cambio.
- Change failure rate, rollback rate y defectos escapados.
- Cobertura de requisitos por tests y divergencia spec/código.
- Tasa de PR aceptados sin retrabajo técnico.
- MTTR y porcentaje de incidentes con causa raíz persistida.
- Costo por cambio de OpenAI, CI, Vercel y AWS.
- Falsos positivos/negativos de revisores automáticos.
- Memorias Engram usadas, contradichas, corregidas y expiradas.

## 15. Criterio de finalización del programa

- Una solicitud de negocio genera automáticamente spec, plan, tests, código, documentación, PR y preview.
- El usuario valida funcionalidad sin abrir un editor.
- Los cambios de bajo riesgo llegan a producción con gates automáticos y rollback probado.
- Identidad, datos, secretos e infraestructura cumplen mínimo privilegio y auditoría completa.
- Toda decisión relevante es trazable desde requisito hasta telemetría productiva.
- El sistema puede detenerse de forma segura, reanudar trabajos y aprender sin almacenar información sensible.
- Dos simulacros completos demuestran restore de PostgreSQL, rollback de aplicación y recuperación del pipeline.

## 16. Primer backlog ejecutable

1. Crear constitución SDD/TDD y matriz de autonomía.
2. Inicializar monorepo y golden paths Next.js/NestJS/CDK/Docker/EKS.
3. Crear plantilla Spec Kit específica para Entra, PostgreSQL, S3 y eventos AWS.
4. Instalar y fijar Superpowers; definir skills permitidos.
5. Seleccionar, auditar y conectar Engram.
6. Implementar contratos OpenAPI y generación de clientes.
7. Implementar autenticación y autorización end-to-end.
8. Implementar persistencia PostgreSQL y estrategia de migraciones.
9. Implementar storage S3 seguro con URLs firmadas.
10. Implementar bus de eventos, idempotencia, retries y DLQ.
11. Construir `.github/workflows/main.yaml`, preview, gates, OIDC, ECR, Kustomize/Argo CD/EKS y entornos protegidos.
12. Construir orquestador multiagente y ciclo Issue-to-PR.
13. Agregar observabilidad, seguridad, costo y kill switch.
14. Ejecutar piloto, medir y promover autonomía por clase de riesgo.

## Referencias base

- [GitHub Spec Kit](https://github.com/github/spec-kit)
- [Metodología SDD de Spec Kit](https://github.com/github/spec-kit/blob/main/spec-driven.md)
- [Superpowers](https://github.com/obra/superpowers)
- [Engram](https://github.com/thebtf/engram)
- [Microsoft Entra External ID](https://learn.microsoft.com/en-us/entra/external-id/customers/faq-customers)
- [AWS CDK v2](https://docs.aws.amazon.com/cdk/v2/guide/awscdk.pdf)
- [AWS Step Functions](https://docs.aws.amazon.com/pdfs/step-functions/latest/dg/step-functions-dg.pdf)
- [OpenAI API y Agents SDK](https://platform.openai.com/docs/quickstart)
