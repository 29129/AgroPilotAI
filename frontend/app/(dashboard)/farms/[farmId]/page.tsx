"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { EmptyState, ErrorState, LoadingState } from "@/components/ui/AsyncState";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useCrops } from "@/hooks/use-crops";
import { useCreatePlot, useFarm, useFarmPlots } from "@/hooks/use-farms";
import type { Crop } from "@/types/crops";
import type { Plot } from "@/types/farms";

import styles from "../farms.module.css";

const plotSchema = z.object({
  areaHa: z
    .string()
    .optional()
    .refine((value) => !value || (Number.isFinite(Number(value)) && Number(value) > 0), {
      message: "Usa un área mayor que cero.",
    }),
  irrigationType: z.string().trim().optional(),
  name: z.string().trim().min(2, "Indica un nombre para la parcela."),
  soilType: z.string().trim().optional(),
});

type PlotFormValues = z.infer<typeof plotSchema>;

function PlotCard({ cropData, plot, farmId }: { cropData: Crop[]; farmId: string; plot: Plot }) {
  return (
    <article className={styles.plotCard}>
      <div className={styles.plotHeading}>
        <div>
          <h3>{plot.name}</h3>
          <p className={styles.location}>
            {plot.areaHa ? `${plot.areaHa} ha` : "Área sin registrar"}
          </p>
        </div>
        <Link className={styles.secondaryButton} href={`/farms/${farmId}/plots/${plot.id}`}>
          Ver parcela
        </Link>
      </div>
      <dl className={styles.metaList}>
        <div>
          <dt>Suelo</dt>
          <dd>{plot.soilType ?? "Sin registrar"}</dd>
        </div>
        <div>
          <dt>Riego</dt>
          <dd>{plot.irrigationType ?? "Sin registrar"}</dd>
        </div>
      </dl>
      <div>
        <p className={styles.muted}>Cultivos vinculados</p>
        {cropData.length > 0 ? (
          <div className={styles.cropLinks}>
            {cropData.map((crop) => (
              <Link className={styles.cropLink} href={`/crops/${crop.id}`} key={crop.id}>
                {crop.cropType}{crop.variety ? ` · ${crop.variety}` : ""}
              </Link>
            ))}
          </div>
        ) : (
          <p className={styles.muted}>Aún no hay cultivos registrados en esta parcela.</p>
        )}
      </div>
    </article>
  );
}

