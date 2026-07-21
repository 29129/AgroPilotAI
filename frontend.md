# FORGEAI — CONTEXTO Y PROMPT PARA FRONTEND

## 1. Propósito

Este documento es la fuente de verdad para la persona y la sesión de Codex responsables del frontend de ForgeAI.

El frontend será desarrollado en paralelo con el backend.

Debe avanzar usando contratos compartidos y mocks tipados, sin esperar a que todos los endpoints estén terminados.

El frontend será responsable de:

- Landing.
- Dashboard.
- Conectar repositorios.
- Centro de operaciones.
- Health Score.
- Riesgos.
- Evidencias.
- Sprint Planner.
- Workspace del agente.
- Streaming SSE.
- Confirmación de acciones.
- Responsive.
- Accesibilidad.
- Pruebas frontend.

No debe implementar lógica de negocio del backend.

---

# 2. Producto

ForgeAI es un Engineering Operations Agent.

La interfaz debe permitir comprender rápidamente:

1. Cómo está el repositorio.
2. Qué riesgo necesita atención.
3. Qué tarea debe ejecutarse primero.
4. Qué herramientas está usando el agente.
5. Qué acción necesita confirmación.

La interfaz no debe sentirse como ChatGPT.

Debe sentirse como un centro de operaciones técnico.

---

# 3. Flujo de usuario

```text
Landing
   ↓
Conectar repositorio
   ↓
Sincronización
   ↓
Centro de operaciones
   ↓
Health Score y riesgos
   ↓
Pregunta al agente
   ↓
Actividad de tools
   ↓
Recomendación
   ↓
Sprint
   ↓
Acción pendiente
   ↓
Confirmación
```

La demo debe poder completarse en menos de tres minutos.

---

# 4. Arquitectura

```text
app/
├── (web)/                      # Frontend
│   ├── page.tsx
│   ├── dashboard/
│   ├── projects/
│   └── settings/
└── api/                        # Backend: no modificar

components/
├── ui/
├── layout/
├── projects/
├── dashboard/
├── risks/
├── sprint/
├── agent/
└── feedback/

client/
├── api/
│   ├── forgeai-client.ts
│   └── sse-client.ts
├── hooks/
└── mocks/
    ├── fixtures.ts
    └── handlers.ts

server/                         # Backend: no modificar

shared/
└── contracts/                  # Backend: solo importar

db/                             # Backend: no modificar

tests/
└── frontend/
```

---

# 5. Stack

Respetar primero el stack instalado.

Para proyecto nuevo:

- Next.js 16.
- React 19.
- TypeScript estricto.
- App Router.
- CSS existente o Tailwind si está configurado.
- Lucide Icons.
- Recharts solo cuando sea necesario.
- Zod.
- Testing Library.
- Vitest o herramienta existente.

No instalar una librería por cada componente.

---

# 6. Organización Git

La rama debe crearse después de que los contratos v1 estén integrados en `main`.

```bash
git checkout main
git pull origin main
git checkout -b feat/frontend-forgeai-mvp
```

Commits sugeridos:

```text
feat(ui): add application shell
feat(projects): add repository connection flow
feat(dashboard): add project health overview
feat(agent): consume SSE activity events
feat(actions): add issue confirmation flow
test(agent): validate streaming state reducer
```

---

# 7. Propiedad de archivos

## Frontend puede modificar

```text
app/(web)/**
components/**
client/**
styles/**
public/**
tests/frontend/**
```

## Frontend no puede modificar

```text
app/api/**
server/**
db/**
shared/contracts/**
tests/backend/**
```

## Archivos de alto riesgo

```text
package.json
lockfiles
tsconfig.json
next.config.*
middleware.ts
proxy.ts
app/layout.tsx
app/globals.css
```

Para cambiar uno:

1. Crear propuesta.
2. Hacer commit aislado.
3. Coordinar integración en `main`.
4. Actualizar ambas ramas.
5. Continuar.

---

# 8. Contratos compartidos

Todos los tipos se importan desde:

