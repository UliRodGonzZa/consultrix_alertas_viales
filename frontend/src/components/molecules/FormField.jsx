// Molecules — FormField
import React from 'react';
import { Label } from '../atoms/Typography';

export default function FormField({ label, children, error, testId }) {
  return (
    <div data-testid={testId} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <Label>{label}</Label>
      {children}
      {error && <span style={{ fontSize: 11, color: '#C0392B', fontFamily: 'IBM Plex Sans, sans-serif' }}>{error}</span>}
    </div>
  );
}

export function Input({ value, onChange, type = 'number', placeholder, min, max, step, testId }) {
  return (
    <input
      data-testid={testId}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      style={{
        padding: '8px 12px', borderRadius: 6, border: '1.5px solid #E5E7EB',
        fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 14, color: '#111827',
        outline: 'none', transition: 'border 0.15s',
        width: '100%', boxSizing: 'border-box',
      }}
      onFocus={e => { e.target.style.borderColor = '#6B21A8'; }}
      onBlur={e => { e.target.style.borderColor = '#E5E7EB'; }}
    />
  );
}

export function Select({ value, onChange, options, testId }) {
  return (
    <select
      data-testid={testId}
      value={value}
      onChange={onChange}
      style={{
        padding: '8px 12px', borderRadius: 6, border: '1.5px solid #E5E7EB',
        fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 14, color: '#111827',
        outline: 'none', background: '#fff', width: '100%', boxSizing: 'border-box',
      }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
