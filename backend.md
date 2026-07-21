# FORGEAI — CONTEXTO Y PROMPT PARA BACKEND

## 1. Propósito

Este documento es la fuente de verdad para la persona y la sesión de Codex encargadas del backend de ForgeAI.

ForgeAI será desarrollado por dos personas:

- Desarrollador Backend.
- Desarrollador Frontend.

Ambas personas trabajarán en paralelo, pero no deben modificar los mismos archivos.

El backend será responsable de:

- Integración con GitHub.
- Base de datos.
- Métricas.
- Detección de riesgos.
- Agente de IA.
- Tool calling.
- Streaming.
- Contratos compartidos.
- Endpoints.
- Seguridad.
- Pruebas backend.

El backend no debe implementar interfaces visuales.

---

# 2. Producto

ForgeAI es un Engineering Operations Agent.

Su función es analizar repositorios de software y responder con evidencia:

1. ¿Cómo se encuentra el proyecto?
2. ¿Qué riesgos técnicos existen?
3. ¿Qué debe hacer primero el equipo?
4. ¿Qué Pull Request, Issue o workflow está bloqueando el avance?
5. ¿Qué puede completarse en un periodo determinado?
6. ¿Qué acciones puede preparar o ejecutar el agente?

ForgeAI no es un chatbot genérico.

El agente debe utilizar herramientas internas, consultar información real y ejecutar acciones controladas.

---

# 3. Flujo principal

```text
Usuario registra repositorio
        ↓
Backend valida GitHub
        ↓
Sincroniza Issues, PR, commits y CI
        ↓
Calcula métricas
        ↓
Detecta riesgos
        ↓
Guarda snapshot
        ↓
Usuario pregunta al agente
        ↓
Agente ejecuta tools
        ↓
Devuelve recomendaciones con evidencia
        ↓
Prepara una acción
        ↓
Usuario confirma
        ↓
Backend ejecuta la acción
```

---

# 4. Arquitectura compartida

```text
app/
├── (web)/                      # Frontend
└── api/                        # Backend

components/                     # Frontend

client/                         # Frontend
├── api/
├── hooks/
└── mocks/

server/                         # Backend
├── auth/
├── github/
├── projects/
├── analysis/
├── agent/
├── actions/
├── logging/
└── errors/

shared/
└── contracts/                  # Backend mantiene; frontend consume
    ├── api.ts
    ├── projects.ts
    ├── risks.ts
    ├── sprint.ts
    ├── agent.ts
    ├── actions.ts
    └── index.ts

db/                             # Backend
├── schema/
└── migrations/

tests/
├── backend/
└── frontend/

docs/
└── integration/
```

---

# 5. Stack

Usar primero las dependencias existentes.

Para un proyecto nuevo:

- Next.js 16.
- App Router.
- React 19.
- TypeScript estricto.
- Route Handlers.
- PostgreSQL o Neon.
- Drizzle ORM.
- Zod.
- Octokit.
- OpenAI SDK.
- Responses API.
- Clerk si ya está configurado.
- Vitest o el framework de pruebas existente.

Antes de instalar una dependencia:

1. Revisar `package.json`.
2. Revisar el lockfile.
3. Confirmar que no existe una alternativa instalada.
4. Justificar la instalación.

---

# 6. Organización Git

## 6.1 Rama base

Los dos desarrolladores deben iniciar desde el mismo commit de `main`.

```bash
git checkout main
git pull origin main
```

El proyecto debe tener antes:

- TypeScript configurado.
- Lint configurado.
- Scripts de test y build.
- Estructura inicial.
- Contratos compartidos v1.
- `.env.example`.

## 6.2 Rama backend

```bash
git checkout -b feat/backend-forgeai-mvp
```

## 6.3 Commits

Usar Conventional Commits:

```text
feat(contracts): define API contract v1
feat(github): add repository metadata service
feat(analysis): calculate repository health
feat(agent): add project analysis tools
fix(agent): prevent duplicated tool execution
test(api): add project endpoint contract tests
```

Cada commit debe contener una sola responsabilidad.

---