```ts
import type {
  ApiResponse,
  ProjectSummary,
  ProjectOverview,
  ProjectRisk,
  Recommendation,
  SprintPlan,
  AgentStreamEvent,
  PendingAction,
  ExecutedAction,
} from "@/shared/contracts";
```

Reglas:

- No duplicar interfaces.
- No inventar campos.
- No cambiar contratos.
- No volver opcional un campo solo para evitar un error.
- No calcular métricas del backend.
- No calcular Health Score.
- No ordenar prioridades mediante lógica local.
- No determinar severidad.
- No marcar una acción completada sin respuesta del backend.

---

# 9. Endpoints esperados

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

---

# 10. Cliente API único

Todo acceso HTTP debe pasar por:

```text
client/api/forgeai-client.ts
```

Funciones:

```ts
listProjects()
createProject(input)
getProject(projectId)
deleteProject(projectId)
syncProject(projectId)
getProjectOverview(projectId)
getProjectRisks(projectId)
generateSprint(projectId, input)
confirmAction(projectId, actionId)
cancelAction(projectId, actionId)
```

Responsabilidades:

- Construir rutas.
- Enviar headers.
- Parsear `ApiResponse`.
- Convertir errores.
- Aceptar AbortSignal.
- Validar respuestas.
- No mostrar toasts.
- No contener componentes.
- No contener mocks.

No hacer `fetch` directamente dentro de componentes.

---

# 11. Cliente SSE

Archivo:

```text
client/api/sse-client.ts
```

Interfaz sugerida:

```ts
streamAgentResponse({
  projectId,
  message,
  sessionId,
  signal,
  onEvent,
}): Promise<void>
```

Debe:

- Consumir `text/event-stream`.
- Validar `AgentStreamEvent`.
- Acumular `message.delta`.
- Procesar tools.
- Evitar eventos duplicados.
- Permitir cancelación.
- Cerrar con `session.completed`.
- Manejar `session.error`.
- Manejar desconexión.
- No reconstruir razonamiento interno.

---

# 12. Mocks tipados

Variable:

```env
NEXT_PUBLIC_USE_MOCK_API=true
```

Cuando esté activa:

- Usar fixtures.
- Mantener las mismas rutas.
- Mantener los mismos payloads.
- Emitir los mismos eventos SSE.
- Importar contratos compartidos.
- No mezclar datos mock con reales.

Fixtures mínimos:

```text
project-healthy
project-at-risk
project-syncing
project-failed
overview-default
risks-default
sprint-four-hours
agent-stream-priority
pending-create-issue
executed-create-issue
```

Secuencia mock:

```text
session.started
tool.started
tool.completed
tool.started
tool.completed
message.delta
message.delta
recommendation
pending_action
session.completed
```

Centralizar los tiempos simulados. No colocar `setTimeout` por toda la UI.

---

# 13. Diseño

ForgeAI debe transmitir:

- Precisión.
- Control.
- Confianza.
- Claridad.
- Inteligencia técnica.

Paleta:

```css
:root {
  --background: #f3f4f6;
  --surface: #ffffff;
  --surface-secondary: #e5e7eb;
  --text-primary: #2f2f2f;
  --text-secondary: #4b5563;
  --border: #d1d5db;
  --accent: #dc2626;
  --accent-hover: #b91c1c;
  --critical: #991b1b;
  --success: #166534;
  --warning: #b45309;
}

[data-theme="dark"] {
  --background: #0b0d10;
  --surface: #14171c;
  --surface-secondary: #1d2128;
  --text-primary: #f3f4f6;
  --text-secondary: #9ca3af;
  --border: #2f3540;
}
```

Composición:

- 60 % gris.
- 30 % negro.
- 10 % rojo.

El rojo se reserva para CTA, riesgos y estado activo.

Evitar:

- Gradientes excesivos.
- Glassmorphism exagerado.
- Neón.
- Animaciones decorativas.
- Pantallas saturadas.

---

# 14. Rutas

