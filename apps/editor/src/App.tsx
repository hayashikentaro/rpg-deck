import { useEffect, useMemo, useState } from "react";
import {
  buildEventGraph,
  eventGraphToMermaid,
  parseProjectJson,
  summarizeProject,
  validateProject,
  type EventDefinition,
  type GridPosition
} from "@rpg-deck/core-domain";
import { createRuntime, type Direction, type PlayerInput } from "@rpg-deck/web-runtime";
import sampleProjectJson from "../../../packages/sample-projects/tiny-rpg/project.json" with { type: "json" };
import { EditorOverview, type MapEditMode } from "./EditorOverview.js";
import { createMockProposal, type ProjectProposal } from "./proposals.js";

const sampleProject = parseProjectJson(JSON.stringify(sampleProjectJson));

export function App() {
  const [project, setProject] = useState(sampleProject);
  const [proposal, setProposal] = useState<ProjectProposal | null>(() => createMockProposal(sampleProject));
  const [proposalNotice, setProposalNotice] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(() => Object.keys(sampleProject.events)[0] ?? null);
  const [mapEditMode, setMapEditMode] = useState<MapEditMode>("move_event");
  const summary = useMemo(() => summarizeProject(project), [project]);
  const validationIssues = useMemo(() => validateProject(project), [project]);
  const graph = useMemo(() => buildEventGraph(project), [project]);
  const mermaid = useMemo(() => eventGraphToMermaid(graph), [graph]);
  const runtime = useMemo(() => {
    const nextRuntime = createRuntime(project);
    nextRuntime.startNewGame();
    return nextRuntime;
  }, [project]);
  const [snapshot, setSnapshot] = useState(() => runtime.getSnapshot());
  const [eventLog, setEventLog] = useState(() => runtime.getEventLog());

  useEffect(() => {
    setSnapshot(runtime.getSnapshot());
    setEventLog(runtime.getEventLog());
  }, [runtime]);

  useEffect(() => {
    if (selectedEventId && project.events[selectedEventId]) return;
    setSelectedEventId(Object.keys(project.events)[0] ?? null);
  }, [project, selectedEventId]);

  const dispatchRuntimeInput = (input: PlayerInput) => {
    runtime.dispatch(input);
    setSnapshot(runtime.getSnapshot());
    setEventLog(runtime.getEventLog());
  };

  const restart = () => {
    runtime.startNewGame();
    setSnapshot(runtime.getSnapshot());
    setEventLog(runtime.getEventLog());
  };

  const createProposal = () => {
    setProposal(createMockProposal(project));
    setProposalNotice(null);
  };

  const acceptProposal = () => {
    if (!proposal) return;

    const affectedEventId = proposal.diff.changes.find((change) => change.entityType === "event")?.entityId;
    setProject(proposal.afterProject);
    if (affectedEventId) setSelectedEventId(affectedEventId);
    setProposal(null);
    setProposalNotice("Accepted proposal applied. Confirm the updated event in Event Inspector and Playable Preview.");
  };

  const rejectProposal = () => {
    setProposal(null);
    setProposalNotice("Mock proposal rejected. The current project was not changed.");
  };

  const holdProposal = () => {
    if (!proposal) return;

    setProposal({
      ...proposal,
      status: "held"
    });
    setProposalNotice(null);
  };

  const importProjectJson = (json: string): { ok: true } | { ok: false; message: string } => {
    try {
      const importedProject = parseProjectJson(json);

      setProject(importedProject);
      setSelectedEventId((currentEventId) =>
        currentEventId && importedProject.events[currentEventId]
          ? currentEventId
          : Object.keys(importedProject.events)[0] ?? null
      );
      setProposal(null);
      setProposalNotice("Project JSON imported. Runtime and editor views now use the imported project.");

      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: `Import failed. Paste valid RPG Deck project JSON.${formatImportError(error)}`
      };
    }
  };

  const updateEvent = (eventId: string, updater: (event: EventDefinition) => EventDefinition) => {
    setProject((currentProject) => {
      const currentEvent = currentProject.events[eventId];
      if (!currentEvent) return currentProject;

      return {
        ...currentProject,
        events: {
          ...currentProject.events,
          [eventId]: updater(currentEvent)
        }
      };
    });
  };

  const moveSelectedEventTo = (position: GridPosition) => {
    if (!selectedEventId || !project.events[selectedEventId]) return;

    updateEvent(selectedEventId, (event) => ({
      ...event,
      position: [position[0], position[1]]
    }));
  };

  const toggleCollisionAt = (position: GridPosition) => {
    const mapId = snapshot.currentMapId;
    setProject((currentProject) => {
      const currentMap = currentProject.maps[mapId];
      if (!currentMap) return currentProject;

      const collision = currentMap.collision ?? [];
      const hasCollision = collision.some((collisionPosition) => positionsEqual(collisionPosition, position));
      const nextCollision = hasCollision
        ? collision.filter((collisionPosition) => !positionsEqual(collisionPosition, position))
        : [...collision, [position[0], position[1]] as GridPosition];

      return {
        ...currentProject,
        maps: {
          ...currentProject.maps,
          [mapId]: {
            ...currentMap,
            collision: nextCollision
          }
        }
      };
    });
  };

  return (
    <EditorOverview
      eventLog={eventLog.slice(-8).reverse()}
      mermaid={mermaid}
      proposal={proposal}
      proposalNotice={proposalNotice}
      mapEditMode={mapEditMode}
      project={project}
      projectTitle={project.title}
      runtimeSnapshot={snapshot}
      selectedEventId={selectedEventId}
      summary={summary}
      validationIssues={validationIssues}
      onAcceptProposal={acceptProposal}
      onAdvance={() => dispatchRuntimeInput({ type: "advance" })}
      onCreateProposal={createProposal}
      onHoldProposal={holdProposal}
      onImportProjectJson={importProjectJson}
      onInteract={() => dispatchRuntimeInput({ type: "interact" })}
      onChooseOption={(optionIndex) => dispatchRuntimeInput({ type: "choose", optionIndex })}
      onMapEditModeChange={setMapEditMode}
      onMove={(direction: Direction) => dispatchRuntimeInput({ type: "move", direction })}
      onMoveSelectedEvent={moveSelectedEventTo}
      onRejectProposal={rejectProposal}
      onRestart={restart}
      onSelectEvent={setSelectedEventId}
      onToggleCollision={toggleCollisionAt}
      onUpdateEvent={updateEvent}
    />
  );
}

function positionsEqual(left: GridPosition, right: GridPosition) {
  return left[0] === right[0] && left[1] === right[1];
}

function formatImportError(error: unknown) {
  if (!(error instanceof Error) || !error.message) return "";

  const firstLine = error.message.split("\n")[0]?.trim();
  if (!firstLine) return "";

  return ` ${firstLine.slice(0, 160)}`;
}
