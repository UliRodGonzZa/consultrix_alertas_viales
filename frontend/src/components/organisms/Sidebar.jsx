// Organisms — Sidebar
import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PsychologyIcon from '@mui/icons-material/Psychology';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import TrafficIcon from '@mui/icons-material/Traffic';

const NAV = [
  { id: 'overview', label: 'Resumen',   Icon: DashboardIcon },
  { id: 'trafico',  label: 'Tráfico',   Icon: DirectionsCarIcon },
  { id: 'accidentes', label: 'Accidentes', Icon: WarningAmberIcon },
  { id: 'modelo',   label: 'Modelo ML', Icon: PsychologyIcon },
  { id: 'alertas',  label: 'Alertas',   Icon: NotificationsActiveIcon },
];

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside
      data-testid="sidebar"
      style={{
        width: 220, minHeight: '100vh', background: '#fff',
        borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'linear-gradient(135deg, #6B21A8, #9333EA)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <TrafficIcon style={{ color: '#fff', fontSize: 20 }} />
        </div>
        <div>
          <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 13, color: '#111827', lineHeight: 1.2 }}>Alertas</div>
          <div style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sistema Vial</div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              data-testid={`nav-${id}`}
              onClick={() => onTabChange(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, border: 'none',
                background: active ? '#F3E8FF' : 'transparent',
                color: active ? '#6B21A8' : '#4B5563',
                fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: active ? 600 : 400,
                fontSize: 14, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                width: '100%',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.color = '#6B21A8'; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4B5563'; }}}
            >
              <Icon style={{ fontSize: 18, flexShrink: 0 }} />
              {label}
              {active && <div style={{ marginLeft: 'auto', width: 3, height: 18, borderRadius: 2, background: '#6B21A8' }} />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #E5E7EB' }}>
        <div style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'IBM Plex Sans, sans-serif' }}>
          Equipo 2 — Consultrix<br />CAPUFE 2021–2025
        </div>
      </div>
    </aside>
  );
}
