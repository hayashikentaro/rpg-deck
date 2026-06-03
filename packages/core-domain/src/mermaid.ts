import type { EventGraph } from "./model.js";

export function eventGraphToMermaid(graph: EventGraph): string {
  const lines = ["flowchart TD"];

  for (const node of graph.nodes) {
    lines.push(`  ${mermaidNodeId(node.id)}["${escapeLabel(node.label)}"]`);
  }

  for (const edge of graph.edges) {
    const label = edge.label ? `|"${escapeLabel(edge.label)}"|` : "";
    lines.push(`  ${mermaidNodeId(edge.from)} -->${label} ${mermaidNodeId(edge.to)}`);
  }

  return `${lines.join("\n")}\n`;
}

function mermaidNodeId(id: string) {
  const sanitized = id.replace(/[^A-Za-z0-9_]/g, "_");
  return /^[A-Za-z_]/.test(sanitized) ? sanitized : `node_${sanitized}`;
}

function escapeLabel(label: string) {
  return label.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
