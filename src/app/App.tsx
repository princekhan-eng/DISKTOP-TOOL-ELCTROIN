import React from 'react';
import { useApp } from '../context/AppContext';
import { useProject } from '../context/ProjectContext';
import { AppLayout } from './layout/AppLayout';
import { DashboardPage } from '../features/projects/pages/DashboardPage';
import { PromptBuilderPage } from '../features/prompt-builder/pages/PromptBuilderPage';
import { PinBoardPage } from '../features/pin-board/pages/PinBoardPage';
import { ArchitecturePage } from '../features/architecture-builder/pages/ArchitecturePage';
import { PromptLibraryPage } from '../features/prompt-library/pages/PromptLibraryPage';
import { ProjectProfilePage } from '../features/project-profile/pages/ProjectProfilePage';
import { ExportHistoryPage } from '../features/export-history/pages/ExportHistoryPage';
import { SettingsPage } from '../features/settings/pages/SettingsPage';

export const App: React.FC = () => {
  const { activeModule } = useApp();
  const { isLoading } = useProject();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100vw',
          backgroundColor: 'var(--bg-app)',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Initializing DevPrompt SQLite workspace...
        </span>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'home':
        return <DashboardPage />;
      case 'prompt-builder':
        return <PromptBuilderPage />;
      case 'pin-board':
        return <PinBoardPage />;
      case 'architecture':
        return <ArchitecturePage />;
      case 'prompt-library':
        return <PromptLibraryPage />;
      case 'project-profile':
        return <ProjectProfilePage />;
      case 'export-history':
        return <ExportHistoryPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return <AppLayout>{renderModule()}</AppLayout>;
};