```text
/
  Landing

/dashboard
  Proyectos

/projects/new
  Conectar repositorio

/projects/[projectId]
  Centro de operaciones

/projects/[projectId]/agent
  Workspace del agente

/settings
  Preferencias
```

El centro de operaciones puede usar pestañas:

```text
Overview
Risks
Sprint
Activity
Agent
```

---

# 15. Landing

Título:

```text
Tu proyecto tiene datos. ForgeAI los convierte en decisiones.
```

Subtítulo:

```text
Un agente de operaciones de ingeniería que analiza Issues, Pull Requests, commits y CI para detectar riesgos y priorizar el trabajo.
```

CTA principal:

```text
Analizar repositorio
```

CTA secundario:

```text
Ver demostración
```

No dedicar demasiado tiempo a la landing.

---

# 16. Dashboard

Debe mostrar:

- Repositorios conectados.
- Health Score.
- Riesgos críticos.
- Issues abiertas.
- PR abiertas.
- Estado de sincronización.
- Última sincronización.

Componentes:

```text
ProjectGrid
ProjectCard
ProjectCardMenu
HealthBadge
SyncStatus
EmptyProjects
```

Estados:

```text
loading
empty
syncing
ready
partial
failed
rate-limited
unauthorized
```

---

# 17. Conectar repositorio

Componente:

```text
ConnectRepositoryForm
```

Campo:

```text
https://github.com/owner/repository
```

Flujo:

1. Validación local básica.
2. Envío al backend.
3. Validación real.
4. Previsualización.
5. Confirmación.
6. Creación.
7. Sincronización.
8. Navegación.

No afirmar que el repositorio existe antes de recibir respuesta.

---

# 18. Centro de operaciones

## Header

- Repositorio.
- Owner.
- Rama principal.
- Última sincronización.
- Estado.
- Botón sincronizar.
- Botón preguntar.

## Métricas

- Health Score.
- Riesgos críticos.
- PR abiertas.
- Issues abiertas.
- CI.

## Prioridad

Mostrar:

- Título.
- Razón.
- Tiempo estimado.
- Evidencia.
- Acción sugerida.

## Riesgos

Mostrar de tres a cinco riesgos.

## Actividad

Mostrar commits, PR, Issues, workflows y releases.

---

# 19. Health Score

Componente:

```text
ProjectHealthScore
```

Mostrar:

- Puntuación.
- Nivel.
- Tendencia.
- Factores.
- Fecha.

No llamarlo progreso.

Ejemplo:

```text
-15 por CI fallido
-10 por riesgo crítico
-5 por PR antigua
+8 por actividad reciente
```

Frontend no calcula estos valores.

---

# 20. Riesgos

Componentes:

```text
RiskList
RiskCard
RiskSeverityBadge
RiskDetailDrawer
EvidenceList
RiskFilters
```

Mostrar:

- Severidad.
- Categoría.
- Título.
- Descripción.
- Evidencia.
- Recomendación.
- Confianza.
- Fecha.

Orden:

```text
critical
high
medium
low
```

La evidencia debe enlazar a GitHub cuando tenga URL.

---

# 21. Workspace del agente

No crear una copia de ChatGPT.

```text
AgentWorkspace
├── ProjectContextPanel
├── AgentConversation
├── AgentActivity
├── RecommendationPanel
└── PendingActionsPanel
```

Componentes:

```text
AgentMessage
AgentComposer
PromptSuggestion
ToolExecutionItem
EvidenceReference
RecommendationCard
PendingActionCard
ConfirmationDialog
```

Prompts sugeridos:

```text
¿Cuál es el mayor riesgo?
¿Qué debería hacer primero el equipo?
Planifica un sprint de cuatro horas.
Resume el trabajo de esta semana.
¿Qué Pull Request debemos revisar primero?
```

---

# 22. Actividad del agente

No mostrar chain-of-thought.

Mostrar eventos verificables:

```text
Consultando 18 Issues
Revisando 6 Pull Requests
Comprobando workflows
Calculando salud
Analizando riesgos
Generando recomendación
```

Estados:

```text
pending
running
completed
failed
```

Ejemplo:

