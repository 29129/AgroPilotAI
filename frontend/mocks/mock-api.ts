import { ApiClientError } from "@/services/api-client";
import type { AuthSession, LoginInput, RefreshSessionInput, RegisterInput, User } from "@/types/auth";
import type {
  Conversation,
  ConversationDetail,
  CreateConversationInput,
  SendConversationMessageInput,
} from "@/types/conversations";
import type { CreateCropInput, Crop, CropsListQuery, UpdateCropInput } from "@/types/crops";
import type { CreateDiagnosisInput, Diagnosis } from "@/types/diagnoses";
import type { CreateFarmInput, CreatePlotInput, Farm, FarmsListQuery, Plot, UpdateFarmInput, UpdatePlotInput } from "@/types/farms";
import type { ListQuery } from "@/types/common";
import type { GenerateWeeklyPlanInput, WeeklyPlan } from "@/types/plans";
import type {
  CreateCropAnalysisInput,
  CropAnalysis,
  Recommendation,
  RejectRecommendationInput,
} from "@/types/recommendations";
import type { MarketPrice, MarketPriceQuery, WeatherReport } from "@/types/weather-market";
import {
  mockAuthSession,
  mockConversations,
  mockCrops,
  mockDiagnoses,
  mockFarms,
  mockMarketPrices,
  mockPlots,
  mockRecommendations,
  mockUser,
  mockWeatherReports,
  mockWeeklyPlans,
} from "@/mocks/fixtures";

