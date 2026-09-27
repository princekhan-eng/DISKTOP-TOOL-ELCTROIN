import { executeQuery, executeRun } from '../sqlite';
import { ArchitecturePlan, ArchitectureNode, ArchitectureEdge } from '../../types';

interface ArchitectureRow {
  id: string;
  project_id: string;
  name: string;
  nodes_json: string;
  edges_json: string;
  generated_text: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: ArchitectureRow): ArchitecturePlan {
  let nodes: ArchitectureNode[] = [];
  let edges: ArchitectureEdge[] = [];

  try {
    nodes = JSON.parse(row.nodes_json);
  } catch {}

  try {
    edges = JSON.parse(row.edges_json);
  } catch {}

  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    nodes,
    edges,
    generatedText: row.generated_text || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const architectureRepository = {
  async getByProjectId(projectId: string): Promise<ArchitecturePlan[]> {
    const rows = await executeQuery<ArchitectureRow>(
      'SELECT * FROM architectures WHERE project_id = ? ORDER BY updated_at DESC',
      [projectId]
    );
    return rows.map(mapRow);
  },

  async getById(id: string): Promise<ArchitecturePlan | null> {
    const rows = await executeQuery<ArchitectureRow>('SELECT * FROM architectures WHERE id = ? LIMIT 1', [id]);
    return rows.length > 0 ? mapRow(rows[0]) : null;
  },

  async save(plan: ArchitecturePlan): Promise<ArchitecturePlan> {
    const now = new Date().toISOString();
    const existing = await this.getById(plan.id);

    if (existing) {
      await executeRun(
        'UPDATE architectures SET name = ?, nodes_json = ?, edges_json = ?, generated_text = ?, updated_at = ? WHERE id = ?',
        [plan.name, JSON.stringify(plan.nodes), JSON.stringify(plan.edges), plan.generatedText, now, plan.id]
      );
      return { ...plan, updatedAt: now };
    } else {
      await executeRun(
        'INSERT INTO architectures (id, project_id, name, nodes_json, edges_json, generated_text, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [plan.id, plan.projectId, plan.name, JSON.stringify(plan.nodes), JSON.stringify(plan.edges), plan.generatedText, now, now]
      );
      return { ...plan, createdAt: now, updatedAt: now };
    }
  },

  async delete(id: string): Promise<void> {
    await executeRun('DELETE FROM architectures WHERE id = ?', [id]);
  },
};
