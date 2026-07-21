import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type {
  Evidence,
  Priority,
  Recommendation,
  RecommendationCategory,
  RecommendationStatus,
} from "@/types/recommendations";

import styles from "./dashboard.module.css";

type BadgeTone = "danger" | "info" | "neutral" | "success" | "warning";

export interface RecommendationListProps {
  recommendations: readonly Recommendation[];
  title?: string;
  description?: string;
  emptyMessage?: string;
}

const categoryLabels: Record<RecommendationCategory, string> = {
  CLIMATE: "Clima",
  HEALTH: "Sanidad",
  IRRIGATION: "Riego",
  MARKET: "Mercado",
  NUTRITION: "Nutrición",
};

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

const evidenceTypeLabels: Record<Evidence["type"], string> = {
  IMAGE: "Imagen",
  MARKET: "Mercado",
  SOIL: "Suelo",
  USER_INPUT: "Registro del productor",
  WEATHER: "Clima",
};

export function RecommendationList({
  recommendations,
  title = "Recomendaciones",
  description = "Hallazgos y próximos pasos basados en la información disponible.",
  emptyMessage = "No hay recomendaciones disponibles por ahora.",
}: RecommendationListProps) {
  return (
    <SectionCard description={description} title={title}>
      {recommendations.length === 0 ? (
        <p className={styles.emptyMessage}>{emptyMessage}</p>
      ) : (
        <ol className={styles.recommendationList}>
          {recommendations.map((recommendation) => (
            <li key={recommendation.id}>
              <article className={styles.recommendationItem}>
                <header className={styles.recommendationHeader}>
                  <div>
                    <p className={styles.overline}>
                      {categoryLabels[recommendation.category]}
                    </p>
                    <h3>{recommendation.title}</h3>
                  </div>
                  <div
                    aria-label={`Prioridad ${priorityLabels[recommendation.priority]}, estado ${statusLabels[recommendation.status]}`}
                    className={styles.badgeGroup}
                  >
                    <StatusBadge tone={priorityTones[recommendation.priority]}>
                      {priorityLabels[recommendation.priority]}
                    </StatusBadge>
                    <StatusBadge tone={statusTones[recommendation.status]}>
                      {statusLabels[recommendation.status]}
                    </StatusBadge>
                  </div>
                </header>

                <p className={styles.itemSummary}>{recommendation.summary}</p>
                <p className={styles.explanation}>{recommendation.explanation}</p>

                <dl className={styles.metadataList}>
                  <div>
                    <dt>Confianza</dt>
                    <dd>{recommendation.confidence}</dd>
                  </div>
                  <div>
                    <dt>Aprobación</dt>
                    <dd>
                      {recommendation.requiresApproval
                        ? "Requiere aprobación humana"
                        : "No requiere aprobación humana"}
                    </dd>
                  </div>
                </dl>

                {recommendation.evidence.length > 0 && (
                  <div className={styles.detailBlock}>
                    <h4>Evidencia</h4>
                    <ul className={styles.evidenceList}>
                      {recommendation.evidence.map((evidence, index) => (
                        <li
                          key={`${recommendation.id}-${evidence.type}-${evidence.label}-${index}`}
                        >
                          <span className={styles.evidenceType}>
                            {evidenceTypeLabels[evidence.type]}
                          </span>
                          <div>
                            <strong>{evidence.label}</strong>
                            <p>{evidence.value}</p>
                            {evidence.source && <span>{evidence.source}</span>}
                            {evidence.observedAt && (
                              <time dateTime={evidence.observedAt}>
                                {evidence.observedAt}
                              </time>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {recommendation.actions.length > 0 && (
                  <div className={styles.detailBlock}>
                    <h4>Acciones propuestas</h4>
                    <ul className={styles.actionList}>
                      {recommendation.actions.map((action) => (
                        <li key={action.id}>
                          <strong>{action.label}</strong>
                          {action.description && <p>{action.description}</p>}
                          {action.scheduledFor && (
                            <time dateTime={action.scheduledFor}>
                              Programada: {action.scheduledFor}
                            </time>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            </li>
          ))}
        </ol>
      )}
    </SectionCard>
  );
}
