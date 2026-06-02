// Pages — TraficoPage
import React, { useEffect, useState } from 'react';
import Spinner from '../atoms/Spinner';
import ChartCard from '../molecules/ChartCard';
import Modal from '../organisms/Modal';
import { fetchTraficoAnual, fetchTraficoMensual, fetchHeatmap } from '../../api/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, Legend,
} from 'recharts';

const TRAMO_COLORS = ['#6B21A8','#9333EA','#E67E22','#D35400','#2980B9','#1A5276','#27AE60','#1E8449'];
const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function HeatmapChart({ data }) {
  if (!data || data.length === 0) return null;
  const tramos = [...new Set(data.map(d => d.tramo))];
  const anios  = [...new Set(data.map(d => d.anio))].sort();
  const maxVal = Math.max(...data.map(d => d.total));

  const getColor = (v) => {
    const pct = v / maxVal;
    if (pct > 0.75) return '#6B21A8';
    if (pct > 0.50) return '#9333EA';
    if (pct > 0.25) return '#C084FC';
    return '#EDE9FE';
  };

  const fmt = (v) => {
    if (v >= 1e9) return `${(v/1e9).toFixed(1)}B`;
    if (v >= 1e6) return `${(v/1e6).toFixed(1)}M`;
    return `${(v/1e3).toFixed(0)}K`;
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 12 }}>
        <thead>
          <tr>
            <th style={{ padding: '6px 10px', textAlign: 'left', color: '#6B7280', fontWeight: 600, borderBottom: '1px solid #E5E7EB', whiteSpace: 'nowrap' }}>Tramo</th>
            {anios.map(a => <th key={a} style={{ padding: '6px 12px', textAlign: 'center', color: '#6B7280', fontWeight: 600, borderBottom: '1px solid #E5E7EB' }}>{a}</th>)}
          </tr>
        </thead>
        <tbody>
          {tramos.map((t, ti) => (
            <tr key={ti} style={{ background: ti % 2 === 0 ? '#FAFAFA' : '#fff' }}>
              <td style={{ padding: '6px 10px', color: '#374151', fontWeight: 500, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t}>{t}</td>
              {anios.map(a => {
                const cell = data.find(d => d.tramo === t && d.anio === a);
                const val = cell ? cell.total : 0;
                return (
                  <td key={a} title={`${t} — ${a}: ${val.toLocaleString()}`} style={{ padding: '5px 8px', textAlign: 'center' }}>
                    <div style={{ background: getColor(val), borderRadius: 4, padding: '4px 6px', color: val/maxVal > 0.5 ? '#fff' : '#374151', fontWeight: 600, fontSize: 11 }}>
                      {fmt(val)}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TraficoPage() {
  const [anual, setAnual] = useState([]);
  const [mensual2023, setMensual2023] = useState([]);
  const [mensual2024, setMensual2024] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selectedAnio, setSelectedAnio] = useState(2024);

  useEffect(() => {
    Promise.all([
      fetchTraficoAnual(),
      fetchTraficoMensual(2023),
      fetchTraficoMensual(2024),
      fetchHeatmap(),
    ]).then(([a, m23, m24, h]) => {
      setAnual(a);
      setMensual2023(m23);
      setMensual2024(m24);
      setHeatmap(h);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  // Build line chart data: pivot mensual by tramo
  const mensualData = selectedAnio === 2023 ? mensual2023 : mensual2024;
  const tramos = [...new Set(mensualData.map(d => d.tramo))].slice(0, 6);
  const lineData = MESES.map((mes, i) => {
    const row = { mes };
    tramos.forEach(t => {
      const record = mensualData.find(d => d.mes === i+1 && d.tramo === t);
      row[t] = record ? Math.round(record.total / 1000) : 0;
    });
    return row;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Annual bar */}
      <ChartCard
        testId="chart-trafico-anual"
        title="Tráfico total anual en autopistas CAPUFE"
        subtitle="Millones de vehículos por año (2021–2025)"
        onExpand={() => setModal('anual')}
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={anual} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="anio" tick={{ fontSize: 13, fontFamily: 'IBM Plex Sans, sans-serif', fill: '#6B7280' }} />
            <YAxis tick={{ fontSize: 12, fontFamily: 'IBM Plex Sans, sans-serif', fill: '#6B7280' }} unit="M" />
            <Tooltip
              formatter={(v, n) => [`${v}M vehículos`, 'Total']}
              contentStyle={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 13, borderRadius: 8 }}
            />
            <Bar dataKey="total_millones" radius={[5, 5, 0, 0]}>
              {anual.map((e, i) => <Cell key={i} fill={e.anio >= 2024 ? '#E67E22' : '#6B21A8'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Monthly line */}
      <ChartCard
        testId="chart-flujo-mensual"
        title="Flujo mensual por tramo"
        subtitle="Top 6 tramos — miles de vehículos"
        onExpand={() => setModal('mensual')}
      >
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {[2023, 2024].map(a => (
            <button
              key={a}
              data-testid={`btn-anio-${a}`}
              onClick={() => setSelectedAnio(a)}
              style={{
                padding: '5px 14px', borderRadius: 20, border: '1.5px solid',
                borderColor: selectedAnio === a ? '#6B21A8' : '#E5E7EB',
                background: selectedAnio === a ? '#F3E8FF' : '#fff',
                color: selectedAnio === a ? '#6B21A8' : '#4B5563',
                fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
              }}
            >{a}</button>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={lineData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fontFamily: 'IBM Plex Sans, sans-serif', fill: '#6B7280' }} />
            <YAxis tick={{ fontSize: 11, fontFamily: 'IBM Plex Sans, sans-serif', fill: '#6B7280' }} unit="K" />
            <Tooltip formatter={(v) => [`${v}K veh.`]} contentStyle={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 12, borderRadius: 8 }} />
            <Legend formatter={(v) => <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 11 }}>{v.length > 20 ? v.substring(0, 20) + '…' : v}</span>} />
            {tramos.map((t, i) => (
              <Line key={t} type="monotone" dataKey={t} stroke={TRAMO_COLORS[i % TRAMO_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} name={t} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Heatmap */}
      <ChartCard
        testId="chart-heatmap"
        title="Mapa de calor — Top 10 tramos por año"
        subtitle="Volumen de vehículos: más oscuro = mayor tráfico"
        onExpand={() => setModal('heatmap')}
        minH={200}
      >
        <HeatmapChart data={heatmap} />
      </ChartCard>

      {/* Modals */}
      <Modal open={modal === 'anual'} onClose={() => setModal(null)} title="Tráfico anual — Vista ampliada" wide>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={anual} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="anio" tick={{ fontSize: 14, fontFamily: 'IBM Plex Sans, sans-serif' }} />
            <YAxis tick={{ fontSize: 13, fontFamily: 'IBM Plex Sans, sans-serif' }} unit="M" />
            <Tooltip formatter={(v) => [`${v}M vehículos`, 'Total']} contentStyle={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 13 }} />
            <Bar dataKey="total_millones" radius={[5,5,0,0]}>
              {anual.map((e, i) => <Cell key={i} fill={e.anio >= 2024 ? '#E67E22' : '#6B21A8'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p style={{ fontSize: 12, color: '#6B7280', fontFamily: 'IBM Plex Sans, sans-serif', marginTop: 12 }}>
          * 2025 incluye datos parciales hasta junio 2025
        </p>
      </Modal>

      <Modal open={modal === 'mensual'} onClose={() => setModal(null)} title="Flujo mensual — Vista ampliada" wide>
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={lineData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="mes" tick={{ fontSize: 13, fontFamily: 'IBM Plex Sans, sans-serif' }} />
            <YAxis unit="K" tick={{ fontSize: 12, fontFamily: 'IBM Plex Sans, sans-serif' }} />
            <Tooltip formatter={(v) => [`${v}K vehículos`]} contentStyle={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 12 }} />
            <Legend formatter={(v) => <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 12 }}>{v}</span>} />
            {tramos.map((t, i) => (
              <Line key={t} type="monotone" dataKey={t} stroke={TRAMO_COLORS[i % TRAMO_COLORS.length]} strokeWidth={2.5} dot={{ r: 4 }} name={t} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Modal>

      <Modal open={modal === 'heatmap'} onClose={() => setModal(null)} title="Mapa de calor ampliado" wide>
        <HeatmapChart data={heatmap} />
      </Modal>
    </div>
  );
}
