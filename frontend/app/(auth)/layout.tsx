import type { ReactNode } from "react";
import { Brand } from "@/components/ui/Brand";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-page">
      <aside className="auth-aside">
        <div>
          <Brand />
          <p className="eyebrow">AgroPilot AI</p>
          <h1>Decisiones agrícolas con evidencia, no con suposiciones.</h1>
          <p>
            Centraliza tus fincas, cultivos, alertas y recomendaciones para decidir
            el siguiente paso con mayor claridad.
          </p>
        </div>
        <ul className="auth-benefits">
          <li>Recomendaciones explicables</li>
          <li>Revisión humana antes de actuar</li>
          <li>Planes semanales priorizados</li>
        </ul>
      </aside>
      <section className="auth-content" aria-label="Acceso a AgroPilot AI">
        <div className="auth-mobile-brand">
          <Brand />
        </div>
        {children}
      </section>
    </main>
  );
}
