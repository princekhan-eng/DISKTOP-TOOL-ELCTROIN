import React, { useState, useEffect } from 'react';
import { useProject } from '../../../context/ProjectContext';
import { useApp } from '../../../context/AppContext';
import { ExportRecord } from '../../../types';
import { exportRepository } from '../../../db/repositories/exportRepository';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import {
  History,
  Copy,
  Trash2,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Code,
  Check,
} from 'lucide-react';

export const ExportHistoryPage: React.FC = () => {
  const { activeProject } = useProject();
  const { showToast } = useApp();

  const [records, setRecords] = useState<ExportRecord[]>([]);
  const [previewRecord, setPreviewRecord] = useState<ExportRecord | null>(null);

  const loadHistory = async () => {
    if (!activeProject) return;
    try {
      const list = await exportRepository.getAll(activeProject.id);
      setRecords(list);
    } catch (err) {
      console.error('Failed to load export history:', err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [activeProject]);

  const handleCopy = async (record: ExportRecord) => {
    try {
      await navigator.clipboard.writeText(record.content);
      showToast(`Copied "${record.title}" to clipboard!`, 'success');
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this export history record?')) {
      await exportRepository.delete(id);
      showToast('Record deleted', 'info');
      loadHistory();
    }
  };

  const handleClearAll = async () => {
    if (!activeProject) return;
    if (confirm(`Clear all export history for "${activeProject.name}"?`)) {
      await exportRepository.clearByProject(activeProject.id);
      showToast('History cleared', 'info');
      loadHistory();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-surface)',
          padding: '14px 18px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <History size={20} color="var(--primary)" />
          <div>
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Export & Copy History
            </span>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Track copied prompts, wireframe snapshots, and generated architecture flows.
            </p>
          </div>
        </div>

        {records.length > 0 && (
          <Button variant="subtle" size="sm" icon={<Trash2 size={13} />} onClick={handleClearAll}>
            Clear History
          </Button>
        )}
      </div>

      {/* History Table */}
      <div
        style={{
          flex: 1,
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          overflowY: 'auto',
        }}
      >
        {records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
            No export records found for this workspace. When you copy or export prompts, they will appear here.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Source Module</th>
                <th>Title / File</th>
                <th>Format</th>
                <th>Notes</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {new Date(r.createdAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td>
                    <Badge
                      variant={
                        r.sourceType === 'prompt-builder'
                          ? 'primary'
                          : r.sourceType === 'ui-builder'
                          ? 'warning'
                          : 'success'
                      }
                    >
                      {r.sourceType}
                    </Badge>
                  </td>
                  <td>
                    <div
                      style={{ fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                      onClick={() => setPreviewRecord(r)}
                    >
                      {r.title}
                    </div>
                    {r.path && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Target: {r.path}
                      </div>
                    )}
                  </td>
                  <td>
                    <Badge variant="default">{r.format.toUpperCase()}</Badge>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {r.notes || '-'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Button
                        variant="subtle"
                        size="sm"
                        icon={<Copy size={13} />}
                        onClick={() => handleCopy(r)}
                        title="Copy content again"
                      />
                      <Button
                        variant="subtle"
                        size="sm"
                        icon={<ExternalLink size={13} />}
                        onClick={() => setPreviewRecord(r)}
                        title="View details"
                      />
                      <Button
                        variant="subtle"
                        size="sm"
                        icon={<Trash2 size={13} color="var(--danger-text)" />}
                        onClick={() => handleDelete(r.id)}
                        title="Delete record"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Preview Modal */}
      {previewRecord && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewRecord(null)}
          title={`Export Record: ${previewRecord.title}`}
          size="lg"
          footer={
            <>
              <Button variant="subtle" onClick={() => setPreviewRecord(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                icon={<Copy size={14} />}
                onClick={() => handleCopy(previewRecord)}
              >
                Copy Content
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <Badge variant="primary">{previewRecord.sourceType}</Badge>
            <Badge variant="default">{previewRecord.format.toUpperCase()}</Badge>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Exported at {new Date(previewRecord.createdAt).toLocaleString()}
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
              maxHeight: '400px',
              overflowY: 'auto',
            }}
          >
            {previewRecord.content}
          </pre>
        </Modal>
      )}
    </div>
  );
};
