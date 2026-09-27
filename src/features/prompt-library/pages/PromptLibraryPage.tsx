import React, { useState, useEffect } from 'react';
import { useProject } from '../../../context/ProjectContext';
import { useApp } from '../../../context/AppContext';
import { Prompt, PromptRole } from '../../../types';
import { promptRepository } from '../../../db/repositories/promptRepository';
import { exportRepository } from '../../../db/repositories/exportRepository';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import {
  BookOpen,
  Plus,
  Search,
  Star,
  Copy,
  CopyPlus,
  Trash2,
  Edit2,
  Globe,
  FolderGit2,
  Download,
  Filter,
} from 'lucide-react';

const ROLES: (PromptRole | 'All')[] = [
  'All',
  'Global Rules',
  'Frontend',
  'Backend',
  'Database',
  'Full Stack',
  'UI/UX',
  'Testing',
  'Security',
  'Reviewer',
];

export const PromptLibraryPage: React.FC = () => {
  const { activeProject } = useProject();
  const { showToast } = useApp();

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedRole, setSelectedRole] = useState<PromptRole | 'All'>('All');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'project' | 'global'>('all');
  const [search, setSearch] = useState('');
  const [favoriteOnly, setFavoriteOnly] = useState(false);

  // Edit / Create modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formRole, setFormRole] = useState<PromptRole>('Frontend');
  const [formBody, setFormBody] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formScope, setFormScope] = useState<'project' | 'global'>('project');

  // Preview modal
  const [previewPrompt, setPreviewPrompt] = useState<Prompt | null>(null);

  const loadPrompts = async () => {
    try {
      const items = await promptRepository.getAll({
        projectId: activeProject?.id,
        role: selectedRole === 'All' ? undefined : selectedRole,
        scope: scopeFilter,
        search,
        favoriteOnly,
      });
      setPrompts(items);
    } catch (err) {
      console.error('Failed to load prompts:', err);
    }
  };

  useEffect(() => {
    loadPrompts();
  }, [activeProject, selectedRole, scopeFilter, search, favoriteOnly]);

  const handleOpenCreate = () => {
    setEditingPrompt(null);
    setFormTitle('');
    setFormRole(selectedRole !== 'All' ? selectedRole : 'Frontend');
    setFormBody('');
    setFormTags('reusable, standards');
    setFormScope('project');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Prompt) => {
    setEditingPrompt(p);
    setFormTitle(p.title);
    setFormRole(p.role);
    setFormBody(p.body);
    setFormTags(p.tags.join(', '));
    setFormScope(p.scope);
    setIsModalOpen(true);
  };

  const handleSavePrompt = async () => {
    if (!formTitle.trim() || !formBody.trim()) {
      showToast('Title and Body are required', 'warning');
      return;
    }

    const tags = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (editingPrompt) {
        await promptRepository.update(editingPrompt.id, {
          title: formTitle.trim(),
          role: formRole,
          body: formBody,
          tags,
          scope: formScope,
          projectId: formScope === 'global' ? null : activeProject?.id || null,
        });
        showToast('Prompt updated successfully', 'success');
      } else {
        const id = `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        await promptRepository.create({
          id,
          projectId: formScope === 'global' ? null : activeProject?.id || null,
          title: formTitle.trim(),
          role: formRole,
          body: formBody,
          tags,
          scope: formScope,
          favorite: false,
        });
        showToast('Prompt created successfully', 'success');
      }

      setIsModalOpen(false);
      loadPrompts();
    } catch (err: any) {
      showToast('Failed to save prompt', 'error');
    }
  };

  const handleToggleFavorite = async (p: Prompt) => {
    try {
      await promptRepository.toggleFavorite(p.id, !p.favorite);
      loadPrompts();
    } catch {
      showToast('Failed to update favorite', 'error');
    }
  };

  const handleDuplicate = async (p: Prompt) => {
    try {
      await promptRepository.duplicate(p.id);
      showToast(`Duplicated "${p.title}"`, 'success');
      loadPrompts();
    } catch {
      showToast('Failed to duplicate prompt', 'error');
    }
  };

  const handleDelete = async (p: Prompt) => {
    if (confirm(`Delete prompt "${p.title}"?`)) {
      try {
        await promptRepository.deletePermanently(p.id);
        showToast('Prompt deleted', 'info');
        loadPrompts();
      } catch {
        showToast('Failed to delete prompt', 'error');
      }
    }
  };

  const handleCopy = async (p: Prompt) => {
    try {
      await navigator.clipboard.writeText(p.body);
      showToast(`Copied "${p.title}" to clipboard!`, 'success');

      if (activeProject) {
        await exportRepository.create({
          projectId: activeProject.id,
          sourceType: 'library',
          format: 'text',
          path: 'clipboard',
          title: p.title,
          content: p.body,
          notes: `Copied from Prompt Library (${p.role})`,
        });
      }
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      {/* Top Header Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-surface)',
          padding: '14px 18px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <div className="search-input-wrapper" style={{ width: '280px' }}>
            <Search className="search-icon" size={16} />
            <input
              className="input"
              placeholder="Search prompts by title, body, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value as any)}
            style={{ width: '150px' }}
            options={[
              { value: 'all', label: 'All Scopes' },
              { value: 'project', label: 'This Project' },
              { value: 'global', label: 'Global Only' },
            ]}
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={favoriteOnly}
              onChange={(e) => setFavoriteOnly(e.target.checked)}
            />
            <span>Favorites only</span>
          </label>
        </div>

        <Button variant="primary" icon={<Plus size={15} />} onClick={handleOpenCreate}>
          New Prompt
        </Button>
      </div>

      {/* Role Pill Filters */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '2px',
        }}
      >
        {ROLES.map((role) => {
          const isSelected = selectedRole === role;
          return (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-surface)',
                color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                fontSize: '12.5px',
                fontWeight: isSelected ? 600 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.12s ease',
              }}
            >
              {role}
            </button>
          );
        })}
      </div>

      {/* Prompts Table / List */}
      <div
        style={{
          flex: 1,
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          overflowY: 'auto',
        }}
      >
        {prompts.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No prompts found matching the filter criteria.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>Fav</th>
                <th>Title & Content Snippet</th>
                <th>Role Category</th>
                <th>Scope</th>
                <th>Tags</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prompts.map((p) => (
                <tr key={p.id}>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => handleToggleFavorite(p)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: p.favorite ? 'var(--warning)' : 'var(--text-muted)',
                      }}
                    >
                      <Star size={16} fill={p.favorite ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                  <td>
                    <div
                      style={{ fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                      onClick={() => setPreviewPrompt(p)}
                    >
                      {p.title}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        maxWidth: '420px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: '2px',
                      }}
                    >
                      {p.body.replace(/\n+/g, ' ')}
                    </div>
                  </td>
                  <td>
                    <Badge variant="primary">{p.role}</Badge>
                  </td>
                  <td>
                    {p.scope === 'global' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                        <Globe size={13} /> Global
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                        <FolderGit2 size={13} /> Project
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {p.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: '11px',
                            backgroundColor: 'var(--bg-surface-hover)',
                            color: 'var(--text-secondary)',
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Button
                        variant="subtle"
                        size="sm"
                        icon={<Copy size={13} />}
                        onClick={() => handleCopy(p)}
                        title="Copy prompt body"
                      />
                      <Button
                        variant="subtle"
                        size="sm"
                        icon={<CopyPlus size={13} />}
                        onClick={() => handleDuplicate(p)}
                        title="Duplicate prompt"
                      />
                      <Button
                        variant="subtle"
                        size="sm"
                        icon={<Edit2 size={13} />}
                        onClick={() => handleOpenEdit(p)}
                        title="Edit prompt"
                      />
                      <Button
                        variant="subtle"
                        size="sm"
                        icon={<Trash2 size={13} color="var(--danger-text)" />}
                        onClick={() => handleDelete(p)}
                        title="Delete prompt"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}
        size="lg"
        footer={
          <>
            <Button variant="subtle" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSavePrompt}>
              {editingPrompt ? 'Save Changes' : 'Create Prompt'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Prompt Title *"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="e.g. Strict TypeScript Migration Rules"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Role Category"
              value={formRole}
              onChange={(e) => setFormRole(e.target.value as PromptRole)}
              options={ROLES.filter((r) => r !== 'All').map((r) => ({ value: r, label: r }))}
            />

            <Select
              label="Scope"
              value={formScope}
              onChange={(e) => setFormScope(e.target.value as any)}
              options={[
                { value: 'project', label: `Project Only (${activeProject?.name || 'Local'})` },
                { value: 'global', label: 'Global (All Projects)' },
              ]}
            />
          </div>

          <Input
            label="Tags (comma separated)"
            value={formTags}
            onChange={(e) => setFormTags(e.target.value)}
            placeholder="react, typescript, quality, testing"
          />

          <Textarea
            label="Prompt Content / Instructions *"
            value={formBody}
            onChange={(e) => setFormBody(e.target.value)}
            rows={8}
            placeholder="Write the reusable prompt guidelines, rules, or instructions..."
          />
        </div>
      </Modal>

      {/* Preview Modal */}
      {previewPrompt && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewPrompt(null)}
          title={previewPrompt.title}
          size="lg"
          footer={
            <>
              <Button variant="subtle" onClick={() => setPreviewPrompt(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                icon={<Copy size={14} />}
                onClick={() => handleCopy(previewPrompt)}
              >
                Copy Prompt
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Badge variant="primary">{previewPrompt.role}</Badge>
            <Badge variant="default">{previewPrompt.scope}</Badge>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Updated {new Date(previewPrompt.updatedAt).toLocaleDateString()}
            </span>
          </div>
          <pre
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12.5px',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              padding: '16px',
              backgroundColor: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            {previewPrompt.body}
          </pre>
        </Modal>
      )}
    </div>
  );
};
