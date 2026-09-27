import React, { useState, useEffect, useMemo } from 'react';
import { useProject } from '../../../context/ProjectContext';
import { useApp } from '../../../context/AppContext';
import { PromptFormState, DEFAULT_PROMPT_FORM } from '../prompt-builder.types';
import { composePrompt } from '../prompt-engine/composer';
import { profileRepository } from '../../../db/repositories/profileRepository';
import { promptRepository } from '../../../db/repositories/promptRepository';
import { uiPlanRepository } from '../../../db/repositories/uiPlanRepository';
import { architectureRepository } from '../../../db/repositories/architectureRepository';
import { exportRepository } from '../../../db/repositories/exportRepository';
import { SaveToLibraryModal } from '../components/SaveToLibraryModal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Tabs } from '../../../components/ui/Tabs';
import { ProjectProfile, UIPlan, ArchitecturePlan, Prompt } from '../../../types';
import {
  Copy,
  Download,
  BookmarkPlus,
  RefreshCw,
  CheckCircle,
  FileCode,
  Layers,
  Sparkles,
  Sliders,
} from 'lucide-react';

export const PromptBuilderPage: React.FC = () => {
  const { activeProject } = useProject();
  const { showToast, settings } = useApp();

  const [form, setForm] = useState<PromptFormState>(DEFAULT_PROMPT_FORM);
  const [activeTab, setActiveTab] = useState('task');
  const [profile, setProfile] = useState<ProjectProfile | null>(null);
  const [globalRules, setGlobalRules] = useState<Prompt[]>([]);
  const [selectedGlobalRule, setSelectedGlobalRule] = useState<Prompt | null>(null);
  const [uiPlans, setUiPlans] = useState<UIPlan[]>([]);
  const [archPlans, setArchPlans] = useState<ArchitecturePlan[]>([]);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load project defaults, profiles, and available builder plans
  useEffect(() => {
    if (!activeProject) return;

    const loadContextData = async () => {
      try {
        const [prof, rules, uis, archs] = await Promise.all([
          profileRepository.getByProjectId(activeProject.id),
          promptRepository.getAll({ role: 'Global Rules' }),
          uiPlanRepository.getByProjectId(activeProject.id),
          architectureRepository.getByProjectId(activeProject.id),
        ]);

        setProfile(prof);
        setGlobalRules(rules);
        if (rules.length > 0) {
          setSelectedGlobalRule(rules[0]);
        }
        setUiPlans(uis);
        setArchPlans(archs);

        // Pre-fill form with active project stack if available
        if (activeProject.stack) {
          setForm((prev) => ({
            ...prev,
            stackTech: activeProject.stack,
            projectContext: `${activeProject.name}: ${activeProject.description}`,
          }));
        }
      } catch (err) {
        console.error('Failed to load prompt builder dependencies:', err);
      }
    };

    loadContextData();
  }, [activeProject]);

  const updateField = (field: keyof PromptFormState, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Selected UI plan and Architecture plan
  const selectedUiPlan = useMemo(() => {
    if (!form.selectedUIPlanId) return null;
    return uiPlans.find((u) => u.id === form.selectedUIPlanId) || null;
  }, [form.selectedUIPlanId, uiPlans]);

  const selectedArchitecture = useMemo(() => {
    if (!form.selectedArchitectureId) return null;
    return archPlans.find((a) => a.id === form.selectedArchitectureId) || null;
  }, [form.selectedArchitectureId, archPlans]);

  // Real-time deterministic prompt generation
  const generatedPrompt = useMemo(() => {
    return composePrompt({
      form,
      project: activeProject,
      profile,
      globalRule: form.includeGlobalRules ? selectedGlobalRule : null,
      uiPlan: selectedUiPlan,
      architecturePlan: selectedArchitecture,
      separator: settings.promptSeparator || '###',
    });
  }, [form, activeProject, profile, selectedGlobalRule, selectedUiPlan, selectedArchitecture, settings.promptSeparator]);

  const wordCount = useMemo(() => {
    return generatedPrompt.trim().split(/\s+/).filter(Boolean).length;
  }, [generatedPrompt]);

  const estimatedTokens = useMemo(() => {
    return Math.round(generatedPrompt.length / 4);
  }, [generatedPrompt]);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast('Prompt copied to clipboard!', 'success');

      if (activeProject) {
        await exportRepository.create({
          projectId: activeProject.id,
          sourceType: 'prompt-builder',
          format: 'text',
          path: 'clipboard',
          title: form.taskTitle,
          content: generatedPrompt,
          notes: `Deterministic prompt generated for ${form.targetRole}`,
        });
      }
    } catch {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleDownloadMarkdown = async () => {
    const filename = `${form.taskTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-prompt.md`;
    const blob = new Blob([generatedPrompt], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Downloaded ${filename}`, 'success');

    if (activeProject) {
      await exportRepository.create({
        projectId: activeProject.id,
        sourceType: 'prompt-builder',
        format: 'markdown',
        path: filename,
        title: form.taskTitle,
        content: generatedPrompt,
        notes: 'Exported as Markdown document',
      });
    }
  };

  const handleResetForm = () => {
    if (confirm('Reset prompt builder fields to defaults?')) {
      setForm(DEFAULT_PROMPT_FORM);
      showToast('Fields reset to defaults', 'info');
    }
  };

  const tabs = [
    { id: 'task', label: '1. Task & Role' },
    { id: 'tech', label: '2. Stack & Data' },
    { id: 'ui', label: '3. UI & UX' },
    { id: 'security', label: '4. Rules & Boundaries' },
    { id: 'delivery', label: '5. Delivery & Criteria' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      {/* Top Banner & Deterministic Toggles */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-surface)',
          padding: '12px 18px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={16} color="var(--primary)" />
            <span style={{ fontWeight: 600, fontSize: '13px' }}>Composition Blocks:</span>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.includeGlobalRules}
              onChange={(e) => updateField('includeGlobalRules', e.target.checked)}
            />
            <span>Global Quality Rules</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.includeProjectProfile}
              onChange={(e) => updateField('includeProjectProfile', e.target.checked)}
            />
            <span>Project Profile</span>
          </label>

          {/* Attach UI Plan Selector */}
          {uiPlans.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>UI Plan:</span>
              <select
                style={{ padding: '3px 8px', fontSize: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                value={form.selectedUIPlanId || ''}
                onChange={(e) => updateField('selectedUIPlanId', e.target.value || undefined)}
              >
                <option value="">None</option>
                {uiPlans.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Attach Architecture Selector */}
          {archPlans.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Architecture:</span>
              <select
                style={{ padding: '3px 8px', fontSize: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                value={form.selectedArchitectureId || ''}
                onChange={(e) => updateField('selectedArchitectureId', e.target.value || undefined)}
              >
                <option value="">None</option>
                {archPlans.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <Button variant="subtle" size="sm" icon={<RefreshCw size={14} />} onClick={handleResetForm}>
          Reset
        </Button>
      </div>

      {/* Split Pane: Form Topics (Left) vs Composed Prompt Output (Right) */}
      <div className="split-pane">
        {/* Left Pane: Topic Form Sections */}
        <div className="split-pane-left">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {activeTab === 'task' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                  <Input
                    label="Task Title (Topic 1) *"
                    value={form.taskTitle}
                    onChange={(e) => updateField('taskTitle', e.target.value)}
                    placeholder="e.g. Implement Barcode Scanner UI"
                  />
                  <Select
                    label="Task Type (Topic 1)"
                    value={form.taskType}
                    onChange={(e) => updateField('taskType', e.target.value)}
                    options={[
                      { value: 'Create New Feature', label: 'Create New Feature' },
                      { value: 'Refactor / Clean Up', label: 'Refactor / Clean Up' },
                      { value: 'Bug Fix / Debugging', label: 'Bug Fix / Debugging' },
                      { value: 'Performance Optimization', label: 'Performance Optimization' },
                      { value: 'API Integration', label: 'API Integration' },
                      { value: 'Database Migration', label: 'Database Migration' },
                      { value: 'Test Suite Implementation', label: 'Test Suite Implementation' },
                    ]}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <Select
                    label="Target Role (Topic 3)"
                    value={form.targetRole}
                    onChange={(e) => updateField('targetRole', e.target.value)}
                    options={[
                      { value: 'Full Stack', label: 'Full Stack Engineer' },
                      { value: 'Frontend', label: 'Frontend Engineer' },
                      { value: 'Backend', label: 'Backend Engineer' },
                      { value: 'Database', label: 'Database / SQLite Specialist' },
                      { value: 'UI/UX', label: 'UI/UX Designer & Implementer' },
                      { value: 'Security', label: 'Security & Boundary Specialist' },
                      { value: 'Testing', label: 'QA & Test Automation' },
                      { value: 'Reviewer', label: 'Code & Architecture Reviewer' },
                    ]}
                  />
                  <Input
                    label="Project Context (Topic 2)"
                    value={form.projectContext}
                    onChange={(e) => updateField('projectContext', e.target.value)}
                    placeholder="Specific module, workspace or project background..."
                  />
                </div>

                <Textarea
                  label="Feature Goal and Expected Outcome (Topic 4)"
                  value={form.featureGoal}
                  onChange={(e) => updateField('featureGoal', e.target.value)}
                  placeholder="What should this task achieve and what is the expected result?"
                  rows={3}
                />

                <Textarea
                  label="Existing Files / Scope to Modify (Topic 5)"
                  value={form.existingFilesScope}
                  onChange={(e) => updateField('existingFilesScope', e.target.value)}
                  placeholder="Specify filenames, directories, or code boundaries to constrain..."
                  rows={2}
                />
              </>
            )}

            {activeTab === 'tech' && (
              <>
                <Input
                  label="Framework, Language and Runtime (Topic 6)"
                  value={form.stackTech}
                  onChange={(e) => updateField('stackTech', e.target.value)}
                  placeholder="e.g. Electron + React 19 + TypeScript + SQLite"
                />

                <Textarea
                  label="Data Model / Entities Involved (Topic 7)"
                  value={form.dataModel}
                  onChange={(e) => updateField('dataModel', e.target.value)}
                  placeholder="List tables, entity properties, or TypeScript interfaces involved..."
                  rows={3}
                />

                <Textarea
                  label="State-Management Rules (Topic 10)"
                  value={form.stateManagement}
                  onChange={(e) => updateField('stateManagement', e.target.value)}
                  placeholder="e.g. Local state in components; React Context for active user & project."
                  rows={3}
                />

                <Textarea
                  label="API / Request-Response Flow (Topic 11)"
                  value={form.apiFlow}
                  onChange={(e) => updateField('apiFlow', e.target.value)}
                  placeholder="e.g. Typed IPC messages; REST endpoint /api/v1/items; error handling contract."
                  rows={3}
                />
              </>
            )}

            {activeTab === 'ui' && (
              <>
                <Textarea
                  label="UI Layout & Interaction Requirements (Topic 8)"
                  value={form.uiRequirements}
                  onChange={(e) => updateField('uiRequirements', e.target.value)}
                  placeholder="Describe buttons, tables, filters, drawer, or modal interactions..."
                  rows={4}
                />

                <Textarea
                  label="Error / Empty / Loading States (Topic 16)"
                  value={form.errorLoadingStates}
                  onChange={(e) => updateField('errorLoadingStates', e.target.value)}
                  placeholder="Describe skeleton loaders, error toast handling, and zero-data states..."
                  rows={3}
                />

                {selectedUiPlan && (
                  <div
                    style={{
                      padding: '12px',
                      backgroundColor: 'var(--primary-light)',
                      border: '1px solid var(--primary-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '12.5px',
                    }}
                  >
                    <strong>Attached Wireframe: {selectedUiPlan.name}</strong>
                    <p style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>
                      Layout: {selectedUiPlan.settings.layout} | Theme: {selectedUiPlan.settings.theme}
                    </p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'security' && (
              <>
                <Textarea
                  label="Validation Rules (Topic 9)"
                  value={form.validationRules}
                  onChange={(e) => updateField('validationRules', e.target.value)}
                  placeholder="Zod schemas, required fields, format constraints..."
                  rows={2}
                />

                <Textarea
                  label="Authentication / Authorization / RBAC (Topic 12)"
                  value={form.authPermissions}
                  onChange={(e) => updateField('authPermissions', e.target.value)}
                  placeholder="Role checks, permission guards, session requirements..."
                  rows={2}
                />

                <Textarea
                  label="Security and Tenant Boundaries (Topic 13)"
                  value={form.securityBoundaries}
                  onChange={(e) => updateField('securityBoundaries', e.target.value)}
                  placeholder="Input sanitization, query parameterization, tenant separation..."
                  rows={2}
                />

                <Textarea
                  label="Performance Constraints (Topic 14)"
                  value={form.performanceConstraints}
                  onChange={(e) => updateField('performanceConstraints', e.target.value)}
                  placeholder="Latency targets, memory limits, virtualization, lazy loading..."
                  rows={2}
                />

                <Textarea
                  label="SEO / Accessibility Requirements (Topic 15)"
                  value={form.seoAccessibility}
                  onChange={(e) => updateField('seoAccessibility', e.target.value)}
                  placeholder="ARIA landmarks, keyboard focus, semantic HTML tags, WCAG standards..."
                  rows={2}
                />
              </>
            )}

            {activeTab === 'delivery' && (
              <>
                <Textarea
                  label="Testing Requirements (Topic 17)"
                  value={form.testingRequirements}
                  onChange={(e) => updateField('testingRequirements', e.target.value)}
                  placeholder="Unit tests, integration suites, edge cases to verify..."
                  rows={2}
                />

                <Textarea
                  label="Dependency Restrictions (Topic 18)"
                  value={form.dependencyRestrictions}
                  onChange={(e) => updateField('dependencyRestrictions', e.target.value)}
                  placeholder="Forbidden packages, zero heavy UI frameworks, strict minimal dependencies..."
                  rows={2}
                />

                <Textarea
                  label="Output Format & Implementation Depth (Topic 19)"
                  value={form.outputFormat}
                  onChange={(e) => updateField('outputFormat', e.target.value)}
                  placeholder="e.g. Complete working code without placeholder comments; diff format; step-by-step."
                  rows={2}
                />

                <Textarea
                  label="Acceptance Criteria (Topic 20)"
                  value={form.acceptanceCriteria}
                  onChange={(e) => updateField('acceptanceCriteria', e.target.value)}
                  placeholder="Bullet points verifying exact success criteria..."
                  rows={3}
                />

                <Textarea
                  label="Custom Request / Ad-hoc Notes"
                  value={form.customNotes}
                  onChange={(e) => updateField('customNotes', e.target.value)}
                  placeholder="Any immediate instructions or special requirements for the AI pair programmer..."
                  rows={2}
                />
              </>
            )}
          </div>
        </div>

        {/* Right Pane: Live Composed Output Preview */}
        <div className="split-pane-right">
          <div className="preview-box">
            <div className="preview-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCode size={16} color="var(--primary)" />
                <span style={{ fontWeight: 600, fontSize: '13px' }}>AI-Ready Composed Prompt</span>
                <Badge variant="default">{wordCount} words</Badge>
                <Badge variant="primary">~{estimatedTokens} tokens</Badge>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Button
                  variant="primary"
                  size="sm"
                  icon={copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                  onClick={handleCopyPrompt}
                >
                  {copied ? 'Copied!' : 'Copy Prompt'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<BookmarkPlus size={14} />}
                  onClick={() => setIsLibraryModalOpen(true)}
                  title="Save prompt to Library"
                >
                  Save
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Download size={14} />}
                  onClick={handleDownloadMarkdown}
                  title="Download as Markdown"
                >
                  Export
                </Button>
              </div>
            </div>

            <pre className="preview-content">{generatedPrompt}</pre>
          </div>
        </div>
      </div>

      {/* Save to Library Modal */}
      <SaveToLibraryModal
        isOpen={isLibraryModalOpen}
        onClose={() => setIsLibraryModalOpen(false)}
        defaultTitle={form.taskTitle}
        defaultRole={form.targetRole}
        promptBody={generatedPrompt}
      />
    </div>
  );
};
