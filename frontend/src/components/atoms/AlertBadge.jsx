// Atoms — AlertBadge
import React from 'react';

const CONFIG = {
  ALTA:  { bg: '#FEE2E2', text: '#C0392B', dot: '#C0392B', label: 'ALTA' },
  MEDIA: { bg: '#FEF3C7', text: '#E67E22', dot: '#E67E22', label: 'MEDIA' },
  BAJA:  { bg: '#DBEAFE', text: '#2980B9', dot: '#2980B9', label: 'BAJA' },
};

export default function AlertBadge({ nivel, size = 'sm' }) {
  const c = CONFIG[nivel?.toUpperCase()] || CONFIG.BAJA;
  const pad = size === 'lg' ? '6px 14px' : '3px 10px';
  const fs = size === 'lg' ? 13 : 11;
  return (
    <span
      data-testid={`alert-badge-${nivel?.toLowerCase()}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: c.bg, color: c.text,
        padding: pad, borderRadius: 20,
        fontWeight: 700, fontSize: fs, letterSpacing: '0.05em',
        fontFamily: 'IBM Plex Sans, sans-serif',
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}
