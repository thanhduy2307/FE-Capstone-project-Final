import React from 'react';
import './Button.css';

/**
 * Button Component
 * @param {Object} props
 * @param {string} props.variant - Button variant: 'primary', 'secondary', 'outline'
 * @param {string} props.size - Button size: 'sm', 'md', 'lg'
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.type - Button type: 'button', 'submit', 'reset'
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  children,
  onClick,
  className = '',
  ...props
}) => {
  const buttonClass = `btn btn-${variant} btn-${size} ${loading ? 'btn-loading' : ''} ${className}`;

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="btn-spinner"></span>
      )}
      <span className={loading ? 'btn-text-loading' : ''}>{children}</span>
    </button>
  );
};

export default Button;
