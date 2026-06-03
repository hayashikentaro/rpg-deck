import type { ReactNode } from "react";
import { joinClassNames } from "./shared.js";

export type DiffCardChange = {
  id: string;
  type: "added" | "removed" | "changed";
  entityType: string;
  entityId: string;
  path: string;
  before?: ReactNode;
  after?: ReactNode;
  severity?: "info" | "warning" | "error";
};

export type DiffCardActions = {
  onAccept?: () => void;
  onReject?: () => void;
  onHold?: () => void;
  acceptLabel?: string;
  rejectLabel?: string;
  holdLabel?: string;
};

export type DiffCardProps = {
  title: string;
  summary?: ReactNode;
  changes: DiffCardChange[];
  actions?: DiffCardActions;
  className?: string;
};

export function DiffCard({ title, summary, changes, actions, className }: DiffCardProps) {
  return (
    <article className={joinClassNames("rdk-diff-card", className)}>
      <header className="rdk-diff-card__header">
        <h3>{title}</h3>
        {summary ? <p>{summary}</p> : null}
      </header>
      <ul className="rdk-diff-card__changes">
        {changes.map((change) => (
          <li data-severity={change.severity ?? "info"} key={change.id}>
            <span>{change.type}</span>
            <strong>{change.entityType}</strong>
            <code>{change.entityId}</code>
            <code>{change.path}</code>
            {change.before ? <div className="rdk-diff-card__before">{change.before}</div> : null}
            {change.after ? <div className="rdk-diff-card__after">{change.after}</div> : null}
          </li>
        ))}
      </ul>
      {actions ? (
        <footer className="rdk-diff-card__actions">
          {actions.onAccept ? (
            <button type="button" onClick={actions.onAccept}>
              {actions.acceptLabel ?? "Accept"}
            </button>
          ) : null}
          {actions.onReject ? (
            <button type="button" onClick={actions.onReject}>
              {actions.rejectLabel ?? "Reject"}
            </button>
          ) : null}
          {actions.onHold ? (
            <button type="button" onClick={actions.onHold}>
              {actions.holdLabel ?? "Hold"}
            </button>
          ) : null}
        </footer>
      ) : null}
    </article>
  );
}
