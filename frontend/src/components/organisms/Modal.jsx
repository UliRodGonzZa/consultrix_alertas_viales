// Organisms — Modal
import React, { useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { H2 } from '../atoms/Typography';

export default function Modal({ open, onClose, title, children, wide = false }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      data-testid="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <div
        data-testid="modal-content"
        style={{
          background: '#fff', borderRadius: 12, padding: '28px 32px',
          width: '100%', maxWidth: wide ? 900 : 680,
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
          animation: 'slideUp 0.2s ease',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <H2>{title}</H2>
          <button
            data-testid="modal-close-btn"
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', borderRadius: 6,
              padding: 4, color: '#6B7280', display: 'flex', alignItems: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F3E8FF'; e.currentTarget.style.color = '#6B21A8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6B7280'; }}
          >
            <CloseIcon style={{ fontSize: 22 }} />
          </button>
        </div>
        {children}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
}
