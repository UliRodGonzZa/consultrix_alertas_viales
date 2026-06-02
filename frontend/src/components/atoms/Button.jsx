// Atoms — Button
import React from 'react';

export default function Button({ children, onClick, variant = 'primary', size = 'md', disabled, testId, style }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none', borderRadius: 6, fontFamily: 'IBM Plex Sans, sans-serif',
    fontWeight: 600, transition: 'all 0.15s ease', opacity: disabled ? 0.5 : 1,
  };
  const sizes = { sm: { padding: '6px 14px', fontSize: 12 }, md: { padding: '9px 20px', fontSize: 14 }, lg: { padding: '12px 28px', fontSize: 15 } };
  const variants = {
    primary: { background: '#6B21A8', color: '#fff' },
    secondary: { background: '#E67E22', color: '#fff' },
    ghost: { background: 'transparent', color: '#6B21A8', border: '1.5px solid #6B21A8' },
    danger: { background: '#C0392B', color: '#fff' },
  };
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}
