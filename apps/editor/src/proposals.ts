import { diffProjects, type GameProject, type ProjectDiff } from "@rpg-deck/core-domain";

export type ProposalStatus = "active" | "accepted" | "rejected" | "held";

export type ProjectProposal = {
  id: string;
  title: string;
  summary: string;
  status: ProposalStatus;
  beforeProject: GameProject;
  afterProject: GameProject;
  diff: ProjectDiff;
};

export function createMockProposal(project: GameProject): ProjectProposal {
  const afterProject = cloneProject(project);
  const targetEvent = findMessageEvent(afterProject);

  if (!targetEvent) {
    return {
      id: "mock-no-previewable-dialogue",
      title: "No preview-confirmable dialogue found",
      summary: "No event with a direct show_message command was found, so this mock proposal makes no changes.",
      status: "active",
      beforeProject: project,
      afterProject,
      diff: diffProjects(project, afterProject)
    };
  }

  const messageIndex = targetEvent.commands.findIndex((command) => command.type === "show_message");
  afterProject.events = {
    ...afterProject.events,
    [targetEvent.id]: {
      ...targetEvent,
      commands: targetEvent.commands.map((command, index) =>
        index === messageIndex && command.type === "show_message"
          ? {
              ...command,
              text: "北の洞窟にはまだ近づくな。準備ができたら戻ってこい。"
            }
          : command
      )
    }
  };

  return {
    id: `mock-dialogue-${targetEvent.id}`,
    title: `Clarify dialogue for ${targetEvent.id}`,
    summary: `Updates the first direct show_message in '${targetEvent.id}' so the proposal can be confirmed in Event Inspector and Playable Preview.`,
    status: "active",
    beforeProject: project,
    afterProject,
    diff: diffProjects(project, afterProject)
  };
}

function cloneProject(project: GameProject): GameProject {
  return JSON.parse(JSON.stringify(project)) as GameProject;
}

function findMessageEvent(project: GameProject) {
  const mayorIntro = project.events.mayor_intro;
  if (mayorIntro?.commands.some((command) => command.type === "show_message")) return mayorIntro;

  return Object.values(project.events).find((event) =>
    event.commands.some((command) => command.type === "show_message")
  );
}
