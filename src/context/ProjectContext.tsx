import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { projectRepository } from '../db/repositories/projectRepository';
import { Project, ProjectType } from '../types';

interface ProjectContextType {
  activeProject: Project | null;
  projects: Project[];
  isLoading: boolean;
  setActiveProjectId: (id: string) => void;
  createProject: (data: { name: string; projectType: ProjectType; description?: string; stack?: string }) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  archiveProject: (id: string) => Promise<void>;
  reloadProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reloadProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await projectRepository.getAll();
      setProjects(all);
      if (all.length > 0) {
        if (!activeProjectId || !all.some((p) => p.id === activeProjectId)) {
          setActiveProjectIdState(all[0].id);
        }
      } else {
        setActiveProjectIdState(null);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeProjectId]);

  useEffect(() => {
    reloadProjects();
  }, [reloadProjects]);

  const setActiveProjectId = (id: string) => {
    setActiveProjectIdState(id);
  };

  const createProject = async (data: {
    name: string;
    projectType: ProjectType;
    description?: string;
    stack?: string;
  }): Promise<Project> => {
    const id = `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const created = await projectRepository.create({
      id,
      name: data.name,
      projectType: data.projectType,
      description: data.description,
      stack: data.stack,
    });
    await reloadProjects();
    setActiveProjectIdState(created.id);
    return created;
  };

  const updateProject = async (id: string, updates: Partial<Project>): Promise<void> => {
    await projectRepository.update(id, updates);
    await reloadProjects();
  };

  const archiveProject = async (id: string): Promise<void> => {
    await projectRepository.archive(id);
    await reloadProjects();
  };

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  return (
    <ProjectContext.Provider
      value={{
        activeProject,
        projects,
        isLoading,
        setActiveProjectId,
        createProject,
        updateProject,
        archiveProject,
        reloadProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export function useProject(): ProjectContextType {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
