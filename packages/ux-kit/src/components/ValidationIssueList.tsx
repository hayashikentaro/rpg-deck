import { joinClassNames } from "./shared.js";

export type ValidationIssueListItem = {
  id?: string;
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  path?: string;
  entityId?: string;
  entityType?: string;
};

export type ValidationIssueListProps = {
  issues: ValidationIssueListItem[];
  emptyMessage?: string;
  className?: string;
};

export function ValidationIssueList({ issues, emptyMessage = "No issues.", className }: ValidationIssueListProps) {
  return (
    <section className={joinClassNames("rdk-validation-issues", className)}>
      {issues.length === 0 ? <p>{emptyMessage}</p> : null}
      {issues.length > 0 ? (
        <ul>
          {issues.map((issue, index) => (
            <li data-severity={issue.severity} key={issue.id ?? `${issue.code}-${index}`}>
              <strong>{issue.severity}</strong>
              <code>{issue.code}</code>
              <span>{issue.message}</span>
              {issue.path ? <code>{issue.path}</code> : null}
              {issue.entityType || issue.entityId ? (
                <span>
                  {issue.entityType}
                  {issue.entityType && issue.entityId ? ":" : ""}
                  {issue.entityId}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
