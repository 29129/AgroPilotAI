import type { ListQuery } from "@/types/common";
import type { CropsListQuery } from "@/types/crops";
import type { FarmsListQuery } from "@/types/farms";
import type { MarketPriceQuery } from "@/types/weather-market";

export const authKeys = {
  all: ["auth"] as const,
  current: () => ["auth", "current"] as const,
};

export const farmKeys = {
  all: ["farms"] as const,
  list: (query?: FarmsListQuery) => ["farms", "list", query ?? {}] as const,
  detail: (farmId: string) => ["farms", "detail", farmId] as const,
  plots: (farmId: string, query?: ListQuery) =>
    ["farms", "detail", farmId, "plots", query ?? {}] as const,
};

export const cropKeys = {
  all: ["crops"] as const,
  list: (query?: CropsListQuery) => ["crops", "list", query ?? {}] as const,
  detail: (cropId: string) => ["crops", "detail", cropId] as const,
  diagnoses: (cropId: string, query?: ListQuery) =>
    ["crops", "detail", cropId, "diagnoses", query ?? {}] as const,
  recommendations: (cropId: string, query?: ListQuery) =>
    ["crops", "detail", cropId, "recommendations", query ?? {}] as const,
  weather: (cropId: string) => ["crops", "detail", cropId, "weather"] as const,
  currentWeeklyPlan: (cropId: string) =>
    ["crops", "detail", cropId, "weekly-plan", "current"] as const,
};

export const recommendationKeys = {
  detail: (recommendationId: string) =>
    ["recommendations", "detail", recommendationId] as const,
};

export const weeklyPlanKeys = {
  detail: (planId: string) => ["weekly-plans", "detail", planId] as const,
};

export const conversationKeys = {
  all: ["conversations"] as const,
  list: (query?: ListQuery) => ["conversations", "list", query ?? {}] as const,
  detail: (conversationId: string) =>
    ["conversations", "detail", conversationId] as const,
};

export const marketKeys = {
  prices: (query: MarketPriceQuery) => ["market", "prices", query] as const,
};