# 7. Propiedad de archivos

## Backend puede modificar

```text
app/api/**
server/**
db/**
shared/contracts/**
tests/backend/**
drizzle.config.*
.env.example
```

## Backend no puede modificar sin coordinación

```text
app/(web)/**
components/**
client/**
styles/**
public/**
tests/frontend/**
```

## Archivos de alto riesgo

```text
package.json
package-lock.json
pnpm-lock.yaml
yarn.lock
tsconfig.json
next.config.*
middleware.ts
proxy.ts
app/layout.tsx
app/globals.css
```

Para modificar uno de estos archivos:

1. Detener el trabajo relacionado.
2. Crear un commit independiente.
3. Informar al frontend.
4. Integrar el commit en `main`.
5. Ambos desarrolladores actualizan sus ramas.
6. Continuar después.

---

# 8. Fuente de verdad

La fuente de verdad será:

```text
shared/contracts/**
```

Reglas:

- Backend es propietario de los contratos.
- Frontend los importa en modo solo lectura.
- No duplicar interfaces.
- No modificar contratos v1 silenciosamente.
- No renombrar campos ya consumidos.
- No cambiar tipos sin coordinación.
- Todo cambio incompatible crea una versión nueva.
- Los endpoints y mocks deben ajustarse al contrato.

Versión inicial:

```text
API_VERSION=v1
```

---

# 9. Contratos compartidos

## Respuesta estándar

```ts
export type ApiSuccess<T> = {
  ok: true;
  data: T;
  meta?: {
    requestId?: string;
    generatedAt: string;
    stale?: boolean;
    demo?: boolean;
  };
};

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "GITHUB_REPOSITORY_NOT_FOUND"
  | "GITHUB_PRIVATE_REPOSITORY"
  | "GITHUB_RATE_LIMITED"
  | "OPENAI_ERROR"
  | "SYNC_FAILED"
  | "ACTION_EXPIRED"
  | "ACTION_ALREADY_EXECUTED"
  | "INTERNAL_ERROR";

export type ApiFailure = {
  ok: false;
  error: {
    code: ApiErrorCode;
    message: string;
    fieldErrors?: Record<string, string[]>;
    requestId?: string;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
```

## Proyecto

```ts
export type ProjectSummary = {
  id: string;
  githubOwner: string;
  githubRepository: string;
  fullName: string;
  description: string | null;
  defaultBranch: string;
  visibility: "public" | "private";
  primaryLanguage: string | null;
  healthScore: number | null;
  criticalRiskCount: number;
  openIssueCount: number;
  openPullRequestCount: number;
  syncStatus:
    | "idle"
    | "syncing"
    | "ready"
    | "partial"
    | "failed";
  lastSyncedAt: string | null;
  createdAt: string;
};

export type CreateProjectInput = {
  repositoryUrl: string;
};
```

## Evidencia y riesgos

```ts
export type RiskEvidence = {
  type:
    | "issue"
    | "pull_request"
    | "commit"
    | "workflow"
    | "file";
  identifier: string;
  title?: string;
  url?: string;
  detail: string;
};

export type ProjectRisk = {
  id: string;
  category:
    | "delivery"
    | "quality"
    | "security"
    | "collaboration"
    | "documentation"
    | "technical_debt";
  severity:
    | "low"
    | "medium"
    | "high"
    | "critical";
  title: string;
  description: string;
  evidence: RiskEvidence[];
  recommendation: string;
  confidence: number;
  detectedAt: string;
};
```

## Recomendaciones

```ts
export type Recommendation = {
  id: string;
  priority: 1 | 2 | 3 | 4 | 5;
  title: string;
  reason: string;
  estimatedMinutes: number | null;
  evidence: RiskEvidence[];
  suggestedAction:
    | "review_pull_request"
    | "fix_ci"
    | "assign_issue"
    | "update_documentation"
    | "create_issue"
    | "investigate";
};
```

## Overview

