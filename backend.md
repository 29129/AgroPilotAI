# AgroPilot AI — Guía y prompt de implementación del backend

## 1. Objetivo del documento

Este archivo define el contexto, las responsabilidades, el contrato de integración y el orden de trabajo para la persona encargada del backend de **AgroPilot AI**.

El objetivo principal es permitir que el backend y el frontend se desarrollen en paralelo sin depender de implementaciones internas entre sí y sin generar conflictos al integrar ambos proyectos.

La regla principal es la siguiente:

> El backend puede cambiar internamente, pero no debe modificar el contrato de la API sin actualizar primero el archivo compartido `API_CONTRACT.md` y comunicar el cambio al responsable del frontend.

---

## 2. Contexto del proyecto

**AgroPilot AI** es una plataforma de apoyo para pequeños y medianos productores agrícolas. Su propósito es reunir información del cultivo, clima, suelo, recursos y mercado para generar recomendaciones explicables y planes de acción.

La plataforma utiliza una arquitectura multiagente compuesta por:

- Agente climático.
- Agente de cultivo y sanidad vegetal.
- Agente de recursos, riego y fertilización.
- Agente de mercado.
- Agente orquestador.

El sistema no debe presentarse como un simple chatbot. Debe actuar como una herramienta de apoyo a decisiones agrícolas, con evidencia, trazabilidad y aprobación humana antes de ejecutar acciones importantes.

---

## 3. Alcance del backend

El backend será responsable de:

1. Autenticación y autorización.
2. Gestión de usuarios y perfiles agrícolas.
3. Gestión de fincas, parcelas y cultivos.
4. Recepción y almacenamiento de imágenes del cultivo.
5. Integración con servicios externos de clima y mercado.
6. Ejecución de los agentes especializados.
7. Orquestación de recomendaciones.
8. Generación de planes semanales.
9. Registro de evidencias, fuentes y explicaciones.
10. Persistencia de conversaciones y memoria útil.
11. Notificaciones y alertas.
12. Exposición de una API estable para el frontend.

El backend no debe incluir componentes visuales ni asumir detalles internos del frontend.

---

## 4. Stack recomendado

El responsable puede adaptar tecnologías si el equipo ya tiene una base creada, pero se recomienda:

- Node.js 20 o superior.
- TypeScript.
- NestJS o Express con arquitectura modular.
- PostgreSQL.
- Prisma ORM.
- JWT o proveedor de autenticación acordado.
- Zod, Joi o class-validator para validación.
- Swagger/OpenAPI para documentar la API.
- Servicio compatible con almacenamiento S3 para imágenes.
- Redis opcional para caché, colas o sesiones.
- Vitest o Jest para pruebas.

---

## 5. Arquitectura interna sugerida

```text
src/
├── config/
├── common/
│   ├── errors/
│   ├── guards/
│   ├── middleware/
│   ├── types/
│   └── utils/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── farms/
│   ├── plots/
│   ├── crops/
│   ├── diagnoses/
│   ├── climate/
│   ├── resources/
│   ├── market/
│   ├── recommendations/
│   ├── plans/
│   ├── conversations/
│   └── notifications/
├── agents/
│   ├── climate-agent/
│   ├── crop-agent/
│   ├── resource-agent/
│   ├── market-agent/
│   └── orchestrator/
├── integrations/
├── database/
├── jobs/
├── app.ts
└── server.ts
```

Cada módulo debe mantener separadas las capas de controlador, servicio, repositorio, validación y tipos.

---

## 6. Entidades mínimas

### User

```ts
interface User {
  id: string;
  name: string;
  email: string;
  role: "PRODUCER" | "TECHNICIAN" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}
```

### Farm

```ts
interface Farm {
  id: string;
  ownerId: string;
  name: string;
  province: string;
  canton: string;
  latitude?: number;
  longitude?: number;
  totalAreaHa?: number;
  createdAt: string;
  updatedAt: string;
}
```

### Plot

```ts
interface Plot {
  id: string;
  farmId: string;
  name: string;
  areaHa?: number;
  soilType?: string;
  irrigationType?: string;
}
```

### Crop

```ts
interface Crop {
  id: string;
  plotId: string;
  cropType: string;
  variety?: string;
  sowingDate?: string;
  expectedHarvestDate?: string;
  growthStage?: string;
  status: "ACTIVE" | "HARVESTED" | "CANCELLED";
}
```

### Recommendation

```ts
interface Recommendation {
  id: string;
  cropId: string;
  category: "CLIMATE" | "HEALTH" | "IRRIGATION" | "NUTRITION" | "MARKET";
  title: string;
  summary: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  confidence: number;
  explanation: string;
  evidence: Evidence[];
  actions: RecommendedAction[];
  requiresApproval: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  createdAt: string;
}
```

### Evidence

```ts
interface Evidence {
  type: "WEATHER" | "IMAGE" | "SOIL" | "MARKET" | "USER_INPUT";
  label: string;
  value: string | number;
  source?: string;
  observedAt?: string;
}
```

