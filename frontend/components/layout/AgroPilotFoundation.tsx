import Link from "next/link";

import { Brand } from "@/components/ui/Brand";

const modules = [
  {
    label: "Fincas y parcelas",
    description: "Organiza la información base de cada unidad productiva.",
  },
  {
    label: "Cultivos y diagnósticos",
    description: "Concentra el estado sanitario, las imágenes y los hallazgos.",
  },
  {
    label: "Recomendaciones explicables",
    description: "Relaciona cada sugerencia con su evidencia y confianza.",
  },
  {
    label: "Plan semanal",
    description: "Convierte prioridades aprobadas en tareas accionables.",
  },
] as const;

const principles = [
  {
    number: "01",
    title: "Evidencia antes que automatización",
    description:
      "Cada recomendación muestra su origen, explicación y nivel de confianza.",
  },
  {
    number: "02",
    title: "El productor conserva el control",
    description:
      "Las acciones relevantes se revisan y aprueban antes de marcarse como realizadas.",
  },
  {
    number: "03",
    title: "Una base lista para crecer",
    description:
      "La interfaz se conecta mediante servicios tipados y puede operar con datos de demostración o API real.",
  },
] as const;

export function AgroPilotFoundation() {
  return (
    <main className="foundation-page">
      <div className="foundation-frame">
        <header className="foundation-header">
          <Brand />
          <Link className="action-secondary" href="/login">
            Ingresar
          </Link>
        </header>

        <section className="foundation-hero" aria-labelledby="foundation-title">
          <div>
            <p className="eyebrow">Centro de decisiones agrícolas</p>
            <h1 id="foundation-title" className="foundation-title">
              Decisiones más claras para <strong>cada cultivo.</strong>
            </h1>
            <p className="foundation-lead">
              AgroPilot AI reúne datos de la finca, clima, sanidad y mercado para
              ayudar a productores y técnicos a priorizar acciones con contexto.
            </p>
            <div className="foundation-actions">
              <Link className="action-primary" href="/login">
                Empezar ahora
              </Link>
              <Link className="action-secondary" href="/dashboard">
                Ver panel de demostración
              </Link>
            </div>
          </div>

          <section
            className="foundation-panel"
            id="modulos"
            aria-labelledby="modules-title"
          >
            <div className="panel-heading">
              <div>
                <p>Una operación conectada</p>
                <h2 id="modules-title">Información que se convierte en acción</h2>
              </div>
              <span className="panel-tag">Demo lista</span>
            </div>
            <ul className="module-list">
              {modules.map((module, index) => (
                <li className="module-item" key={module.label}>
                  <span className="module-index">0{index + 1}</span>
                  <div className="module-copy">
                    <h3>{module.label}</h3>
                    <p>{module.description}</p>
                  </div>
                  <span className="module-state">Disponible</span>
                </li>
              ))}
            </ul>
          </section>
        </section>

        <section
          id="principios"
          className="foundation-principles"
          aria-label="Principios de AgroPilot AI"
        >
          {principles.map((principle) => (
            <article className="principle" key={principle.number}>
              <span className="principle-number">{principle.number}</span>
              <h2>{principle.title}</h2>
              <p>{principle.description}</p>
            </article>
          ))}
        </section>

        <footer className="foundation-footer">
          Diseño accesible, responsive y preparado para API real o modo mock.
        </footer>
      </div>
    </main>
  );
}
