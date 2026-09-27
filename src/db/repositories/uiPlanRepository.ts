import { executeQuery, executeRun } from '../sqlite';
import { UIPlan, UIBlock, UISettings } from '../../types';

interface UIPlanRow {
  id: string;
  project_id: string;
  name: string;
  blocks_json: string;
  settings_json: string;
  generated_text: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: UIPlanRow): UIPlan {
  let blocks: UIBlock[] = [];
  let settings: UISettings = {
    pageType: 'Dashboard',
    layout: 'Sidebar + Topbar',
    theme: 'Light (Soft)',
    accentColor: '#2563EB',
    borderRadius: '8px',
    showBorders: true,
    responsiveBehavior: 'Responsive',
    statesIncluded: [],
  };

  try {
    blocks = JSON.parse(row.blocks_json);
  } catch {}

  try {
    settings = JSON.parse(row.settings_json);
  } catch {}

  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    blocks,
    settings,
    generatedText: row.generated_text || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const uiPlanRepository = {
  async getByProjectId(projectId: string): Promise<UIPlan[]> {
    const rows = await executeQuery<UIPlanRow>(
      'SELECT * FROM ui_plans WHERE project_id = ? ORDER BY updated_at DESC',
      [projectId]
    );
    return rows.map(mapRow);
  },

  async getById(id: string): Promise<UIPlan | null> {
    const rows = await executeQuery<UIPlanRow>('SELECT * FROM ui_plans WHERE id = ? LIMIT 1', [id]);
    return rows.length > 0 ? mapRow(rows[0]) : null;
  },

  async save(plan: UIPlan): Promise<UIPlan> {
    const now = new Date().toISOString();
    const existing = await this.getById(plan.id);

    if (existing) {
      await executeRun(
        'UPDATE ui_plans SET name = ?, blocks_json = ?, settings_json = ?, generated_text = ?, updated_at = ? WHERE id = ?',
        [plan.name, JSON.stringify(plan.blocks), JSON.stringify(plan.settings), plan.generatedText, now, plan.id]
      );
      return { ...plan, updatedAt: now };
    } else {
      await executeRun(
        'INSERT INTO ui_plans (id, project_id, name, blocks_json, settings_json, generated_text, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [plan.id, plan.projectId, plan.name, JSON.stringify(plan.blocks), JSON.stringify(plan.settings), plan.generatedText, now, now]
      );
      return { ...plan, createdAt: now, updatedAt: now };
    }
  },

  async delete(id: string): Promise<void> {
    await executeRun('DELETE FROM ui_plans WHERE id = ?', [id]);
  },
};
