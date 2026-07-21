import type { AuthSession, User } from "@/types/auth";
import type { ConversationDetail } from "@/types/conversations";
import type { Crop } from "@/types/crops";
import type { Diagnosis } from "@/types/diagnoses";
import type { Farm, Plot } from "@/types/farms";
import type { WeeklyPlan } from "@/types/plans";
import type { Recommendation } from "@/types/recommendations";
import type { MarketPrice, WeatherReport } from "@/types/weather-market";

export const mockUser: User = {
  id: "usr-ana-paredes",
  name: "Ana Paredes",
  email: "ana@agropilot.ec",
  role: "PRODUCER",
  createdAt: "2026-07-01T14:00:00.000Z",
  updatedAt: "2026-07-20T18:30:00.000Z",
};

export const mockAuthSession: AuthSession = {
  user: mockUser,
  accessToken: "mock-access-token-ana-paredes",
  refreshToken: "mock-refresh-token-ana-paredes",
  expiresAt: "2026-07-22T18:30:00.000Z",
};

export const mockFarms: Farm[] = [
  {
    id: "farm-la-esperanza",
    ownerId: mockUser.id,
    name: "Finca La Esperanza",
    province: "Manabi",
    canton: "Chone",
    latitude: -0.696,
    longitude: -80.093,
    totalAreaHa: 8.4,
    createdAt: "2025-10-08T10:30:00.000Z",
    updatedAt: "2026-07-20T16:10:00.000Z",
  },
  {
    id: "farm-el-porvenir",
    ownerId: mockUser.id,
    name: "Finca El Porvenir",
    province: "Manabi",
    canton: "Flavio Alfaro",
    latitude: -0.405,
    longitude: -79.905,
    totalAreaHa: 3.1,
    createdAt: "2026-02-12T09:15:00.000Z",
    updatedAt: "2026-07-18T14:20:00.000Z",
  },
];

export const mockPlots: Plot[] = [
  {
    id: "plot-cacao-norte",
    farmId: "farm-la-esperanza",
    name: "Cacao Norte",
    areaHa: 3.2,
    soilType: "Franco arcilloso",
    irrigationType: "Goteo",
  },
  {
    id: "plot-cacao-sur",
    farmId: "farm-la-esperanza",
    name: "Cacao Sur",
    areaHa: 2.6,
    soilType: "Franco limoso",
    irrigationType: "Secano",
  },
  {
    id: "plot-platano",
    farmId: "farm-el-porvenir",
    name: "Lote Platano",
    areaHa: 1.8,
    soilType: "Franco arenoso",
    irrigationType: "Aspersion",
  },
];

export const mockCrops: Crop[] = [
  {
    id: "crop-cacao-norte",
    plotId: "plot-cacao-norte",
    cropType: "Cacao",
    variety: "CCN-51",
    sowingDate: "2022-03-15T00:00:00.000Z",
    expectedHarvestDate: "2026-09-30T00:00:00.000Z",
    growthStage: "Fructificacion",
    status: "ACTIVE",
  },
  {
    id: "crop-cacao-sur",
    plotId: "plot-cacao-sur",
    cropType: "Cacao",
    variety: "Nacional",
    sowingDate: "2023-01-20T00:00:00.000Z",
    expectedHarvestDate: "2026-10-15T00:00:00.000Z",
    growthStage: "Floracion",
    status: "ACTIVE",
  },
  {
    id: "crop-platano",
    plotId: "plot-platano",
    cropType: "Platano",
    variety: "Barraganete",
    sowingDate: "2026-02-08T00:00:00.000Z",
    expectedHarvestDate: "2026-11-28T00:00:00.000Z",
    growthStage: "Crecimiento vegetativo",
    status: "ACTIVE",
  },
];

