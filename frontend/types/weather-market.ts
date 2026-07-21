import type { EntityId, IsoDateString } from "@/types/common";

/** Pending API_CONTRACT v1: weather provider fields and alert catalogue are not defined. */
export interface WeatherCurrent {
  temperatureC: number;
  humidityPct: number;
  precipitationMm: number;
  windKph: number;
  condition: string;
  observedAt: IsoDateString;
}

export interface WeatherForecastDay {
  date: IsoDateString;
  condition: string;
  minTemperatureC: number;
  maxTemperatureC: number;
  precipitationProbabilityPct: number;
}

export interface WeatherAlert {
  id: EntityId;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  description: string;
  startsAt?: IsoDateString;
}

export interface WeatherReport {
  cropId: EntityId;
  current: WeatherCurrent;
  forecast: WeatherForecastDay[];
  alerts: WeatherAlert[];
}

/** Pending API_CONTRACT v1: market unit, currency and history shape require confirmation. */
export interface MarketPrice {
  id: EntityId;
  product: string;
  province: string;
  price: number;
  currency: string;
  unit: string;
  observedAt: IsoDateString;
  source?: string;
}

export interface MarketPriceQuery {
  product: string;
  province: string;
}
