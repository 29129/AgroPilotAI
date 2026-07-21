# AgroPilot AI — Guía y prompt de implementación del frontend

## 1. Objetivo del documento

Este archivo define el contexto, las responsabilidades, el contrato de integración y el orden de trabajo para la persona encargada del frontend de **AgroPilot AI**.

El frontend y el backend deben poder desarrollarse en paralelo. Para lograrlo, el frontend consumirá únicamente el contrato de API acordado y utilizará datos mock mientras los endpoints reales no estén disponibles.

La regla principal es:

> El frontend no debe depender de la estructura interna del backend. Toda comunicación debe pasar por una capa de servicios tipada y centralizada.

---

## 2. Contexto del proyecto

**AgroPilot AI** es una plataforma agrícola inteligente para pequeños y medianos productores.

Permite:

- Registrar fincas, parcelas y cultivos.
- Consultar el estado general de la producción.
- Cargar fotografías de hojas o frutos.
- Revisar alertas climáticas.
- Obtener recomendaciones de riego y fertilización.
- Consultar información de mercado.
- Generar planes semanales.
- Conversar con un asistente agrícola.
- Revisar la evidencia y explicación de cada recomendación.
- Aprobar, rechazar o completar acciones.

La interfaz debe transmitir que el sistema apoya decisiones y no sustituye automáticamente al productor o técnico.

---

## 3. Alcance del frontend

El frontend será responsable de:

1. Interfaz de autenticación.
2. Panel general.
3. Gestión visual de fincas, parcelas y cultivos.
4. Carga y previsualización de imágenes.
5. Visualización de diagnósticos.
6. Visualización de clima y mercado.
7. Presentación de recomendaciones y evidencias.
8. Aprobación o rechazo de acciones.
9. Presentación de planes semanales.
10. Chat con el agente orquestador.
11. Estados de carga, error, vacío y éxito.
12. Diseño responsive y accesible.
13. Consumo centralizado y tipado de la API.

El frontend no debe contener reglas críticas de negocio que pertenezcan al backend.

---

## 4. Stack recomendado

- Next.js 16 con App Router.
- React 19.
- TypeScript estricto.
- CSS Modules, Tailwind CSS o sistema de estilos acordado.
- TanStack Query para estado de servidor.
- Zustand o Context solo para estado global necesario.
- React Hook Form.
- Zod para validación del lado cliente.
- Recharts para gráficas.
- Vitest y React Testing Library.
- Playwright para pruebas end-to-end opcionales.

---

## 5. Diseño visual

Usar una distribución aproximada:

- 60 % gris oscuro.
- 30 % negro.
- 10 % rojo como color de acción y alerta.

Paleta sugerida:

```css
:root {
  --background-primary: #111111;
  --background-secondary: #1f1f1f;
  --surface: #2f2f2f;
  --surface-soft: #3b3b3b;
  --text-primary: #f3f4f6;
  --text-secondary: #b8bcc4;
  --border: #444444;
  --accent: #dc2626;
  --accent-hover: #b91c1c;
  --success: #16a34a;
  --warning: #d97706;
  --danger: #dc2626;
}
```

El rojo no debe ocupar grandes superficies. Debe reservarse para:

- Botones principales.
- Alertas críticas.
- Estados activos.
- Indicadores de prioridad alta.
- Acciones destructivas.

---

## 6. Arquitectura sugerida

```text
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   ├── forms/
│   ├── charts/
│   ├── recommendations/
│   ├── crops/
│   └── agents/
├── features/
│   ├── auth/
│   ├── farms/
│   ├── plots/
│   ├── crops/
│   ├── diagnoses/
│   ├── recommendations/
│   ├── plans/
│   └── conversations/
├── services/
│   ├── api-client.ts
│   ├── auth.service.ts
│   ├── farms.service.ts
│   ├── crops.service.ts
│   ├── recommendations.service.ts
│   └── conversations.service.ts
├── hooks/
├── lib/
├── mocks/
├── schemas/
├── types/
└── styles/
```

Cada funcionalidad debe tener sus propios componentes, hooks, tipos y pruebas cuando sea necesario.

---

## 7. Rutas principales

```text
/login
/register
/dashboard
/farms
/farms/new
/farms/[farmId]
/farms/[farmId]/plots/[plotId]
/crops
/crops/[cropId]
/crops/[cropId]/diagnosis
/crops/[cropId]/recommendations
/crops/[cropId]/weekly-plan
/assistant
/notifications
/profile
```

---

## 8. Pantallas mínimas

### Inicio de sesión

- Correo.
- Contraseña.
- Recuperación de contraseña opcional.
- Mensajes de error claros.

### Dashboard

Debe mostrar:

- Cantidad de cultivos activos.
- Alertas críticas.
- Recomendaciones pendientes.
- Próximas tareas.
- Resumen del clima.
- Últimos análisis.

### Gestión de fincas

- Lista de fincas.
- Creación y edición.
- Vista de parcelas.
- Estado vacío cuando no existan registros.

### Detalle del cultivo

- Información general.
- Etapa de crecimiento.
- Clima.
- Estado sanitario.
- Recomendaciones.
- Plan semanal.
- Historial de diagnósticos.

