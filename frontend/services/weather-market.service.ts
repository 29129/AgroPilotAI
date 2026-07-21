import { mockApi } from "@/mocks/mock-api";
import { apiClient } from "@/services/api-client";
import { fromDataSource, withQuery } from "@/services/service-utils";
import type { MarketPrice, MarketPriceQuery, WeatherReport } from "@/types/weather-market";

export const weatherService = {
  getByCrop(cropId: string): Promise<WeatherReport> {
    return fromDataSource(
      () => mockApi.weather.getByCrop(cropId),
      () => apiClient.get<WeatherReport>(`/crops/${cropId}/weather`),
    );
  },
};

export const marketService = {
  getPrices(query: MarketPriceQuery): Promise<MarketPrice[]> {
    return fromDataSource(
      () => mockApi.market.getPrices(query),
      () => apiClient.get<MarketPrice[]>(withQuery("/market/prices", query)),
    );
  },
};
