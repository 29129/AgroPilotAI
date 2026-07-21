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
import { useCreateDiagnosis, useCrop, useCropDiagnoses } from "@/hooks/use-crops";
import type { DiagnosisSeverity, DiagnosisStatus } from "@/types/diagnoses";

import styles from "../../crops.module.css";

const diagnosisSchema = z.object({
  symptoms: z.string().trim().max(600, "Describe los síntomas en menos de 600 caracteres.").optional(),
});

type DiagnosisFormValues = z.infer<typeof diagnosisSchema>;

const diagnosisStatuses: Record<DiagnosisStatus, { label: string; tone: "danger" | "info" | "neutral" | "success" | "warning" }> = {
  COMPLETED: { label: "Completado", tone: "success" },
  FAILED: { label: "Fallido", tone: "danger" },
  PENDING: { label: "Pendiente", tone: "warning" },
  PROCESSING: { label: "En proceso", tone: "info" },
};

const severities: Record<DiagnosisSeverity, { label: string; tone: "danger" | "info" | "neutral" | "success" | "warning" }> = {
  CRITICAL: { label: "Crítica", tone: "danger" },
  HIGH: { label: "Alta", tone: "warning" },
  LOW: { label: "Baja", tone: "neutral" },
  MEDIUM: { label: "Media", tone: "info" },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function DiagnosisPage() {
  const { cropId } = useParams<{ cropId: string }>();
  const crop = useCrop(cropId);
  const diagnoses = useCropDiagnoses(cropId);
  const createDiagnosis = useCreateDiagnosis();
  const form = useForm<DiagnosisFormValues>({
    defaultValues: { symptoms: "" },
    resolver: zodResolver(diagnosisSchema),
  });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const mutationError = createDiagnosis.error instanceof Error ? createDiagnosis.error.message : null;

  async function submit(values: DiagnosisFormValues) {
    setFeedback(null);
    if (!file) {
      setFileError("Selecciona una imagen para continuar.");
      return;
    }

    try {
      await createDiagnosis.mutateAsync({
        cropId,
        input: {
          image: file,
          symptoms: values.symptoms?.trim() || undefined,
        },
      });
      form.reset();
      setFile(null);
      setFileError(null);
      setFileInputKey((value) => value + 1);
      setFeedback("La imagen se registró. Revisa los hallazgos y confirma en campo antes de aplicar un tratamiento.");
    } catch {
      // El error de la operación se muestra en el formulario.
    }
  }

  if (crop.isLoading) {
    return <LoadingState label="Cargando el cultivo…" />;
  }

  if (crop.isError || !crop.data) {
    return (
      <ErrorState
        description="No pudimos recuperar el cultivo para registrar un diagnóstico."
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
        <span>Diagnóstico</span>
      </nav>

      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Diagnóstico visual</p>
          <h1 className={styles.pageTitle}>Evidencia de {cropName}</h1>
          <p className={styles.pageLead}>Los hallazgos son orientativos. Contrasta la evidencia con una inspección de campo antes de ejecutar un tratamiento.</p>
        </div>
        <div className={styles.headerActions}>
          <Link className={styles.secondaryButton} href={`/crops/${cropId}`}>Volver al cultivo</Link>
        </div>
      </header>

      <section className={styles.overviewGrid}>
        <SectionCard description="Sube una imagen reciente y describe lo que observaste en campo." title="Nuevo análisis">
          <form className={styles.formPanel} onSubmit={form.handleSubmit(submit)} noValidate>
            <div className={styles.formGrid}>
              <label className={styles.formField}>
                <span>Imagen del cultivo</span>
                <input
                  accept="image/jpeg,image/png,image/webp"
                  aria-invalid={Boolean(fileError)}
                  key={fileInputKey}
                  onChange={(event) => {
                    const selected = event.currentTarget.files?.[0] ?? null;
                    setFile(selected);
                    setFileError(selected ? null : "Selecciona una imagen para continuar.");
                  }}
                  type="file"
                />
                {file && <small className={styles.formHint}>{file.name}</small>}
                {fileError && <small className={styles.fieldError} role="alert">{fileError}</small>}
              </label>
              <label className={`${styles.formField} ${styles.formFieldWide}`}>
                <span>Síntomas observados (opcional)</span>
                <textarea
                  aria-invalid={Boolean(form.formState.errors.symptoms)}
                  placeholder="Ej.: manchas amarillas irregulares en hojas jóvenes, zona y evolución observada."
                  {...form.register("symptoms")}
                />
                {form.formState.errors.symptoms && <small className={styles.fieldError}>{form.formState.errors.symptoms.message}</small>}
              </label>
            </div>

            <p className={styles.formHint}>Formatos admitidos: JPG, PNG o WEBP. La recomendación resultante nunca reemplaza la revisión técnica.</p>
            {mutationError && <p className={styles.formError} role="alert">{mutationError}</p>}
            {feedback && <p className={styles.feedback} role="status">{feedback}</p>}
            <div className={styles.buttonRow}>
              <button className={styles.primaryButton} disabled={createDiagnosis.isPending} type="submit">
                {createDiagnosis.isPending ? "Analizando…" : "Registrar y analizar imagen"}
              </button>
            </div>
          </form>
        </SectionCard>

        <article className={styles.detailCard}>
          <h2>Antes de decidir</h2>
          <ul className={styles.compactList}>
            <li>
              <strong>Registra contexto</strong>
              <span>Anota la zona de la parcela, fecha y evolución de los síntomas.</span>
            </li>
            <li>
              <strong>Verifica en campo</strong>
              <span>Una imagen puede sugerir una causa, pero no confirma enfermedad ni tratamiento.</span>
            </li>
            <li>
              <strong>Escala si es necesario</strong>
              <span>Los hallazgos que requieren revisión técnica deben validarse antes de actuar.</span>
            </li>
          </ul>
        </article>
      </section>

      <SectionCard description="Resultados registrados para este cultivo, con su evidencia y nivel de confianza." title="Historial de diagnósticos">
        {diagnoses.isLoading && <LoadingState label="Cargando diagnósticos…" />}
        {diagnoses.isError && (
          <ErrorState
            description="No pudimos cargar el historial de diagnósticos."
            retry={<button className={styles.secondaryButton} onClick={() => diagnoses.refetch()} type="button">Reintentar</button>}
          />
        )}
        {diagnoses.data && diagnoses.data.length === 0 && (
          <EmptyState description="Sube la primera imagen cuando observes un cambio que necesite seguimiento." title="Aún no hay diagnósticos" />
        )}
        {diagnoses.data && diagnoses.data.length > 0 && (
          <div className={styles.diagnosisList}>
            {diagnoses.data.map((diagnosis) => {
              const status = diagnosisStatuses[diagnosis.status];
              const canShowImage = Boolean(diagnosis.imageUrl?.startsWith("https://") || diagnosis.imageUrl?.startsWith("http://"));
              return (
                <article className={styles.diagnosisCard} key={diagnosis.id}>
                  <div className={styles.diagnosisBody}>
                    <div className={styles.diagnosisHeading}>
                      <div>
                        <h3>{diagnosis.summary ?? "Análisis visual registrado"}</h3>
                        <p className={styles.cardSubtitle}>{formatDate(diagnosis.createdAt)}</p>
                      </div>
                      <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                    </div>
                    {diagnosis.symptoms && <p className={styles.recommendationSummary}>{diagnosis.symptoms}</p>}
                    <dl className={styles.factList}>
                      <div>
                        <dt>Confianza</dt>
                        <dd>{diagnosis.confidence !== undefined ? `${Math.round(diagnosis.confidence * 100)} %` : "No disponible"}</dd>
                      </div>
                      <div>
                        <dt>Revisión técnica</dt>
                        <dd>{diagnosis.requiresTechnicalReview ? "Requerida" : "No requerida"}</dd>
                      </div>
                    </dl>
                    {diagnosis.findings && diagnosis.findings.length > 0 && (
                      <div>
                        <p className={styles.sectionLabel}>Hallazgos</p>
                        <ul className={styles.findingList}>
                          {diagnosis.findings.map((finding, index) => {
                            const severity = finding.severity ? severities[finding.severity] : null;
                            return (
                              <li key={`${diagnosis.id}-${finding.condition}-${index}`}>
                                <div className={styles.findingTopline}>
                                  <strong>{finding.condition}</strong>
                                  {severity && <StatusBadge tone={severity.tone}>{severity.label}</StatusBadge>}
                                </div>
                                <p>{finding.description ?? "Sin descripción adicional."}</p>
                                <p>Confianza estimada: {Math.round(finding.confidence * 100)} %</p>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    {diagnosis.requiresTechnicalReview && (
                      <p className={styles.approvalNotice}>Este resultado necesita revisión técnica antes de aplicar tratamientos o insumos.</p>
                    )}
                  </div>
                  {canShowImage ? (
                    <img alt={`Evidencia del diagnóstico ${diagnosis.id}`} className={styles.diagnosisImage} src={diagnosis.imageUrl} />
                  ) : (
                    <div className={styles.diagnosisImagePlaceholder}>Imagen registrada de forma segura</div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </SectionCard>
    </main>
  );
}
