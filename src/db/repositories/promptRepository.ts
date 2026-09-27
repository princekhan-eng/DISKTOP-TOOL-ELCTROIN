import { executeQuery, executeRun } from '../sqlite';
import { Prompt, PromptRole } from '../../types';

interface PromptRow {
  id: string;
  project_id: string | null;
  title: string;
  role: string;
  body: string;
  tags: string | null;
  scope: string;
  favorite: number;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: PromptRow): Prompt {
  let tags: string[] = [];
  try {
    tags = row.tags ? JSON.parse(row.tags) : [];
  } catch {
    tags = [];
  }

  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    role: row.role as PromptRole,
    body: row.body,
    tags,
    scope: row.scope as 'project' | 'global',
    favorite: row.favorite === 1,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const promptRepository = {
  async getAll(options: {
    projectId?: string | null;
    role?: string;
    scope?: 'project' | 'global' | 'all';
    search?: string;
    favoriteOnly?: boolean;
    includeArchived?: boolean;
  } = {}): Promise<Prompt[]> {
    let sql = 'SELECT * FROM prompts WHERE 1=1';
    const params: any[] = [];

    if (!options.includeArchived) {
      sql += ' AND archived_at IS NULL';
    }

    if (options.scope === 'project' && options.projectId) {
      sql += ' AND project_id = ?';
      params.push(options.projectId);
    } else if (options.scope === 'global') {
      sql += ' AND (scope = "global" OR project_id IS NULL)';
    } else if (options.projectId) {
      // Include both this project's prompts and global prompts
      sql += ' AND (project_id = ? OR scope = "global" OR project_id IS NULL)';
      params.push(options.projectId);
    }

    if (options.role && options.role !== 'All') {
      sql += ' AND role = ?';
      params.push(options.role);
    }

    if (options.favoriteOnly) {
      sql += ' AND favorite = 1';
    }

    if (options.search && options.search.trim()) {
      sql += ' AND (title LIKE ? OR body LIKE ? OR tags LIKE ?)';
      const term = `%${options.search.trim()}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY favorite DESC, updated_at DESC';

    const rows = await executeQuery<PromptRow>(sql, params);
    return rows.map(mapRow);
  },

  async getById(id: string): Promise<Prompt | null> {
    const rows = await executeQuery<PromptRow>('SELECT * FROM prompts WHERE id = ? LIMIT 1', [id]);
    return rows.length > 0 ? mapRow(rows[0]) : null;
  },

  async create(prompt: {
    id: string;
    projectId: string | null;
    title: string;
    role: PromptRole;
    body: string;
    tags: string[];
    scope: 'project' | 'global';
    favorite?: boolean;
  }): Promise<Prompt> {
    const now = new Date().toISOString();
    const created: Prompt = {
      id: prompt.id,
      projectId: prompt.scope === 'global' ? null : prompt.projectId,
      title: prompt.title,
      role: prompt.role,
      body: prompt.body,
      tags: prompt.tags,
      scope: prompt.scope,
      favorite: !!prompt.favorite,
      archivedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await executeRun(
      'INSERT INTO prompts (id, project_id, title, role, body, tags, scope, favorite, archived_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        created.id,
        created.projectId,
        created.title,
        created.role,
        created.body,
        JSON.stringify(created.tags),
        created.scope,
        created.favorite ? 1 : 0,
        null,
        created.createdAt,
        created.updatedAt,
      ]
    );

    return created;
  },

  async update(id: string, updates: Partial<Omit<Prompt, 'id' | 'createdAt'>>): Promise<void> {
    const now = new Date().toISOString();
    const fields: string[] = ['updated_at = ?'];
    const values: any[] = [now];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.role !== undefined) {
      fields.push('role = ?');
      values.push(updates.role);
    }
    if (updates.body !== undefined) {
      fields.push('body = ?');
      values.push(updates.body);
    }
    if (updates.tags !== undefined) {
      fields.push('tags = ?');
      values.push(JSON.stringify(updates.tags));
    }
    if (updates.scope !== undefined) {
      fields.push('scope = ?');
      values.push(updates.scope);
      if (updates.scope === 'global') {
        fields.push('project_id = NULL');
      }
    }
    if (updates.projectId !== undefined && updates.scope !== 'global') {
      fields.push('project_id = ?');
      values.push(updates.projectId);
    }
    if (updates.favorite !== undefined) {
      fields.push('favorite = ?');
      values.push(updates.favorite ? 1 : 0);
    }

    values.push(id);
    await executeRun(`UPDATE prompts SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async toggleFavorite(id: string, favorite: boolean): Promise<void> {
    const now = new Date().toISOString();
    await executeRun('UPDATE prompts SET favorite = ?, updated_at = ? WHERE id = ?', [favorite ? 1 : 0, now, id]);
  },

  async archive(id: string): Promise<void> {
    const now = new Date().toISOString();
    await executeRun('UPDATE prompts SET archived_at = ?, updated_at = ? WHERE id = ?', [now, now, id]);
  },

  async duplicate(id: string, newTitle?: string): Promise<Prompt | null> {
    const original = await this.getById(id);
    if (!original) return null;

    const newId = `p-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const title = newTitle || `${original.title} (Copy)`;

    return this.create({
      id: newId,
      projectId: original.projectId,
      title,
      role: original.role,
      body: original.body,
      tags: [...original.tags],
      scope: original.scope,
      favorite: false,
    });
  },

  async deletePermanently(id: string): Promise<void> {
    await executeRun('DELETE FROM prompts WHERE id = ?', [id]);
  },
};
