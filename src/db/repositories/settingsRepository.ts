import { executeQuery, executeRun } from '../sqlite';
import { AppSettings } from '../../types';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  defaultExportDirectory: 'downloads/devprompt',
  promptSeparator: '###',
  defaultGlobalRuleId: 'p-global-01',
  autoBackup: true,
};

export const settingsRepository = {
  async getSettings(): Promise<AppSettings> {
    const rows = await executeQuery<{ key: string; value_json: string }>(
      'SELECT value_json FROM app_settings WHERE key = ? LIMIT 1',
      ['general']
    );

    if (rows.length === 0) return DEFAULT_SETTINGS;

    try {
      const parsed = JSON.parse(rows[0].value_json);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const updated: AppSettings = { ...current, ...settings };

    await executeRun(
      'INSERT OR REPLACE INTO app_settings (key, value_json) VALUES (?, ?)',
      ['general', JSON.stringify(updated)]
    );

    return updated;
  },
};
