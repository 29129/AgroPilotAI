"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { EmptyState, ErrorState, LoadingState } from "@/components/ui/AsyncState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  useCropRecommendations,
  useCrops,
  useCropWeather,
  useCurrentWeeklyPlan,
} from "@/hooks";
import type { Priority } from "@/types/recommendations";

import styles from "./page.module.css";

type AlertTone = "danger" | "warning" | "info" | "neutral";

type AlertItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  tone: AlertTone;
  priority: Priority;
  href: string;
  detail: string;
};

const priorityRank: Record<Priority, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function alertTone(priority: Priority): AlertTone {
  if (priority === "CRITICAL" || priority === "HIGH") {
    return "danger";
  }

  if (priority === "MEDIUM") {
    return "warning";
  }

  return "info";
}

function priorityLabel(priority: Priority) {
  return {
    CRITICAL: "Crítica",
    HIGH: "Alta",
    MEDIUM: "Media",
    LOW: "Baja",
  }[priority];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-EC", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

export default function NotificationsPage() {
  const cropsQuery = useCrops();
  const [activeCropId, setActiveCropId] = useState("");

  useEffect(() => {
    if (!activeCropId && cropsQuery.data?.[0]) {
      setActiveCropId(cropsQuery.data[0].id);
    }
  }, [activeCropId, cropsQuery.data]);

  const weatherQuery = useCropWeather(activeCropId || undefined);
  const recommendationsQuery = useCropRecommendations(activeCropId || undefined);
  const weeklyPlanQuery = useCurrentWeeklyPlan(activeCropId || undefined);
  const activeCrop = cropsQuery.data?.find((crop) => crop.id === activeCropId);

  const alerts = useMemo<AlertItem[]>(() => {
    if (!activeCropId) {
      return [];
    }

    const weatherAlerts = (weatherQuery.data?.alerts ?? []).map((alert) => ({
      id: `weather-${alert.id}`,
      title: alert.title,
      description: alert.description,
      category: "Clima",
      tone: alertTone(alert.severity),
      priority: alert.severity,
      href: `/crops/${activeCropId}/recommendations`,
      detail: alert.startsAt ? `Vigente desde ${formatDate(alert.startsAt)}` : "Aviso meteorológico",
    }));

    const recommendationAlerts = (recommendationsQuery.data ?? [])
      .filter((recommendation) => recommendation.status === "PENDING")
      .map((recommendation) => ({
        id: `recommendation-${recommendation.id}`,
        title: recommendation.title,
        description: recommendation.summary,
        category: "Recomendación",
        tone: alertTone(recommendation.priority),
        priority: recommendation.priority,
        href: `/crops/${activeCropId}/recommendations`,
        detail: recommendation.requiresApproval
          ? "Requiere validación humana antes de ejecutarse"
          : "Acción sugerida pendiente de revisión",
      }));

    const weeklyTasks = (weeklyPlanQuery.data?.tasks ?? [])
      .filter((task) => task.status === "PENDING")
      .map((task) => ({
        id: `task-${task.id}`,
        title: task.title,
        description: task.description ?? task.reason,
        category: "Plan semanal",
        tone: alertTone(task.priority),
        priority: task.priority,
        href: `/crops/${activeCropId}/weekly-plan`,
        detail: `Programada para ${formatDate(task.scheduledFor)}`,
      }));

    return [...weatherAlerts, ...recommendationAlerts, ...weeklyTasks].sort(
      (left, right) => priorityRank[left.priority] - priorityRank[right.priority],
    );
  }, [activeCropId, recommendationsQuery.data, weatherQuery.data, weeklyPlanQuery.data]);

  const isAlertDataLoading =
    Boolean(activeCropId) &&
    (weatherQuery.isLoading || recommendationsQuery.isLoading || weeklyPlanQuery.isLoading);
  const alertDataError = weatherQuery.error || recommendationsQuery.error || weeklyPlanQuery.error;

  function retryAlertData() {
    void weatherQuery.refetch();
    void recommendationsQuery.refetch();
    void weeklyPlanQuery.refetch();
  }

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div>
          <p className="eyebrow">Seguimiento operativo</p>
          <h2>Alertas que necesitan contexto.</h2>
          <p>
            Reunimos clima, recomendaciones y tareas para que puedas validar una decisión antes de
            llevarla a campo.
          </p>
        </div>
        <label className={styles.cropPicker}>
          <span>Cultivo</span>
          <select
            value={activeCropId}
            onChange={(event) => setActiveCropId(event.target.value)}
            disabled={cropsQuery.isLoading || !cropsQuery.data?.length}
          >
            <option value="">Selecciona un cultivo</option>
            {(cropsQuery.data ?? []).map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.cropType} · {crop.variety ?? crop.growthStage ?? "Sin detalle"}
              </option>
            ))}
          </select>
        </label>
      </section>

      {cropsQuery.isLoading ? <LoadingState label="Cargando cultivos y alertas…" /> : null}
      {cropsQuery.isError ? (
        <ErrorState
          description={errorMessage(cropsQuery.error, "No pudimos cargar los cultivos disponibles.")}
          retry={
            <button className="action-secondary" type="button" onClick={() => cropsQuery.refetch()}>
              Reintentar
            </button>
          }
        />
      ) : null}
      {!cropsQuery.isLoading && !cropsQuery.isError && !cropsQuery.data?.length ? (
        <EmptyState
          title="No hay cultivos para monitorear"
          description="Cuando registres un cultivo, sus avisos y tareas aparecerán en este espacio."
          action={
            <Link className="action-primary" href="/crops">
              Ver cultivos
            </Link>
          }
        />
      ) : null}

      {!cropsQuery.isLoading && !cropsQuery.isError && cropsQuery.data?.length ? (
        <>
          <section className={styles.summary} aria-label="Resumen de alertas">
            <div>
              <span>Vista actual</span>
              <strong>{activeCrop ? `${activeCrop.cropType} · ${activeCrop.variety ?? "Sin variedad"}` : "Selecciona un cultivo"}</strong>
            </div>
            <div>
              <span>Alertas activas</span>
              <strong>{isAlertDataLoading ? "—" : alerts.length}</strong>
            </div>
            <div>
              <span>Acciones de alta prioridad</span>
              <strong>
                {isAlertDataLoading
                  ? "—"
                  : alerts.filter((alert) => alert.priority === "HIGH" || alert.priority === "CRITICAL").length}
              </strong>
            </div>
          </section>

          {isAlertDataLoading ? <LoadingState label="Preparando alertas del cultivo…" /> : null}
          {!isAlertDataLoading && alertDataError ? (
            <ErrorState
              description={errorMessage(alertDataError, "No pudimos reunir todas las alertas del cultivo.")}
              retry={
                <button className="action-secondary" type="button" onClick={retryAlertData}>
                  Reintentar
                </button>
              }
            />
          ) : null}
          {!isAlertDataLoading && !alertDataError && !alerts.length ? (
            <EmptyState
              title="Sin alertas activas"
              description="No hay señales climáticas, recomendaciones pendientes ni tareas abiertas para este cultivo."
            />
          ) : null}
          {!isAlertDataLoading && !alertDataError && alerts.length ? (
            <section className={styles.alertList} aria-label="Lista de alertas">
              {alerts.map((alert) => (
                <article key={alert.id} className={styles.alertCard}>
                  <div className={styles.alertHeading}>
                    <div>
                      <span className={styles.category}>{alert.category}</span>
                      <h3>{alert.title}</h3>
                    </div>
                    <StatusBadge tone={alert.tone}>{priorityLabel(alert.priority)}</StatusBadge>
                  </div>
                  <p>{alert.description}</p>
                  <footer>
                    <span>{alert.detail}</span>
                    <Link href={alert.href}>Revisar contexto</Link>
                  </footer>
                </article>
              ))}
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
