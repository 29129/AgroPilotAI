"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { EmptyState, ErrorState, LoadingState } from "@/components/ui/AsyncState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useCrop } from "@/hooks/use-crops";
import {
  useApproveRecommendation,
  useCompleteRecommendation,
  useCropRecommendations,
  useRejectRecommendation,
  useRunCropAnalysis,
} from "@/hooks/use-recommendations";
import type { Priority, Recommendation, RecommendationCategory, RecommendationStatus } from "@/types/recommendations";

import styles from "../../crops.module.css";

type ConfirmationAction = "approve" | "complete" | "reject";

type Confirmation = {
  action: ConfirmationAction;
  recommendation: Recommendation;
};

type BadgeTone = "danger" | "info" | "neutral" | "success" | "warning";

const priorityLabels: Record<Priority, string> = {
  CRITICAL: "Crítica",
  HIGH: "Alta",
  LOW: "Baja",
  MEDIUM: "Media",
};

const priorityTones: Record<Priority, BadgeTone> = {
  CRITICAL: "danger",
  HIGH: "warning",
  LOW: "neutral",
  MEDIUM: "info",
};

const categoryLabels: Record<RecommendationCategory, string> = {
  CLIMATE: "Clima",
  HEALTH: "Sanidad",
  IRRIGATION: "Riego",
  MARKET: "Mercado",
  NUTRITION: "Nutrición",
};

const statusLabels: Record<RecommendationStatus, string> = {
  APPROVED: "Aprobada",
  COMPLETED: "Completada",
  PENDING: "Pendiente",
  REJECTED: "Rechazada",
};

const statusTones: Record<RecommendationStatus, BadgeTone> = {
  APPROVED: "info",
  COMPLETED: "success",
  PENDING: "warning",
  REJECTED: "danger",
};

function actionLabel(action: ConfirmationAction) {
  if (action === "approve") return "Aprobar recomendación";
  if (action === "reject") return "Rechazar recomendación";
  return "Marcar como completada";
}

