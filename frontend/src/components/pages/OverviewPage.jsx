// Pages — OverviewPage
import React, { useEffect, useState } from 'react';
import KpiCard from '../molecules/KpiCard';
import Modal from '../organisms/Modal';
import Spinner from '../atoms/Spinner';
import { fetchKpis, fetchTraficoAnual, fetchRiesgoEstados } from '../../api/client';
import AlertBadge from '../atoms/AlertBadge';
import { Body } from '../atoms/Typography';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import EventIcon from '@mui/icons-material/Event';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';

const COLORS = ['#6B21A8','#9333EA','#A855F7','#C084FC','#DDD6FE'];

export default function OverviewPage() {
  const [kpis, setKpis] = useState(null);
  const [trafico, setTrafico] = useState([]);
  const [estados, setEstados] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchKpis(), fetchTraficoAnual(), fetchRiesgoEstados()])
      .then(([k, t, e]) => { setKpis(k); setTrafico(t); setEstados(e); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!kpis) return <Body>No se pudieron cargar los datos.</Body>;

  const top5 = estados.slice(0, 5);
  const pieData = [
    { name: 'Día', value: 100 - kpis.pct_nocturnos },
    { name: 'Noche', value: kpis.pct_nocturnos },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <KpiCard
          testId="kpi-tramo"
          icon={<DirectionsCarIcon />}
          label="Tramo más crítico"
          value={kpis.tramo_critico}
          sub={`Score de alerta: ${kpis.tramo_score}/120`}
          color="#C0392B"
          onClick={() => setModal('tramos')}
        />
        <KpiCard
          testId="kpi-estado"
          icon={<LocationOnIcon />}
          label="Estado más peligroso"
          value={kpis.estado_peligroso}
          sub={`Índice de riesgo: ${kpis.estado_indice}/100`}
          color="#E67E22"
          onClick={() => setModal('estados')}
        />
        <KpiCard
          testId="kpi-dia"
          icon={<EventIcon />}
          label="Día más peligroso"
          value={kpis.dia_peligroso}
          sub={`Tasa de mortalidad: ${kpis.dia_tasa}%`}
          color="#6B21A8"
          onClick={() => setModal('dias')}
        />
        <KpiCard
          testId="kpi-nocturnos"
          icon={<NightsStayIcon />}
          label="Accidentes nocturnos"
          value={`${kpis.pct_nocturnos}%`}
          sub="Del total nacional"
          color="#2980B9"
          onClick={() => setModal('noche')}
        />
        <KpiCard
          testId="kpi-total-acc"
          icon={<ReportProblemIcon />}
          label="Total accidentes"
          value={kpis.total_accidentes?.toLocaleString()}
          sub={`${kpis.total_mortales?.toLocaleString()} mortales`}
          color="#C0392B"
        />
      </div>

      {/* Mini charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Traffic bar */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '20px 24px', border: '1px solid #E5E7EB' }}>
          <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 12, color: '#111827' }}>
            Tráfico anual — Millones de vehículos
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trafico} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="anio" tick={{ fontSize: 12, fontFamily: 'IBM Plex Sans, sans-serif', fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'IBM Plex Sans, sans-serif', fill: '#6B7280' }} unit="M" />
              <Tooltip formatter={(v) => [`${v}M vehículos`, 'Total']} contentStyle={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 13 }} />
              <Bar dataKey="total_millones" radius={[4, 4, 0, 0]}>
                {trafico.map((entry, i) => (
                  <Cell key={i} fill={entry.anio === Math.max(...trafico.map(d => d.anio)) ? '#E67E22' : '#6B21A8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Accidents pie */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '20px 24px', border: '1px solid #E5E7EB' }}>
          <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 12, color: '#111827' }}>
            Accidentes por condición lumínica
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40} label={({ name, value }) => `${name}: ${value.toFixed(1)}%`} labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={i === 0 ? '#6B21A8' : '#2980B9'} />)}
              </Pie>
              <Legend formatter={(v) => <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 12 }}>{v}</span>} />
              <Tooltip contentStyle={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 13 }} formatter={(v) => [`${v.toFixed(1)}%`]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 5 states preview */}
      <div style={{ background: '#fff', borderRadius: 10, padding: '20px 24px', border: '1px solid #E5E7EB' }}>
        <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 16, color: '#111827' }}>
          Top 5 estados por índice de riesgo
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {top5.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 22, textAlign: 'right', fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 13, fontWeight: 700, color: '#9CA3AF' }}>{i+1}</span>
              <span style={{ flex: 1, fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 14, color: '#111827' }}>{e.estado}</span>
              <AlertBadge nivel={e.nivel} />
              <div style={{ width: 100, height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${e.indice_riesgo}%`, height: '100%', background: e.nivel === 'ALTA' ? '#C0392B' : e.nivel === 'MEDIA' ? '#E67E22' : '#2980B9', borderRadius: 4 }} />
              </div>
              <span style={{ width: 40, textAlign: 'right', fontSize: 13, fontWeight: 700, fontFamily: 'IBM Plex Sans, sans-serif', color: '#111827' }}>{e.indice_riesgo}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <Modal open={modal === 'tramos'} onClose={() => setModal(null)} title="Tramos más críticos — Detalle" wide>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 14, color: '#4B5563', marginBottom: 16 }}>
          El tramo <strong>{kpis.tramo_critico}</strong> es el más crítico con un score de <strong>{kpis.tramo_score}/120</strong>. Ver la pestaña "Alertas" para el listado completo.
        </p>
      </Modal>
      <Modal open={modal === 'estados'} onClose={() => setModal(null)} title="Índice de riesgo por estado — Top 10" wide>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {estados.slice(0,10).map((e,i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
              <span style={{ width: 24, fontWeight: 700, fontSize: 13, color: '#9CA3AF', textAlign: 'right' }}>{i+1}</span>
              <span style={{ flex: 1, fontSize: 14, fontFamily: 'IBM Plex Sans, sans-serif', color: '#111827' }}>{e.estado}</span>
              <AlertBadge nivel={e.nivel} />
              <div style={{ width: 130, height: 10, background: '#F3F4F6', borderRadius: 5 }}>
                <div style={{ width: `${e.indice_riesgo}%`, height: '100%', borderRadius: 5, background: e.nivel === 'ALTA' ? '#C0392B' : e.nivel === 'MEDIA' ? '#E67E22' : '#2980B9' }} />
              </div>
              <span style={{ width: 38, textAlign: 'right', fontSize: 13, fontWeight: 700, fontFamily: 'IBM Plex Sans, sans-serif' }}>{e.indice_riesgo}</span>
            </div>
          ))}
        </div>
      </Modal>
      <Modal open={modal === 'dias'} onClose={() => setModal(null)} title="Accidentalidad por día de la semana">
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 14, color: '#4B5563', marginBottom: 12 }}>
          <strong>{kpis.dia_peligroso}</strong> es el día con mayor tasa de mortalidad: <strong>{kpis.dia_tasa}%</strong>. Los fines de semana (sábado y domingo) presentan consistentemente las tasas más altas.
        </p>
      </Modal>
      <Modal open={modal === 'noche'} onClose={() => setModal(null)} title="Accidentes nocturnos">
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 14, color: '#4B5563' }}>
          El <strong>{kpis.pct_nocturnos}%</strong> de los accidentes ocurren bajo condiciones de baja iluminación (noche o crepúsculo). Esto indica una necesidad crítica de mejoras en alumbrado vial.
        </p>
      </Modal>
    </div>
  );
}