```text
✓ Pull Requests revisadas
6 PR, 2 sin revisión y 1 con CI fallido
```

---

# 23. Estado del streaming

```ts
export type AgentUIState = {
  sessionId: string | null;
  status:
    | "idle"
    | "connecting"
    | "streaming"
    | "completed"
    | "error";
  text: string;
  tools: Array<{
    id: string;
    name: string;
    label: string;
    status:
      | "running"
      | "completed"
      | "failed";
    summary?: string;
    durationMs?: number;
  }>;
  recommendations: Recommendation[];
  pendingActions: PendingAction[];
  error: string | null;
};
```

Usar un reducer o estado centralizado para el workspace.

No permitir dos streams simultáneos.

---

# 24. Sprint Planner

Permitir:

```text
4 horas
1 día
3 días
1 semana
Personalizado
```

Componentes:

```text
TimeBudgetSelector
SprintSummary
SprintTaskList
SprintTaskCard
DependencyIndicator
SprintWarnings
```

Mostrar:

- Objetivo.
- Tiempo.
- Tareas.
- Orden.
- Dependencias.
- Evidencia.
- Motivo.
- Advertencias.

No crear un clon completo de Jira.

---

# 25. Acciones confirmables

Para crear una Issue mostrar:

```text
Nueva Issue propuesta

Título
Descripción
Labels
Repositorio
Motivo
Evidencia
```

Botones:

```text
Editar
Cancelar
Confirmar y crear
```

Reglas:

- No ejecutar al abrir.
- Deshabilitar durante envío.
- Evitar doble click.
- Esperar backend.
- Mostrar URL real al terminar.
- No perder el borrador ante error.
- Manejar acción expirada.

---

# 26. Responsive

Revisar:

```text
375px
768px
1024px
1440px
```

Móvil:

- Sidebar colapsada.
- Una columna.
- Tablas convertidas en cards.
- Agente a pantalla completa.
- Sin scroll horizontal.
- Acciones importantes visibles.

---

# 27. Accesibilidad

- Navegación por teclado.
- Focus visible.
- Labels.
- Contraste.
- Diálogos accesibles.
- Errores asociados a campos.
- `aria-live` para streaming.
- `prefers-reduced-motion`.
- No comunicar estado solo con color.

---

# 28. Estados obligatorios

```text
loading
empty
success
partial
error
unauthorized
rate-limited
offline
syncing
stale
```

Usar skeletons locales, no un spinner global.

---

# 29. Fases de implementación

## Fase 0 — Preparación

- Importar contratos.
- Cliente API.
- Cliente SSE.
- Mocks.
- Fixtures.
- Tests de cliente.

## Fase 1 — Sistema visual

- Tokens.
- Layout.
- Sidebar.
- Header.
- Componentes UI mínimos.

## Fase 2 — Proyectos

- Dashboard.
- ProjectCard.
- Empty state.
- Conectar repositorio.
- Sincronización.

## Fase 3 — Overview

- Métricas.
- Health Score.
- Prioridad.
- Actividad.
- Riesgos principales.

## Fase 4 — Riesgos

- Listado.
- Filtros.
- Drawer.
- Evidencia.

## Fase 5 — Agente

- Workspace.
- Composer.
- SSE.
- Tools.
- Recomendaciones.

## Fase 6 — Sprint

- Selector.
- Plan.
- Tareas.
- Dependencias.

## Fase 7 — Acciones

- Acción pendiente.
- Confirmación.
- Resultado.
- Errores.

## Fase 8 — Calidad

- Responsive.
- Accesibilidad.
- Tests.
- API real.
- Demo mode.

Solo implementar una fase por solicitud.

---

# 30. Integración progresiva

## Integración 1

Después de contratos:

- Importar tipos reales.
- Validar fixtures.
- Ejecutar typecheck.

## Integración 2

Después de proyectos:

- Desactivar mocks solo para proyectos.
- Probar listado y creación.

## Integración 3

Después de overview:

- Usar datos reales.
- Comparar con fixtures.
- Corregir el cliente API, no cada componente.

