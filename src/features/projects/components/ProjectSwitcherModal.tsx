import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useProject } from '../../../context/ProjectContext';
import { Plus, Check, Archive, FolderGit2 } from 'lucide-react';

interface ProjectSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreate: () => void;
}

export const ProjectSwitcherModal: React.FC<ProjectSwitcherModalProps> = ({
  isOpen,
  onClose,
  onOpenCreate,
}) => {
  const { projects, activeProject, setActiveProjectId, archiveProject } = useProject();

  const handleSelect = (id: string) => {
    setActiveProjectId(id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Switch Project Workspace"
      size="md"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => {
              onClose();
              onOpenCreate();
            }}
          >
            New Project
          </Button>
          <Button variant="subtle" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {projects.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '24px 0' }}>
            No projects found. Create your first project to get started!
          </p>
        ) : (
          projects.map((proj) => {
            const isSelected = activeProject?.id === proj.id;
            return (
              <div
                key={proj.id}
                onClick={() => handleSelect(proj.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-surface)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FolderGit2
                    size={20}
                    color={isSelected ? 'var(--primary)' : 'var(--text-secondary)'}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {proj.name}
                      </span>
                      <Badge variant="default">{proj.projectType}</Badge>
                      {isSelected && <Badge variant="primary">Active</Badge>}
                    </div>
                    {proj.stack && (
                      <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {proj.stack}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isSelected ? (
                    <Check size={18} color="var(--primary)" />
                  ) : (
                    <Button
                      variant="subtle"
                      size="sm"
                      icon={<Archive size={14} />}
                      title="Archive Project"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Archive project "${proj.name}"?`)) {
                          archiveProject(proj.id);
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
};
