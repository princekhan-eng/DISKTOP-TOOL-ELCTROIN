import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  help?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  help,
  error,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          <span>{label}</span>
          {help && <span className="form-help">{help}</span>}
        </label>
      )}
      <input id={inputId} className={`input ${error ? 'border-danger' : ''} ${className}`} {...props} />
      {error && <span style={{ color: 'var(--danger-text)', fontSize: '11.5px' }}>{error}</span>}
    </div>
  );
};