### WeeklyPlan

```ts
interface WeeklyPlan {
  id: string;
  cropId: string;
  weekStart: string;
  weekEnd: string;
  summary: string;
  tasks: PlanTask[];
  generatedAt: string;
}
```

---

## 7. Contrato de integración

El backend debe usar el prefijo:

```text
/api/v1
```

Formato de respuesta exitosa:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "uuid"
  }
}
```

Formato de error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Los datos enviados no son válidos.",
    "details": {}
  },
  "meta": {
    "requestId": "uuid"
  }
}
```

Reglas obligatorias:

- Las fechas deben enviarse en ISO 8601.
- Los identificadores deben ser UUID o CUID, pero se debe elegir un solo formato.
- Los nombres de propiedades deben usar `camelCase`.
- No se deben devolver errores internos, consultas SQL ni claves privadas.
- Los endpoints paginados deben aceptar `page`, `limit`, `sortBy` y `sortOrder`.
- La API debe mantener compatibilidad con el contrato acordado.

---

## 8. Endpoints mínimos

### Autenticación

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
```

### Fincas y parcelas

```text
GET    /api/v1/farms
POST   /api/v1/farms
GET    /api/v1/farms/:farmId
PATCH  /api/v1/farms/:farmId
DELETE /api/v1/farms/:farmId

GET    /api/v1/farms/:farmId/plots
POST   /api/v1/farms/:farmId/plots
PATCH  /api/v1/plots/:plotId
DELETE /api/v1/plots/:plotId
```

### Cultivos

```text
GET    /api/v1/crops
POST   /api/v1/crops
GET    /api/v1/crops/:cropId
PATCH  /api/v1/crops/:cropId
DELETE /api/v1/crops/:cropId
```

### Diagnóstico por imagen

```text
POST   /api/v1/crops/:cropId/diagnoses
GET    /api/v1/crops/:cropId/diagnoses
GET    /api/v1/diagnoses/:diagnosisId
```

El endpoint de creación puede recibir `multipart/form-data`.

### Recomendaciones y agentes

```text
POST   /api/v1/crops/:cropId/analysis
GET    /api/v1/crops/:cropId/recommendations
GET    /api/v1/recommendations/:recommendationId
POST   /api/v1/recommendations/:recommendationId/approve
POST   /api/v1/recommendations/:recommendationId/reject
POST   /api/v1/recommendations/:recommendationId/complete
```

### Plan semanal

```text
POST   /api/v1/crops/:cropId/weekly-plans/generate
GET    /api/v1/crops/:cropId/weekly-plans/current
GET    /api/v1/weekly-plans/:planId
```

### Mercado y clima

```text
GET    /api/v1/crops/:cropId/weather
GET    /api/v1/market/prices?product=cacao&province=Manabi
```

### Conversaciones

```text
POST   /api/v1/conversations
GET    /api/v1/conversations
GET    /api/v1/conversations/:conversationId
POST   /api/v1/conversations/:conversationId/messages
```

---

## 9. Contrato del análisis multiagente

Solicitud:

```json
{
  "analysisType": "FULL",
  "include": ["CLIMATE", "HEALTH", "IRRIGATION", "MARKET"],
  "userContext": {
    "currentConcern": "Aparecieron manchas amarillas en varias hojas"
  }
}
```

Respuesta:

```json
{
  "success": true,
  "data": {
    "analysisId": "uuid",
    "status": "COMPLETED",
    "summary": "Se detectó riesgo moderado de estrés hídrico y posible deficiencia nutricional.",
    "recommendations": [],
    "agentResults": [
      {
        "agent": "CLIMATE",
        "status": "COMPLETED",
        "summary": "Se esperan cinco días con baja precipitación.",
        "confidence": 0.91
      }
    ],
    "generatedAt": "2026-07-21T16:00:00.000Z"
  },
  "meta": {
    "requestId": "uuid"
  }
}
```

El sistema debe diferenciar claramente entre:

- Dato observado.
- Inferencia de la IA.
- Recomendación.
- Acción que necesita aprobación.

---

## 10. Flujo de trabajo ordenado

### Fase 1 — Preparación

1. Crear rama `backend/develop` desde `develop`.
2. Crear estructura base.
3. Configurar variables de entorno.
4. Configurar base de datos y migraciones.
5. Publicar Swagger.
6. Crear `env.example` sin secretos.

### Fase 2 — Contrato antes de lógica

1. Definir DTO y esquemas de respuesta.
2. Implementar temporalmente respuestas mock.
3. Verificar que el frontend pueda consumir los endpoints.
4. Congelar la versión inicial del contrato.

### Fase 3 — Funcionalidades base

1. Autenticación.
2. Usuarios.
3. Fincas.
4. Parcelas.
5. Cultivos.
6. Carga de imágenes.

### Fase 4 — Inteligencia y agentes

1. Agente climático.
2. Agente de cultivo.
3. Agente de recursos.
4. Agente de mercado.
5. Agente orquestador.
6. Recomendaciones explicables.
7. Plan semanal.

### Fase 5 — Calidad

1. Pruebas unitarias.
2. Pruebas de integración.
3. Validación de permisos.
4. Manejo de errores.
5. Rate limiting.
6. Logs sin datos sensibles.
7. Documentación de despliegue.

---

## 11. Reglas para trabajar sin conflictos

- No modificar archivos del frontend.
- No renombrar endpoints unilateralmente.
- No cambiar estructuras JSON sin actualizar el contrato.
- No incluir secretos en Git.
- No subir archivos de entorno reales.
- Crear una rama por funcionalidad:

```text
backend/feature-auth
backend/feature-farms
backend/feature-agents
backend/fix-analysis-response
```

- Realizar commits pequeños y descriptivos.
- Ejecutar migraciones versionadas.
- No editar migraciones que ya fueron compartidas; crear una nueva.
- Mantener Swagger actualizado.
- Incluir ejemplos reales de request y response.

---

## 12. Criterios de aceptación del backend

El backend se considera integrable cuando:

- Inicia con un solo comando documentado.
- Incluye `env.example`.
- Las migraciones se ejecutan correctamente.
- Swagger funciona.
- Todos los endpoints acordados responden con el formato estándar.
- CORS permite el origen del frontend configurado por variable de entorno.
- Las respuestas no contienen secretos.
- Los errores usan códigos estables.
- Las funciones críticas poseen pruebas.
- El análisis multiagente puede ser consumido sin lógica adicional en el frontend.

---

## 13. Prompt para Codex — Backend

```text
Actúa como arquitecto backend senior y desarrollador TypeScript especializado en sistemas de IA multiagente.

