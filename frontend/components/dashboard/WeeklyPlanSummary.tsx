import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { PlanTask, PlanTaskStatus, WeeklyPlan } from "@/types/plans";
import type { Priority } from "@/types/recommendations";

import styles from "./dashboard.module.css";

type BadgeTone = "danger" | "info" | "neutral" | "success" | "warning";

export interface WeeklyPlanSummaryProps {
  plan: WeeklyPlan;
  title?: string;
  description?: string;
  emptyMessage?: string;
}

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

const taskStatusLabels: Record<PlanTaskStatus, string> = {
  COMPLETED: "Completada",
  PENDING: "Pendiente",
};

const taskStatusTones: Record<PlanTaskStatus, BadgeTone> = {
  COMPLETED: "success",
  PENDING: "warning",
};

function TaskItem({ task }: { task: PlanTask }) {
  return (
    <li className={styles.planTask}>
      <div className={styles.taskHeading}>
        <h3>{task.title}</h3>
        <div
          aria-label={`Prioridad ${priorityLabels[task.priority]}, estado ${taskStatusLabels[task.status]}`}
          className={styles.badgeGroup}
        >
          <StatusBadge tone={priorityTones[task.priority]}>
            {priorityLabels[task.priority]}
          </StatusBadge>
          <StatusBadge tone={taskStatusTones[task.status]}>
            {taskStatusLabels[task.status]}
          </StatusBadge>
        </div>
      </div>
      {task.description && <p>{task.description}</p>}
      <dl className={styles.taskMetadata}>
        <div>
          <dt>Programada</dt>
          <dd>
            <time dateTime={task.scheduledFor}>{task.scheduledFor}</time>
          </dd>
        </div>
        <div>
          <dt>Motivo</dt>
          <dd>{task.reason}</dd>
        </div>
        {task.recommendationId && (
          <div>
            <dt>Recomendación</dt>
            <dd>{task.recommendationId}</dd>
          </div>
        )}
      </dl>
    </li>
  );
}

export function WeeklyPlanSummary({
  plan,
  title = "Plan semanal",
  description = "Tareas priorizadas para el cultivo seleccionado.",
  emptyMessage = "No hay tareas programadas para esta semana.",
}: WeeklyPlanSummaryProps) {
  return (
    <SectionCard description={description} title={title}>
      <div className={styles.planIntro}>
        <p>{plan.summary}</p>
        <p className={styles.planPeriod}>
          <time dateTime={plan.weekStart}>{plan.weekStart}</time>
          <span aria-hidden="true"> — </span>
          <time dateTime={plan.weekEnd}>{plan.weekEnd}</time>
        </p>
      </div>

      {plan.tasks.length === 0 ? (
        <p className={styles.emptyMessage}>{emptyMessage}</p>
      ) : (
        <ol className={styles.planTaskList}>
          {plan.tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ol>
      )}
    </SectionCard>
  );
}