export default function FarmDetailPage() {
  const { farmId } = useParams<{ farmId: string }>();
  const farm = useFarm(farmId);
  const plots = useFarmPlots(farmId);
  const crops = useCrops();
  const createPlot = useCreatePlot();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const form = useForm<PlotFormValues>({
    defaultValues: { areaHa: "", irrigationType: "", name: "", soilType: "" },
    resolver: zodResolver(plotSchema),
  });
  const mutationError = createPlot.error instanceof Error ? createPlot.error.message : null;

  async function submitPlot(values: PlotFormValues) {
    try {
      await createPlot.mutateAsync({
        farmId,
        input: {
          areaHa: values.areaHa ? Number(values.areaHa) : undefined,
          irrigationType: values.irrigationType?.trim() || undefined,
          name: values.name.trim(),
          soilType: values.soilType?.trim() || undefined,
        },
      });
      form.reset();
      setIsFormVisible(false);
    } catch {
      // El error se presenta junto al formulario.
    }
  }

  if (farm.isLoading) {
    return <LoadingState label="Cargando los datos de la finca…" />;
  }

  if (farm.isError) {
    return (
      <ErrorState
        description="No pudimos recuperar esta finca. Es posible que ya no esté disponible."
        retry={<button className={styles.secondaryButton} onClick={() => farm.refetch()} type="button">Reintentar</button>}
      />
    );
  }

  if (!farm.data) {
    return <EmptyState description="No encontramos la finca solicitada." title="Finca no disponible" />;
  }

  const cropsByPlot = new Map<string, Crop[]>();
  for (const crop of crops.data ?? []) {
    const matchingPlots = plots.data?.some((plot) => plot.id === crop.plotId);
    if (!matchingPlots) continue;
    cropsByPlot.set(crop.plotId, [...(cropsByPlot.get(crop.plotId) ?? []), crop]);
  }

  return (
    <main className={styles.page}>
      <nav aria-label="Migas de pan" className={styles.breadcrumb}>
        <Link href="/farms">Fincas</Link>
        <span aria-hidden="true">/</span>
        <span>{farm.data.name}</span>
      </nav>

      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Finca</p>
          <h1 className={styles.pageTitle}>{farm.data.name}</h1>
          <p className={styles.pageLead}>{farm.data.canton}, {farm.data.province}. Consulta las parcelas y sus cultivos asociados.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.primaryButton} onClick={() => setIsFormVisible((value) => !value)} type="button">
            {isFormVisible ? "Cerrar formulario" : "Agregar parcela"}
          </button>
        </div>
      </header>

      <div className={styles.detailGrid}>
        <aside className={styles.infoPanel}>
          <h2>Ficha de la finca</h2>
          <p>Datos operativos registrados para ubicar y comparar las parcelas.</p>
          <dl className={styles.detailList}>
            <div>
              <dt>Provincia</dt>
              <dd>{farm.data.province}</dd>
            </div>
            <div>
              <dt>Cantón</dt>
              <dd>{farm.data.canton}</dd>
            </div>
            <div>
              <dt>Área total</dt>
              <dd>{farm.data.totalAreaHa ? `${farm.data.totalAreaHa} ha` : "Sin registrar"}</dd>
            </div>
            <div>
              <dt>Coordenadas</dt>
              <dd>{farm.data.latitude && farm.data.longitude ? `${farm.data.latitude}, ${farm.data.longitude}` : "Sin registrar"}</dd>
            </div>
          </dl>
        </aside>

        <div className={styles.sectionStack}>
          {isFormVisible && (
            <SectionCard description="Registra las características básicas de una parcela dentro de esta finca." title="Nueva parcela">
              <form className={styles.inlineForm} onSubmit={form.handleSubmit(submitPlot)} noValidate>
                <div className={styles.formGrid}>
                  <label className={styles.formField}>
                    <span>Nombre</span>
                    <input aria-invalid={Boolean(form.formState.errors.name)} {...form.register("name")} />
                    {form.formState.errors.name && <small className={styles.fieldError}>{form.formState.errors.name.message}</small>}
                  </label>
                  <label className={styles.formField}>
                    <span>Área (ha, opcional)</span>
                    <input inputMode="decimal" min="0" step="0.1" type="number" {...form.register("areaHa")} />
                    {form.formState.errors.areaHa && <small className={styles.fieldError}>{form.formState.errors.areaHa.message}</small>}
                  </label>
                  <label className={styles.formField}>
                    <span>Tipo de suelo (opcional)</span>
                    <input {...form.register("soilType")} />
                  </label>
                  <label className={styles.formField}>
                    <span>Tipo de riego (opcional)</span>
                    <input {...form.register("irrigationType")} />
                  </label>
                </div>
                {mutationError && <p className={styles.formError} role="alert">{mutationError}</p>}
                <div className={styles.buttonRow}>
                  <button className={styles.primaryButton} disabled={createPlot.isPending} type="submit">
                    {createPlot.isPending ? "Guardando…" : "Guardar parcela"}
                  </button>
                  <button className={styles.secondaryButton} onClick={() => setIsFormVisible(false)} type="button">Cancelar</button>
                </div>
              </form>
            </SectionCard>
          )}

          <SectionCard description="Cada parcela conserva su suelo, riego y cultivos vinculados." title="Parcelas">
            {plots.isLoading && <LoadingState label="Cargando parcelas…" />}
            {plots.isError && (
              <ErrorState
                description="No pudimos cargar las parcelas de esta finca."
                retry={<button className={styles.secondaryButton} onClick={() => plots.refetch()} type="button">Reintentar</button>}
              />
            )}
            {plots.data && plots.data.length === 0 && (
              <EmptyState description="Agrega la primera parcela para asociar cultivos y decisiones." title="No hay parcelas registradas" />
            )}
            {plots.data && plots.data.length > 0 && (
              <div className={styles.plotList}>
                {plots.data.map((plot) => (
                  <PlotCard cropData={cropsByPlot.get(plot.id) ?? []} farmId={farmId} key={plot.id} plot={plot} />
                ))}
              </div>
            )}
            {crops.isError && <p className={styles.formHint}>No pudimos cargar los cultivos asociados; puedes abrir cada parcela para revisarlos.</p>}
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
