import React from 'react';

interface FormInputProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
  step?: string;
  min?: string | number;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = false,
  disabled = false,
  placeholder,
  error,
  step,
  min,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <label style={{ fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--primary)', letterSpacing: '0.5px' }}>
      {label} {required && '*'}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      placeholder={placeholder}
      step={step}
      min={min}
      style={{
        padding: '0.75rem',
        border: error ? '2px solid var(--accent)' : '2px solid var(--border)',
        background: disabled ? 'var(--bg-secondary)' : 'white',
        color: 'var(--text-primary)',
        fontSize: '0.95rem',
        transition: 'all 0.3s ease',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    />
    {error && <span style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: '600' }}>{error}</span>}
  </div>
);

interface FormSelectProps {
  label: string;
  name: string;
  value: string;
  options: Array<{ id: string; name: string; code?: string }>;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  name,
  value,
  options,
  onChange,
  required = false,
  disabled = false,
  error,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <label style={{ fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--primary)', letterSpacing: '0.5px' }}>
      {label} {required && '*'}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      style={{
        padding: '0.75rem',
        border: error ? '2px solid var(--accent)' : '2px solid var(--border)',
        background: 'white',
        color: 'var(--text-primary)',
        fontSize: '0.95rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
    >
      <option value="">-- Select {label} --</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.name} {opt.code && `(${opt.code})`}
        </option>
      ))}
    </select>
    {error && <span style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: '600' }}>{error}</span>}
  </div>
);

interface FormTextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  error?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  name,
  value,
  onChange,
  required = false,
  placeholder,
  rows = 4,
  error,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <label style={{ fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--primary)', letterSpacing: '0.5px' }}>
      {label} {required && '*'}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      rows={rows}
      style={{
        padding: '0.75rem',
        border: error ? '2px solid var(--accent)' : '2px solid var(--border)',
        background: 'white',
        color: 'var(--text-primary)',
        fontSize: '0.95rem',
        fontFamily: 'inherit',
        resize: 'vertical',
        transition: 'all 0.3s ease',
      }}
    />
    {error && <span style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: '600' }}>{error}</span>}
  </div>
);

interface FormGroupProps {
  children: React.ReactNode;
  columns?: number;
  gap?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({ children, columns = 2, gap = '1.5rem' }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap }}>
    {children}
  </div>
);

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({ title, children }) => (
  <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '0.5px' }}>
      {title}
    </h2>
    {children}
  </div>
);

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: 'rgba(217, 119, 6, 0.1)',
      APPROVED: 'rgba(5, 150, 105, 0.1)',
      RECEIVED: 'rgba(2, 132, 199, 0.1)',
      REJECTED: 'rgba(220, 38, 38, 0.1)',
      COMPLETED: 'rgba(5, 150, 105, 0.1)',
      IN_PROGRESS: 'rgba(217, 119, 6, 0.1)',
      CANCELLED: 'rgba(107, 114, 128, 0.1)',
    };
    return statusMap[status] || 'rgba(107, 114, 128, 0.1)';
  };

  const getStatusTextColor = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: 'var(--warning)',
      APPROVED: 'var(--success)',
      RECEIVED: 'var(--info)',
      REJECTED: 'var(--accent)',
      COMPLETED: 'var(--success)',
      IN_PROGRESS: 'var(--warning)',
      CANCELLED: 'var(--text-light)',
    };
    return statusMap[status] || 'var(--text-light)';
  };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.4rem 0.8rem',
        fontSize: '0.75rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        background: getStatusColor(status),
        color: getStatusTextColor(status),
      }}
    >
      {status}
    </span>
  );
};

interface ActionButtonProps {
  label: string;
  onClick?: () => void;
  type?: 'submit' | 'button' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
}) => {
  const getVariantStyle = (variant: string) => {
    const variantMap: Record<string, React.CSSProperties> = {
      primary: {
        background: 'linear-gradient(135deg, var(--secondary), var(--secondary-light))',
        color: 'white',
      },
      secondary: {
        background: 'var(--primary)',
        color: 'white',
      },
      danger: {
        background: 'var(--accent)',
        color: 'white',
      },
      success: {
        background: 'var(--success)',
        color: 'white',
      },
    };
    return variantMap[variant] || variantMap.primary;
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        width: fullWidth ? '100%' : 'auto',
        padding: '0.75rem 1.5rem',
        border: 'none',
        fontWeight: '600',
        textTransform: 'uppercase',
        fontSize: '0.875rem',
        letterSpacing: '0.5px',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        opacity: disabled || loading ? 0.5 : 1,
        transition: 'all 0.3s ease',
        ...getVariantStyle(variant),
      }}
    >
      {icon} {loading ? 'PROCESSING...' : label}
    </button>
  );
};

interface AlertProps {
  message: string;
  type?: 'success' | 'danger' | 'warning' | 'info';
  icon?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ message, type = 'info', icon }) => {
  const getTypeStyle = (type: string) => {
    const typeMap: Record<string, { bg: string; border: string; color: string }> = {
      success: { bg: 'rgba(5, 150, 105, 0.05)', border: '4px solid var(--success)', color: 'var(--success)' },
      danger: { bg: 'rgba(220, 38, 38, 0.05)', border: '4px solid var(--accent)', color: 'var(--accent)' },
      warning: { bg: 'rgba(217, 119, 6, 0.05)', border: '4px solid var(--warning)', color: 'var(--warning)' },
      info: { bg: 'rgba(2, 132, 199, 0.05)', border: '4px solid var(--info)', color: 'var(--info)' },
    };
    return typeMap[type] || typeMap.info;
  };

  const style = getTypeStyle(type);

  return (
    <div
      style={{
        background: style.bg,
        borderLeft: style.border,
        color: style.color,
        padding: '1rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        fontWeight: '600',
      }}
    >
      {icon} {message}
    </div>
  );
};
