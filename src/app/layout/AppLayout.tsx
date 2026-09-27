import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ProjectModal } from '../../features/projects/components/ProjectModal';
import { ProjectSwitcherModal } from '../../features/projects/components/ProjectSwitcherModal';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar onOpenProjectSwitcher={() => setIsSwitcherOpen(true)} />

      <main className="app-main">
        <Header
          onOpenCreateProject={() => setIsCreateOpen(true)}
          onOpenProjectSwitcher={() => setIsSwitcherOpen(true)}
        />

        <div className="content-workspace">{children}</div>
      </main>

      <ProjectModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      <ProjectSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        onOpenCreate={() => setIsCreateOpen(true)}
      />
    </div>
  );
};