```ts
export type HealthFactor = {
  key: string;
  label: string;
  impact: number;
  explanation: string;
};

export type RepositoryMetric = {
  key: string;
  label: string;
  value: number;
  unit?: "count" | "percent" | "score";
  explanation?: string;
  trend?: {
    direction: "up" | "down" | "stable";
    difference: number;
  };
};

export type ActivityItem = {
  id: string;
  type:
    | "commit"
    | "issue"
    | "pull_request"
    | "workflow"
    | "release";
  title: string;
  subtitle?: string;
  actor?: string;
  status?: string;
  url?: string;
  occurredAt: string;
};

export type ProjectOverview = {
  project: ProjectSummary;
  metrics: RepositoryMetric[];
  health: {
    score: number;
    level:
      | "healthy"
      | "attention"
      | "risk"
      | "critical";
    factors: HealthFactor[];
    calculatedAt: string;
  };
  topPriority: Recommendation | null;
  topRisks: ProjectRisk[];
  recentActivity: ActivityItem[];
};
```

## Sprint

```ts
export type SprintPlanRequest = {
  durationMinutes: number;
  objective?: string;
};

export type SprintTask = {
  id: string;
  order: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  reason: string;
  dependencies: string[];
  evidence: RiskEvidence[];
  source:
    | {
        type: "issue";
        number: number;
        url: string;
      }
    | {
        type: "pull_request";
        number: number;
        url: string;
      }
    | {
        type: "generated";
      };
};

export type SprintPlan = {
  id: string;
  objective: string;
  durationMinutes: number;
  allocatedMinutes: number;
  tasks: SprintTask[];
  warnings: string[];
  generatedAt: string;
};
```

## Acciones

```ts
export type PendingAction = {
  id: string;
  type: "create_github_issue";
  status:
    | "pending"
    | "executing"
    | "completed"
    | "cancelled"
    | "expired";
  projectId: string;
  expiresAt: string;
  payload: {
    title: string;
    body: string;
    labels: string[];
    repositoryFullName: string;
  };
  reason: string;
  evidence: RiskEvidence[];
};

export type ExecutedAction = {
  id: string;
  type: "create_github_issue";
  externalId: string;
  externalNumber: number;
  externalUrl: string;
  executedAt: string;
};
```

---

# 10. Streaming del agente

El agente debe responder mediante Server-Sent Events.

```text
Content-Type: text/event-stream
```

Contrato:

```ts
export type AgentStreamEvent =
  | {
      type: "session.started";
      sessionId: string;
      timestamp: string;
    }
  | {
      type: "tool.started";
      toolCallId: string;
      toolName: string;
      label: string;
      timestamp: string;
    }
  | {
      type: "tool.completed";
      toolCallId: string;
      toolName: string;
      summary: string;
      durationMs: number;
      timestamp: string;
    }
  | {
      type: "tool.failed";
      toolCallId: string;
      toolName: string;
      message: string;
      timestamp: string;
    }
  | {
      type: "message.delta";
      delta: string;
      timestamp: string;
    }
  | {
      type: "recommendation";
      recommendation: Recommendation;
      timestamp: string;
    }
  | {
      type: "pending_action";
      action: PendingAction;
      timestamp: string;
    }
  | {
      type: "session.completed";
      sessionId: string;
      timestamp: string;
    }
  | {
      type: "session.error";
      code: ApiErrorCode;
      message: string;
      timestamp: string;
    };
```

Formato SSE:

```text
event: agent
data: {"type":"tool.started",...}

```

Cada evento termina con una línea en blanco.

---

# 11. Endpoints v1

```text
POST   /api/projects
GET    /api/projects
GET    /api/projects/[projectId]
DELETE /api/projects/[projectId]

POST /api/projects/[projectId]/sync
GET  /api/projects/[projectId]/overview
GET  /api/projects/[projectId]/risks
POST /api/projects/[projectId]/sprint

POST /api/projects/[projectId]/agent

POST /api/projects/[projectId]/actions/[actionId]/confirm
POST /api/projects/[projectId]/actions/[actionId]/cancel
```

Request del agente:

```ts
export type AgentRequest = {
  message: string;
  sessionId?: string;
};
```

---

# 12. Herramientas del agente

