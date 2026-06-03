import type { GameProject, ProjectSummary } from "./model.js";

export function summarizeProject(project: GameProject): ProjectSummary {
  return {
    id: project.id,
    title: project.title,
    startMap: project.settings.start.map,
    startPosition: project.settings.start.position,
    counts: {
      maps: Object.keys(project.maps).length,
      events: Object.keys(project.events).length,
      actors: Object.keys(project.actors).length,
      enemies: Object.keys(project.enemies).length,
      items: Object.keys(project.items).length,
      skills: Object.keys(project.skills).length,
      flags: Object.keys(project.flags).length,
      switches: Object.keys(project.switches).length,
      variables: Object.keys(project.variables).length
    }
  };
}
