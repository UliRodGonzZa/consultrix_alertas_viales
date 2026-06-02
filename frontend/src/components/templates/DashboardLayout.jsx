// Templates — DashboardLayout
import React from 'react';
import Sidebar from '../organisms/Sidebar';
import Header from '../organisms/Header';

export default function DashboardLayout({ activeTab, onTabChange, anio, children }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F9FAFB', fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header anio={anio} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
