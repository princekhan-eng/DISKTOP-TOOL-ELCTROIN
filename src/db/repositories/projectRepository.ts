import { executeQuery, executeRun } from '../sqlite';
import { Project } from '../../types';

interface ProjectRow {
  id: string;
  name: string;
  description: string;
  project_type: string;
  stack: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

function mapRow(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    projectType: row.project_type as Project['projectType'],
    stack: row.stack || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at,
  };
}

export const projectRepository = {
  async getAll(includeArchived = false): Promise<Project[]> {
    const sql = includeArchived
      ? 'SELECT * FROM projects ORDER BY updated_at DESC'
      : 'SELECT * FROM projects WHERE archived_at IS NULL ORDER BY updated_at DESC';
    const rows = await executeQuery<ProjectRow>(sql);
    return rows.map(mapRow);
  },

  async getById(id: string): Promise<Project | null> {
    const rows = await executeQuery<ProjectRow>('SELECT * FROM projects WHERE id = ? LIMIT 1', [id]);
    return rows.length > 0 ? mapRow(rows[0]) : null;
  },

  async create(project: { id: string; name: string; description?: string; projectType: Project['projectType']; stack?: string }): Promise<Project> {
    const now = new Date().toISOString();
    const created: Project = {
      id: project.id,
      name: project.name,
      description: project.description || '',
      projectType: project.projectType,
      stack: project.stack || '',
      createdAt: now,
      updatedAt: now,
      archivedAt: null,
    };

    await executeRun(
      'INSERT INTO projects (id, name, description, project_type, stack, created_at, updated_at, archived_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [created.id, created.name, created.description, created.projectType, created.stack, created.createdAt, created.updatedAt, null]
    );

    // Initialize default profile for this project
    await executeRun(
      `INSERT INTO project_profiles (
        project_id, framework, language, runtime, database, validation_approach,
        state_conventions, folder_conventions, ui_rules, security_defaults,
        performance_rules, testing_defaults, forbidden_patterns, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        created.id,
        created.projectType === 'Desktop' ? 'Electron + React' : 'React + TypeScript',
        'TypeScript',
        'Node.js 24',
        'SQLite',
        'Zod schemas',
        'React Context + Local state',
        'Feature-based folders',
        'Soft light theme (#F7F9FC bg, #2563EB accent), 8-12px radii',
        'Strict input validation and sanitized IPC boundaries',
        'Zero redundant renders; fast local load times',
        'Vitest unit tests for domain functions',
        'No any types, no raw untyped SQL in UI',
        now,
      ]
    );

    return created;
  },

  async update(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<void> {
    const now = new Date().toISOString();
    const fields: string[] = ['updated_at = ?'];
    const values: any[] = [now];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.projectType !== undefined) {
      fields.push('project_type = ?');
      values.push(updates.projectType);
    }
    if (updates.stack !== undefined) {
      fields.push('stack = ?');
      values.push(updates.stack);
    }

    values.push(id);
    await executeRun(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async archive(id: string): Promise<void> {
    const now = new Date().toISOString();
    await executeRun('UPDATE projects SET archived_at = ?, updated_at = ? WHERE id = ?', [now, now, id]);
  },

  async restore(id: string): Promise<void> {
    const now = new Date().toISOString();
    await executeRun('UPDATE projects SET archived_at = NULL, updated_at = ? WHERE id = ?', [now, id]);
  },

  async deletePermanently(id: string): Promise<void> {
    await executeRun('DELETE FROM projects WHERE id = ?', [id]);
  },
};
