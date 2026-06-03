import { useEffect, useMemo, useState } from "react";
import {
  buildEventGraph,
  eventGraphToMermaid,
  parseProjectJson,
  summarizeProject,
  validateProject
} from "@rpg-deck/core-domain";
import { createRuntime, type Direction, type PlayerInput } from "@rpg-deck/web-runtime";
import sampleProjectJson from "../../../packages/sample-projects/tiny-rpg/project.json" with { type: "json" };
import { EditorOverview } from "./EditorOverview.js";
import { createMockProposal, type ProjectProposal } from "./proposals.js";

const sampleProject = parseProjectJson(JSON.stringify(sampleProjectJson));

export function App() {
  const [project, setProject] = useState(sampleProject);
  const [proposal, setProposal] = useState<ProjectProposal | null>(() => createMockProposal(sampleProject));
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
  };

  const acceptProposal = () => {
    if (!proposal) return;

    setProject(proposal.afterProject);
    setProposal(null);
  };

  const rejectProposal = () => {
    setProposal(null);
  };

  const holdProposal = () => {
    if (!proposal) return;

    setProposal({
      ...proposal,
      status: "held"
    });
  };

  return (
    <EditorOverview
      eventLog={eventLog.slice(-8).reverse()}
      mermaid={mermaid}
      proposal={proposal}
      project={project}
      projectTitle={project.title}
      runtimeSnapshot={snapshot}
      summary={summary}
      validationIssues={validationIssues}
      onAcceptProposal={acceptProposal}
      onCreateProposal={createProposal}
      onHoldProposal={holdProposal}
      onInteract={() => dispatchRuntimeInput({ type: "interact" })}
      onMove={(direction: Direction) => dispatchRuntimeInput({ type: "move", direction })}
      onRejectProposal={rejectProposal}
      onRestart={restart}
    />
  );
}
