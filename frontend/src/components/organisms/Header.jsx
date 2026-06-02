// Organisms — Header
import React from 'react';
import TrafficIcon from '@mui/icons-material/Traffic';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

export default function Header({ anio }) {
  return (
    <header
      data-testid="app-header"
      style={{
        height: 60, background: '#6B21A8',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px', flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <TrafficIcon style={{ color: '#fff', fontSize: 22 }} />
        <span style={{
          fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 17, color: '#fff',
        }}>
          Sistema de Alertas Viales
        </span>
        <span style={{
          background: 'rgba(255,255,255,0.15)', color: '#fff',
          padding: '2px 10px', borderRadius: 12,
          fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 11, fontWeight: 600,
          marginLeft: 4,
        }}>CAPUFE</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'IBM Plex Sans, sans-serif' }}>
        <CalendarTodayIcon style={{ fontSize: 15 }} />
        Datos {anio || '2025'} — Actualizado Jun 2025
      </div>
    </header>
  );
}