export default function RecommendationsPage() {
  const { cropId } = useParams<{ cropId: string }>();
  const crop = useCrop(cropId);
  const recommendations = useCropRecommendations(cropId);
  const runAnalysis = useRunCropAnalysis();
  const approve = useApproveRecommendation();
  const reject = useRejectRecommendation();
  const complete = useCompleteRecommendation();
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [approvalAcknowledged, setApprovalAcknowledged] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const mutationError =
    approve.error instanceof Error
      ? approve.error.message
      : reject.error instanceof Error
        ? reject.error.message
        : complete.error instanceof Error
          ? complete.error.message
          : null;
  const isUpdating = approve.isPending || reject.isPending || complete.isPending;

  function openConfirmation(recommendation: Recommendation, action: ConfirmationAction) {
    setFeedback(null);
    setApprovalAcknowledged(false);
    setRejectionReason("");
    setConfirmation({ action, recommendation });
  }

  async function generateAnalysis() {
    setFeedback(null);
    try {
      const analysis = await runAnalysis.mutateAsync({
        cropId,
        input: {
          analysisType: "FULL",
          include: ["CLIMATE", "HEALTH", "IRRIGATION", "MARKET", "NUTRITION"],
        },
      });
      setFeedback(`${analysis.recommendations.length} recomendaciones se actualizaron con evidencia de clima, sanidad, riego y mercado.`);
    } catch {
      // El error se muestra debajo de la acción principal.
    }
  }

  async function confirmAction() {
    if (!confirmation || (confirmation.action === "approve" && !approvalAcknowledged)) return;

    try {
      if (confirmation.action === "approve") {
        await approve.mutateAsync({ recommendationId: confirmation.recommendation.id });
        setFeedback("La recomendación fue aprobada por una persona y queda lista para seguimiento.");
      }
      if (confirmation.action === "reject") {
        await reject.mutateAsync({
          recommendationId: confirmation.recommendation.id,
          input: { reason: rejectionReason.trim() || undefined },
        });
        setFeedback("La recomendación fue rechazada y se conserva la decisión en el historial.");
      }
      if (confirmation.action === "complete") {
        await complete.mutateAsync({ recommendationId: confirmation.recommendation.id });
        setFeedback("La recomendación se marcó como completada.");
      }
      setConfirmation(null);
    } catch {
      // El error de la mutación se muestra en el diálogo.
    }
  }

  if (crop.isLoading) {
    return <LoadingState label="Cargando el cultivo…" />;
  }

  if (crop.isError || !crop.data) {
    return (
      <ErrorState
        description="No pudimos recuperar el cultivo para mostrar sus recomendaciones."
        retry={<button className={styles.secondaryButton} onClick={() => crop.refetch()} type="button">Reintentar</button>}
      />
    );
  }

  const cropName = `${crop.data.cropType}${crop.data.variety ? ` · ${crop.data.variety}` : ""}`;
  const analysisError = runAnalysis.error instanceof Error ? runAnalysis.error.message : null;

  return (
    <main className={styles.page}>
      <nav aria-label="Migas de pan" className={styles.breadcrumb}>
        <Link href="/crops">Cultivos</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/crops/${cropId}`}>{cropName}</Link>
        <span aria-hidden="true">/</span>
        <span>Recomendaciones</span>
      </nav>

      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Decisión asistida</p>
          <h1 className={styles.pageTitle}>Recomendaciones para {cropName}</h1>
          <p className={styles.pageLead}>Revisa el razonamiento, la evidencia y las acciones propuestas. Las decisiones sensibles requieren una aprobación humana explícita.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.primaryButton} disabled={runAnalysis.isPending} onClick={() => { void generateAnalysis(); }} type="button">
            {runAnalysis.isPending ? "Actualizando análisis…" : "Actualizar análisis"}
          </button>
        </div>
      </header>

      {analysisError && <p className={styles.formError} role="alert">{analysisError}</p>}
      {feedback && <p className={styles.feedback} role="status">{feedback}</p>}

      {recommendations.isLoading && <LoadingState label="Cargando recomendaciones…" />}
      {recommendations.isError && (
        <ErrorState
          description="No pudimos cargar las recomendaciones de este cultivo."
          retry={<button className={styles.secondaryButton} onClick={() => recommendations.refetch()} type="button">Reintentar</button>}
        />
      )}
      {recommendations.data && recommendations.data.length === 0 && (
        <EmptyState
          action={<button className={styles.primaryButton} disabled={runAnalysis.isPending} onClick={() => { void generateAnalysis(); }} type="button">Generar análisis</button>}
          description="Aún no hay recomendaciones disponibles. Puedes iniciar un análisis con las fuentes actuales."
          title="Sin recomendaciones por ahora"
        />
      )}
      {recommendations.data && recommendations.data.length > 0 && (
        <section aria-label="Recomendaciones disponibles" className={styles.recommendationList}>
          {recommendations.data.map((recommendation) => (
            <article className={styles.recommendationCard} key={recommendation.id}>
              <div className={styles.recommendationHeading}>
                <div>
                  <p className={styles.eyebrow}>{categoryLabels[recommendation.category]}</p>
                  <h3>{recommendation.title}</h3>
                </div>
                <div className={styles.badgeRow}>
                  <StatusBadge tone={priorityTones[recommendation.priority]}>{priorityLabels[recommendation.priority]}</StatusBadge>
                  <StatusBadge tone={statusTones[recommendation.status]}>{statusLabels[recommendation.status]}</StatusBadge>
                </div>
              </div>

              <p className={styles.recommendationSummary}>{recommendation.summary}</p>
              <p className={styles.recommendationExplanation}>{recommendation.explanation}</p>

              <dl className={styles.factList}>
                <div>
                  <dt>Confianza</dt>
                  <dd>{Math.round(recommendation.confidence * 100)} %</dd>
                </div>
                <div>
                  <dt>Revisión humana</dt>
                  <dd>{recommendation.requiresApproval ? "Obligatoria" : "Recomendada"}</dd>
                </div>
              </dl>

              {recommendation.requiresApproval && (
                <p className={styles.approvalNotice}>No se ejecutará ninguna acción hasta que una persona confirme esta recomendación.</p>
              )}

              {recommendation.evidence.length > 0 && (
                <div>
                  <p className={styles.sectionLabel}>Evidencia utilizada</p>
                  <ul className={styles.evidenceList}>
                    {recommendation.evidence.map((evidence, index) => (
                      <li key={`${recommendation.id}-${evidence.type}-${evidence.label}-${index}`}>
                        <strong>{evidence.label}</strong>
                        <span>{String(evidence.value)}{evidence.source ? ` · ${evidence.source}` : ""}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {recommendation.actions.length > 0 && (
                <div>
                  <p className={styles.sectionLabel}>Acciones propuestas</p>
                  <ul className={styles.proposalList}>
                    {recommendation.actions.map((action) => (
                      <li key={action.id}>
                        <strong>{action.label}</strong>
                        {action.description && <p>{action.description}</p>}
                        {action.scheduledFor && <p>Programada: {new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(action.scheduledFor))}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {recommendation.status === "PENDING" && (
                <div className={styles.buttonRow}>
                  <button className={styles.primaryButton} disabled={isUpdating} onClick={() => openConfirmation(recommendation, "approve")} type="button">
                    {recommendation.requiresApproval ? "Revisar y aprobar" : "Aceptar recomendación"}
                  </button>
                  <button className={styles.dangerButton} disabled={isUpdating} onClick={() => openConfirmation(recommendation, "reject")} type="button">
                    Rechazar
                  </button>
                </div>
              )}
              {recommendation.status === "APPROVED" && (
                <div className={styles.buttonRow}>
                  <button className={styles.secondaryButton} disabled={isUpdating} onClick={() => openConfirmation(recommendation, "complete")} type="button">
                    Confirmar tarea completada
                  </button>
                </div>
              )}
            </article>
          ))}
        </section>
      )}

      {confirmation && (
        <div className={styles.dialogBackdrop}>
          <section aria-describedby="recommendation-confirmation-description" aria-labelledby="recommendation-confirmation-title" aria-modal="true" className={styles.dialog} role="dialog">
            <div>
              <p className={styles.eyebrow}>Confirmación humana</p>
              <h2 id="recommendation-confirmation-title">{actionLabel(confirmation.action)}</h2>
            </div>
            <p id="recommendation-confirmation-description">
              {confirmation.action === "approve"
                ? `Vas a autorizar: ${confirmation.recommendation.title}. Confirma que revisaste la evidencia y que la decisión es apropiada para la situación de campo.`
                : confirmation.action === "reject"
                  ? `Vas a rechazar: ${confirmation.recommendation.title}. Esta decisión quedará registrada.`
                  : `Vas a marcar como completada: ${confirmation.recommendation.title}. Confirma que la acción se realizó en campo.`}
            </p>

            {confirmation.action === "approve" && (
              <label className={styles.checkboxField}>
                <input checked={approvalAcknowledged} onChange={(event) => setApprovalAcknowledged(event.target.checked)} type="checkbox" />
                <span>Confirmo que revisé la evidencia y autorizo esta acción de manera informada.</span>
              </label>
            )}

            {confirmation.action === "reject" && (
              <label className={styles.formField}>
                <span>Motivo del rechazo (opcional)</span>
                <textarea onChange={(event) => setRejectionReason(event.target.value)} placeholder="Ej.: la condición de campo ya cambió o se requiere una visita técnica." value={rejectionReason} />
              </label>
            )}

            {mutationError && <p className={styles.formError} role="alert">{mutationError}</p>}
            <div className={styles.dialogActions}>
              <button className={confirmation.action === "reject" ? styles.dangerButton : styles.primaryButton} disabled={isUpdating || (confirmation.action === "approve" && !approvalAcknowledged)} onClick={() => { void confirmAction(); }} type="button">
                {isUpdating ? "Guardando…" : actionLabel(confirmation.action)}
              </button>
              <button className={styles.secondaryButton} disabled={isUpdating} onClick={() => setConfirmation(null)} type="button">Cancelar</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
