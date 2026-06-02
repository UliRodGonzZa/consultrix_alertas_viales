// Molecules — KpiCard
import React from 'react';
import { H2, Label } from '../atoms/Typography';

export default function KpiCard({ icon, label, value, sub, color = '#6B21A8', onClick, testId }) {
  return (
    <div
      data-testid={testId || 'kpi-card'}
      onClick={onClick}
      style={{
        background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10,
        padding: '20px 24px', cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', gap: 8,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(107,33,168,0.12)'; }}}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Label>{label}</Label>
        <span style={{ color, display: 'flex', alignItems: 'center' }}>{icon}</span>
      </div>
      <H2 style={{ fontSize: '1.5rem', color }}>{value}</H2>
      {sub && <span style={{ fontSize: 12, color: '#6B7280', fontFamily: 'IBM Plex Sans, sans-serif' }}>{sub}</span>}
    </div>
  );
}
