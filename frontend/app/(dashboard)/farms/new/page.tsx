"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useCreateFarm } from "@/hooks/use-farms";

import styles from "../farms.module.css";

const farmSchema = z.object({
  canton: z.string().trim().min(2, "Indica el cantón."),
  name: z.string().trim().min(2, "Indica un nombre para la finca."),
  province: z.string().trim().min(2, "Indica la provincia."),
  totalAreaHa: z
    .string()
    .optional()
    .refine((value) => !value || (Number.isFinite(Number(value)) && Number(value) > 0), {
      message: "Usa un área mayor que cero.",
    }),
});

type FarmFormValues = z.infer<typeof farmSchema>;

export default function NewFarmPage() {
  const router = useRouter();
  const createFarm = useCreateFarm();
  const form = useForm<FarmFormValues>({
    defaultValues: { canton: "", name: "", province: "", totalAreaHa: "" },
    resolver: zodResolver(farmSchema),
  });
  const mutationError = createFarm.error instanceof Error ? createFarm.error.message : null;

  async function submit(values: FarmFormValues) {
    try {
      const farm = await createFarm.mutateAsync({
        canton: values.canton.trim(),
        name: values.name.trim(),
        province: values.province.trim(),
        totalAreaHa: values.totalAreaHa ? Number(values.totalAreaHa) : undefined,
      });
      router.push(`/farms/${farm.id}`);
    } catch {
      // El error se presenta junto al formulario.
    }
  }

  return (
    <main className={styles.page}>
      <nav aria-label="Migas de pan" className={styles.breadcrumb}>
        <Link href="/farms">Fincas</Link>
        <span aria-hidden="true">/</span>
        <span>Nueva finca</span>
      </nav>

      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Nuevo registro</p>
          <h1 className={styles.pageTitle}>Registra una finca</h1>
          <p className={styles.pageLead}>
            Esta información ubica las parcelas y permite contextualizar clima, mercado y recomendaciones.
          </p>
        </div>
      </header>

      <section className={styles.infoPanel}>
        <h2>Datos principales</h2>
        <p>Podrás completar o ajustar la información de la finca más adelante.</p>

        <form className={styles.inlineForm} onSubmit={form.handleSubmit(submit)} noValidate>
          <div className={styles.formGrid}>
            <label className={styles.formField}>
              <span>Nombre de la finca</span>
              <input aria-invalid={Boolean(form.formState.errors.name)} autoComplete="organization" {...form.register("name")} />
              {form.formState.errors.name && <small className={styles.fieldError}>{form.formState.errors.name.message}</small>}
            </label>
            <label className={styles.formField}>
              <span>Provincia</span>
              <input aria-invalid={Boolean(form.formState.errors.province)} {...form.register("province")} />
              {form.formState.errors.province && <small className={styles.fieldError}>{form.formState.errors.province.message}</small>}
            </label>
            <label className={styles.formField}>
              <span>Cantón</span>
              <input aria-invalid={Boolean(form.formState.errors.canton)} {...form.register("canton")} />
              {form.formState.errors.canton && <small className={styles.fieldError}>{form.formState.errors.canton.message}</small>}
            </label>
            <label className={styles.formField}>
              <span>Área total (ha, opcional)</span>
              <input inputMode="decimal" min="0" step="0.1" type="number" {...form.register("totalAreaHa")} />
              {form.formState.errors.totalAreaHa && <small className={styles.fieldError}>{form.formState.errors.totalAreaHa.message}</small>}
            </label>
          </div>

          {mutationError && <p className={styles.formError} role="alert">{mutationError}</p>}

          <div className={styles.buttonRow}>
            <button className={styles.primaryButton} disabled={createFarm.isPending} type="submit">
              {createFarm.isPending ? "Guardando…" : "Guardar finca"}
            </button>
            <Link className={styles.secondaryButton} href="/farms">
              Cancelar
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
