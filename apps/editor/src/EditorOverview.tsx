import { useEffect } from "react";
import type { EventDefinition, GameProject, ProjectSummary, ValidationIssue } from "@rpg-deck/core-domain";
import type { Direction, RuntimeEventLogEntry, RuntimeSnapshot } from "@rpg-deck/web-runtime";
import {
  AppShell,
  CommandList,
  DiffCard,
  InspectorPanel,
  PropertyGrid,
  ValidationIssueList
} from "@rpg-deck/ux-kit";
import { EventInspector } from "./features/events/EventInspector.js";
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
  proposalNotice?: string | null;
  selectedEventId: string | null;
  onMove?: (direction: Direction) => void;
  onInteract?: () => void;
  onAdvance?: () => void;
  onChooseOption?: (optionIndex: number) => void;
  onRestart?: () => void;
  onCreateProposal?: () => void;
  onAcceptProposal?: () => void;
  onRejectProposal?: () => void;
  onHoldProposal?: () => void;
  onSelectEvent?: (eventId: string) => void;
  onUpdateEvent?: (eventId: string, updater: (event: EventDefinition) => EventDefinition) => void;
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
  proposalNotice,
  selectedEventId,
  onMove,
  onInteract,
  onAdvance,
  onChooseOption,
  onRestart,
  onCreateProposal,
  onAcceptProposal,
  onRejectProposal,
  onHoldProposal,
  onSelectEvent,
  onUpdateEvent
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      if (isNativeButtonActivation(event)) return;

      const action = runtimeActionForKey(event.key);
      if (!action) return;

      if (action.preventDefault) event.preventDefault();

      if (action.type === "move") onMove?.(action.direction);
      else if (action.type === "interact") {
        if (runtimeSnapshot.canAdvance) onAdvance?.();
        else onInteract?.();
      }
      else onRestart?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onAdvance, onInteract, onMove, onRestart, runtimeSnapshot.canAdvance]);

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
          <section className="runtime-controls" aria-labelledby="runtime-controls-title">
            <h2 id="runtime-controls-title">Runtime controls</h2>
            <div className="runtime-controls__pad" aria-label="Movement controls">
              <button
                className="runtime-controls__button"
                data-direction="up"
                type="button"
                onClick={() => onMove?.("up")}
              >
                Up
              </button>
              <button
                className="runtime-controls__button"
                data-direction="left"
                type="button"
                onClick={() => onMove?.("left")}
              >
                Left
              </button>
              <button
                className="runtime-controls__button"
                data-direction="right"
                type="button"
                onClick={() => onMove?.("right")}
              >
                Right
              </button>
              <button
                className="runtime-controls__button"
                data-direction="down"
                type="button"
                onClick={() => onMove?.("down")}
              >
                Down
              </button>
            </div>
            <div className="runtime-controls__actions">
              <button className="runtime-controls__button" type="button" onClick={onInteract}>
                Interact
              </button>
              <button className="runtime-controls__button" type="button" onClick={onRestart}>
                Restart
              </button>
            </div>
            <p className="runtime-controls__hint">
              Arrow keys / WASD move, Space or Enter advances messages or interacts, R restarts.
            </p>
          </section>
        </aside>
      }
      main={
        <main className="editor-main">
          <PlayablePreview
            eventLog={eventLog}
            project={project}
            snapshot={runtimeSnapshot}
            onAdvance={onAdvance}
            onChooseOption={onChooseOption}
          />
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
            <p className="diff-review__guidance">
              Accept applies the proposed project change. Confirm accepted changes in Event Inspector and Playable Preview.
            </p>
            {proposalNotice ? <p className="diff-review__notice">{proposalNotice}</p> : null}
            {proposal ? (
              <div className="diff-review__proposal">
                <p className="diff-review__status" data-proposal-status={proposal.status}>
                  Proposal status: {proposal.status}
                </p>
                <DiffCard
                  title={proposal.title}
                  summary={`${proposal.summary} Changes: ${proposal.diff.changes.length}.`}
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
              </div>
            ) : (
              <div className="empty-proposal">
                <p>No active mock project proposal.</p>
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
          title="Project Inspector"
          subtitle="Event authoring, validation, and graph output."
          sections={[
            {
              id: "events",
              title: "Events",
              children: (
                <EventInspector
                  project={project}
                  selectedEventId={selectedEventId}
                  onSelectEvent={onSelectEvent}
                  onUpdateEvent={onUpdateEvent}
                />
              )
            },
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

type RuntimeKeyboardAction =
  | { type: "move"; direction: Direction; preventDefault: boolean }
  | { type: "interact"; preventDefault: boolean }
  | { type: "restart"; preventDefault: boolean };

function runtimeActionForKey(key: string): RuntimeKeyboardAction | null {
  if (key === "ArrowUp" || key.toLowerCase() === "w") return { type: "move", direction: "up", preventDefault: true };
  if (key === "ArrowDown" || key.toLowerCase() === "s") return { type: "move", direction: "down", preventDefault: true };
  if (key === "ArrowLeft" || key.toLowerCase() === "a") return { type: "move", direction: "left", preventDefault: true };
  if (key === "ArrowRight" || key.toLowerCase() === "d") return { type: "move", direction: "right", preventDefault: true };
  if (key === " " || key === "Enter") return { type: "interact", preventDefault: true };
  if (key.toLowerCase() === "r") return { type: "restart", preventDefault: false };
  return null;
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return tagName === "input" || tagName === "select" || tagName === "textarea" || target.isContentEditable;
}

function isNativeButtonActivation(event: KeyboardEvent) {
  return event.target instanceof HTMLButtonElement && (event.key === " " || event.key === "Enter");
}
