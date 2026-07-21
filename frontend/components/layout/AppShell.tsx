"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Brand } from "@/components/ui/Brand";

const navigation = [
  { href: "/dashboard", label: "Panel general", glyph: "dashboard" },
  { href: "/farms", label: "Fincas y parcelas", glyph: "farms" },
  { href: "/crops", label: "Cultivos", glyph: "crops" },
  { href: "/assistant", label: "Asistente", glyph: "assistant" },
  { href: "/notifications", label: "Alertas", glyph: "alerts" },
] as const;

const routeMeta = [
  { match: "/farms", eyebrow: "Producción", title: "Fincas y parcelas" },
  { match: "/crops", eyebrow: "Producción", title: "Cultivos" },
  { match: "/assistant", eyebrow: "Agentes", title: "Asistente agrícola" },
  { match: "/notifications", eyebrow: "Seguimiento", title: "Alertas" },
  { match: "/profile", eyebrow: "Cuenta", title: "Mi perfil" },
  { match: "/dashboard", eyebrow: "Resumen operativo", title: "Panel general" },
] as const;

function getRouteMeta(pathname: string) {
  return (
    routeMeta.find(
      (item) => pathname === item.match || pathname.startsWith(`${item.match}/`),
    ) ?? routeMeta.at(-1)!
  );
}

function isCurrentPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const meta = getRouteMeta(pathname);

  return (
    <div className="app-shell">
      <button
        className={`shell-backdrop ${isNavigationOpen ? "is-visible" : ""}`}
        type="button"
        aria-label="Cerrar navegación"
        onClick={() => setIsNavigationOpen(false)}
      />
      <aside
        className={`shell-sidebar ${isNavigationOpen ? "is-open" : ""}`}
        aria-label="Navegación principal"
      >
        <div className="shell-brand">
          <Brand />
        </div>
        <nav className="shell-navigation">
          <p className="navigation-label">Espacio de trabajo</p>
          <ul>
            {navigation.map((item) => {
              const isActive = isCurrentPath(pathname, item.href);

              return (
                <li key={item.href}>
                  <Link
                    className={`navigation-link ${isActive ? "is-active" : ""}`}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setIsNavigationOpen(false)}
                  >
                    <span
                      className={`navigation-glyph navigation-glyph-${item.glyph}`}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="shell-sidebar-footer">
          <span className="mode-indicator" aria-hidden="true" />
          <div>
            <strong>Modo demostración</strong>
            <span>Datos locales compatibles</span>
          </div>
        </div>
      </aside>

      <div className="shell-main">
        <header className="shell-topbar">
          <button
            className="navigation-toggle"
            type="button"
            aria-label={isNavigationOpen ? "Cerrar navegación" : "Abrir navegación"}
            aria-expanded={isNavigationOpen}
            onClick={() => setIsNavigationOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          <div>
            <p>{meta.eyebrow}</p>
            <h1>{meta.title}</h1>
          </div>
          <Link className="topbar-profile" href="/profile">
            <span aria-hidden="true">AP</span>
            <span>Mi perfil</span>
          </Link>
        </header>
        <main className="shell-content">{children}</main>
      </div>
    </div>
  );
}
