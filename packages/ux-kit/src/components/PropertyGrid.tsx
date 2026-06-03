import type { ReactNode } from "react";
import { joinClassNames } from "./shared.js";

export type PropertyFieldOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type PositionValue = [number, number];

export type PropertyField =
  | BasePropertyField<"text", string>
  | BasePropertyField<"number", number>
  | BasePropertyField<"boolean", boolean>
  | (BasePropertyField<"select", string> & { options: PropertyFieldOption[] })
  | BasePropertyField<"position", PositionValue>
  | (BasePropertyField<"reference", string> & { options?: PropertyFieldOption[] })
  | (BasePropertyField<"custom", unknown> & { children: ReactNode });

export type BasePropertyField<Kind extends string, Value> = {
  id: string;
  kind: Kind;
  label: string;
  value?: Value;
  description?: ReactNode;
  error?: ReactNode;
  warning?: ReactNode;
  onChange?: (value: Value) => void;
};

export type PropertyGridProps = {
  fields: PropertyField[];
  className?: string;
};

export function PropertyGrid({ fields, className }: PropertyGridProps) {
  return (
    <div className={joinClassNames("rdk-property-grid", className)}>
      {fields.map((field) => (
        <div className="rdk-property-grid__row" key={field.id}>
          <label className="rdk-property-grid__label" htmlFor={fieldId(field.id)}>
            {field.label}
          </label>
          <div className="rdk-property-grid__control">{renderFieldControl(field)}</div>
          {field.description ? <p className="rdk-field-description">{field.description}</p> : null}
          {field.warning ? <p className="rdk-field-warning">{field.warning}</p> : null}
          {field.error ? <p className="rdk-field-error">{field.error}</p> : null}
        </div>
      ))}
    </div>
  );
}

function renderFieldControl(field: PropertyField) {
  switch (field.kind) {
    case "text":
      return (
        <input
          id={fieldId(field.id)}
          type="text"
          value={field.value ?? ""}
          onChange={(event) => field.onChange?.(event.target.value)}
        />
      );
    case "number":
      return (
        <input
          id={fieldId(field.id)}
          type="number"
          value={field.value ?? 0}
          onChange={(event) => field.onChange?.(Number(event.target.value))}
        />
      );
    case "boolean":
      return (
        <input
          checked={Boolean(field.value)}
          id={fieldId(field.id)}
          type="checkbox"
          onChange={(event) => field.onChange?.(event.target.checked)}
        />
      );
    case "select":
      return (
        <select id={fieldId(field.id)} value={field.value ?? ""} onChange={(event) => field.onChange?.(event.target.value)}>
          {field.options.map((option) => (
            <option disabled={option.disabled} key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    case "position":
      return (
        <div className="rdk-position-field">
          <input
            aria-label={`${field.label} x`}
            type="number"
            value={field.value?.[0] ?? 0}
            onChange={(event) => field.onChange?.([Number(event.target.value), field.value?.[1] ?? 0])}
          />
          <input
            aria-label={`${field.label} y`}
            type="number"
            value={field.value?.[1] ?? 0}
            onChange={(event) => field.onChange?.([field.value?.[0] ?? 0, Number(event.target.value)])}
          />
        </div>
      );
    case "reference":
      return (
        <select id={fieldId(field.id)} value={field.value ?? ""} onChange={(event) => field.onChange?.(event.target.value)}>
          {(field.options ?? []).map((option) => (
            <option disabled={option.disabled} key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    case "custom":
      return field.children;
  }
}

function fieldId(id: string) {
  return `rdk-field-${id}`;
}
