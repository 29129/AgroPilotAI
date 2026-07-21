import type { ReactNode } from "react";

export function LoadingState({ label = "Cargando información…" }: { label?: string }) {
  return (
    <div className="async-state" role="status" aria-live="polite">
      <span className="loading-mark" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({
  title = "No pudimos cargar esta información",
  description,
  retry,
}: {
  title?: string;
  description: string;
  retry?: ReactNode;
}) {
  return (
    <div className="async-state async-state-error" role="alert">
      <strong>{title}</strong>
      <p>{description}</p>
      {retry}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="async-state async-state-empty">
      <strong>{title}</strong>
      <p>{description}</p>
      {action}
    </div>
  );
}
