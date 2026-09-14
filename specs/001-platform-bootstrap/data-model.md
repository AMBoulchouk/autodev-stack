# Data model

## WorkflowRun

| Field   | Type                 | Rule                             |
| ------- | -------------------- | -------------------------------- |
| id      | UUID                 | Immutable                        |
| intent  | string               | Required and non-empty           |
| phase   | enum                 | Must follow the transition graph |
| history | WorkflowTransition[] | Append-only                      |

## WorkflowTransition

| Field | Type               | Rule                                  |
| ----- | ------------------ | ------------------------------------- |
| at    | ISO-8601 timestamp | Generated on transition               |
| phase | WorkflowPhase      | Valid successor of the previous phase |

Persistent storage is intentionally deferred until PostgreSQL migrations and retention requirements are specified.
