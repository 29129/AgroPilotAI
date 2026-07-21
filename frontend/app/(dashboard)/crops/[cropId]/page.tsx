"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { RecommendationList, WeatherSummary, WeeklyPlanSummary } from "@/components/dashboard";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/AsyncState";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useCrop } from "@/hooks/use-crops";
import { useCropRecommendations } from "@/hooks/use-recommendations";
import { useCropWeather } from "@/hooks/use-weather-market";
import { useCurrentWeeklyPlan } from "@/hooks/use-weekly-plans";
import type { CropStatus } from "@/types/crops";

import styles from "../crops.module.css";

const cropStatuses: Record<CropStatus, { label: string; tone: "danger" | "info" | "neutral" | "success" | "warning" }> = {
  ACTIVE: { label: "Activo", tone: "success" },
  CANCELLED: { label: "Cancelado", tone: "danger" },
  HARVESTED: { label: "Cosechado", tone: "neutral" },
};

function formatDate(value?: string) {
  return value ? new Intl.DateTimeFormat("es-EC", { dateStyle: "medium" }).format(new Date(value)) : "Sin registrar";
}

export default function CropDetailPage() {
  const { cropId } = useParams<{ cropId: string }>();
  const crop = useCrop(cropId);
  const weather = useCropWeather(cropId);
  const recommendations = useCropRecommendations(cropId);
  const weeklyPlan = useCurrentWeeklyPlan(cropId);

  if (crop.isLoading) {
    return <LoadingState label="Cargando el cultivo…" />;
  }

  if (crop.isError) {
    return (
      <ErrorState
        description="No pudimos recuperar este cultivo. Es posible que ya no esté disponible."
        retry={<button className={styles.secondaryButton} onClick={() => crop.refetch()} type="button">Reintentar</button>}
      />
    );
  }

  if (!crop.data) {
    return <EmptyState description="No encontramos el cultivo solicitado." title="Cultivo no disponible" />;
  }

  const status = cropStatuses[crop.data.status];
  const cropName = `${crop.data.cropType}${crop.data.variety ? ` · ${crop.data.variety}` : ""}`;

  return (
    <main className={styles.page}>
      <nav aria-label="Migas de pan" className={styles.breadcrumb}>
        <Link href="/crops">Cultivos</Link>
        <span aria-hidden="true">/</span>
        <span>{cropName}</span>
      </nav>

      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Cultivo activo</p>
          <h1 className={styles.pageTitle}>{cropName}</h1>
          <p className={styles.pageLead}>Centraliza la evidencia y revisa las acciones antes de llevarlas a campo.</p>
        </div>
        <div className={styles.headerActions}>
          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
        </div>
      </header>

      <section className={styles.actionGrid} aria-label="Acciones del cultivo">
        <article className={styles.actionCard}>
          <div className={styles.actionHeading}>
            <p className={styles.eyebrow}>01</p>
          </div>
          <h2>Diagnóstico visual</h2>
          <p>Registra una imagen y síntomas para recibir hallazgos que requieren revisión técnica.</p>
          <Link className={styles.actionLink} href={`/crops/${cropId}/diagnosis`}>Abrir diagnósticos →</Link>
        </article>
        <article className={styles.actionCard}>
          <div className={styles.actionHeading}>
            <p className={styles.eyebrow}>02</p>
          </div>
          <h2>Recomendaciones</h2>
          <p>Evalúa la evidencia, confirma las acciones sensibles y deja trazabilidad de la decisión.</p>
          <Link className={styles.actionLink} href={`/crops/${cropId}/recommendations`}>Revisar decisiones →</Link>
        </article>
        <article className={styles.actionCard}>
          <div className={styles.actionHeading}>
            <p className={styles.eyebrow}>03</p>
          </div>
          <h2>Plan semanal</h2>
          <p>Convierte las prioridades actuales en tareas concretas para el equipo de campo.</p>
          <Link className={styles.actionLink} href={`/crops/${cropId}/weekly-plan`}>Ver plan semanal →</Link>
        </article>
      </section>

      <section className={styles.overviewGrid}>
        <div className={styles.detailStack}>
          <article className={styles.detailCard}>
            <h2>Ficha del cultivo</h2>
            <dl className={styles.detailList}>
              <div>
                <dt>Etapa</dt>
                <dd>{crop.data.growthStage ?? "Sin registrar"}</dd>
              </div>
              <div>
                <dt>Parcela</dt>
                <dd>{crop.data.plotId}</dd>
              </div>
              <div>
                <dt>Siembra</dt>
                <dd>{formatDate(crop.data.sowingDate)}</dd>
              </div>
              <div>
                <dt>Cosecha prevista</dt>
                <dd>{formatDate(crop.data.expectedHarvestDate)}</dd>
              </div>
            </dl>
          </article>

          {recommendations.isLoading && <LoadingState label="Cargando recomendaciones…" />}
          {recommendations.isError && (
            <ErrorState
              description="No pudimos cargar las recomendaciones de este cultivo."
              retry={<button className={styles.secondaryButton} onClick={() => recommendations.refetch()} type="button">Reintentar</button>}
            />
          )}
          {recommendations.data && (
            <RecommendationList
              description="Un resumen de las decisiones que esperan revisión o seguimiento."
              recommendations={recommendations.data.slice(0, 2)}
              title="Prioridades actuales"
            />
          )}
        </div>

        <div className={styles.detailStack}>
          {weather.isLoading && <LoadingState label="Cargando condiciones climáticas…" />}
          {weather.isError && (
            <ErrorState
              description="No pudimos cargar el clima asociado a este cultivo."
              retry={<button className={styles.secondaryButton} onClick={() => weather.refetch()} type="button">Reintentar</button>}
            />
          )}
          {weather.data && <WeatherSummary weather={weather.data} />}

          {weeklyPlan.isLoading && <LoadingState label="Cargando el plan semanal…" />}
          {weeklyPlan.isError && (
            <ErrorState
              description="No hay un plan disponible en este momento. Puedes generarlo desde el detalle del plan semanal."
              retry={<Link className={styles.secondaryButton} href={`/crops/${cropId}/weekly-plan`}>Abrir plan semanal</Link>}
            />
          )}
          {weeklyPlan.data && <WeeklyPlanSummary description="Tareas que se generaron a partir de la evidencia disponible." plan={weeklyPlan.data} />}
        </div>
      </section>
    </main>
  );
}
