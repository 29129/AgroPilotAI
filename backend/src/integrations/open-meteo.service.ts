import { AppError } from '../common/errors/app-error.js';

type Location = { latitude?: number | null; longitude?: number | null; canton: string; province: string };

export async function getOpenMeteoForecast(location: Location) {
  const timeout = AbortSignal.timeout(8_000);
  let latitude = location.latitude;
  let longitude = location.longitude;
  if (latitude == null || longitude == null) {
    const search = new URL('https://geocoding-api.open-meteo.com/v1/search');
    search.searchParams.set('name', `${location.canton}, ${location.province}, Ecuador`);
    search.searchParams.set('count', '1');
    const response = await fetch(search, { signal: timeout });
    const payload = await response.json() as { results?: Array<{ latitude: number; longitude: number; name: string }> };
    if (!response.ok || !payload.results?.[0]) throw new AppError(502, 'WEATHER_LOCATION_NOT_FOUND', 'No se pudo localizar la finca en Open-Meteo.');
    ({ latitude, longitude } = payload.results[0]);
  }
  const endpoint = new URL(process.env.WEATHER_API_URL || 'https://api.open-meteo.com/v1/forecast');
  endpoint.searchParams.set('latitude', String(latitude));
  endpoint.searchParams.set('longitude', String(longitude));
  endpoint.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration');
  endpoint.searchParams.set('timezone', 'auto');
  endpoint.searchParams.set('forecast_days', '7');
  try {
    const response = await fetch(endpoint, { signal: timeout });
    const data = await response.json() as { daily?: { time: string[]; precipitation_sum: number[]; temperature_2m_max: number[]; temperature_2m_min: number[]; weather_code: number[]; et0_fao_evapotranspiration: number[] } };
    if (!response.ok || !data.daily) throw new Error('Invalid provider response');
    const daily = data.daily;
    return { location: { latitude, longitude, province: location.province, canton: location.canton }, source: 'Open-Meteo', observedAt: new Date().toISOString(), forecast: daily.time.map((date, index) => ({ date, precipitationMm: daily.precipitation_sum[index], maxTemperatureC: daily.temperature_2m_max[index], minTemperatureC: daily.temperature_2m_min[index], weatherCode: daily.weather_code[index], referenceEvapotranspirationMm: daily.et0_fao_evapotranspiration[index] })) };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(502, 'WEATHER_PROVIDER_UNAVAILABLE', 'Open-Meteo no está disponible temporalmente.');
  }
}
