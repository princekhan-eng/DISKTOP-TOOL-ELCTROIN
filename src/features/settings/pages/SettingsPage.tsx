import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useProject } from '../../../context/ProjectContext';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import {
  exportDatabaseBinary,
  exportFullDatabaseJson,
  restoreDatabaseFromJson,
  resetAndSeedDatabase,
} from '../../../db/sqlite';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Database,
  Download,
  Upload,
  RefreshCw,
  Save,
  CheckCircle,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme, settings, updateSettings, showToast } = useApp();
  const { reloadProjects } = useProject();

  const [exportDir, setExportDir] = useState(settings.defaultExportDirectory);
  const [separator, setSeparator] = useState(settings.promptSeparator);
  const [autoBackup, setAutoBackup] = useState(settings.autoBackup);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleSavePreferences = async () => {
    try {
      await updateSettings({
        defaultExportDirectory: exportDir,
        promptSeparator: separator,
        autoBackup,
      });
      showToast('Settings saved successfully!', 'success');
    } catch {
      showToast('Failed to save settings', 'error');
    }
  };

  const handleBackupJson = async () => {
    try {
      const data = await exportFullDatabaseJson();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `devprompt-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Downloaded complete database JSON backup', 'success');
    } catch (err: any) {
      showToast('Failed to backup database', 'error');
    }
  };

  const handleBackupSQLite = async () => {
    try {
      const binary = await exportDatabaseBinary();
      const blob = new Blob([binary as any], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `devprompt_studio-${new Date().toISOString().slice(0, 10)}.sqlite`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Downloaded raw SQLite .sqlite database file', 'success');
    } catch (err: any) {
      showToast('Failed to export SQLite database', 'error');
    }
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setIsRestoring(true);
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        await restoreDatabaseFromJson(parsed);
        await reloadProjects();
        showToast('Database restored successfully from backup!', 'success');
      } catch (err: any) {
        showToast('Failed to restore database: invalid format', 'error');
      } finally {
        setIsRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  const handleResetSampleData = async () => {
    if (confirm('Reset and re-seed database with default blueprint templates and StorePro project?')) {
      await resetAndSeedDatabase();
      await reloadProjects();
      showToast('Database reset to clean factory state with seed templates', 'info');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '880px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Application Settings
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>
            Configure theme, prompt separators, and SQLite database backups.
          </p>
        </div>

        <Button variant="primary" icon={<Save size={14} />} onClick={handleSavePreferences}>
          Save Settings
        </Button>
      </div>

      {/* Visual & Theme Preferences */}
      <Card title="Visual & Formatting Preferences">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '13.5px' }}>Interface Theme</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Soft light theme is default for readability; toggle for dark mode.
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? 'Dark Mode' : 'Soft Light Theme'}
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '4px' }}>
            <Select
              label="Prompt Section Separator"
              value={separator}
              onChange={(e) => setSeparator(e.target.value)}
              options={[
                { value: '###', label: '### Markdown Header (Recommended)' },
                { value: '---', label: '--- Horizontal Divider' },
                { value: '##', label: '## H2 Heading' },
                { value: '[SECTION]', label: '[SECTION] Bracket Tags' },
              ]}
            />

            <Input
              label="Default Export Directory"
              value={exportDir}
              onChange={(e) => setExportDir(e.target.value)}
              placeholder="e.g. downloads/devprompt"
            />
          </div>
        </div>
      </Card>

      {/* Local SQLite Database & Backups */}
      <Card title="Local SQLite Database & Safety">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            DevPrompt Studio operates entirely local-first. All projects, prompts, profiles, and wireframes are stored persistently inside your local SQLite engine.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button variant="secondary" icon={<Download size={14} />} onClick={handleBackupJson}>
              Export Full JSON Backup
            </Button>
            <Button variant="secondary" icon={<Database size={14} />} onClick={handleBackupSQLite}>
              Export Raw .sqlite File
            </Button>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
            <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>
              Restore Database from Backup
            </div>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface-subtle)',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <Upload size={14} color="var(--primary)" />
              <span>{isRestoring ? 'Restoring...' : 'Choose JSON Backup File to Restore'}</span>
              <input type="file" accept=".json" onChange={handleRestoreFile} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
      </Card>

      {/* Factory Reset */}
      <Card title="Reset & Seed Data">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '13.5px' }}>Restore Factory Templates</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Re-populates the database with initial blueprint project (StorePro) and standard role prompts.
            </div>
          </div>
          <Button variant="danger" size="sm" icon={<RefreshCw size={14} />} onClick={handleResetSampleData}>
            Reset to Defaults
          </Button>
        </div>
      </Card>
    </div>
  );
};