```text
get_project_overview
get_open_issues
get_pull_requests
get_recent_commits
get_workflow_status
get_project_risks
get_project_health
generate_sprint_plan
generate_standup_report
draft_github_issue
create_github_issue
refresh_project_data
```

Cada tool debe:

- Validar parámetros con Zod.
- Verificar autenticación.
- Verificar propiedad del proyecto.
- Devolver información estructurada.
- Registrar duración.
- Manejar errores.
- Limitar la cantidad de información.
- Ser testeable de forma independiente.

El agente no puede consultar directamente GitHub ni la base de datos.

---

# 13. Reglas del agente

- Nunca inventar Issues, PR, commits o métricas.
- Cada recomendación debe incluir evidencia.
- Las métricas deben calcularse mediante código.
- El LLM interpreta y prioriza.
- No exponer chain-of-thought.
- No mostrar razonamiento privado.
- Registrar herramientas ejecutadas.
- No ejecutar escrituras sin confirmación.
- No declarar una acción exitosa sin confirmación externa.
- Implementar idempotencia.
- Evitar ejecutar la misma acción dos veces.

---

# 14. Base de datos

Tablas mínimas:

```text
projects
repository_snapshots
project_metrics
project_risks
agent_sessions
agent_messages
agent_tool_executions
pending_actions
executed_actions
```

Reglas:

- Cada proyecto pertenece a un usuario.
- El usuario se obtiene desde autenticación.
- No aceptar `ownerId` desde frontend.
- No guardar tokens en texto plano.
- Usar timestamps UTC.
- Crear índices.
- Usar transacciones.
- Las acciones deben tener expiración.

---

# 15. Datos GitHub

Obtener para el MVP:

- Metadata.
- Rama principal.
- Lenguajes.
- Commits.
- Issues.
- Pull Requests.
- Reviews.
- Archivos modificados.
- Workflows.
- Ejecuciones de CI.
- Releases.
- README.
- Árbol limitado.
- `package.json`.

Límites iniciales:

```text
Issues: 50
Pull Requests: 30
Commits: 100
Archivos del árbol: 200
Tamaño por archivo: 100 KB
Archivos enviados al modelo: 10
```

Implementar timeout, paginación, caché y manejo de rate limits.

---

# 16. Riesgos deterministas

Detectar:

1. PR sin revisión.
2. PR antigua.
3. PR con CI fallido.
4. PR demasiado grande.
5. PR que modifican archivos iguales.
6. Issue crítica sin asignar.
7. Issue antigua.
8. Baja actividad.
9. README ausente.
10. TODO, FIXME y HACK.
11. Commits poco descriptivos.
12. Actividad concentrada en una sola persona.

El Health Score debe:

- Empezar en 100.
- Aplicar penalizaciones documentadas.
- Limitarse entre 0 y 100.
- Mostrar el desglose.
- Ser reproducible.
- No llamarse “progreso del proyecto”.

---

# 17. Modo demostración

Variable:

```env
FORGEAI_DEMO_MODE=false
```

El modo demo debe usar fixtures aislados y conservar los mismos contratos.

Datos mínimos:

- PR estancada.
- CI fallido.
- Conflicto potencial.
- Issues críticas.
- Riesgo documental.
- Sprint.
- Acción pendiente.

Toda respuesta demo debe indicar:

```ts
meta: {
  demo: true;
}
```

---

# 18. Fases de implementación

## Fase 0 — Contratos

- Crear `shared/contracts`.
- Crear schemas Zod.
- Exportar tipos.
- Crear fixtures.
- Crear tests de contrato.
- Integrar esta fase temprano en `main`.

## Fase 1 — Base backend

- Estructura.
- Configuración.
- Variables.
- Errores.
- Logger.
- Base de datos.
- Migraciones.

## Fase 2 — GitHub read-only

- Parser de URL.
- Cliente.
- Metadata.
- Issues.
- PR.
- Commits.
- Workflows.
- Tests.

## Fase 3 — Sincronización

- Snapshots.
- Persistencia.
- Endpoints de proyectos.
- Endpoint de sincronización.

## Fase 4 — Análisis

