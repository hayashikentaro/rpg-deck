import type { ProjectSummary, ValidationIssue } from "@rpg-deck/core-domain";
import type { Direction, RuntimeEventLogEntry, RuntimeSnapshot } from "@rpg-deck/web-runtime";
import {
  AppShell,
  CanvasToolbar,
  CommandList,
  InspectorPanel,
  PropertyGrid,
  ValidationIssueList
} from "@rpg-deck/ux-kit";

export type EditorOverviewProps = {
  projectTitle: string;
  summary: ProjectSummary;
  validationIssues: ValidationIssue[];
  mermaid: string;
  runtimeSnapshot: RuntimeSnapshot;
  eventLog: RuntimeEventLogEntry[];
  onMove?: (direction: Direction) => void;
  onInteract?: () => void;
  onRestart?: () => void;
};

export function EditorOverview({
  projectTitle,
  summary,
  validationIssues,
  mermaid,
  runtimeSnapshot,
  eventLog,
  onMove,
  onInteract,
  onRestart
}: EditorOverviewProps) {
  const issueItems = validationIssues.map((issue, index) => ({
    id: `${issue.code}-${issue.path}-${index}`,
    severity: issue.severity,
    code: issue.code,
    message: issue.message,
    path: issue.path,
    entityId: issue.entityId,
    entityType: issue.entityType
  }));

  return (
    <AppShell
      className="editor-shell"
      header={
        <div className="editor-header">
          <h1>{projectTitle}</h1>
          <span>Minimal Editor Shell</span>
        </div>
      }
      sidebar={
        <aside className="editor-sidebar">
          <h2>Project summary</h2>
          <PropertyGrid
            fields={[
              { id: "project-id", kind: "text", label: "Project ID", value: summary.id },
              { id: "start-map", kind: "text", label: "Start map", value: summary.startMap },
              { id: "start-position", kind: "position", label: "Start position", value: summary.startPosition },
              { id: "maps", kind: "number", label: "Maps", value: summary.counts.maps },
              { id: "events", kind: "number", label: "Events", value: summary.counts.events },
              { id: "flags", kind: "number", label: "Flags", value: summary.counts.flags }
            ]}
          />
          <h2>Runtime controls</h2>
          <CanvasToolbar
            actions={[
              { id: "up", label: "Up" },
              { id: "down", label: "Down" },
              { id: "left", label: "Left" },
              { id: "right", label: "Right" },
              { id: "interact", label: "Interact" },
              { id: "restart", label: "Restart" }
            ]}
            onAction={(id) => {
              if (id === "interact") onInteract?.();
              else if (id === "restart") onRestart?.();
              else onMove?.(id as Direction);
            }}
          />
        </aside>
      }
      main={
        <main className="editor-main">
          <section className="preview-placeholder" aria-label="Preview placeholder">
            <h2>Preview placeholder</h2>
            <p>No canvas renderer yet. This panel reflects headless runtime state.</p>
            <dl>
              <dt>Current map</dt>
              <dd>{runtimeSnapshot.currentMapId}</dd>
              <dt>Player position</dt>
              <dd>[{runtimeSnapshot.playerPosition.join(", ")}]</dd>
              <dt>Status</dt>
              <dd>{runtimeSnapshot.status}</dd>
            </dl>
          </section>
          <section>
            <h2>Runtime snapshot</h2>
            <pre>{JSON.stringify(runtimeSnapshot, null, 2)}</pre>
          </section>
          <section>
            <h2>Recent runtime event log</h2>
            <CommandList
              commands={eventLog.map((entry) => ({
                id: String(entry.seq),
                label: `${entry.seq}: ${entry.type}`,
                description: entry.eventId ?? entry.mapId ?? entry.reason
              }))}
            />
          </section>
        </main>
      }
      inspector={
        <InspectorPanel
          title="Project checks"
          subtitle="Validation and graph output from core-domain."
          sections={[
            {
              id: "validation",
              title: "Validation issues",
              children: <ValidationIssueList issues={issueItems} emptyMessage="No validation issues." />
            },
            {
              id: "event-graph",
              title: "Event graph Mermaid",
              children: <pre>{mermaid}</pre>
            }
          ]}
        />
      }
      footer={<p>Editor app composes core-domain, web-runtime, and ux-kit. Domain and runtime logic stay in packages.</p>}
    />
  );
}
