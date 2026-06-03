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

  if (afterProject.flags.mayor_follow_up_unlocked) {
    afterProject.items = {
      ...afterProject.items,
      antidote: {
        id: "antidote",
        name: "Antidote"
      }
    };

    return {
      id: "mock-add-antidote",
      title: "Add antidote item",
      summary: "Adds a small database item so future proposal review can inspect added entities.",
      status: "active",
      beforeProject: project,
      afterProject,
      diff: diffProjects(project, afterProject)
    };
  }

  afterProject.flags = {
    ...afterProject.flags,
    mayor_follow_up_unlocked: {
      id: "mayor_follow_up_unlocked",
      name: "Mayor follow-up unlocked"
    }
  };
  afterProject.events = {
    ...afterProject.events,
    mayor_intro: {
      ...afterProject.events.mayor_intro,
      commands: afterProject.events.mayor_intro.commands.map((command) =>
        command.type === "show_message"
          ? {
              ...command,
              text: "北の洞窟には近づくな。準備ができたら、もう一度わしに話しかけなさい。"
            }
          : command
      )
    }
  };

  return {
    id: "mock-mayor-follow-up",
    title: "Mayor follow-up guidance",
    summary: "Updates the mayor warning text and adds a stable flag for a future follow-up branch.",
    status: "active",
    beforeProject: project,
    afterProject,
    diff: diffProjects(project, afterProject)
  };
}

function cloneProject(project: GameProject): GameProject {
  return JSON.parse(JSON.stringify(project)) as GameProject;
}
