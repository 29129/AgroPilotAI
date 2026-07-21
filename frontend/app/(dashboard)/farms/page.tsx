"use client";

import Link from "next/link";

import { EmptyState, ErrorState, LoadingState } from "@/components/ui/AsyncState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useFarms } from "@/hooks/use-farms";

import styles from "./farms.module.css";

export default function FarmsPage() {
  const farms = useFarms();

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Operación agrícola</p>
          <h1 className={styles.pageTitle}>Fincas y parcelas</h1>
          <p className={styles.pageLead}>
            Organiza la ubicación, el área y las parcelas que dan contexto a cada decisión.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link className={styles.primaryButton} href="/farms/new">
            Registrar finca
          </Link>
        </div>
      </header>

      {farms.isLoading && <LoadingState label="Cargando tus fincas…" />}

      {farms.isError && (
        <ErrorState
          description="No pudimos recuperar tus fincas. Comprueba la conexión e intenta nuevamente."
          retry={
            <button className={styles.secondaryButton} onClick={() => farms.refetch()} type="button">
              Reintentar
            </button>
          }
        />
      )}

      {farms.data && farms.data.length === 0 && (
        <EmptyState
          action={
            <Link className={styles.primaryButton} href="/farms/new">
              Registrar la primera finca
            </Link>
          }
          description="Todavía no hay fincas registradas. Empieza con la ubicación principal de tu producción."
          title="Aún no tienes fincas"
        />
      )}

      {farms.data && farms.data.length > 0 && (
        <section aria-label="Fincas registradas" className={styles.cards}>
          {farms.data.map((farm) => (
            <Link className={styles.farmCard} href={`/farms/${farm.id}`} key={farm.id}>
              <div className={styles.cardTopline}>
                <div>
                  <h2>{farm.name}</h2>
                  <p className={styles.location}>
                    {farm.canton}, {farm.province}
                  </p>
                </div>
                <StatusBadge tone="neutral">Finca</StatusBadge>
              </div>
              <dl className={styles.metaList}>
                <div>
                  <dt>Área registrada</dt>
                  <dd>{farm.totalAreaHa ? `${farm.totalAreaHa} ha` : "Sin registrar"}</dd>
                </div>
                <div>
                  <dt>Actualizada</dt>
                  <dd>{new Intl.DateTimeFormat("es-EC", { dateStyle: "medium" }).format(new Date(farm.updatedAt))}</dd>
                </div>
              </dl>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
