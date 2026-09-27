import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  help?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  help,
  error,
  id,
  className = '',
  ...props
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={textareaId} className="form-label">
          <span>{label}</span>
          {help && <span className="form-help">{help}</span>}
        </label>
      )}
      <textarea id={textareaId} className={`textarea ${className}`} {...props} />
      {error && <span style={{ color: 'var(--danger-text)', fontSize: '11.5px' }}>{error}</span>}
    </div>
  );
};
