"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { WeeklyPlanSummary } from "@/components/dashboard";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/AsyncState";
import { useCrop } from "@/hooks/use-crops";
import { useCurrentWeeklyPlan, useGenerateWeeklyPlan } from "@/hooks/use-weekly-plans";

import styles from "../../crops.module.css";

export default function WeeklyPlanPage() {
  const { cropId } = useParams<{ cropId: string }>();
  const crop = useCrop(cropId);
  const plan = useCurrentWeeklyPlan(cropId);
  const generatePlan = useGenerateWeeklyPlan();
  const [feedback, setFeedback] = useState<string | null>(null);
  const mutationError = generatePlan.error instanceof Error ? generatePlan.error.message : null;

  async function regeneratePlan() {
    setFeedback(null);
    try {
      const generated = await generatePlan.mutateAsync({ cropId });
      setFeedback(`Se generó un plan con ${generated.tasks.length} tareas priorizadas. Revisa cada tarea antes de coordinar la ejecución en campo.`);
    } catch {
      // El error de generación se muestra junto al control.
    }
  }

  if (crop.isLoading) {
    return <LoadingState label="Cargando el cultivo…" />;
  }

  if (crop.isError || !crop.data) {
    return (
      <ErrorState
        description="No pudimos recuperar el cultivo para preparar su plan semanal."
        retry={<button className={styles.secondaryButton} onClick={() => crop.refetch()} type="button">Reintentar</button>}
      />
    );
  }

  const cropName = `${crop.data.cropType}${crop.data.variety ? ` · ${crop.data.variety}` : ""}`;

  return (
    <main className={styles.page}>
      <nav aria-label="Migas de pan" className={styles.breadcrumb}>
        <Link href="/crops">Cultivos</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/crops/${cropId}`}>{cropName}</Link>
        <span aria-hidden="true">/</span>
        <span>Plan semanal</span>
      </nav>

      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Planificación</p>
          <h1 className={styles.pageTitle}>Plan semanal de {cropName}</h1>
          <p className={styles.pageLead}>El plan organiza prioridades a partir de la evidencia actual. No sustituye las aprobaciones necesarias para acciones sensibles.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.primaryButton} disabled={generatePlan.isPending} onClick={() => { void regeneratePlan(); }} type="button">
            {generatePlan.isPending ? "Generando…" : "Regenerar plan"}
          </button>
        </div>
      </header>

      {mutationError && <p className={styles.formError} role="alert">{mutationError}</p>}
      {feedback && <p className={styles.feedback} role="status">{feedback}</p>}

      {plan.isLoading && <LoadingState label="Cargando el plan semanal…" />}
      {plan.isError && (
        <ErrorState
          description="No hay un plan disponible para este cultivo. Puedes crear uno con la evidencia actual."
          retry={<button className={styles.primaryButton} disabled={generatePlan.isPending} onClick={() => { void regeneratePlan(); }} type="button">Generar plan semanal</button>}
        />
      )}
      {plan.data && <WeeklyPlanSummary description="Revisa las prioridades y confirma en campo antes de coordinar tareas sensibles." plan={plan.data} />}
      {!plan.isLoading && !plan.isError && !plan.data && (
        <EmptyState
          action={<button className={styles.primaryButton} disabled={generatePlan.isPending} onClick={() => { void regeneratePlan(); }} type="button">Generar plan semanal</button>}
          description="Genera tareas priorizadas usando la evidencia que ya existe para este cultivo."
          title="No hay plan semanal"
        />
      )}
    </main>
  );
}
