import type { EventCommand, EventGraph, EventGraphEdge, EventGraphNode, GameProject } from "./model.js";

export function buildEventGraph(project: GameProject): EventGraph {
  const nodes = new Map<string, EventGraphNode>();
  const edges: EventGraphEdge[] = [];

  for (const map of Object.values(project.maps)) {
    nodes.set(`map:${map.id}`, {
      id: `map:${map.id}`,
      type: "map",
      label: map.name
    });
  }

  for (const event of Object.values(project.events)) {
    const eventNodeId = `event:${event.id}`;
    nodes.set(eventNodeId, {
      id: eventNodeId,
      type: "event",
      label: event.id
    });

    edges.push({
      from: `map:${event.map}`,
      to: eventNodeId,
      type: "contains"
    });

    collectCommandGraph(event.commands, eventNodeId, nodes, edges, `event:${event.id}`);
  }

  return {
    nodes: [...nodes.values()],
    edges
  };
}

function collectCommandGraph(
  commands: EventCommand[],
  fromNodeId: string,
  nodes: Map<string, EventGraphNode>,
  edges: EventGraphEdge[],
  branchPrefix: string
) {
  commands.forEach((command, index) => {
    const commandNodeId = `${branchPrefix}:command:${index}`;

    switch (command.type) {
      case "transfer_player":
        ensureNode(nodes, {
          id: `map:${command.map}`,
          type: "map",
          label: command.map
        });
        edges.push({
          from: fromNodeId,
          to: `map:${command.map}`,
          type: "transfer",
          label: `transfer_player ${formatPosition(command.position)}`
        });
        return;

      case "start_battle":
        ensureNode(nodes, {
          id: `battle:${command.enemy}`,
          type: "battle",
          label: command.enemy
        });
        edges.push({
          from: fromNodeId,
          to: `battle:${command.enemy}`,
          type: "battle",
          label: "start_battle"
        });
        return;

      case "choice":
        command.options.forEach((option, optionIndex) => {
          const choiceNodeId = `${commandNodeId}:choice:${optionIndex}`;
          ensureNode(nodes, {
            id: choiceNodeId,
            type: "choice",
            label: option.label
          });
          edges.push({
            from: fromNodeId,
            to: choiceNodeId,
            type: "choice",
            label: command.prompt
          });
          collectCommandGraph(option.commands, choiceNodeId, nodes, edges, choiceNodeId);
        });
        return;

      case "if_flag":
        ensureNode(nodes, {
          id: `flag:${command.flag}`,
          type: "flag",
          label: command.flag
        });
        edges.push({
          from: fromNodeId,
          to: `flag:${command.flag}`,
          type: "flag_condition",
          label: "if_flag"
        });
        collectCommandGraph(command.then, `flag:${command.flag}`, nodes, edges, `${commandNodeId}:then`);
        collectCommandGraph(command.else ?? [], `flag:${command.flag}`, nodes, edges, `${commandNodeId}:else`);
        return;

      case "set_flag":
        ensureNode(nodes, {
          id: `flag:${command.flag}`,
          type: "flag",
          label: command.flag
        });
        edges.push({
          from: fromNodeId,
          to: `flag:${command.flag}`,
          type: "flag_set",
          label: "set_flag"
        });
        return;

      case "unset_flag":
        ensureNode(nodes, {
          id: `flag:${command.flag}`,
          type: "flag",
          label: command.flag
        });
        edges.push({
          from: fromNodeId,
          to: `flag:${command.flag}`,
          type: "flag_unset",
          label: "unset_flag"
        });
        return;

      default:
        return;
    }
  });
}

function ensureNode(nodes: Map<string, EventGraphNode>, node: EventGraphNode) {
  if (!nodes.has(node.id)) {
    nodes.set(node.id, node);
  }
}

function formatPosition(position: [number, number]) {
  return `[${position[0]}, ${position[1]}]`;
}
