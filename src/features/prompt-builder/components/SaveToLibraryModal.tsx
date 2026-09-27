import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { PromptRole } from '../../../types';
import { promptRepository } from '../../../db/repositories/promptRepository';
import { useApp } from '../../../context/AppContext';
import { useProject } from '../../../context/ProjectContext';

interface SaveToLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTitle: string;
  defaultRole: PromptRole;
  promptBody: string;
}

export const SaveToLibraryModal: React.FC<SaveToLibraryModalProps> = ({
  isOpen,
  onClose,
  defaultTitle,
  defaultRole,
  promptBody,
}) => {
  const { activeProject } = useProject();
  const { showToast } = useApp();

  const [title, setTitle] = useState(defaultTitle);
  const [role, setRole] = useState<PromptRole>(defaultRole);
  const [tagsInput, setTagsInput] = useState('prompt-builder, custom');
  const [scope, setScope] = useState<'project' | 'global'>('project');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const id = `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      await promptRepository.create({
        id,
        projectId: scope === 'global' ? null : activeProject?.id || null,
        title: title.trim(),
        role,
        body: promptBody,
        tags,
        scope,
        favorite: false,
      });

      showToast(`Prompt "${title.trim()}" saved to library!`, 'success');
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'Failed to save prompt', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save Generated Prompt to Library"
      footer={
        <>
          <Button variant="subtle" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Prompt'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Input
          label="Prompt Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Authentication Flow Implementation Prompt"
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Select
            label="Category / Role"
            value={role}
            onChange={(e) => setRole(e.target.value as PromptRole)}
            options={[
              { value: 'Global Rules', label: 'Global Rules' },
              { value: 'Frontend', label: 'Frontend' },
              { value: 'Backend', label: 'Backend' },
              { value: 'Database', label: 'Database' },
              { value: 'Full Stack', label: 'Full Stack' },
              { value: 'UI/UX', label: 'UI/UX' },
              { value: 'Testing', label: 'Testing' },
              { value: 'Security', label: 'Security' },
              { value: 'Reviewer', label: 'Reviewer' },
            ]}
          />

          <Select
            label="Scope"
            value={scope}
            onChange={(e) => setScope(e.target.value as 'project' | 'global')}
            options={[
              { value: 'project', label: `This Project (${activeProject?.name || 'Local'})` },
              { value: 'global', label: 'Global (Available to all projects)' },
            ]}
          />
        </div>

        <Input
          label="Tags (comma separated)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="react, auth, api, testing"
        />
      </div>
    </Modal>
  );
};
