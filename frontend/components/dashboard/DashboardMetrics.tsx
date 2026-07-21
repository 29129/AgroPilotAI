import { MetricCard } from "@/components/ui/MetricCard";
import type { Crop } from "@/types/crops";
import type { Farm } from "@/types/farms";
import type { Recommendation } from "@/types/recommendations";

import styles from "./dashboard.module.css";

export interface DashboardMetricsProps {
  crops: readonly Crop[];
  farms: readonly Farm[];
  recommendations: readonly Recommendation[];
}

export function DashboardMetrics({
  crops,
  farms,
  recommendations,
}: DashboardMetricsProps) {
  return (
    <section aria-label="Resumen de actividad" className={styles.metricsGrid}>
      <MetricCard
        detail="Cultivos registrados"
        label="Cultivos"
        value={crops.length}
      />
      <MetricCard
        detail="Fincas registradas"
        label="Fincas"
        value={farms.length}
      />
      <MetricCard
        detail="Recomendaciones disponibles"
        label="Recomendaciones"
        tone="warning"
        value={recommendations.length}
      />
    </section>
  );
}
