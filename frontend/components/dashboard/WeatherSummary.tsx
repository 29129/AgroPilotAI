import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { WeatherAlert, WeatherReport } from "@/types/weather-market";

import styles from "./dashboard.module.css";

type BadgeTone = "danger" | "info" | "neutral" | "success" | "warning";

export interface WeatherSummaryProps {
  weather: WeatherReport;
  title?: string;
  description?: string;
}

const alertSeverityLabels: Record<WeatherAlert["severity"], string> = {
  CRITICAL: "Crítica",
  HIGH: "Alta",
  LOW: "Baja",
  MEDIUM: "Media",
};

const alertSeverityTones: Record<WeatherAlert["severity"], BadgeTone> = {
  CRITICAL: "danger",
  HIGH: "warning",
  LOW: "neutral",
  MEDIUM: "info",
};

export function WeatherSummary({
  weather,
  title = "Clima",
  description = "Condiciones actuales y pronóstico para el cultivo seleccionado.",
}: WeatherSummaryProps) {
  const { alerts, current, forecast } = weather;

  return (
    <SectionCard description={description} title={title}>
      <div className={styles.weatherCurrent}>
        <div>
          <p className={styles.overline}>Condición actual</p>
          <strong className={styles.temperature}>{current.temperatureC} °C</strong>
          <p className={styles.weatherCondition}>{current.condition}</p>
          <time className={styles.observedAt} dateTime={current.observedAt}>
            Observado: {current.observedAt}
          </time>
        </div>

        <dl className={styles.weatherFacts}>
          <div>
            <dt>Humedad</dt>
            <dd>{current.humidityPct} %</dd>
          </div>
          <div>
            <dt>Precipitación</dt>
            <dd>{current.precipitationMm} mm</dd>
          </div>
          <div>
            <dt>Viento</dt>
            <dd>{current.windKph} km/h</dd>
          </div>
        </dl>
      </div>

      {forecast.length > 0 && (
        <div className={styles.detailBlock}>
          <h3>Pronóstico</h3>
          <ul className={styles.forecastList}>
            {forecast.map((day) => (
              <li key={day.date}>
                <time dateTime={day.date}>{day.date}</time>
                <strong>{day.condition}</strong>
                <span>
                  {day.minTemperatureC} °C — {day.maxTemperatureC} °C
                </span>
                <span>{day.precipitationProbabilityPct} % de precipitación</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {alerts.length > 0 && (
        <div className={styles.detailBlock}>
          <h3>Alertas meteorológicas</h3>
          <ul className={styles.alertList}>
            {alerts.map((alert) => (
              <li key={alert.id}>
                <div className={styles.alertHeading}>
                  <strong>{alert.title}</strong>
                  <StatusBadge tone={alertSeverityTones[alert.severity]}>
                    {alertSeverityLabels[alert.severity]}
                  </StatusBadge>
                </div>
                <p>{alert.description}</p>
                {alert.startsAt && (
                  <time dateTime={alert.startsAt}>{alert.startsAt}</time>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionCard>
  );
}
