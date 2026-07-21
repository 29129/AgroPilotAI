"use client";

import Link from "next/link";

import {
  DashboardMetrics,
  RecommendationList,
  WeatherSummary,
  WeeklyPlanSummary,
} from "@/components/dashboard";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/AsyncState";
import { SectionCard } from "@/components/ui/SectionCard";
import { useCurrentUser } from "@/hooks/use-auth";
import { useCrops } from "@/hooks/use-crops";
import { useFarms } from "@/hooks/use-farms";
import { useCropRecommendations } from "@/hooks/use-recommendations";
import { useCropWeather } from "@/hooks/use-weather-market";
import { useCurrentWeeklyPlan } from "@/hooks/use-weekly-plans";

import styles from "./dashboard-page.module.css";

function ReloadButton({ onClick }: { onClick: () => void }) {
  return (
    <button className={styles.retryButton} type="button" onClick={onClick}>
      Reintentar
    </button>
  );
}

export default function DashboardPage() {
  const user = useCurrentUser();
  const farms = useFarms();
  const crops = useCrops({ status: "ACTIVE" });
  const primaryCrop = crops.data?.[0];
  const recommendations = useCropRecommendations(primaryCrop?.id);
  const weather = useCropWeather(primaryCrop?.id);
  const weeklyPlan = useCurrentWeeklyPlan(primaryCrop?.id);

  const hasCoreError = farms.isError || crops.isError;
  const isCoreLoading = farms.isLoading || crops.isLoading;

  if (isCoreLoading) {
    return <LoadingState label="Cargando el panorama de tu producción…" />;
  }

  if (hasCoreError) {
    return (
      <ErrorState
        description="No fue posible obtener las fincas y cultivos. Comprueba la conexión e inténtalo de nuevo."
        retry={
          <ReloadButton
            onClick={() => {
              void farms.refetch();
              void crops.refetch();
            }}
          />
        }
      />
    );
  }

  const activeCrops = crops.data ?? [];
  const registeredFarms = farms.data ?? [];

  if (activeCrops.length === 0) {
    return (
      <div className={styles.pageStack}>
        <section className={styles.overview}>
          <div>
            <p className="eyebrow">Visión operativa</p>
            <h2>Empieza por registrar tu primer cultivo</h2>
            <p>
              AgroPilot organiza el contexto de la finca antes de generar recomendaciones.
            </p>
          </div>
        </section>
        <EmptyState
          action={
            <Link className="action-primary" href="/crops">
              Registrar cultivo
            </Link>
          }
          description="Todavía no hay cultivos activos para analizar."
          title="No hay un cultivo bajo seguimiento"
        />
      </div>
    );
  }

  const cropName = [primaryCrop.cropType, primaryCrop.variety]
    .filter(Boolean)
    .join(" · ");
  const greeting = user.data?.name ? `Hola, ${user.data.name.split(" ")[0]}` : "Hola";

  return (
    <div className={styles.pageStack}>
      <section className={styles.overview}>
        <div>
          <p className="eyebrow">Decisiones con contexto</p>
          <h2>{greeting}. Este es el estado de tu operación.</h2>
          <p>
            Priorizamos las señales que requieren revisión humana antes de llevarlas al
            campo.
          </p>
        </div>
        <Link className="action-primary" href={`/crops/${primaryCrop.id}/recommendations`}>
          Ver prioridades
        </Link>
      </section>

      <DashboardMetrics
        crops={activeCrops}
        farms={registeredFarms}
        recommendations={recommendations.data ?? []}
      />

      <section className={styles.focusBar}>
        <div>
          <span>Seguimiento actual</span>
          <strong>{cropName}</strong>
          <p>
            {primaryCrop.growthStage ?? "Etapa no registrada"} · {primaryCrop.status === "ACTIVE" ? "Activo" : primaryCrop.status}
          </p>
        </div>
        <Link className="action-secondary" href={`/crops/${primaryCrop.id}`}>
          Abrir cultivo
        </Link>
      </section>

      <div className={styles.dashboardGrid}>
        <div className={styles.primaryColumn}>
          {recommendations.isLoading ? (
            <LoadingState label="Preparando recomendaciones…" />
          ) : recommendations.isError ? (
            <ErrorState
              description="No pudimos cargar las recomendaciones del cultivo seleccionado."
              retry={<ReloadButton onClick={() => void recommendations.refetch()} />}
            />
          ) : (
            <RecommendationList
              description="Cada propuesta muestra su evidencia y mantiene la decisión final en tus manos."
              recommendations={recommendations.data ?? []}
              title="Prioridades para revisar"
            />
          )}
        </div>

        <div className={styles.secondaryColumn}>
          {weather.isLoading ? (
            <LoadingState label="Consultando condiciones del cultivo…" />
          ) : weather.isError ? (
            <ErrorState
              description="No pudimos consultar el clima en este momento."
              retry={<ReloadButton onClick={() => void weather.refetch()} />}
            />
          ) : weather.data ? (
            <WeatherSummary weather={weather.data} />
          ) : (
            <SectionCard title="Clima">
              <EmptyState
                description="Aún no hay un reporte meteorológico para este cultivo."
                title="Sin datos de clima"
              />
            </SectionCard>
          )}

          {weeklyPlan.isLoading ? (
            <LoadingState label="Organizando el plan semanal…" />
          ) : weeklyPlan.isError ? (
            <ErrorState
              description="No pudimos cargar el plan semanal."
              retry={<ReloadButton onClick={() => void weeklyPlan.refetch()} />}
            />
          ) : weeklyPlan.data ? (
            <WeeklyPlanSummary plan={weeklyPlan.data} />
          ) : (
            <SectionCard title="Plan semanal">
              <EmptyState
                description="Genera un análisis del cultivo para construir tareas priorizadas."
                title="No hay un plan disponible"
              />
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
