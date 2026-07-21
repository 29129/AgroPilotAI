"use client";

import { EmptyState, ErrorState, LoadingState } from "@/components/ui/AsyncState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useCrops, useCurrentUser, useFarms } from "@/hooks";

import styles from "./page.module.css";

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-EC", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function roleLabel(role: "PRODUCER" | "TECHNICIAN" | "ADMIN") {
  return {
    PRODUCER: "Productora",
    TECHNICIAN: "Técnico",
    ADMIN: "Administración",
  }[role];
}

export default function ProfilePage() {
  const userQuery = useCurrentUser();
  const farmsQuery = useFarms();
  const cropsQuery = useCrops();

  if (userQuery.isLoading) {
    return <LoadingState label="Cargando tu perfil…" />;
  }

  if (userQuery.isError) {
    return (
      <ErrorState
        description={errorMessage(userQuery.error, "No pudimos cargar la información de tu perfil.")}
        retry={
          <button className="action-secondary" type="button" onClick={() => userQuery.refetch()}>
            Reintentar
          </button>
        }
      />
    );
  }

  const user = userQuery.data;

  if (!user) {
    return (
      <EmptyState
        title="No hay un perfil disponible"
        description="Inicia sesión de nuevo para recuperar la información de tu cuenta."
      />
    );
  }

  const activeCrops = (cropsQuery.data ?? []).filter((crop) => crop.status === "ACTIVE").length;
  const totalArea = (farmsQuery.data ?? []).reduce((total, farm) => total + (farm.totalAreaHa ?? 0), 0);

  return (
    <div className={styles.page}>
      <section className={styles.profileHeader}>
        <div className={styles.avatar} aria-hidden="true">
          {initials(user.name)}
        </div>
        <div className={styles.profileIdentity}>
          <p className="eyebrow">Cuenta y espacio de trabajo</p>
          <div>
            <h2>{user.name}</h2>
            <StatusBadge tone="success">Cuenta activa</StatusBadge>
          </div>
          <p>{user.email}</p>
        </div>
      </section>

      <section className={styles.grid}>
        <article className={styles.detailsCard}>
          <header>
            <div>
              <p>Datos de la cuenta</p>
              <h3>Perfil operativo</h3>
            </div>
            <StatusBadge tone="neutral">{roleLabel(user.role)}</StatusBadge>
          </header>
          <dl>
            <div>
              <dt>Nombre</dt>
              <dd>{user.name}</dd>
            </div>
            <div>
              <dt>Correo</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Rol</dt>
              <dd>{roleLabel(user.role)}</dd>
            </div>
            <div>
              <dt>Miembro desde</dt>
              <dd>{formatDate(user.createdAt)}</dd>
            </div>
          </dl>
        </article>

        <article className={styles.workspaceCard}>
          <header>
            <p>Resumen del espacio</p>
            <h3>Alcance actual</h3>
          </header>
          <div className={styles.metrics}>
            <div>
              <span>Fincas</span>
              <strong>{farmsQuery.isLoading ? "—" : farmsQuery.data?.length ?? 0}</strong>
            </div>
            <div>
              <span>Área registrada</span>
              <strong>{farmsQuery.isLoading ? "—" : `${totalArea.toFixed(1)} ha`}</strong>
            </div>
            <div>
              <span>Cultivos activos</span>
              <strong>{cropsQuery.isLoading ? "—" : activeCrops}</strong>
            </div>
          </div>
          {farmsQuery.isError || cropsQuery.isError ? (
            <p className={styles.softError} role="status">
              Parte del resumen no está disponible en este momento.
            </p>
          ) : (
            <p className={styles.workspaceNote}>
              Este resumen se actualiza con los datos de tus fincas y cultivos registrados.
            </p>
          )}
        </article>
      </section>

      <section className={styles.safetyCard}>
        <div>
          <p className="eyebrow">Control humano</p>
          <h3>Las decisiones sensibles se mantienen bajo tu control.</h3>
          <p>
            AgroPilot explica la evidencia antes de proponer una acción. Riego, aplicación de
            insumos o cambios de plan requieren una validación explícita.
          </p>
        </div>
        <StatusBadge tone="info">Aprobación requerida</StatusBadge>
      </section>
    </div>
  );
}
