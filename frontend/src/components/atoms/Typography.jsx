// Atoms — Typography
import React from 'react';

export function H1({ children, style }) {
  return <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '2rem', fontWeight: 900, color: '#111827', letterSpacing: '-0.02em', margin: 0, ...style }}>{children}</h1>;
}

export function H2({ children, style }) {
  return <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0, ...style }}>{children}</h2>;
}

export function H3({ children, style }) {
  return <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#111827', margin: 0, ...style }}>{children}</h3>;
}

export function Body({ children, style }) {
  return <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: '0.875rem', color: '#4B5563', margin: 0, ...style }}>{children}</p>;
}

export function Label({ children, style }) {
  return <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: '0.7rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.15em', ...style }}>{children}</span>;
}
