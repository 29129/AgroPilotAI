import type { ReactNode } from "react";

type MetricTone = "accent" | "danger" | "neutral" | "success" | "warning";

export function MetricCard({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  detail: string;
  tone?: MetricTone;
}) {
  return (
    <article className={`metric-card metric-card-${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}
