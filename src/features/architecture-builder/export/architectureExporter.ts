import { ArchitecturePlan, ArchitectureNode, ArchitectureEdge } from '../../../types';

export function generateArchitecturePrompt(
  name: string,
  nodes: ArchitectureNode[],
  edges: ArchitectureEdge[]
): string {
  const lines: string[] = [];

  lines.push(`## Architectural System Flow: ${name}`);
  lines.push(`Total Flow Stages: ${nodes.length} sequential nodes.`);

  lines.push(`\n### End-to-End Pipeline Sequence:`);
  nodes.forEach((node, idx) => {
    lines.push(
      `${idx + 1}. **[${node.tier}] ${node.title}** (${node.type})`
    );
    if (node.tech) {
      lines.push(`   - Technology: ${node.tech}`);
    }
    if (node.description) {
      lines.push(`   - Purpose: ${node.description}`);
    }
    if (node.dataFlow) {
      lines.push(`   - Data Contract / Transfer: ${node.dataFlow}`);
    }
  });

  if (edges.length > 0) {
    lines.push(`\n### Flow Transitions & Contracts:`);
    edges.forEach((edge) => {
      const fromNode = nodes.find((n) => n.id === edge.fromNodeId);
      const toNode = nodes.find((n) => n.id === edge.toNodeId);
      if (fromNode && toNode) {
        lines.push(
          `- ${fromNode.title} ──(${edge.label || 'passes data to'})──▶ ${toNode.title}`
        );
      }
    });
  }

  lines.push(`\n### Architectural Invariants & Boundary Rules:`);
  lines.push(`- Keep UI components isolated from storage and database access.`);
  lines.push(`- Enforce strict typing at every boundary layer.`);
  lines.push(`- All errors must be converted to typed domain results before returning to caller.`);

  return lines.join('\n');
}