interface MockState {
  session: AuthSession | null;
  users: User[];
  farms: Farm[];
  plots: Plot[];
  crops: Crop[];
  diagnoses: Diagnosis[];
  recommendations: Recommendation[];
  weeklyPlans: WeeklyPlan[];
  conversations: ConversationDetail[];
  weatherReports: WeatherReport[];
  marketPrices: MarketPrice[];
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function createInitialState(): MockState {
  return clone({
    session: mockAuthSession,
    users: [mockUser],
    farms: mockFarms,
    plots: mockPlots,
    crops: mockCrops,
    diagnoses: mockDiagnoses,
    recommendations: mockRecommendations,
    weeklyPlans: mockWeeklyPlans,
    conversations: mockConversations,
    weatherReports: mockWeatherReports,
    marketPrices: mockMarketPrices,
  });
}

let state = createInitialState();
let idCounter = 0;

function now(): string {
  return new Date().toISOString();
}

function createMockId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-mock-${idCounter}`;
}

function fail(code: string, message: string, status: number): never {
  throw new ApiClientError(message, { code, status });
}

function required<T>(value: T | undefined, resource: string): T {
  return value ?? fail("NOT_FOUND", `${resource} was not found.`, 404);
}

function requireText(value: string, field: string): void {
  if (!value.trim()) fail("VALIDATION_ERROR", `${field} is required.`, 400);
}

function pageItems<T>(items: T[], query?: ListQuery): T[] {
  if (!query?.limit && !query?.page) return clone(items);

  const limit = Math.max(1, query.limit ?? items.length);
  const page = Math.max(1, query.page ?? 1);
  return clone(items.slice((page - 1) * limit, page * limit));
}

function sessionFor(user: User): AuthSession {
  return {
    user,
    accessToken: `mock-access-token-${user.id}`,
    refreshToken: `mock-refresh-token-${user.id}`,
    expiresAt: "2026-07-22T18:30:00.000Z",
  };
}

function removeCropRelatedData(cropIds: string[]): void {
  state.diagnoses = state.diagnoses.filter((item) => !cropIds.includes(item.cropId));
  state.recommendations = state.recommendations.filter((item) => !cropIds.includes(item.cropId));
  state.weeklyPlans = state.weeklyPlans.filter((item) => !cropIds.includes(item.cropId));
  state.conversations = state.conversations.filter((item) => !item.cropId || !cropIds.includes(item.cropId));
}

function createDefaultPlan(cropId: string, input?: GenerateWeeklyPlanInput): WeeklyPlan {
  const weekStart = input?.weekStart ?? "2026-07-20T00:00:00.000Z";
  const recommendations = state.recommendations.filter((item) => item.cropId === cropId);

  return {
    id: createMockId("plan"),
    cropId,
    weekStart,
    weekEnd: "2026-07-26T23:59:59.999Z",
    summary: "Plan generado a partir de la evidencia disponible y las prioridades actuales.",
    tasks: recommendations.slice(0, 3).map((recommendation, index) => ({
      id: createMockId("task"),
      title: recommendation.actions[0]?.label ?? recommendation.title,
      description: recommendation.actions[0]?.description,
      scheduledFor: `2026-07-${String(22 + index).padStart(2, "0")}T10:00:00.000Z`,
      priority: recommendation.priority,
      reason: recommendation.explanation,
      recommendationId: recommendation.id,
      status: "PENDING",
    })),
    generatedAt: now(),
  };
}

export function resetMockData(): void {
  state = createInitialState();
  idCounter = 0;
}

export const mockApi = {
  auth: {
    async register(input: RegisterInput): Promise<AuthSession> {
      requireText(input.name, "name");
      requireText(input.email, "email");
      requireText(input.password, "password");

      const email = input.email.trim().toLowerCase();
      if (state.users.some((user) => user.email.toLowerCase() === email)) {
        fail("CONFLICT", "An account with this email already exists.", 409);
      }

      const user: User = {
        id: createMockId("user"),
        name: input.name.trim(),
        email,
        role: input.role ?? "PRODUCER",
        createdAt: now(),
        updatedAt: now(),
      };
      state.users.push(user);
      state.session = sessionFor(user);
      return clone(state.session);
    },

    async login(input: LoginInput): Promise<AuthSession> {
      requireText(input.email, "email");
      requireText(input.password, "password");

      const email = input.email.trim().toLowerCase();
      const user = state.users.find((item) => item.email.toLowerCase() === email);
      if (!user) fail("UNAUTHORIZED", "Invalid email or password.", 401);

      state.session = sessionFor(user);
      return clone(state.session);
    },

    async refresh(_input?: RefreshSessionInput): Promise<AuthSession> {
      const session = required(state.session ?? undefined, "Session");
      state.session = sessionFor(session.user);
      return clone(state.session);
    },

    async logout(): Promise<void> {
      state.session = null;
    },

    async me(): Promise<User> {
      return clone(required(state.session?.user, "Session"));
    },
  },

  farms: {
    async list(query?: FarmsListQuery): Promise<Farm[]> {
      return pageItems(state.farms, query);
    },

    async getById(farmId: string): Promise<Farm> {
      return clone(required(state.farms.find((farm) => farm.id === farmId), "Farm"));
    },

    async create(input: CreateFarmInput): Promise<Farm> {
      requireText(input.name, "name");
      requireText(input.province, "province");
      requireText(input.canton, "canton");
      const farm: Farm = {
        id: createMockId("farm"),
        ownerId: state.session?.user.id ?? mockUser.id,
        ...input,
        createdAt: now(),
        updatedAt: now(),
      };
      state.farms.push(farm);
      return clone(farm);
    },

    async update(farmId: string, input: UpdateFarmInput): Promise<Farm> {
      const farm = required(state.farms.find((item) => item.id === farmId), "Farm");
      const updated: Farm = { ...farm, ...input, updatedAt: now() };
      state.farms = state.farms.map((item) => (item.id === farmId ? updated : item));
      return clone(updated);
    },

    async remove(farmId: string): Promise<void> {
      required(state.farms.find((item) => item.id === farmId), "Farm");
      const plotIds = state.plots.filter((item) => item.farmId === farmId).map((item) => item.id);
      const cropIds = state.crops.filter((item) => plotIds.includes(item.plotId)).map((item) => item.id);
      state.farms = state.farms.filter((item) => item.id !== farmId);
      state.plots = state.plots.filter((item) => item.farmId !== farmId);
      state.crops = state.crops.filter((item) => !plotIds.includes(item.plotId));
      removeCropRelatedData(cropIds);
    },

    async listPlots(farmId: string, query?: ListQuery): Promise<Plot[]> {
      required(state.farms.find((item) => item.id === farmId), "Farm");
      return pageItems(state.plots.filter((item) => item.farmId === farmId), query);
    },

    async createPlot(farmId: string, input: CreatePlotInput): Promise<Plot> {
      required(state.farms.find((item) => item.id === farmId), "Farm");
      requireText(input.name, "name");
      const plot: Plot = { id: createMockId("plot"), farmId, ...input };
      state.plots.push(plot);
      return clone(plot);
    },

    async updatePlot(plotId: string, input: UpdatePlotInput): Promise<Plot> {
      const plot = required(state.plots.find((item) => item.id === plotId), "Plot");
      const updated: Plot = { ...plot, ...input };
      state.plots = state.plots.map((item) => (item.id === plotId ? updated : item));
      return clone(updated);
    },

    async removePlot(plotId: string): Promise<void> {
      required(state.plots.find((item) => item.id === plotId), "Plot");
      const cropIds = state.crops.filter((item) => item.plotId === plotId).map((item) => item.id);
      state.plots = state.plots.filter((item) => item.id !== plotId);
      state.crops = state.crops.filter((item) => item.plotId !== plotId);
      removeCropRelatedData(cropIds);
    },
  },

  crops: {
    async list(query?: CropsListQuery): Promise<Crop[]> {
      let crops = state.crops;
      if (query?.plotId) crops = crops.filter((item) => item.plotId === query.plotId);
      if (query?.status) crops = crops.filter((item) => item.status === query.status);
      return pageItems(crops, query);
    },

    async getById(cropId: string): Promise<Crop> {
      return clone(required(state.crops.find((item) => item.id === cropId), "Crop"));
    },

    async create(input: CreateCropInput): Promise<Crop> {
      required(state.plots.find((item) => item.id === input.plotId), "Plot");
      requireText(input.cropType, "cropType");
      const crop: Crop = { id: createMockId("crop"), ...input, status: "ACTIVE" };
      state.crops.push(crop);
      return clone(crop);
    },

    async update(cropId: string, input: UpdateCropInput): Promise<Crop> {
      const crop = required(state.crops.find((item) => item.id === cropId), "Crop");
      const updated: Crop = { ...crop, ...input };
      state.crops = state.crops.map((item) => (item.id === cropId ? updated : item));
      return clone(updated);
    },

    async remove(cropId: string): Promise<void> {
      required(state.crops.find((item) => item.id === cropId), "Crop");
      state.crops = state.crops.filter((item) => item.id !== cropId);
      removeCropRelatedData([cropId]);
    },
  },

  diagnoses: {
    async create(cropId: string, input: CreateDiagnosisInput): Promise<Diagnosis> {
      required(state.crops.find((item) => item.id === cropId), "Crop");
      const diagnosis: Diagnosis = {
        id: createMockId("diagnosis"),
        cropId,
        status: "COMPLETED",
        imageUrl: `mock://diagnoses/${input.image.name}`,
        symptoms: input.symptoms,
        summary: "El analisis inicial recomienda validar humedad y realizar una inspeccion de campo.",
        findings: [
          {
            condition: "Posible estres hidrico",
            confidence: 0.76,
            severity: "MEDIUM",
            description: "Resultado orientativo basado en la imagen y los sintomas registrados.",
          },
        ],
        confidence: 0.76,
        requiresTechnicalReview: true,
        createdAt: now(),
        updatedAt: now(),
      };
      state.diagnoses.unshift(diagnosis);
      return clone(diagnosis);
    },

    async listByCrop(cropId: string, query?: ListQuery): Promise<Diagnosis[]> {
      required(state.crops.find((item) => item.id === cropId), "Crop");
      return pageItems(state.diagnoses.filter((item) => item.cropId === cropId), query);
    },

    async getById(diagnosisId: string): Promise<Diagnosis> {
      return clone(required(state.diagnoses.find((item) => item.id === diagnosisId), "Diagnosis"));
    },
  },

  recommendations: {
    async runAnalysis(cropId: string, _input: CreateCropAnalysisInput): Promise<CropAnalysis> {
      required(state.crops.find((item) => item.id === cropId), "Crop");
      const recommendations = state.recommendations.filter((item) => item.cropId === cropId);
      return clone({
        analysisId: createMockId("analysis"),
        status: "COMPLETED",
        summary: "El analisis combina clima, estado sanitario y recursos disponibles para priorizar acciones.",
        recommendations,
        agentResults: [
          {
            agent: "CLIMATE",
            status: "COMPLETED",
            summary: "Se preve un periodo corto de precipitacion baja.",
            confidence: 0.91,
          },
          {
            agent: "HEALTH",
            status: "COMPLETED",
            summary: "El diagnostico visual requiere una verificacion tecnica antes de tratar.",
            confidence: 0.76,
          },
          {
            agent: "IRRIGATION",
            status: "COMPLETED",
            summary: "Conviene medir humedad del suelo antes de aplicar riego.",
            confidence: 0.88,
          },
          {
            agent: "MARKET",
            status: "COMPLETED",
            summary: "El precio de referencia de cacao se mantiene disponible para consulta.",
            confidence: 0.71,
          },
        ],
        generatedAt: now(),
      });
    },

    async listByCrop(cropId: string, query?: ListQuery): Promise<Recommendation[]> {
      required(state.crops.find((item) => item.id === cropId), "Crop");
      return pageItems(state.recommendations.filter((item) => item.cropId === cropId), query);
    },

    async getById(recommendationId: string): Promise<Recommendation> {
      return clone(required(state.recommendations.find((item) => item.id === recommendationId), "Recommendation"));
    },

    async approve(recommendationId: string): Promise<Recommendation> {
      return this.updateStatus(recommendationId, "APPROVED");
    },

    async reject(recommendationId: string, _input?: RejectRecommendationInput): Promise<Recommendation> {
      return this.updateStatus(recommendationId, "REJECTED");
    },

    async complete(recommendationId: string): Promise<Recommendation> {
      return this.updateStatus(recommendationId, "COMPLETED");
    },

    async updateStatus(
      recommendationId: string,
      status: Recommendation["status"],
    ): Promise<Recommendation> {
      const recommendation = required(
        state.recommendations.find((item) => item.id === recommendationId),
        "Recommendation",
      );
      const updated: Recommendation = { ...recommendation, status };
      state.recommendations = state.recommendations.map((item) =>
        item.id === recommendationId ? updated : item,
      );
      return clone(updated);
    },
  },

  weeklyPlans: {
    async generate(cropId: string, input?: GenerateWeeklyPlanInput): Promise<WeeklyPlan> {
      required(state.crops.find((item) => item.id === cropId), "Crop");
      const plan = createDefaultPlan(cropId, input);
      state.weeklyPlans = [plan, ...state.weeklyPlans.filter((item) => item.cropId !== cropId)];
      return clone(plan);
    },

    async getCurrentByCrop(cropId: string): Promise<WeeklyPlan> {
      required(state.crops.find((item) => item.id === cropId), "Crop");
      const existing = state.weeklyPlans.find((item) => item.cropId === cropId);
      if (existing) return clone(existing);

      const plan = createDefaultPlan(cropId);
      state.weeklyPlans.unshift(plan);
      return clone(plan);
    },

    async getById(planId: string): Promise<WeeklyPlan> {
      return clone(required(state.weeklyPlans.find((item) => item.id === planId), "Weekly plan"));
    },
  },

  conversations: {
    async create(input: CreateConversationInput): Promise<Conversation> {
      if (input.cropId) required(state.crops.find((item) => item.id === input.cropId), "Crop");
      const createdAt = now();
      const conversation: ConversationDetail = {
        id: createMockId("conversation"),
        cropId: input.cropId,
        title: input.title?.trim() || "Nueva consulta agricola",
        createdAt,
        updatedAt: createdAt,
        messages: [],
      };
      state.conversations.unshift(conversation);
      const { messages: _messages, ...result } = conversation;
      return clone(result);
    },

    async list(query?: ListQuery): Promise<Conversation[]> {
      const conversations = state.conversations.map(({ messages: _messages, ...conversation }) => conversation);
      return pageItems(conversations, query);
    },

    async getById(conversationId: string): Promise<ConversationDetail> {
      return clone(required(state.conversations.find((item) => item.id === conversationId), "Conversation"));
    },

    async sendMessage(
      conversationId: string,
      input: SendConversationMessageInput,
    ): Promise<ConversationDetail> {
      requireText(input.content, "content");
      const conversation = required(
        state.conversations.find((item) => item.id === conversationId),
        "Conversation",
      );
      const createdAt = now();
      conversation.messages.push({
        id: createMockId("message"),
        conversationId,
        role: "USER",
        content: input.content.trim(),
        createdAt,
      });
      conversation.messages.push({
        id: createMockId("message"),
        conversationId,
        role: "ASSISTANT",
        content:
          "Revisa primero la evidencia disponible y confirma las condiciones de campo antes de ejecutar una accion sensible.",
        createdAt: now(),
        references: conversation.cropId
          ? [{ type: "CROP", id: conversation.cropId, label: "Cultivo asociado" }]
          : undefined,
      });
      conversation.updatedAt = now();
      return clone(conversation);
    },
  },

  weather: {
    async getByCrop(cropId: string): Promise<WeatherReport> {
      required(state.crops.find((item) => item.id === cropId), "Crop");
      const report = state.weatherReports.find((item) => item.cropId === cropId);
      if (report) return clone(report);
      return clone({ ...state.weatherReports[0], cropId });
    },
  },

  market: {
    async getPrices(query: MarketPriceQuery): Promise<MarketPrice[]> {
      return clone(
        state.marketPrices.filter(
          (item) =>
            item.product.toLowerCase() === query.product.toLowerCase() &&
            item.province.toLowerCase() === query.province.toLowerCase(),
        ),
      );
    },
  },
};
