"use client";

import { useQuery } from "@tanstack/react-query";

import { cropKeys, marketKeys } from "@/hooks/query-keys";
import { marketService, weatherService } from "@/services/weather-market.service";
import type { MarketPriceQuery } from "@/types/weather-market";

export function useCropWeather(cropId?: string) {
  return useQuery({
    queryKey: cropKeys.weather(cropId ?? ""),
    queryFn: () => weatherService.getByCrop(cropId as string),
    enabled: Boolean(cropId),
  });
}

export function useMarketPrices(query?: MarketPriceQuery) {
  const hasRequiredQuery = Boolean(query?.product && query?.province);
  const safeQuery: MarketPriceQuery = query ?? { product: "", province: "" };

  return useQuery({
    queryKey: marketKeys.prices(safeQuery),
    queryFn: () => marketService.getPrices(safeQuery),
    enabled: hasRequiredQuery,
  });
}
