import { executeQuery, executeRun } from '../sqlite';
import { ProjectProfile } from '../../types';

interface ProfileRow {
  project_id: string;
  framework: string;
  language: string;
  runtime: string;
  database: string;
  validation_approach: string;
  state_conventions: string;
  folder_conventions: string;
  architecture_rules?: string;
  ui_rules: string;
  quality_rules?: string;
  security_defaults: string;
  performance_rules: string;
  testing_defaults: string;
  forbidden_patterns: string;
  updated_at: string;
}

function mapRow(row: ProfileRow): ProjectProfile {
  return {
    projectId: row.project_id,
    framework: row.framework || '',
    language: row.language || '',
    runtime: row.runtime || '',
    database: row.database || '',
    validationApproach: row.validation_approach || '',
    stateConventions: row.state_conventions || '',
    folderConventions: row.folder_conventions || '',
    architectureRules: row.architecture_rules || '',
    uiRules: row.ui_rules || '',
    qualityRules: row.quality_rules || '',
    securityDefaults: row.security_defaults || '',
    performanceRules: row.performance_rules || '',
    testingDefaults: row.testing_defaults || '',
    forbiddenPatterns: row.forbidden_patterns || '',
    updatedAt: row.updated_at,
  };
}

export const profileRepository = {
  async getByProjectId(projectId: string): Promise<ProjectProfile | null> {
    const rows = await executeQuery<ProfileRow>('SELECT * FROM project_profiles WHERE project_id = ? LIMIT 1', [projectId]);
    if (rows.length === 0) return null;
    return mapRow(rows[0]);
  },

  async saveOrUpdate(profile: ProjectProfile): Promise<ProjectProfile> {
    const now = new Date().toISOString();
    const existing = await this.getByProjectId(profile.projectId);

    if (existing) {
      await executeRun(
        `UPDATE project_profiles SET
          framework = ?, language = ?, runtime = ?, database = ?,
          validation_approach = ?, state_conventions = ?, folder_conventions = ?,
          architecture_rules = ?, ui_rules = ?, quality_rules = ?, security_defaults = ?,
          performance_rules = ?, testing_defaults = ?, forbidden_patterns = ?, updated_at = ?
        WHERE project_id = ?`,
        [
          profile.framework,
          profile.language,
          profile.runtime,
          profile.database,
          profile.validationApproach,
          profile.stateConventions,
          profile.folderConventions,
          profile.architectureRules,
          profile.uiRules,
          profile.qualityRules,
          profile.securityDefaults,
          profile.performanceRules,
          profile.testingDefaults,
          profile.forbiddenPatterns,
          now,
          profile.projectId,
        ]
      );
    } else {
      await executeRun(
        `INSERT INTO project_profiles (
          project_id, framework, language, runtime, database, validation_approach,
          state_conventions, folder_conventions, architecture_rules, ui_rules,
          quality_rules, security_defaults, performance_rules, testing_defaults,
          forbidden_patterns, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          profile.projectId,
          profile.framework,
          profile.language,
          profile.runtime,
          profile.database,
          profile.validationApproach,
          profile.stateConventions,
          profile.folderConventions,
          profile.architectureRules,
          profile.uiRules,
          profile.qualityRules,
          profile.securityDefaults,
          profile.performanceRules,
          profile.testingDefaults,
          profile.forbiddenPatterns,
          now,
        ]
      );
    }

    return { ...profile, updatedAt: now };
  },
};