export const mockDiagnoses: Diagnosis[] = [
  {
    id: "diagnosis-cacao-leaves-jul",
    cropId: "crop-cacao-norte",
    status: "COMPLETED",
    imageUrl: "https://images.unsplash.com/photo-1595231776515-ddffb1f4eb73?auto=format&fit=crop&w=1200&q=80",
    symptoms: "Manchas amarillas irregulares en hojas jovenes.",
    summary: "Se observa posible estres hidrico y una deficiencia nutricional leve.",
    findings: [
      {
        condition: "Estres hidrico",
        confidence: 0.84,
        severity: "MEDIUM",
        description: "La humedad estimada y el patron de la hoja requieren revision de riego.",
      },
      {
        condition: "Deficiencia nutricional",
        confidence: 0.68,
        severity: "LOW",
        description: "Conviene confirmar con una inspeccion de campo antes de intervenir.",
      },
    ],
    confidence: 0.84,
    requiresTechnicalReview: true,
    createdAt: "2026-07-20T15:40:00.000Z",
    updatedAt: "2026-07-20T15:42:00.000Z",
  },
];

export const mockRecommendations: Recommendation[] = [
  {
    id: "rec-riego-cacao-norte",
    cropId: "crop-cacao-norte",
    category: "IRRIGATION",
    title: "Revisar humedad y programar riego ligero",
    summary: "La parcela Cacao Norte acumula tres dias de baja precipitacion y humedad descendente.",
    priority: "HIGH",
    confidence: 0.91,
    explanation: "La combinacion de pronostico seco, humedad observada y diagnostico visual sugiere prevenir estres hidrico.",
    evidence: [
      {
        type: "WEATHER",
        label: "Precipitacion prevista para 3 dias",
        value: "Menos de 4 mm",
        source: "Pronostico local",
        observedAt: "2026-07-21T12:00:00.000Z",
      },
      {
        type: "IMAGE",
        label: "Hallazgo visual",
        value: "Patron compatible con estres hidrico",
        source: "Analisis de hoja",
        observedAt: "2026-07-20T15:42:00.000Z",
      },
    ],
    actions: [
      {
        id: "action-riego-ligero",
        label: "Aplicar riego ligero al amanecer",
        description: "Verificar primero humedad del suelo en dos puntos de la parcela.",
        scheduledFor: "2026-07-22T11:00:00.000Z",
      },
    ],
    requiresApproval: true,
    status: "PENDING",
    createdAt: "2026-07-21T12:05:00.000Z",
  },
  {
    id: "rec-monitoreo-cacao-norte",
    cropId: "crop-cacao-norte",
    category: "HEALTH",
    title: "Inspeccionar hojas con manchas amarillas",
    summary: "Realizar una revision dirigida antes de aplicar cualquier tratamiento.",
    priority: "MEDIUM",
    confidence: 0.74,
    explanation: "El analisis visual es una inferencia, no una confirmacion tecnica de enfermedad.",
    evidence: [
      {
        type: "IMAGE",
        label: "Confianza del diagnostico visual",
        value: 0.84,
        source: "Analisis de imagen",
        observedAt: "2026-07-20T15:42:00.000Z",
      },
    ],
    actions: [
      {
        id: "action-inspeccion-hojas",
        label: "Tomar nuevas muestras",
        description: "Registrar hoja, zona de parcela y evolucion de las manchas.",
      },
    ],
    requiresApproval: false,
    status: "PENDING",
    createdAt: "2026-07-21T12:08:00.000Z",
  },
];