### Diagnóstico por imagen

- Zona de carga o captura.
- Previsualización.
- Campo para describir síntomas.
- Progreso de análisis.
- Resultado con nivel de confianza.
- Advertencia cuando el resultado requiera revisión técnica.

### Recomendaciones

Cada tarjeta debe mostrar:

- Categoría.
- Título.
- Resumen.
- Prioridad.
- Confianza.
- Explicación.
- Evidencias.
- Acciones sugeridas.
- Botones aprobar, rechazar y marcar como completada.

### Plan semanal

- Vista por día.
- Tareas pendientes y completadas.
- Prioridad.
- Motivo de la tarea.
- Relación con una recomendación.

### Asistente agrícola

- Historial de conversación.
- Entrada de texto.
- Indicador de procesamiento.
- Respuestas estructuradas.
- Acciones sugeridas.
- Referencias a datos del cultivo cuando correspondan.

---

## 9. Contrato de integración

URL base configurable:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

Respuesta exitosa esperada:

```ts
interface ApiSuccess<T> {
  success: true;
  data: T;
  meta: {
    requestId: string;
    page?: number;
    limit?: number;
    total?: number;
  };
}
```

Respuesta de error:

```ts
interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: {
    requestId: string;
  };
}
```

El frontend debe centralizar el tratamiento de errores en `api-client.ts`.

---

## 10. Tipos compartidos mínimos

```ts
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type RecommendationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED";

export interface Evidence {
  type: "WEATHER" | "IMAGE" | "SOIL" | "MARKET" | "USER_INPUT";
  label: string;
  value: string | number;
  source?: string;
  observedAt?: string;
}

export interface RecommendedAction {
  id: string;
  label: string;
  description?: string;
  scheduledFor?: string;
}

export interface Recommendation {
  id: string;
  cropId: string;
  category: "CLIMATE" | "HEALTH" | "IRRIGATION" | "NUTRITION" | "MARKET";
  title: string;
  summary: string;
  priority: Priority;
  confidence: number;
  explanation: string;
  evidence: Evidence[];
  actions: RecommendedAction[];
  requiresApproval: boolean;
  status: RecommendationStatus;
  createdAt: string;
}
```

Estos tipos deben corresponder exactamente con el contrato del backend.

---

## 11. Capa de servicios

No realizar peticiones HTTP directamente desde los componentes.

Ejemplo:

```ts
export const recommendationsService = {
  async getByCrop(cropId: string): Promise<Recommendation[]> {
    return apiClient.get(`/crops/${cropId}/recommendations`);
  },

  async approve(id: string): Promise<Recommendation> {
    return apiClient.post(`/recommendations/${id}/approve`);
  },

  async reject(id: string): Promise<Recommendation> {
    return apiClient.post(`/recommendations/${id}/reject`);
  }
};
```

Los componentes deben usar hooks:

```ts
useCropRecommendations(cropId)
useApproveRecommendation()
useGenerateWeeklyPlan()
```

---

## 12. Desarrollo paralelo mediante mocks

Mientras el backend no esté terminado:

1. Crear respuestas mock que respeten exactamente el contrato.
2. Usar MSW o un adaptador local.
3. No inventar una estructura diferente a la acordada.
4. Poder activar o desactivar mocks mediante variable de entorno.

```env
NEXT_PUBLIC_USE_MOCKS=true
```

Estructura:

```text
mocks/
├── handlers/
│   ├── auth.handlers.ts
│   ├── farms.handlers.ts
│   ├── crops.handlers.ts
│   └── recommendations.handlers.ts
├── data/
└── browser.ts
```

Cuando el backend esté disponible, la integración debe requerir únicamente cambiar la URL y desactivar los mocks.

---

## 13. Estados obligatorios de interfaz

Cada vista con datos remotos debe incluir:

- Estado de carga.
- Estado de error.
- Estado vacío.
- Estado con datos.
- Reintento cuando sea apropiado.
- Retroalimentación luego de una acción.

No se debe mostrar una pantalla en blanco mientras se espera una respuesta.

---

## 14. Flujo de trabajo ordenado

### Fase 1 — Preparación

1. Crear rama `frontend/develop` desde `develop`.
2. Configurar TypeScript estricto.
3. Crear sistema de estilos y componentes base.
4. Configurar variables de entorno.
5. Crear cliente HTTP.
6. Crear tipos del contrato.

### Fase 2 — Mock y contrato

1. Implementar mocks.
2. Crear servicios.
3. Crear hooks de consulta y mutación.
4. Validar respuestas.
5. Probar errores y cargas.

### Fase 3 — Navegación y estructura

1. Layout principal.
2. Sidebar.
3. Header.
4. Navegación móvil.
5. Rutas protegidas.

### Fase 4 — Funcionalidades

1. Autenticación.
2. Dashboard.
3. Fincas y parcelas.
4. Cultivos.
5. Diagnóstico por imagen.
6. Recomendaciones.
7. Plan semanal.
8. Asistente agrícola.

### Fase 5 — Integración real

