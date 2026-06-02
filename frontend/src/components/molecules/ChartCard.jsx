// Molecules — ChartCard (clickable chart wrapper with modal trigger)
import React from 'react';
import { H3, Body } from '../atoms/Typography';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';

export default function ChartCard({ title, subtitle, children, onExpand, testId, minH = 340 }) {
  return (
    <div
      data-testid={testId || 'chart-card'}
      style={{
        background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10,
        padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <H3>{title}</H3>
          {subtitle && <Body style={{ marginTop: 2 }}>{subtitle}</Body>}
        </div>
        {onExpand && (
          <button
            data-testid={`${testId}-expand`}
            onClick={onExpand}
            title="Ver detalle"
            style={{
              background: 'none', border: '1px solid #E5E7EB', borderRadius: 6,
              padding: '4px 8px', cursor: 'pointer', color: '#6B21A8',
              display: 'flex', alignItems: 'center', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F3E8FF'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
          >
            <OpenInFullIcon style={{ fontSize: 16 }} />
          </button>
        )}
      </div>
      <div style={{ minHeight: minH, flex: 1 }}>{children}</div>
    </div>
  );
}
