import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { useProject } from '../../../context/ProjectContext';
import { useApp } from '../../../context/AppContext';
import { ProjectType } from '../../../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose }) => {
  const { createProject } = useProject();
  const { showToast, setActiveModule } = useApp();

  const [name, setName] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('Web');
  const [stack, setStack] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await createProject({
        name: name.trim(),
        projectType,
        stack: stack.trim(),
        description: description.trim(),
      });
      showToast(`Project "${name.trim()}" created successfully`, 'success');
      setActiveModule('home');
      setName('');
      setStack('');
      setDescription('');
      setError('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      footer={
        <>
          <Button variant="subtle" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Input
          label="Project Name *"
          placeholder="e.g. Acme Dashboard, StorePro, FinTech API"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          error={error}
          autoFocus
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Select
            label="Project Type"
            value={projectType}
            onChange={(e) => setProjectType(e.target.value as ProjectType)}
            options={[
              { value: 'Web', label: 'Web Application' },
              { value: 'Desktop', label: 'Desktop (Electron/Tauri)' },
              { value: 'Mobile', label: 'Mobile Application' },
              { value: 'Other', label: 'Backend / Other' },
            ]}
          />

          <Input
            label="Default Stack"
            placeholder="e.g. Next.js 15, Vite + React + SQLite"
            value={stack}
            onChange={(e) => setStack(e.target.value)}
          />
        </div>

        <Textarea
          label="Description (Optional)"
          placeholder="Brief summary of what this project builds, user personas, or business goals..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </form>
    </Modal>
  );
};
