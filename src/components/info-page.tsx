import type { ReactNode } from "react";

export type InfoSection = {
  title: string;
  body: ReactNode;
};

export function InfoPage({
  eyebrow,
  title,
  lead,
  sections,
  notice,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  sections: InfoSection[];
  notice?: string;
}) {
  return (
    <main id="contenido" tabIndex={-1} className="page-shell info-page">
      <header className="legal-hero">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{lead}</p>
      </header>
      {notice && (
        <aside className="legal-notice">
          <strong>Antes de publicar</strong>
          <p>{notice}</p>
        </aside>
      )}
      <div className="info-sections">
        {sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            <div>{section.body}</div>
          </section>
        ))}
      </div>
    </main>
  );
}
