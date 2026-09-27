import React from 'react';
import { useApp, AppModule } from '../../context/AppContext';
import { useProject } from '../../context/ProjectContext';
import {
  Home,
  FileText,
  Layout,
  Network,
  BookOpen,
  Layers,
  History,
  Settings,
  ChevronDown,
  Terminal,
  Database,
  PenTool,
} from 'lucide-react';

interface SidebarProps {
  onOpenProjectSwitcher: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenProjectSwitcher }) => {
  const { activeModule, setActiveModule } = useApp();
  const { activeProject } = useProject();

  const navItems: { id: AppModule; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="nav-item-icon" /> },
    { id: 'prompt-builder', label: 'Prompt Builder', icon: <FileText className="nav-item-icon" /> },
    { id: 'pin-board', label: 'Pin Board', icon: <PenTool className="nav-item-icon" /> },
    { id: 'architecture', label: 'Architecture', icon: <Network className="nav-item-icon" /> },
    { id: 'prompt-library', label: 'Prompt Library', icon: <BookOpen className="nav-item-icon" /> },
    { id: 'project-profile', label: 'Project Profile', icon: <Layers className="nav-item-icon" /> },
    { id: 'export-history', label: 'Export History', icon: <History className="nav-item-icon" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="nav-item-icon" /> },
  ];

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-row">
          <div className="brand-title">
            <Terminal className="brand-icon" />
            <span>DevPrompt</span>
          </div>
          <span className="brand-badge">v1.0</span>
        </div>

        {/* Project Selector Trigger Button */}
        <button
          className="project-selector-btn"
          onClick={onOpenProjectSwitcher}
          title="Switch or create project workspace"
        >
          <div className="project-selector-info">
            <span className="project-name-label">{activeProject?.name || 'Select Project'}</span>
            <span className="project-type-label">
              {activeProject ? `${activeProject.projectType} Workspace` : 'Click to open project'}
            </span>
          </div>
          <ChevronDown size={14} color="var(--text-secondary)" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveModule(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="sidebar-footer">
        <div className="storage-status-pill">
          <span className="status-dot"></span>
          <span>SQLite Active</span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Local-first</span>
      </div>
    </aside>
  );
};
