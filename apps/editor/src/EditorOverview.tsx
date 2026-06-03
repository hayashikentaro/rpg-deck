import type { GameProject, ProjectSummary, ValidationIssue } from "@rpg-deck/core-domain";
import type { Direction, RuntimeEventLogEntry, RuntimeSnapshot } from "@rpg-deck/web-runtime";
import {
  AppShell,
  CanvasToolbar,
  CommandList,
  DiffCard,
  InspectorPanel,
  PropertyGrid,
  ValidationIssueList
} from "@rpg-deck/ux-kit";
import { PlayablePreview } from "./features/preview/PlayablePreview.js";
import type { ProjectProposal } from "./proposals.js";

export type EditorOverviewProps = {
  projectTitle: string;
  project: GameProject;
  summary: ProjectSummary;
  validationIssues: ValidationIssue[];
  mermaid: string;
  runtimeSnapshot: RuntimeSnapshot;
  eventLog: RuntimeEventLogEntry[];
  proposal: ProjectProposal | null;
  onMove?: (direction: Direction) => void;
  onInteract?: () => void;
  onRestart?: () => void;
  onCreateProposal?: () => void;
  onAcceptProposal?: () => void;
  onRejectProposal?: () => void;
  onHoldProposal?: () => void;
};

export function EditorOverview({
  projectTitle,
  project,
  summary,
  validationIssues,
  mermaid,
  runtimeSnapshot,
  eventLog,
  proposal,
  onMove,
  onInteract,
  onRestart,
  onCreateProposal,
  onAcceptProposal,
  onRejectProposal,
  onHoldProposal
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
          <PlayablePreview eventLog={eventLog} project={project} snapshot={runtimeSnapshot} />
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
          <section>
            <h2>Diff Review</h2>
            {proposal ? (
              <DiffCard
                title={proposal.title}
                summary={`${proposal.summary} Status: ${proposal.status}. Changes: ${proposal.diff.changes.length}.`}
                changes={proposal.diff.changes.map((change) => ({
                  id: `${change.type}-${change.path}`,
                  type: change.type,
                  entityType: change.entityType,
                  entityId: change.entityId,
                  path: change.path,
                  before: change.before ? <pre>{JSON.stringify(change.before, null, 2)}</pre> : undefined,
                  after: change.after ? <pre>{JSON.stringify(change.after, null, 2)}</pre> : undefined
                }))}
                actions={{
                  onAccept: onAcceptProposal,
                  onReject: onRejectProposal,
                  onHold: onHoldProposal
                }}
              />
            ) : (
              <div className="empty-proposal">
                <p>No active project proposal.</p>
                <button type="button" onClick={onCreateProposal}>
                  Create mock proposal
                </button>
              </div>
            )}
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
