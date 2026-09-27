import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Eraser, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const PinBoardPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<'draw' | 'erase'>('draw');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = mode === 'erase' ? '#ffffff' : '#000000';
    ctx.lineWidth = mode === 'erase' ? 20 : 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
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
          <PenTool size={20} color="var(--primary)" />
          <span style={{ fontSize: '16px', fontWeight: 600 }}>Sketch Pin Board</span>
          
          <div style={{ display: 'flex', gap: '8px', marginLeft: '20px' }}>
            <Button
              variant={mode === 'draw' ? 'primary' : 'subtle'}
              size="sm"
              icon={<PenTool size={14} />}
              onClick={() => setMode('draw')}
            >
              Draw
            </Button>
            <Button
              variant={mode === 'erase' ? 'primary' : 'subtle'}
              size="sm"
              icon={<Eraser size={14} />}
              onClick={() => setMode('erase')}
            >
              Erase
            </Button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button variant="secondary" size="sm" icon={<Trash2 size={14} />} onClick={clearBoard}>
            Clear
          </Button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}
      >
        <canvas
          ref={canvasRef}
          width={1000}
          height={700}
          style={{
            cursor: mode === 'draw' ? 'crosshair' : 'cell',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-md)',
            backgroundColor: '#ffffff'
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
        />
      </div>
    </div>
  );
};