## Integración 4

Después del agente:

- Probar SSE.
- Probar orden de eventos.
- Probar cancelación.
- Probar fallo de tool.

## Integración 5

Después de acciones:

- Probar borrador.
- Confirmar.
- Evitar doble envío.
- Mostrar URL real.

---

# 31. Prompt principal para Codex

```text
Lee completamente FRONTEND_CODEX.md y úsalo como fuente de verdad.

Actúa como Principal Frontend Engineer y Product Designer responsable de ForgeAI.

No escribas código todavía.

Primero:

1. Inspecciona el repositorio.
2. Identifica stack, rutas y estilos.
3. Revisa shared/contracts.
4. Confirma la propiedad de carpetas.
5. Detecta archivos que no puedes modificar.
6. Resume la arquitectura.
7. Propón mapa de pantallas.
8. Propón jerarquía de componentes.
9. Explica el flujo de datos desde client/api.
10. Explica la estrategia de mocks.
11. Divide el trabajo en fases.
12. Enumera los archivos de la primera fase.
13. Espera mi aprobación.

Reglas permanentes:

- No modificar app/api.
- No modificar server.
- No modificar db.
- No modificar shared/contracts.
- No duplicar tipos.
- No hacer fetch en componentes.
- No mostrar chain-of-thought.
- No simular acciones completadas.
- Implementar una fase por vez.
- Ejecutar lint, typecheck, tests y build.
```

---

# 32. Prompt para implementar una fase

```text
Lee FRONTEND_CODEX.md y el estado actual del repositorio.

Implementa únicamente la Fase [NÚMERO Y NOMBRE].

Antes de comenzar, enumera los archivos que modificarás.

No modifiques archivos backend.
No modifiques contratos.
Usa client/api.
Mantén compatibilidad entre mock y API real.

Al finalizar:

- Ejecuta lint.
- Ejecuta typecheck.
- Ejecuta tests.
- Ejecuta build.
- Resume archivos modificados.
- Enumera estados implementados.
- Indica dependencias pendientes del backend.
- Sugiere el siguiente paso sin implementarlo.
```

---

# 33. Prompt para integrar endpoint

```text
Integra únicamente el endpoint [RUTA].

Antes de modificar:

1. Revisa shared/contracts.
2. Revisa el ejemplo real.
3. Revisa el fixture.
4. Revisa el cliente API.
5. Identifica diferencias.

No cambies componentes si puede resolverse en client/api.
No modifiques contratos.

Al finalizar ejecuta tests del cliente, typecheck y build.
```

---

# 34. Prompt para resolver incompatibilidad

```text
Analiza el conflicto sin modificar código.

Compara:

- shared/contracts;
- cliente API;
- fixture;
- componente;
- payload real;
- test fallido.

Identifica una causa raíz.

Propón el cambio mínimo compatible.

No agregues propiedades opcionales para ocultar errores.
No modifiques shared/contracts.
Espera aprobación.
```

---

# 35. Checklist Pull Request

- [ ] Lint pasa.
- [ ] Typecheck pasa.
- [ ] Tests pasan.
- [ ] Build pasa.
- [ ] No se modificó backend.
- [ ] No se modificaron contratos.
- [ ] No hay tipos duplicados.
- [ ] Todo HTTP usa el cliente API.
- [ ] Los mocks respetan el contrato.
- [ ] Existen estados de error.
- [ ] Streaming cancelable.
- [ ] Responsive probado.
- [ ] Acciones requieren confirmación.
- [ ] Rama actualizada.

---

# 36. Definición de terminado

Frontend listo cuando:

- Conecta un repositorio.
- Muestra sincronización.
- Presenta overview.
- Explica Health Score.
- Muestra riesgos y evidencia.
- Consume SSE.
- Muestra tools.
- Presenta recomendaciones.
- Genera sprint.
- Confirma acciones.
- Funciona con mock y API real.
- Funciona en móvil.
- Pasa lint, typecheck, tests y build.

Mantener progreso en:

```text
docs/integration/FRONTEND_PROGRESS.md
```
