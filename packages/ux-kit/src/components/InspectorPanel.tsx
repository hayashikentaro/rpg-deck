import type { ReactNode } from "react";
import { joinClassNames } from "./shared.js";

export type InspectorField = {
  id: string;
  label: string;
  value?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  warning?: ReactNode;
};

export type InspectorSection = {
  id: string;
  title: string;
  fields?: InspectorField[];
  children?: ReactNode;
};

export type InspectorPanelProps = {
  title: string;
  subtitle?: ReactNode;
  sections: InspectorSection[];
  className?: string;
};

export function InspectorPanel({ title, subtitle, sections, className }: InspectorPanelProps) {
  return (
    <aside className={joinClassNames("rdk-inspector", className)}>
      <header className="rdk-inspector__header">
        <h2>{title}</h2>
        {subtitle ? <div className="rdk-inspector__subtitle">{subtitle}</div> : null}
      </header>
      {sections.map((section) => (
        <section className="rdk-inspector__section" key={section.id}>
          <h3>{section.title}</h3>
          {section.fields?.length ? (
            <dl className="rdk-inspector__fields">
              {section.fields.map((field) => (
                <div className="rdk-inspector__field" key={field.id}>
                  <dt>{field.label}</dt>
                  <dd>
                    {field.value}
                    {field.description ? <p className="rdk-field-description">{field.description}</p> : null}
                    {field.warning ? <p className="rdk-field-warning">{field.warning}</p> : null}
                    {field.error ? <p className="rdk-field-error">{field.error}</p> : null}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
          {section.children}
        </section>
      ))}
    </aside>
  );
}
