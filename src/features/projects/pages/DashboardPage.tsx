import React, { useState, useEffect } from 'react';
import { useProject } from '../../../context/ProjectContext';
import { useApp } from '../../../context/AppContext';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { promptRepository } from '../../../db/repositories/promptRepository';
import { uiPlanRepository } from '../../../db/repositories/uiPlanRepository';
import { architectureRepository } from '../../../db/repositories/architectureRepository';
import { exportRepository } from '../../../db/repositories/exportRepository';
import {
  FileText,
  Layout,
  Network,
  BookOpen,
  ArrowRight,
  Copy,
  Clock,
  Database,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';

interface RecentItem {
  id: string;
  name: string;
  type: 'Prompt' | 'UI Plan' | 'Architecture' | 'Export';
  updatedAt: string;
  preview: string;
}

export const DashboardPage: React.FC = () => {
  const { activeProject } = useProject();
  const { setActiveModule, showToast } = useApp();
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [totalUIPlans, setTotalUIPlans] = useState(0);
  const [totalArchitectures, setTotalArchitectures] = useState(0);
  const [lastExportTime, setLastExportTime] = useState<string>('Never');

  useEffect(() => {
    if (!activeProject) return;

    const loadDashboardData = async () => {
      try {
        const [prompts, uiPlans, archPlans, exports] = await Promise.all([
          promptRepository.getAll({ projectId: activeProject.id }),
          uiPlanRepository.getByProjectId(activeProject.id),
          architectureRepository.getByProjectId(activeProject.id),
          exportRepository.getAll(activeProject.id),
        ]);

        setTotalPrompts(prompts.length);
        setTotalUIPlans(uiPlans.length);
        setTotalArchitectures(archPlans.length);

        if (exports.length > 0) {
          const latest = new Date(exports[0].createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          setLastExportTime(latest);
        }

        const items: RecentItem[] = [];

        prompts.slice(0, 3).forEach((p) => {
          items.push({
            id: p.id,
            name: p.title,
            type: 'Prompt',
            updatedAt: p.updatedAt,
            preview: p.body.substring(0, 100),
          });
        });

        uiPlans.slice(0, 2).forEach((u) => {
          items.push({
            id: u.id,
            name: u.name,
            type: 'UI Plan',
            updatedAt: u.updatedAt,
            preview: u.generatedText ? u.generatedText.substring(0, 100) : 'Wireframe plan',
          });
        });

        archPlans.slice(0, 2).forEach((a) => {
          items.push({
            id: a.id,
            name: a.name,
            type: 'Architecture',
            updatedAt: a.updatedAt,
            preview: a.generatedText ? a.generatedText.substring(0, 100) : 'Architecture flow',
          });
        });

        // Sort by updatedAt desc
        items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setRecentItems(items.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };

    loadDashboardData();
  }, [activeProject]);

  if (!activeProject) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>No Active Project Selected</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          Select or create a project workspace to get started.
        </p>
      </div>
    );
  }

  const handleCopyPreview = (content: string, name: string) => {
    navigator.clipboard.writeText(content);
    showToast(`Copied "${name}" to clipboard`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-surface-subtle) 100%)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-subtle)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Welcome to {activeProject.name}
            </h1>
            <Badge variant="primary">{activeProject.projectType}</Badge>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '14px' }}>
            {activeProject.description || 'Build better prompts, designs and architectures.'}
          </p>
          {activeProject.stack && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                STACK:
              </span>
              <span
                style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-surface-hover)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                }}
              >
                {activeProject.stack}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="primary"
            icon={<Sparkles size={16} />}
            onClick={() => setActiveModule('prompt-builder')}
          >
            Create Prompt
          </Button>
        </div>
      </div>

      {/* Quick Action Grid (Page 5 blueprint) */}
      <div>
        <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {/* Action 1: Prompt Builder */}
          <div
            onClick={() => setActiveModule('prompt-builder')}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
            className="hover-card"
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
                  Prompt Builder
                </span>
                <ArrowRight size={14} color="var(--text-muted)" />
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Fill structured topics & generate composed AI prompt
              </p>
            </div>
          </div>

          {/* Action 2: UI Builder */}
          <div
            onClick={() => setActiveModule('ui-builder')}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
            className="hover-card"
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#F3E8FF',
                color: '#9333EA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Layout size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
                  UI Builder
                </span>
                <ArrowRight size={14} color="var(--text-muted)" />
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Pick layout/components and produce visual UI specs
              </p>
            </div>
          </div>

          {/* Action 3: Architecture Builder */}
          <div
            onClick={() => setActiveModule('architecture')}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
            className="hover-card"
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--success-light)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Network size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
                  Architecture
                </span>
                <ArrowRight size={14} color="var(--text-muted)" />
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Design system flows and export ordered AI instructions
              </p>
            </div>
          </div>

          {/* Action 4: Prompt Library */}
          <div
            onClick={() => setActiveModule('prompt-library')}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
            className="hover-card"
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--warning-light)',
                color: 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookOpen size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
                  Prompt Library
                </span>
                <ArrowRight size={14} color="var(--text-muted)" />
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Browse & manage production prompts and rules
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Split: Recent Items Table & Project Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Recent Items Table */}
        <Card title="Recent Items">
          {recentItems.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', padding: '16px 0', textAlign: 'center' }}>
              No prompts or designs created yet. Use the quick actions above to start!
            </p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Updated</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentItems.map((item) => (
                    <tr key={`${item.type}-${item.id}`}>
                      <td>
                        <span style={{ fontWeight: 600 }}>{item.name}</span>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.preview}
                        </div>
                      </td>
                      <td>
                        <Badge
                          variant={
                            item.type === 'Prompt'
                              ? 'primary'
                              : item.type === 'UI Plan'
                              ? 'warning'
                              : 'success'
                          }
                        >
                          {item.type}
                        </Badge>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          variant="subtle"
                          size="sm"
                          icon={<Copy size={13} />}
                          onClick={() => handleCopyPreview(item.preview, item.name)}
                          title="Copy content"
                        >
                          Copy
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Project Status & Counts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card title="Workspace Status">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Storage Engine</span>
                <span className="storage-status-pill">
                  <span className="status-dot"></span>
                  SQLite Local
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Last Export</span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {lastExportTime}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Saved Prompts</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {totalPrompts}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>UI Plans</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {totalUIPlans}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Architecture Flows</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {totalArchitectures}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <Button
                variant="secondary"
                size="sm"
                style={{ width: '100%' }}
                icon={<Layers size={14} />}
                onClick={() => setActiveModule('project-profile')}
              >
                Manage Project Profile
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
