"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { EmptyState, ErrorState, LoadingState } from "@/components/ui/AsyncState";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useCrops } from "@/hooks/use-crops";
import { useFarm, useFarmPlots } from "@/hooks/use-farms";

import styles from "../../../farms.module.css";

const cropStatus: Record<string, { label: string; tone: "danger" | "info" | "neutral" | "success" | "warning" }> = {
  ACTIVE: { label: "Activo", tone: "success" },
  CANCELLED: { label: "Cancelado", tone: "danger" },
  HARVESTED: { label: "Cosechado", tone: "neutral" },
};

export default function PlotDetailPage() {
  const { farmId, plotId } = useParams<{ farmId: string; plotId: string }>();
  const farm = useFarm(farmId);
  const plots = useFarmPlots(farmId);
  const crops = useCrops({ plotId });

  if (farm.isLoading || plots.isLoading) {
    return <LoadingState label="Cargando la parcela…" />;
  }

  if (farm.isError || plots.isError) {
    return (
      <ErrorState
        description="No pudimos recuperar los datos de esta parcela."
        retry={
          <button className={styles.secondaryButton} onClick={() => { void farm.refetch(); void plots.refetch(); }} type="button">
            Reintentar
          </button>
        }
      />
    );
  }

  const plot = plots.data?.find((item) => item.id === plotId);
  if (!farm.data || !plot) {
    return <EmptyState description="La parcela solicitada no existe dentro de esta finca." title="Parcela no disponible" />;
  }

  return (
    <main className={styles.page}>
      <nav aria-label="Migas de pan" className={styles.breadcrumb}>
        <Link href="/farms">Fincas</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/farms/${farmId}`}>{farm.data.name}</Link>
        <span aria-hidden="true">/</span>
        <span>{plot.name}</span>
      </nav>

      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Parcela</p>
          <h1 className={styles.pageTitle}>{plot.name}</h1>
          <p className={styles.pageLead}>Revisa las condiciones registradas y los cultivos activos en esta parcela.</p>
        </div>
        <div className={styles.headerActions}>
          <Link className={styles.secondaryButton} href={`/farms/${farmId}`}>Volver a la finca</Link>
        </div>
      </header>

      <div className={styles.detailGrid}>
        <aside className={styles.infoPanel}>
          <h2>Condiciones de la parcela</h2>
          <p>La información técnica acompaña cada diagnóstico y recomendación posterior.</p>
          <dl className={styles.detailList}>
            <div>
              <dt>Área</dt>
              <dd>{plot.areaHa ? `${plot.areaHa} ha` : "Sin registrar"}</dd>
            </div>
            <div>
              <dt>Suelo</dt>
              <dd>{plot.soilType ?? "Sin registrar"}</dd>
            </div>
            <div>
              <dt>Riego</dt>
              <dd>{plot.irrigationType ?? "Sin registrar"}</dd>
            </div>
            <div>
              <dt>Finca</dt>
              <dd>{farm.data.name}</dd>
            </div>
          </dl>
        </aside>

        <SectionCard description="Abre un cultivo para ver diagnósticos, recomendaciones y su plan semanal." title="Cultivos de esta parcela">
          {crops.isLoading && <LoadingState label="Cargando cultivos…" />}
          {crops.isError && (
            <ErrorState
              description="No pudimos cargar los cultivos de esta parcela."
              retry={<button className={styles.secondaryButton} onClick={() => crops.refetch()} type="button">Reintentar</button>}
            />
          )}
          {crops.data && crops.data.length === 0 && (
            <EmptyState description="Todavía no hay cultivos asociados a esta parcela." title="Sin cultivos registrados" />
          )}
          {crops.data && crops.data.length > 0 && (
            <div className={styles.plotList}>
              {crops.data.map((crop) => {
                const status = cropStatus[crop.status] ?? cropStatus.ACTIVE;
                return (
                  <Link className={styles.plotCard} href={`/crops/${crop.id}`} key={crop.id}>
                    <div className={styles.plotHeading}>
                      <div>
                        <h3>{crop.cropType}{crop.variety ? ` · ${crop.variety}` : ""}</h3>
                        <p className={styles.location}>{crop.growthStage ?? "Etapa sin registrar"}</p>
                      </div>
                      <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                    </div>
                    <dl className={styles.metaList}>
                      <div>
                        <dt>Siembra</dt>
                        <dd>{crop.sowingDate ? new Intl.DateTimeFormat("es-EC", { dateStyle: "medium" }).format(new Date(crop.sowingDate)) : "Sin registrar"}</dd>
                      </div>
                      <div>
                        <dt>Cosecha esperada</dt>
                        <dd>{crop.expectedHarvestDate ? new Intl.DateTimeFormat("es-EC", { dateStyle: "medium" }).format(new Date(crop.expectedHarvestDate)) : "Sin registrar"}</dd>
                      </div>
                    </dl>
                  </Link>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </main>
  );
}
