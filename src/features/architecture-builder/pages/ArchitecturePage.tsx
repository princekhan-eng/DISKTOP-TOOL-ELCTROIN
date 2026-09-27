import React, { useState, useEffect } from 'react';
import { useProject } from '../../../context/ProjectContext';
import { useApp } from '../../../context/AppContext';
import { ArchitecturePlan, ArchitectureNode, ArchitectureEdge, ArchitectureNodeType } from '../../../types';
import { AVAILABLE_NODE_TYPES, NodeTypeDefinition } from '../flow-schema/nodes';
import { generateArchitecturePrompt } from '../export/architectureExporter';
import { architectureRepository } from '../../../db/repositories/architectureRepository';
import { exportRepository } from '../../../db/repositories/exportRepository';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import {
  Network,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Copy,
  Save,
  Download,
  FileText,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  const { activeProject } = useProject();
  const { showToast } = useApp();

  const [plans, setPlans] = useState<ArchitecturePlan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string>('');
  const [planName, setPlanName] = useState('New Architecture Flow');
  const [nodes, setNodes] = useState<ArchitectureNode[]>([]);
  const [edges, setEdges] = useState<ArchitectureEdge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [specModalOpen, setSpecModalOpen] = useState(false);

  useEffect(() => {
    if (!activeProject) return;

    architectureRepository.getByProjectId(activeProject.id).then((saved) => {
      setPlans(saved);
      if (saved.length > 0) {
        const first = saved[0];
        setCurrentPlanId(first.id);
        setPlanName(first.name);
        setNodes(first.nodes);
        setEdges(first.edges);
        if (first.nodes.length > 0) setSelectedNodeId(first.nodes[0].id);
      } else {
        initDefaultFlow();
      }
    });
  }, [activeProject]);

  const initDefaultFlow = () => {
    const id = `arch-${Date.now()}`;
    setCurrentPlanId(id);
    setPlanName('Local-First Service Pipeline');
    const defaultNodes: ArchitectureNode[] = [
      {
        id: 'n-1',
        type: 'UI / Component',
        title: 'User Interface Component',
        tier: 'Frontend',
        description: 'React component collecting user action',
        tech: 'React 19 + TypeScript',
        dataFlow: 'Form submit event payload',
        order: 1,
      },
      {
        id: 'n-2',
        type: 'Validation',
        title: 'Input Schema Validator',
        tier: 'Frontend',
        description: 'Verifies data integrity before invoking service',
        tech: 'Zod schemas',
        dataFlow: 'Parsed schema result',
        order: 2,
      },
      {
        id: 'n-3',
        type: 'Service / Logic',
        title: 'Domain Business Logic',
        tier: 'Backend / Core',
        description: 'Executes core workflow rules and atomic boundaries',
        tech: 'TypeScript Service',
        dataFlow: 'Domain entity models',
        order: 3,
      },
      {
        id: 'n-4',
        type: 'Repository / Data Access',
        title: 'SQLite Repository',
        tier: 'Backend / Core',
        description: 'Executes parameterized queries against local database',
        tech: 'SQLite / sql.js',
        dataFlow: 'SQL statement execution',
        order: 4,
      },
      {
        id: 'n-5',
        type: 'Database / SQLite',
        title: 'Local Database File',
        tier: 'Storage / Data',
        description: 'Local single-user SQLite file on disk',
        tech: 'SQLite 3 file',
        dataFlow: 'Committed disk write',
        order: 5,
      },
    ];
    setNodes(defaultNodes);
    setEdges([
      { id: 'e1', fromNodeId: 'n-1', toNodeId: 'n-2', label: 'validates' },
      { id: 'e2', fromNodeId: 'n-2', toNodeId: 'n-3', label: 'dispatches to' },
      { id: 'e3', fromNodeId: 'n-3', toNodeId: 'n-4', label: 'calls queries' },
      { id: 'e4', fromNodeId: 'n-4', toNodeId: 'n-5', label: 'persists in' },
    ]);
    setSelectedNodeId('n-1');
  };

  const handleSelectPlan = (planId: string) => {
    const p = plans.find((x) => x.id === planId);
    if (!p) return;
    setCurrentPlanId(p.id);
    setPlanName(p.name);
    setNodes(p.nodes);
    setEdges(p.edges);
    if (p.nodes.length > 0) setSelectedNodeId(p.nodes[0].id);
  };

  const handleAddNode = (def: NodeTypeDefinition) => {
    const id = `n-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newNode: ArchitectureNode = {
      id,
      type: def.type,
      title: def.label,
      tier: def.defaultTier,
      description: def.description,
      tech: '',
      dataFlow: '',
      order: nodes.length + 1,
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    showToast(`Added node: ${def.label}`, 'info');
  };

  const handleRemoveNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.fromNodeId !== id && e.toNodeId !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const handleMoveNode = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === nodes.length - 1) return;

    const newNodes = [...nodes];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newNodes[index];
    newNodes[index] = newNodes[targetIndex];
    newNodes[targetIndex] = temp;
    setNodes(newNodes);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const handleUpdateSelectedNode = (updates: Partial<ArchitectureNode>) => {
    if (!selectedNodeId) return;
    setNodes((prev) =>
      prev.map((n) => (n.id === selectedNodeId ? { ...n, ...updates } : n))
    );
  };

  const generatedPrompt = generateArchitecturePrompt(planName, nodes, edges);

  const handleSaveFlow = async () => {
    if (!activeProject) return;
    try {
      const planToSave: ArchitecturePlan = {
        id: currentPlanId || `arch-${Date.now()}`,
        projectId: activeProject.id,
        name: planName,
        nodes,
        edges,
        generatedText: generatedPrompt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await architectureRepository.save(planToSave);
      const all = await architectureRepository.getByProjectId(activeProject.id);
      setPlans(all);
      showToast(`Architecture flow "${planName}" saved to SQLite!`, 'success');
    } catch (err: any) {
      showToast('Failed to save flow', 'error');
    }
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      showToast('Architecture instructions copied to clipboard!', 'success');

      if (activeProject) {
        await exportRepository.create({
          projectId: activeProject.id,
          sourceType: 'architecture',
          format: 'text',
          path: 'clipboard',
          title: `Architecture: ${planName}`,
          content: generatedPrompt,
          notes: 'Copied architecture system flow specification',
        });
      }
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  const handleExportJSON = () => {
    const data = {
      name: planName,
      nodes,
      edges,
      generatedPrompt,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `${planName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-architecture.json`;
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported JSON: ${filename}`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      {/* Top Header Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Network size={20} color="var(--success)" />
          <input
            style={{
              fontSize: '16px',
              fontWeight: 600,
              border: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              outline: 'none',
              borderBottom: '1px dashed var(--border-color)',
              minWidth: '240px',
            }}
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
          />
          {plans.length > 1 && (
            <select
              style={{ fontSize: '12px', padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
              value={currentPlanId}
              onChange={(e) => handleSelectPlan(e.target.value)}
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
          <Button variant="subtle" size="sm" icon={<Plus size={14} />} onClick={initDefaultFlow}>
            New Flow
          </Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button variant="secondary" size="sm" icon={<FileText size={14} />} onClick={() => setSpecModalOpen(true)}>
            View Spec
          </Button>
          <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={handleExportJSON}>
            JSON
          </Button>
          <Button variant="secondary" size="sm" icon={<Copy size={14} />} onClick={handleCopyPrompt}>
            Copy Flow Prompt
          </Button>
          <Button variant="primary" size="sm" icon={<Save size={14} />} onClick={handleSaveFlow}>
            Save Flow
          </Button>
        </div>
      </div>

      {/* 3-Column Layout: Node Palette (Left), Flow Graph (Center), Property Inspector (Right) */}
      <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
        {/* Left: Node Types Palette */}
        <div
          style={{
            width: '240px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            overflowY: 'auto',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Architecture Nodes
          </div>
          <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Click to append node to sequence
          </p>

          {AVAILABLE_NODE_TYPES.map((def) => (
            <button
              key={def.type}
              onClick={() => handleAddNode(def)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface-subtle)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.12s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle)';
              }}
            >
              <span>{def.label}</span>
              <Plus size={13} color="var(--primary)" />
            </button>
          ))}
        </div>

        {/* Center: Visual Sequence & Flow Diagram */}
        <div
          style={{
            flex: 1,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                System Pipeline Flow
              </span>
              <Badge variant="default">{nodes.length} nodes</Badge>
            </div>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Deterministic execution sequence
            </span>
          </div>

          {nodes.length === 0 ? (
            <div
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '40px',
                textAlign: 'center',
                color: 'var(--text-muted)',
              }}
            >
              Click nodes from the left palette to construct your architecture flow
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {nodes.map((node, index) => {
                const isSelected = node.id === selectedNodeId;
                const isLast = index === nodes.length - 1;

                return (
                  <React.Fragment key={node.id}>
                    <div
                      onClick={() => setSelectedNodeId(node.id)}
                      style={{
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isSelected ? '#F8FAFC' : 'var(--bg-surface)',
                        padding: '14px 16px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 0 0 2px rgba(37, 99, 235, 0.1)' : 'var(--shadow-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--bg-surface-hover)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: 700,
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {index + 1}
                          </span>
                          <Badge
                            variant={
                              node.tier === 'Frontend'
                                ? 'primary'
                                : node.tier === 'API Gateway'
                                ? 'warning'
                                : 'success'
                            }
                          >
                            {node.tier}
                          </Badge>
                          <span style={{ fontWeight: 600, fontSize: '13.5px' }}>{node.title}</span>
                          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                            ({node.type})
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Button
                            variant="subtle"
                            size="sm"
                            icon={<ArrowUp size={13} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveNode(index, 'up');
                            }}
                            disabled={index === 0}
                          />
                          <Button
                            variant="subtle"
                            size="sm"
                            icon={<ArrowDown size={13} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveNode(index, 'down');
                            }}
                            disabled={isLast}
                          />
                          <Button
                            variant="subtle"
                            size="sm"
                            icon={<Trash2 size={13} color="var(--danger-text)" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveNode(node.id);
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ marginTop: '8px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                        {node.description || 'No description provided'}
                      </div>

                      {(node.tech || node.dataFlow) && (
                        <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '11.5px' }}>
                          {node.tech && (
                            <span>
                              <strong>Tech:</strong> {node.tech}
                            </span>
                          )}
                          {node.dataFlow && (
                            <span>
                              <strong>Data:</strong> {node.dataFlow}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {!isLast && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-muted)',
                          padding: '2px 0',
                        }}
                      >
                        <ArrowDown size={16} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Node Inspector */}
        <div
          style={{
            width: '280px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            overflowY: 'auto',
          }}
        >
          {selectedNode ? (
            <>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Node Properties
              </div>
              <Input
                label="Node Title"
                value={selectedNode.title}
                onChange={(e) => handleUpdateSelectedNode({ title: e.target.value })}
              />
              <Select
                label="Architecture Tier"
                value={selectedNode.tier}
                onChange={(e) =>
                  handleUpdateSelectedNode({
                    tier: e.target.value as ArchitectureNode['tier'],
                  })
                }
                options={[
                  { value: 'Frontend', label: 'Frontend Layer' },
                  { value: 'API Gateway', label: 'API Gateway / IPC' },
                  { value: 'Backend / Core', label: 'Backend / Core Service' },
                  { value: 'Storage / Data', label: 'Storage / Database' },
                ]}
              />
              <Input
                label="Technology / Stack"
                value={selectedNode.tech}
                onChange={(e) => handleUpdateSelectedNode({ tech: e.target.value })}
                placeholder="e.g. React 19, Zod, SQLite, Prisma"
              />
              <Textarea
                label="Purpose / Responsibility"
                value={selectedNode.description}
                onChange={(e) => handleUpdateSelectedNode({ description: e.target.value })}
                rows={3}
              />
              <Input
                label="Data Contract / Transfer"
                value={selectedNode.dataFlow}
                onChange={(e) => handleUpdateSelectedNode({ dataFlow: e.target.value })}
                placeholder="e.g. payload: { id, name }, returns Result<T>"
              />
            </>
          ) : (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Select a node to inspect and edit details
            </div>
          )}
        </div>
      </div>

      {/* Specification Preview Modal */}
      <Modal
        isOpen={specModalOpen}
        onClose={() => setSpecModalOpen(false)}
        title={`Architecture Specification: ${planName}`}
        size="lg"
        footer={
          <>
            <Button variant="subtle" onClick={() => setSpecModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" icon={<Copy size={14} />} onClick={handleCopyPrompt}>
              Copy Instructions
            </Button>
          </>
        }
      >
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
          {generatedPrompt}
        </pre>
      </Modal>
    </div>
  );
};