Debes implementar el backend de AgroPilot AI siguiendo estrictamente este documento.

Objetivo del producto:
AgroPilot AI ayuda a pequeños y medianos productores agrícolas a gestionar fincas, parcelas y cultivos, analizar riesgos, consultar clima y mercado, diagnosticar problemas mediante imágenes y recibir recomendaciones explicables mediante un sistema multiagente.

Responsabilidades:
- Construir únicamente el backend.
- Mantener una arquitectura modular, escalable y testeable.
- Exponer una API REST versionada bajo /api/v1.
- Mantener los formatos de respuesta y error definidos en este documento.
- Implementar autenticación, autorización, validación, persistencia y documentación OpenAPI.
- Separar controladores, servicios, repositorios, DTO, validadores e integraciones.
- Implementar agentes climático, de cultivo, recursos y mercado, coordinados por un agente orquestador.
- Registrar evidencia, nivel de confianza, explicación y acciones recomendadas.
- Exigir aprobación humana para acciones sensibles.

Reglas de integración:
1. No modifiques ningún archivo del frontend.
2. No cambies nombres de endpoints, campos o estructuras JSON sin actualizar primero API_CONTRACT.md.
3. No expongas secretos, errores internos, prompts privados ni consultas SQL.
4. Usa fechas ISO 8601 y propiedades camelCase.
5. Documenta cada endpoint con ejemplos de request y response.
6. Agrega env.example sin valores sensibles.
7. Añade pruebas unitarias y de integración para los flujos críticos.
8. Antes de implementar una función, revisa si ya existe para evitar duplicados.
9. Evita archivos excesivamente grandes; divide por responsabilidad.
10. No reescribas módulos funcionales sin una razón técnica demostrable.

Orden de implementación:
1. Analiza la estructura actual del repositorio.
2. Presenta un resumen de lo encontrado.
3. Define los archivos que crearás o modificarás.
4. Implementa configuración, base de datos y respuesta estándar.
5. Implementa autenticación y autorización.
6. Implementa fincas, parcelas y cultivos.
7. Implementa diagnósticos y carga de imágenes.
8. Implementa agentes especializados.
9. Implementa el orquestador y los planes semanales.
10. Añade Swagger, pruebas y documentación.

Durante cada paso:
- Explica brevemente qué modificarás.
- Realiza cambios pequeños.
- Verifica tipos, lint, pruebas y compilación.
- No avances dejando errores conocidos.
- Conserva compatibilidad con el contrato de API.

Resultado esperado:
Un backend funcional, seguro, documentado y listo para integrarse con un frontend desarrollado en paralelo, sin requerir cambios manuales en las respuestas de la API.
```

---

## 14. Entregables del responsable del backend

- Código del backend.
- `README.md` con instalación y ejecución.
- `env.example`.
- Migraciones de base de datos.
- Datos semilla opcionales.
- Swagger/OpenAPI.
- Colección de pruebas de API o archivo `.http`.
- Pruebas automatizadas.
- Registro de decisiones técnicas importantes.
- Archivo compartido `API_CONTRACT.md` actualizado.
