<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

## Delivery constitution

- Specifications under `specs/` are the source of truth.
- Do not write production behavior before a failing test demonstrates the requirement.
- Follow RED, GREEN and REFACTOR in that order.
- Keep requirement, test, implementation and delivery evidence traceable.
- Never claim a test, review, approval or deployment that did not occur.
- The author cannot approve their own change.
- Production, destructive migrations, IAM changes and material cost increases require human approval.
- Never store credentials, tokens, PII or production payloads in prompts, logs, Git, specs or Engram.
- GitHub Actions publishes immutable ECR images; Git declares desired state; only Argo CD applies it to EKS.
- Use Engram only for durable decisions, conventions and sanitized incident learnings. Canonical artifacts remain in Git.