1. Configurar URL del backend.
2. Desactivar mocks.
3. Corregir únicamente diferencias contra el contrato aprobado.
4. Probar autenticación y CORS.
5. Probar los flujos completos.

### Fase 6 — Calidad

1. Accesibilidad.
2. Responsive.
3. Pruebas de componentes.
4. Pruebas de flujos críticos.
5. Optimización de imágenes.
6. Manejo de sesión expirada.
7. Revisión de textos y mensajes.

---

## 15. Reglas para trabajar sin conflictos

- No modificar archivos del backend.
- No realizar llamadas `fetch` dispersas en componentes.
- No duplicar tipos de dominio en varios lugares.
- No inventar nuevos campos sin agregarlos al contrato.
- No hardcodear la URL de la API.
- No guardar secretos en variables `NEXT_PUBLIC_*`.
- Crear una rama por funcionalidad:

```text
frontend/feature-dashboard
frontend/feature-crops
frontend/feature-diagnosis
frontend/fix-recommendation-card
```

- Usar commits pequeños.
- No mezclar refactorizaciones grandes con nuevas funciones.
- Mantener componentes desacoplados de las respuestas HTTP.
- Usar adaptadores cuando la API requiera transformación.

---

## 16. Criterios de aceptación del frontend

El frontend se considera listo para integración cuando:

- Inicia con un solo comando documentado.
- Incluye `env.example`.
- Puede trabajar completamente con mocks.
- Todas las llamadas están centralizadas en servicios.
- Los tipos coinciden con el contrato.
- El cambio de mocks a API real no requiere modificar componentes.
- Funciona en móvil y escritorio.
- Incluye estados de carga, error y vacío.
- No expone secretos.
- Las acciones importantes requieren confirmación cuando corresponda.
- Las recomendaciones muestran explicación, evidencia y confianza.

---

## 17. Prompt para Codex — Frontend

```text
Actúa como arquitecto frontend senior y desarrollador experto en Next.js, React y TypeScript.

Debes implementar el frontend de AgroPilot AI siguiendo estrictamente este documento.

Objetivo del producto:
AgroPilot AI ayuda a pequeños y medianos productores a registrar fincas, parcelas y cultivos, analizar imágenes, consultar clima y mercado, recibir recomendaciones explicables, aprobar acciones y seguir planes semanales generados por un sistema multiagente.

Responsabilidades:
- Construir únicamente el frontend.
- Crear una interfaz responsive para móvil y escritorio.
- Usar Next.js con App Router, React y TypeScript estricto.
- Centralizar todas las peticiones en una capa de servicios.
- Mantener tipos alineados con API_CONTRACT.md.
- Trabajar inicialmente con mocks compatibles con la API.
- Implementar estados de carga, error, vacío y éxito.
- Mostrar evidencia, explicación, confianza y prioridad en cada recomendación.
- No colocar reglas críticas de negocio en componentes visuales.

Diseño:
- 60 % gris oscuro.
- 30 % negro.
- 10 % rojo.
- El rojo se usa solo para acciones, estados activos y alertas importantes.
- Mantén buen contraste, jerarquía visual, accesibilidad y espacios consistentes.

Reglas de integración:
1. No modifiques archivos del backend.
2. No cambies endpoints ni propiedades del contrato.
3. No hagas fetch directamente en componentes.
4. No hardcodees URLs.
5. No dupliques tipos.
6. No guardes secretos en variables públicas.
7. Usa NEXT_PUBLIC_API_URL para la API.
8. Usa NEXT_PUBLIC_USE_MOCKS para alternar entre mocks y backend real.
9. Si la API cambia, actualiza primero el contrato compartido.
10. Mantén componentes pequeños y reutilizables.

Orden de implementación:
1. Analiza el repositorio actual.
2. Resume la arquitectura encontrada.
3. Indica los archivos que crearás o modificarás.
4. Configura estilos, layout, tipos y cliente HTTP.
5. Implementa mocks y servicios.
6. Implementa autenticación.
7. Implementa dashboard.
8. Implementa fincas, parcelas y cultivos.
9. Implementa diagnóstico por imagen.
10. Implementa recomendaciones, evidencia y aprobación.
11. Implementa plan semanal y asistente.
12. Integra la API real sin cambiar componentes.
13. Ejecuta lint, tipos, pruebas y build.

Durante cada paso:
- Explica brevemente el cambio.
- Realiza modificaciones pequeñas.
- Reutiliza lo existente antes de crear duplicados.
- No elimines código funcional sin justificarlo.
- No avances dejando errores conocidos.

Resultado esperado:
Un frontend accesible, responsive, tipado y desacoplado, capaz de funcionar con mocks y de conectarse posteriormente al backend únicamente mediante configuración, sin reescribir componentes.
```

---

## 18. Entregables del responsable del frontend

- Código del frontend.
- `README.md` con instalación y ejecución.
- `env.example`.
- Componentes reutilizables.
- Tipos compartidos.
- Cliente HTTP.
- Servicios y hooks.
- Mocks compatibles con la API.
- Pruebas de componentes y flujos críticos.
- Registro de decisiones técnicas.
- Validación final contra `API_CONTRACT.md`.
