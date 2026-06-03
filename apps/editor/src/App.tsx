import { useMemo, useState } from "react";
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

const sampleProject = parseProjectJson(JSON.stringify(sampleProjectJson));

export function App() {
  const project = sampleProject;
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

  return (
    <EditorOverview
      eventLog={eventLog.slice(-8).reverse()}
      mermaid={mermaid}
      projectTitle={project.title}
      runtimeSnapshot={snapshot}
      summary={summary}
      validationIssues={validationIssues}
      onInteract={() => dispatchRuntimeInput({ type: "interact" })}
      onMove={(direction: Direction) => dispatchRuntimeInput({ type: "move", direction })}
      onRestart={restart}
    />
  );
}