export const mockWeeklyPlans: WeeklyPlan[] = [
  {
    id: "plan-cacao-norte-2026w30",
    cropId: "crop-cacao-norte",
    weekStart: "2026-07-20T00:00:00.000Z",
    weekEnd: "2026-07-26T23:59:59.999Z",
    summary: "Priorizar la comprobacion de humedad, una inspeccion sanitaria y el registro de resultados.",
    tasks: [
      {
        id: "task-humedad-cacao-norte",
        title: "Medir humedad del suelo",
        description: "Tomar dos lecturas en Cacao Norte antes de decidir riego.",
        scheduledFor: "2026-07-22T10:00:00.000Z",
        priority: "HIGH",
        reason: "Validar la evidencia antes de aplicar riego.",
        recommendationId: "rec-riego-cacao-norte",
        status: "PENDING",
      },
      {
        id: "task-hojas-cacao-norte",
        title: "Registrar nuevas muestras de hojas",
        scheduledFor: "2026-07-23T15:00:00.000Z",
        priority: "MEDIUM",
        reason: "Confirmar la evolucion de las manchas observadas.",
        recommendationId: "rec-monitoreo-cacao-norte",
        status: "PENDING",
      },
    ],
    generatedAt: "2026-07-21T12:30:00.000Z",
  },
];

export const mockConversations: ConversationDetail[] = [
  {
    id: "conversation-cacao-norte",
    cropId: "crop-cacao-norte",
    title: "Consulta sobre Cacao Norte",
    createdAt: "2026-07-20T16:00:00.000Z",
    updatedAt: "2026-07-21T12:10:00.000Z",
    messages: [
      {
        id: "message-user-1",
        conversationId: "conversation-cacao-norte",
        role: "USER",
        content: "He visto manchas amarillas en hojas nuevas. Que debo revisar primero?",
        createdAt: "2026-07-21T11:58:00.000Z",
      },
      {
        id: "message-assistant-1",
        conversationId: "conversation-cacao-norte",
        role: "ASSISTANT",
        content: "Primero verifica la humedad del suelo en dos puntos y registra nuevas muestras. El diagnostico actual requiere revision tecnica antes de aplicar un tratamiento.",
        createdAt: "2026-07-21T12:10:00.000Z",
        references: [
          {
            type: "CROP",
            id: "crop-cacao-norte",
            label: "Cacao Norte",
          },
          {
            type: "DIAGNOSIS",
            id: "diagnosis-cacao-leaves-jul",
            label: "Analisis de hoja del 20 de julio",
          },
        ],
      },
    ],
  },
];

export const mockWeatherReports: WeatherReport[] = [
  {
    cropId: "crop-cacao-norte",
    current: {
      temperatureC: 28,
      humidityPct: 73,
      precipitationMm: 0.4,
      windKph: 9,
      condition: "Parcialmente nublado",
      observedAt: "2026-07-21T13:00:00.000Z",
    },
    forecast: [
      {
        date: "2026-07-22T00:00:00.000Z",
        condition: "Nublado",
        minTemperatureC: 22,
        maxTemperatureC: 29,
        precipitationProbabilityPct: 25,
      },
      {
        date: "2026-07-23T00:00:00.000Z",
        condition: "Soleado",
        minTemperatureC: 21,
        maxTemperatureC: 30,
        precipitationProbabilityPct: 15,
      },
      {
        date: "2026-07-24T00:00:00.000Z",
        condition: "Lluvias aisladas",
        minTemperatureC: 22,
        maxTemperatureC: 28,
        precipitationProbabilityPct: 45,
      },
    ],
    alerts: [
      {
        id: "weather-alert-dry-spell",
        severity: "HIGH",
        title: "Periodo seco corto",
        description: "Se esperan varios dias de precipitacion baja para la zona de Cacao Norte.",
        startsAt: "2026-07-21T18:00:00.000Z",
      },
    ],
  },
];

export const mockMarketPrices: MarketPrice[] = [
  {
    id: "market-cacao-manabi-2026-07-21",
    product: "cacao",
    province: "Manabi",
    price: 148.5,
    currency: "USD",
    unit: "quintal",
    observedAt: "2026-07-21T12:00:00.000Z",
    source: "Mercado provincial",
  },
  {
    id: "market-platano-manabi-2026-07-21",
    product: "platano",
    province: "Manabi",
    price: 8.75,
    currency: "USD",
    unit: "caja",
    observedAt: "2026-07-21T12:00:00.000Z",
    source: "Mercado provincial",
  },
];
