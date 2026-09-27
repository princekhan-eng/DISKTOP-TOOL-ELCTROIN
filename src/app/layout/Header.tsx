import React from 'react';
import { useApp } from '../../context/AppContext';
import { useProject } from '../../context/ProjectContext';
import { Button } from '../../components/ui/Button';
import { Sun, Moon, Plus, Sparkles, FolderGit2 } from 'lucide-react';

interface HeaderProps {
  onOpenCreateProject: () => void;
  onOpenProjectSwitcher: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreateProject,
  onOpenProjectSwitcher,
}) => {
  const { activeModule, setActiveModule, theme, toggleTheme } = useApp();
  const { activeProject } = useProject();

  const moduleNames: Record<string, string> = {
    home: 'Project Dashboard',
    'prompt-builder': 'Prompt Builder',
    'ui-builder': 'UI Builder',
    architecture: 'Architecture Builder',
    'prompt-library': 'Prompt Library',
    'project-profile': 'Project Profile',
    'export-history': 'Export History',
    settings: 'Settings',
  };

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <span className="breadcrumb-module">{moduleNames[activeModule] || 'Workspace'}</span>
        {activeProject && (
          <>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span
              className="breadcrumb-project"
              style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              onClick={onOpenProjectSwitcher}
              title="Switch project"
            >
              <FolderGit2 size={13} color="var(--primary)" />
              {activeProject.name}
            </span>
          </>
        )}
      </div>

      <div className="topbar-right">
        {activeModule !== 'prompt-builder' && (
          <Button
            variant="secondary"
            size="sm"
            icon={<Sparkles size={14} color="var(--primary)" />}
            onClick={() => setActiveModule('prompt-builder')}
          >
            Prompt Builder
          </Button>
        )}

        <Button
          variant="secondary"
          size="sm"
          icon={<Plus size={14} />}
          onClick={onOpenCreateProject}
        >
          New Project
        </Button>

        <Button
          variant="subtle"
          size="sm"
          className="btn-icon"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Soft Light' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
        </Button>
      </div>
    </header>
  );
};