- Métricas.
- Health Score.
- Riesgos.
- Overview.
- Sprint Planner.

## Fase 5 — Agente

- Responses API.
- Tools.
- Tool executor.
- SSE.
- Evidencia.
- Registro de ejecuciones.

## Fase 6 — Acciones

- Borrador.
- Confirmación.
- Creación de Issue.
- Idempotencia.
- Auditoría.

## Fase 7 — Integración

- Contract tests.
- Smoke tests.
- Documentación.
- Demo mode.
- Build final.

Solo implementar una fase por solicitud.

---

# 19. Protocolo de entrega al frontend

Por cada endpoint terminado:

```md
## Endpoint entregado

Ruta:
Método:
Commit:
Estado:

### Request

### Respuesta exitosa

### Errores posibles

### Ejemplo real

### Comando de prueba
```

No declarar un endpoint listo sin ejecutar:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Usar los scripts equivalentes existentes.

---

# 20. Prompt principal para Codex

```text
Lee completamente BACKEND_CODEX.md y úsalo como fuente de verdad.

Actúa como Principal Backend Engineer responsable de ForgeAI.

No escribas código todavía.

Primero:

1. Inspecciona el repositorio.
2. Identifica el stack existente.
3. Identifica las convenciones.
4. Verifica la propiedad de carpetas.
5. Revisa shared/contracts.
6. Detecta inconsistencias.
7. Resume la arquitectura.
8. Propón un plan por fases.
9. Enumera los archivos que modificarías en la primera fase.
10. Explica los riesgos de integración.
11. Espera mi aprobación.

Reglas permanentes:

- No modificar carpetas del frontend.
- No inventar contratos.
- No cambiar v1 sin aprobación.
- Implementar una fase por vez.
- Ejecutar lint, typecheck, tests y build.
- No declarar una tarea lista sin verificarla.
```

---

# 21. Prompt para ejecutar una fase

```text
Lee BACKEND_CODEX.md y revisa el estado actual del repositorio.

Implementa únicamente la Fase [NÚMERO Y NOMBRE].

Antes de empezar, enumera los archivos que modificarás.

No modifiques frontend.
No cambies el contrato v1.

Si detectas que el contrato debe cambiar:
1. Detente.
2. Explica el problema.
3. Propón una migración compatible.
4. Espera aprobación.

Al finalizar:

- Ejecuta lint.
- Ejecuta typecheck.
- Ejecuta tests.
- Ejecuta build.
- Resume los archivos modificados.
- Enumera endpoints entregados.
- Registra riesgos pendientes.
- Sugiere el siguiente paso sin implementarlo.
```

---

# 22. Prompt para errores de integración

```text
Analiza el error de integración sin modificar código.

Compara:

- shared/contracts;
- schema Zod;
- payload real;
- fixture frontend;
- cliente API;
- test fallido.

Identifica una única causa raíz.

Propón el cambio mínimo compatible.

No agregues adaptadores duplicados ni propiedades opcionales para ocultar errores.

Espera aprobación antes de modificar contratos.
```

---

# 23. Checklist Pull Request

- [ ] Lint pasa.
- [ ] Typecheck pasa.
- [ ] Tests pasan.
- [ ] Build pasa.
- [ ] No existen secretos.
- [ ] No se modificaron carpetas frontend.
- [ ] Los contratos son compatibles.
- [ ] Las migraciones funcionan.
- [ ] Los endpoints tienen tests.
- [ ] Los errores siguen `ApiFailure`.
- [ ] La rama está actualizada.
- [ ] Los commits son pequeños.

---

# 24. Definición de terminado

El backend está terminado cuando:

- Registra repositorio.
- Sincroniza GitHub.
- Guarda snapshots.
- Calcula Health Score.
- Detecta riesgos.
- Entrega overview.
- Genera sprint.
- Ejecuta tools.
- Transmite SSE.
- Prepara acciones.
- Confirma acciones.
- Maneja errores.
- Pasa lint, tests, typecheck y build.

Mantener el estado en:

```text
docs/integration/BACKEND_PROGRESS.md
```
