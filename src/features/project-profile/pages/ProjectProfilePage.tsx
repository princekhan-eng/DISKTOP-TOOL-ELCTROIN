import React, { useState, useEffect } from 'react';
import { useProject } from '../../../context/ProjectContext';
import { useApp } from '../../../context/AppContext';
import { ProjectProfile } from '../../../types';
import { profileRepository } from '../../../db/repositories/profileRepository';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Save, Layers, CheckCircle } from 'lucide-react';

export const ProjectProfilePage: React.FC = () => {
  const { activeProject, updateProject } = useProject();
  const { showToast } = useApp();

  const [profile, setProfile] = useState<ProjectProfile>({
    projectId: '',
    framework: '',
    language: '',
    runtime: '',
    database: '',
    validationApproach: '',
    stateConventions: '',
    folderConventions: '',
    architectureRules: '',
    uiRules: '',
    qualityRules: '',
    securityDefaults: '',
    performanceRules: '',
    testingDefaults: '',
    forbiddenPatterns: '',
    updatedAt: '',
  });

  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!activeProject) return;

    setProjectName(activeProject.name);
    setProjectDescription(activeProject.description);

    profileRepository.getByProjectId(activeProject.id).then((p) => {
      if (p) {
        setProfile(p);
      } else {
        setProfile((prev) => ({
          ...prev,
          projectId: activeProject.id,
          framework: 'React 19 + TypeScript',
          language: 'TypeScript (Strict)',
          runtime: 'Node.js 24',
          database: 'SQLite',
        }));
      }
    });
  }, [activeProject]);

  if (!activeProject) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        No active project selected.
      </div>
    );
  }

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // Update project core
      await updateProject(activeProject.id, {
        name: projectName.trim(),
        description: projectDescription.trim(),
        stack: `${profile.framework} | ${profile.database}`.trim(),
      });

      // Update profile
      await profileRepository.saveOrUpdate({
        ...profile,
        projectId: activeProject.id,
      });

      showToast('Project profile and conventions saved successfully!', 'success');
    } catch (err: any) {
      showToast('Failed to save profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfileField = (field: keyof ProjectProfile, val: string) => {
    setProfile((prev) => ({ ...prev, [field]: val }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Project Profile & Defaults
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>
            Conventions defined here are deterministically injected into all prompt compositions.
          </p>
        </div>

        <Button variant="primary" icon={<Save size={15} />} onClick={handleSaveAll} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>

      {/* General Project Metadata */}
      <Card title="1. Project Overview & Identity">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <Input
            label="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <div className="form-group">
            <label className="form-label">Project Type</label>
            <div style={{ paddingTop: '8px' }}>
              <Badge variant="primary">{activeProject.projectType}</Badge>
            </div>
          </div>
        </div>

        <Textarea
          label="Project Description"
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          rows={2}
          placeholder="High level overview of what this application does..."
        />
      </Card>

      {/* Tech Stack & Runtime */}
      <Card title="2. Tech Stack & Runtime Architecture">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <Input
            label="Framework"
            value={profile.framework}
            onChange={(e) => updateProfileField('framework', e.target.value)}
            placeholder="e.g. React 19, Next.js, Electron"
          />
          <Input
            label="Language & Mode"
            value={profile.language}
            onChange={(e) => updateProfileField('language', e.target.value)}
            placeholder="e.g. TypeScript 5 (Strict)"
          />
          <Input
            label="Runtime Environment"
            value={profile.runtime}
            onChange={(e) => updateProfileField('runtime', e.target.value)}
            placeholder="e.g. Node.js 24, Chromium"
          />
          <Input
            label="Database / Storage Engine"
            value={profile.database}
            onChange={(e) => updateProfileField('database', e.target.value)}
            placeholder="e.g. SQLite (sql.js / better-sqlite3)"
          />
        </div>
      </Card>

      {/* Architecture & Conventions */}
      <Card title="3. Coding Standards & Conventions">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Validation Approach"
            value={profile.validationApproach}
            onChange={(e) => updateProfileField('validationApproach', e.target.value)}
            placeholder="e.g. Zod schemas at IPC and route boundaries"
          />

          <Input
            label="State-Management Convention"
            value={profile.stateConventions}
            onChange={(e) => updateProfileField('stateConventions', e.target.value)}
            placeholder="e.g. Local component state + React Context for workspace models"
          />

          <Input
            label="Folder & Layer Architecture"
            value={profile.folderConventions}
            onChange={(e) => updateProfileField('folderConventions', e.target.value)}
            placeholder="e.g. Feature-driven modular layout (features/*, db/repositories/*)"
          />

          <Textarea
            label="UI Theme & Component Rules"
            value={profile.uiRules}
            onChange={(e) => updateProfileField('uiRules', e.target.value)}
            rows={2}
            placeholder="e.g. Soft light theme, #F7F9FC bg, white surfaces, #2563EB accent, 8-12px radii"
          />

          <Textarea
            label="Security & Boundary Defaults"
            value={profile.securityDefaults}
            onChange={(e) => updateProfileField('securityDefaults', e.target.value)}
            rows={2}
            placeholder="e.g. Strict IPC boundary validation; no direct raw SQL in UI components"
          />

          <Textarea
            label="Performance & Testing Guidelines"
            value={profile.testingDefaults}
            onChange={(e) => updateProfileField('testingDefaults', e.target.value)}
            rows={2}
            placeholder="e.g. Vitest unit tests for business logic and deterministic prompt composition"
          />

          <Textarea
            label="Forbidden Patterns & Restrictions"
            value={profile.forbiddenPatterns}
            onChange={(e) => updateProfileField('forbiddenPatterns', e.target.value)}
            rows={2}
            placeholder="e.g. Do not use any types. No large external UI libraries. No cloud APIs in V1."
          />
        </div>
      </Card>
    </div>
  );
};
