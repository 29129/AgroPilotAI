"use client";

import Link from "next/link";

import { EmptyState, ErrorState, LoadingState } from "@/components/ui/AsyncState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useCrops } from "@/hooks/use-crops";
import type { CropStatus } from "@/types/crops";

import styles from "./crops.module.css";

const cropStatuses: Record<CropStatus, { label: string; tone: "danger" | "info" | "neutral" | "success" | "warning" }> = {
  ACTIVE: { label: "Activo", tone: "success" },
  CANCELLED: { label: "Cancelado", tone: "danger" },
  HARVESTED: { label: "Cosechado", tone: "neutral" },
};

function formatDate(value?: string) {
  return value ? new Intl.DateTimeFormat("es-EC", { dateStyle: "medium" }).format(new Date(value)) : "Sin registrar";
}

export default function CropsPage() {
  const crops = useCrops();

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Seguimiento agrícola</p>
          <h1 className={styles.pageTitle}>Cultivos</h1>
          <p className={styles.pageLead}>
            Entra a cada cultivo para revisar evidencia, condiciones de clima y las acciones que requieren tu decisión.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link className={styles.secondaryButton} href="/farms">Ver fincas y parcelas</Link>
        </div>
      </header>

      {crops.isLoading && <LoadingState label="Cargando los cultivos registrados…" />}
      {crops.isError && (
        <ErrorState
          description="No pudimos recuperar los cultivos. Intenta nuevamente."
          retry={<button className={styles.secondaryButton} onClick={() => crops.refetch()} type="button">Reintentar</button>}
        />
      )}
      {crops.data && crops.data.length === 0 && (
        <EmptyState
          action={<Link className={styles.primaryButton} href="/farms">Ir a mis parcelas</Link>}
          description="Registra una parcela y asocia un cultivo para comenzar el seguimiento."
          title="No hay cultivos registrados"
        />
      )}
      {crops.data && crops.data.length > 0 && (
        <section aria-label="Cultivos registrados" className={styles.cropGrid}>
          {crops.data.map((crop) => {
            const status = cropStatuses[crop.status];
            return (
              <Link className={styles.cropCard} href={`/crops/${crop.id}`} key={crop.id}>
                <div className={styles.cardHeading}>
                  <div>
                    <h2>{crop.cropType}{crop.variety ? ` · ${crop.variety}` : ""}</h2>
                    <p className={styles.cardSubtitle}>{crop.growthStage ?? "Etapa de desarrollo sin registrar"}</p>
                  </div>
                  <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                </div>
                <dl className={styles.detailList}>
                  <div>
                    <dt>Siembra</dt>
                    <dd>{formatDate(crop.sowingDate)}</dd>
                  </div>
                  <div>
                    <dt>Cosecha prevista</dt>
                    <dd>{formatDate(crop.expectedHarvestDate)}</dd>
                  </div>
                </dl>
              </Link>
            );
          })}
        </section>
      )}
    </main>
  );
}
