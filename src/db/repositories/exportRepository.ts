import { executeQuery, executeRun } from '../sqlite';
import { ExportRecord } from '../../types';

interface ExportRow {
  id: string;
  project_id: string;
  source_type: string;
  format: string;
  path: string | null;
  title: string;
  content: string;
  notes: string | null;
  created_at: string;
}

function mapRow(row: ExportRow): ExportRecord {
  return {
    id: row.id,
    projectId: row.project_id,
    sourceType: row.source_type as ExportRecord['sourceType'],
    format: row.format as ExportRecord['format'],
    path: row.path || '',
    title: row.title,
    content: row.content,
    notes: row.notes || '',
    createdAt: row.created_at,
  };
}

export const exportRepository = {
  async getAll(projectId?: string): Promise<ExportRecord[]> {
    let sql = 'SELECT * FROM export_records';
    const params: any[] = [];
    if (projectId) {
      sql += ' WHERE project_id = ?';
      params.push(projectId);
    }
    sql += ' ORDER BY created_at DESC';

    const rows = await executeQuery<ExportRow>(sql, params);
    return rows.map(mapRow);
  },

  async create(record: Omit<ExportRecord, 'id' | 'createdAt'>): Promise<ExportRecord> {
    const id = `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const created: ExportRecord = {
      id,
      projectId: record.projectId,
      sourceType: record.sourceType,
      format: record.format,
      path: record.path || 'clipboard',
      title: record.title,
      content: record.content,
      notes: record.notes || '',
      createdAt: now,
    };

    await executeRun(
      'INSERT INTO export_records (id, project_id, source_type, format, path, title, content, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        created.id,
        created.projectId,
        created.sourceType,
        created.format,
        created.path,
        created.title,
        created.content,
        created.notes,
        created.createdAt,
      ]
    );

    return created;
  },

  async delete(id: string): Promise<void> {
    await executeRun('DELETE FROM export_records WHERE id = ?', [id]);
  },

  async clearByProject(projectId: string): Promise<void> {
    await executeRun('DELETE FROM export_records WHERE project_id = ?', [projectId]);
  },
};
